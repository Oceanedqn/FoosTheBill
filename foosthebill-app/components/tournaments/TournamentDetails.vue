<template>
    <div v-if="tournament.lenght" class="w-full p-6 mb-6 border-2 rounded-lg shadow-md  border-primary shadow-primary">
        <h2 class="mb-4 text-3xl font-semibold">{{ tournament.name }}</h2>
        <p class="mb-2 text-gray-600">{{ tournament.description }}</p>
        <p class="mb-4 text-sm text-gray-500">
            <i class="pr-1 fa-solid fa-calendar-day"></i>
            {{ new Date(tournament.start_date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }) }}
        </p>

        <div v-if="myTeam" class="p-4 mb-4 bg-gray-100 border-2 rounded-lg shadow-lg">
            <h3 class="text-2xl font-semibold">Votre équipe : {{ myTeam.name }}</h3>
            <div>
                <p><i class="fa-solid fa-user"></i> {{ myTeam.participant1.name }} {{ myTeam.participant1.firstname }}
                </p>
                <p v-if="myTeam.participant2"><i class="fa-solid fa-user"></i> {{ myTeam.participant2.name }} {{
                    myTeam.participant2.firstname }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    tournament: Object,
    myTeam: Object
});
</script>
