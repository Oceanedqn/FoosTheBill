<template>
    <div class="calendar w-full text-center">
        <div class="header flex justify-between items-center mb-2">
            <button @click="changeMonth(-1)" class="px-4 py-2 border border-primary rounded-full cursor-pointer"> <i
                    class="fa-solid fa-caret-left text-primary"></i> </button>
            <span class="text-lg font-semibold">{{ format(currentDate, 'MMMM yyyy', { locale: fr }) }}</span>
            <button @click="changeMonth(1)" class="px-4 py-2 border border-primary rounded-full cursor-pointer">
                <i class="fa-solid fa-caret-right text-primary"></i> </button>
        </div>
        <div class="grid grid-cols-7 gap-2 w-full">
            <div v-for="day in daysOfWeek" :key="day" class="day font-bold">
                {{ day }}
            </div>
            <div v-for="day in calendarDays" :key="day.toString()"
                class="flex justify-center items-center p-2 border border-primary bg-primary text-white text-center cursor-pointer rounded-lg w-full h-24"
                :class="{ 'border border-secondary-light bg-secondary-light': day.getMonth() !== currentDate.getMonth() }"
                @click="openModal(day)">
                <div class="w-full h-full flex justify-center items-center">
                    {{ format(day, 'd') }}
                </div>
            </div>
        </div>
    </div>

    <div v-if="showModal"
        class="modal fixed top-0 left-0 w-full h-full bg-black/50 bg-opacity-50 flex justify-center items-center">
        <div class="modal-content bg-white p-6 rounded-lg text-center relative w-72">
            <span class="close absolute top-2 right-3 cursor-pointer text-xl hover:text-primary"
                @click="closeModal">&times;</span>
            <h2 class="text-lg font-semibold">{{ format(selectedDate!, 'PPP', { locale: fr }) }}</h2>
            <textarea v-model="note" placeholder="Ajouter une note..."
                class="w-full h-24 mt-4 p-2 border rounded"></textarea>
            <button @click="saveNote"
                class="mt-4 px-4 py-2 bg-primary cursor-pointer hover:bg-primary-light text-white rounded">Valider</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { addMonths, startOfMonth, endOfMonth, getDay, eachDayOfInterval, format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const note = ref('');
const showModal = ref(false);

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const calendarDays = computed(() => {
    const start = startOfMonth(currentDate.value);
    const end = endOfMonth(currentDate.value);
    const prevMonthEnd = new Date(start.getFullYear(), start.getMonth(), 0);

    let startDay = getDay(start);
    startDay = startDay === 0 ? 6 : startDay - 1;

    const prevDays = eachDayOfInterval({
        start: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - startDay + 1),
        end: prevMonthEnd
    });

    const currentDays = eachDayOfInterval({ start, end });

    const remainingDays = 42 - (prevDays.length + currentDays.length);
    const nextDays = eachDayOfInterval({
        start: addMonths(start, 1),
        end: new Date(start.getFullYear(), start.getMonth() + 1, remainingDays)
    });

    return [...prevDays, ...currentDays, ...nextDays];
});

const changeMonth = (offset: number) => {
    currentDate.value = addMonths(currentDate.value, offset);
};

const openModal = (day: Date) => {
    selectedDate.value = day;
    note.value = '';
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveNote = () => {
    console.log(`Note saved for ${format(selectedDate.value!, 'PPP', { locale: fr })}:`, note.value);
    closeModal();
};
</script>
