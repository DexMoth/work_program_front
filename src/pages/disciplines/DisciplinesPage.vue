<script setup>
import { ref, onMounted } from 'vue';
import { API_URL } from '@/js/api';

const disciplines = ref([])
const departments = ref([])

const load = async () => {
    try {
        const resp = await fetch(API_URL + '/discipline')
        disciplines.value = await resp.json();
        console.log('Загружены дисциплины');
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
    const d = disciplines.value.find(d => d.id === depId);
    return d ? d.name : 'Неизвестно';
}

onMounted(() => {
    load();
})
</script>

<template>
    <h2>Список дисциплин</h2>
    <div>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Название</th>
                    <th scope="col">Кафедра</th>
                    <th scope="col">Компетенции</th>
                    <th scope="col">Дата создания</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in disciplines" :key="i.id">
                    <td>{{ i.name }}</td>
                    <td>{{ getDepartmentName(i.departmentId) }}</td>
                    <td>
                        <span v-for="code in i.competenciesIds.map(c => c.code)" 
                              :key="code">
                            {{ code + ' '}}
                        </span>
                        <span v-if="i.competenciesIds.length === 0">
                            Нет компетенций
                        </span>
                    </td>
                    <td>{{ i.createdAt }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>