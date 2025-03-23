<template>
    <div v-if="match" class="relative flex flex-col p-4 mb-2 overflow-hidden rounded-lg shadow-lg hover:shadow-xl">

        <!-- Tournament name -->

        <h2 class="text-xl font-semibold text-center text">{{ match.team1?.name }} vs {{ match.team2?.name }}</h2>
        <div class="flex flex-col pt-2 bg-white">

            <!-- Display current scores -->
            <div class="text-center">
                <div class="font-semibold">{{ $t('current_score') }}</div>
                <div>{{ match.score_team_1 }} - {{ match.score_team_2 }}</div>
            </div>

            <div v-if="isAdmin && !match.isClosed">
                <!-- Score Inputs -->
                <div class="flex gap-2 mt-4">
                    <input v-model="updatedScore.team1" type="number" :placeholder="match.team1?.name + ' score'"
                        class="w-full p-2 border rounded-md" min="0" />
                    <input v-model="updatedScore.team2" type="number" :placeholder="match.team2?.name + ' score'"
                        class="w-full p-2 border rounded-md" min="0" />
                </div>

                <!-- Update Button -->
                <div class="flex mt-2 space-x-2">
                    <button @click="updateScores(false)"
                        class="flex-1 px-4 py-2 text-white rounded-md cursor-pointer bg-secondary hover:bg-secondary-dark">
                        {{ $t('update_score') }}
                    </button>

                    <button @click="updateScores(true)"
                        class="flex-1 px-4 py-2 text-white rounded-md cursor-pointer bg-secondary hover:bg-secondary-dark">
                        {{ $t('end_match') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { updateScore } from '~/services/match.service';
import type { IMatchUpdate } from '~/models/Match';

const props = defineProps({
    match: {
        type: Object,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    fetchMatches: {
        type: Function as PropType<() => void>,
        required: true
    }
});

const updatedScore = ref<{ team1: number | null; team2: number | null }>({
    team1: null,
    team2: null,
});

const isUpdating = ref(false); // To handle loading state

// Update match scores
const updateScores = async (isClosed: boolean) => {
    if (updatedScore.value.team1 !== null && updatedScore.value.team2 !== null) {
        isUpdating.value = true; // Show loading state

        const matchUpdate: IMatchUpdate = {
            score_team_1: updatedScore.value.team1,
            score_team_2: updatedScore.value.team2,
            isClosed: isClosed
        };

        try {
            await updateScore(props.match.id, matchUpdate);
            if (isClosed) {
                showSuccessToast('close_match_ok');
            } else {
                showSuccessToast('update_match_ok');
            }
            props.match.score_team_1 = updatedScore.value.team1;
            props.match.score_team_2 = updatedScore.value.team2;
            props.fetchMatches();
        } catch (error) {
            showAlertToast('update_match_error');
        }
    }
};
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
    opacity: 1;
}
</style>
