<script setup>
import { ref, onMounted } from 'vue';
import { API_URL } from '@/js/api';

const faculties = ref([])

const load = async () => {
    try {
        const resp = await fetch(API_URL + '/faculty')
        faculties.value = await resp.json();
        console.log('Загружены факультеты');
    } catch (err) {
        console.error('Ошибка загрузки', err);
        throw err;
    } finally {
        console.log('Запрос завершен');
    }
}

onMounted(() => {
    load();
})
</script>

<template>
    <h2>Список факультетов</h2>
    <div>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Название</th>
                    <th scope="col">Дата создания</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in faculties" :key="i.id">
                    <td>{{ i.name }}</td>
                    <td>{{ i.createdAt }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>