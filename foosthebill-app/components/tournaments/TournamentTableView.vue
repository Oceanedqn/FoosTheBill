<template>
  <div class="w-full max-w-6xl overflow-x-auto rounded-t-2xl">
    <table class="min-w-full table-auto">
      <thead>
        <tr class="text-white bg-primary">
          <th class="px-4 py-2 ">{{ $t("tournament_name") }}</th>
          <th class="px-4 py-2 text-left">{{ $t("date") }}</th>
          <th class="px-4 py-2 text-left">{{ $t("description") }}</th>
          <th class="px-4 py-2 text-center">{{ $t("inscription") }}</th>
          <th class="px-4 py-2 text-center">{{ $t("actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tournament in tournaments" :key="tournament.id" class="border-b border-gray-300">
          <td class="px-4 py-2 ">{{ tournament.name }}</td>
          <td class="px-4 py-2">
            {{ formatDate(tournament.start_date) }}
          </td>
          <td class="px-4 py-2">{{ tournament.description.length > 47 ? tournament.description.slice(0,
            47) +
            '...' : tournament.description }}</td>

          <td class="px-4 py-2 text-center">
            {{ tournament.participant_number }}
          </td>
          <td class="flex items-center justify-center px-4 py-1 text-center whitespace-nowrap">

            <button @click="joinTournament(tournament.id)"
              class="px-4 py-1 mt-auto text-white rounded-lg cursor-pointer bg-primary-light hover:bg-primary-dark">
              {{ tournament.isRegister ? $t('see') : $t('join') }}
              <i class="ml-1 fa-solid" :class="tournament.isRegister ? 'fa-calendar-days' : 'fa-hand-point-right'"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  tournaments: {
    type: Array,
    required: true,
  },
});

const router = useRouter();

const formatDate = (startDate) => {
  return new Date(startDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const joinTournament = (tournamentId) => {
  router.push(`/tournaments/${tournamentId}`);
};
</script>
