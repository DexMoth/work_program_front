<script setup>
import { ref, onMounted } from 'vue';
import { API_URL } from '@/js/api';

const studyDirections = ref([])

const load = async () => {
    try {
        const resp = await fetch(API_URL + '/studyDirection')
        studyDirections.value = await resp.json();
        console.log('Загружены cпециальности');
    } catch (err) {
        console.error('Ошибка загрузки', err);
        throw err;
    } finally {
        console.log('Запрос завершен');
    }
}

const loadDepartments = async () => {
    try {
        const resp = await fetch(API_URL + '/department')
        departments.value = await resp.json();
        console.log('Загружены кафедры');
    } catch (err) {
        console.error('Ошибка загрузки', err);
        throw err;
    } finally {
        console.log('Запрос завершен');
    }
}

const getDepartmentName = (depId) => {
    const d = studyDirections.value.find(d => d.id === depId);
    return d ? d.name : 'Неизвестно';
}

onMounted(() => {
    load();
})
</script>

<template>
    <h2>Список направлений</h2>
    <div>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Название</th>
                    <th scope="col">Код</th>
                    <th scope="col">Кафедра</th>
                    <th scope="col">Дата создания</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in studyDirections" :key="i.id">
                    <td>{{ i.name }}</td>
                    <td>{{ i.code }}</td>
                    <td>{{ getDepartmentName(i.departmentId) }}</td>
                    <td>{{ i.createdAt }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>