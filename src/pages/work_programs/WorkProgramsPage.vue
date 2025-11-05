<script setup>
import { ref, onMounted, computed } from 'vue';
import { API_URL } from '@/js/api';
import { useAuthStore } from '@/js/auth';

const authStore = useAuthStore();
const programs = ref([])
const curriculumDisciplines = ref([])
const teachers = ref([])
const disciplines = ref([])
const statuses = ref([])
const departments = ref([])
const studyDirection = ref([])

const selectedDepartment = ref('')
const selectedStudyDirection = ref('')

const loadPrograms = async () => {
    try {
        let url = API_URL + '/workProgram';
        
        // параметры фильтрации
        if (authStore.isDepartmentHead) {
            const params = new URLSearchParams();
            if (selectedDepartment.value) params.append('departmentId', selectedDepartment.value);
            if (selectedStudyDirection.value) params.append('studyDirectionId', selectedStudyDirection.value);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }
        } else {
            // для преподавателя - только его программы
            url += '/my';
        }
        const resp = await fetch(url, { credentials: 'include' })
        programs.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки раб. программ', err);
    }
}

const loadCurriculumDisciplines = async () => {
    try {
        const resp = await fetch(API_URL + '/curriculumDiscipline')
        curriculumDisciplines.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки дисциплин', err);
    }
}

const loadTeachers = async () => {
    try {
        const resp = await fetch(API_URL + '/teacher')
        teachers.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки преподавателей', err);
    }
}

const loadDisciplines = async () => {
    try {
        const resp = await fetch(API_URL + '/discipline')
        disciplines.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки дисциплин', err);
    }
}

const loadStatuses = async () => {
    try {
        const resp = await fetch(API_URL + '/status')
        statuses.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки статусов', err);
    }
}

const loadDepartments = async () => {
    try {
        const resp = await fetch(API_URL + '/department')
        departments.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки кафедр', err);
    }
}

const loadCurriculums = async () => {
    try {
        const resp = await fetch(API_URL + '/studyDirection')
        studyDirection.value = await resp.json();
    } catch (err) {
        console.error('Ошибка загрузки направлений', err);
    }
}

const getCurriculumDisciplineName = (disId) => {
    const dis = curriculumDisciplines.value.find(f => f.id === disId);
    if (!dis) return 'Неизвестно';
    const discipline = disciplines.value.find(d => d.id === dis.disciplineId);
    return discipline ? discipline.name : 'Неизвестно';
}

const getTeacherName = (teachId) => {
    const teach = teachers.value.find(f => f.id === teachId);
    return teach ? teach.fio : 'Неизвестно';
}

const getStatus = (id) => {
    const status = statuses.value.find(s => s.id === id);
    return status ? status.name : 'Неизвестно';
}

// может ли пользователь редактировать программу
const canEditProgram = (program) => {
    if (authStore.isDepartmentHead) return true;
    return program.teacherId === authStore.currentUser?.id;
}

// фильтры
const applyFilters = () => {
    loadPrograms();
}

// сбросить фильтры
const resetFilters = () => {
    selectedDepartment.value = '';
    selectedStudyDirection.value = '';
    loadPrograms();
}

onMounted(() => {
    loadPrograms();
    loadDisciplines();
    loadCurriculumDisciplines();
    loadTeachers();
    loadStatuses();
    console.log(authStore.isAuthenticated)
    console.log(authStore.isVerified)
    
    if (authStore.isDepartmentHead) {
        loadDepartments();
        loadCurriculums();
    }
})
</script>

<template>
    <h2>Список рабочих программ</h2>
    <div v-if="authStore.isDepartmentHead" class="card mb-4">
        <div class="card-header">
            <h5 class="mb-0">Фильтры</h5>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Кафедра</label>
                    <select v-model="selectedDepartment" class="form-select">
                        <option value="">Все кафедры</option>
                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                            {{ dept.name }}
                        </option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Направление</label>
                    <select v-model="selectedStudyDirection" class="form-select">
                        <option value="">Все направления</option>
                        <option v-for="curr in studyDirection" :key="curr.id" :value="curr.id">
                            {{ curr.name }}
                        </option>
                    </select>
                </div>
                <div class="col-md-4 d-flex align-items-end">
                    <button @click="applyFilters" class="btn btn-primary me-2">Применить</button>
                    <button @click="resetFilters" class="btn btn-outline-secondary">Сбросить</button>
                </div>
            </div>
        </div>
    </div>

    <router-link 
        v-if="authStore.isAuthenticated"
        to="/work_programs/create" 
        class="btn btn-primary p-10 mb-4"
    >
        Создать рабочую программу
    </router-link>
        
    <div class="table-responsive">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Дисциплина</th>
                    <th scope="col">Составитель</th>
                    <th scope="col">Статус</th>
                    <th scope="col">Дата создания</th>
                    <th scope="col">Действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="program in programs" :key="program.id">
                    <td>{{ getCurriculumDisciplineName(program.curriculumDisciplineId) }}</td>
                    <td>{{ getTeacherName(program.teacherId) }}</td>
                    <td>{{ getStatus(program.statusId) }}</td>
                    <td>{{ new Date(program.createdAt).toLocaleDateString() }}</td>
                    <td>
                        <router-link 
                            :to="`/work_programs/${program.id}`"
                            class="btn btn-sm btn-outline-primary me-1"
                        >
                            Просмотр
                        </router-link>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
        
    <div v-if="programs.length === 0" class="text-center text-muted py-4">
        <p>Рабочие программы не найдены</p>
    </div>
</template>