<script setup>
import { ref, onMounted } from 'vue';
import { API_URL } from '@/js/api';

const departments = ref([])
const faculties = ref([])

const loadFaculties = async () => {
    try {
        const resp = await fetch(API_URL + '/faculty')
        faculties.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки факультетов', err);
    }
}

const load = async () => {
    try {
        const resp = await fetch(API_URL + '/department')
        departments.value = await resp.json();
        departments.value = departments.value.sort((a, b) => b.facultyId - a.facultyId);
        console.log('Загружены кафедры');
    } catch (err) {
        console.error('Ошибка загрузки', err);
        throw err;
    } finally {
        console.log('Запрос завершен');
    }
}

const getFacultyName = (facultyId) => {
    const faculty = faculties.value.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Неизвестно';
}

onMounted(() => {
    load();
    loadFaculties();
})
</script>

<template>
    <h2>Список кафедр</h2>
    <div>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Название</th>
                    <th scope="col">Факультет</th>
                    <th scope="col">Дата создания</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in departments" :key="i.id">
                    <td>{{ i.name }}</td>
                    <td>{{ getFacultyName(i.facultyId) }}</td>
                    <td>{{ i.createdAt }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>