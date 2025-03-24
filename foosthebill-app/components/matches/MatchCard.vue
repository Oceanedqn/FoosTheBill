<template>
    <div v-if="match" class="relative flex flex-col p-4 mb-2 overflow-hidden rounded-lg shadow-lg hover:shadow-xl">
        <!-- Match title -->
        <h2 class="text-xl font-semibold text-center">
            {{ match.teams[0]?.name }} vs {{ match.teams[1]?.name }}
        </h2>

        <div class="flex flex-col pt-2 bg-white">
            <!-- Display current scores -->
            <div class="text-center">
                <div class="font-semibold">{{ $t('current_score') }}</div>
                <div>{{ match.teams[0]?.score }} - {{ match.teams[1]?.score }}</div>
            </div>

            <div v-if="isAdmin && !match.isClosed">
                <!-- Score Inputs -->
                <div class="flex gap-2 mt-4">
                    <input v-model="updatedScore.team1" type="number" :placeholder="match.teams[0]?.name + ' score'"
                        class="w-full p-2 border rounded-md" min="0" />
                    <input v-model="updatedScore.team2" type="number" :placeholder="match.teams[1]?.name + ' score'"
                        class="w-full p-2 border rounded-md" min="0" />
                </div>

                <!-- Update Buttons -->
                <div class="flex mt-2 space-x-2">
                    <button @click="updateScores(false)"
                        class="flex-1 px-4 py-2 text-white rounded-md cursor-pointer bg-secondary hover:bg-secondary-dark disabled:opacity-50">
                        {{ $t('update_score') }}
                    </button>

                    <button @click="updateScores(true)"
                        class="flex-1 px-4 py-2 text-white rounded-md cursor-pointer bg-secondary hover:bg-secondary-dark disabled:opacity-50">
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
import type { IMatch, IUpdateMatch } from '~/models/Match';

const props = defineProps({
    match: {
        type: Object as () => IMatch,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    fetchMatches: {
        type: Function,
        required: true
    },
    tournamentId: {
        type: Object as () => string,
        required: true
    }

});

const updatedScore = ref<{ team1: number | null; team2: number | null }>({
    team1: null,
    team2: null,
});


// Update match scores
const updateScores = async (isClosed: boolean) => {
    if (updatedScore.value.team1 === null || updatedScore.value.team2 === null) {
        showAlertToast('score_required');
        return;
    }

    const matchUpdate: IUpdateMatch = {
        tournament_id: props.tournamentId,
        team_1_id: props.match.teams[0].id,
        team_2_id: props.match.teams[1].id,
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

        props.match.teams[0].score = updatedScore.value.team1;
        props.match.teams[1].score = updatedScore.value.team2;
        props.fetchMatches();
    } catch (error) {
        showAlertToast('update_match_error');
    }
};
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
    opacity: 1;
}
</style>
