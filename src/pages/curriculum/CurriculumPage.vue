<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="$router.back()" class="btn btn-outline-secondary">
        Назад
      </button>
      <h2>Учебный план</h2>
      <div></div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else-if="curriculum" class="row">
      <!-- Основная информация -->
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Основная информация</h4>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <p><strong>Дисциплина:</strong> {{ getDisciplineName(curriculum.studyDirectionId) }}</p>
                <p><strong>Название:</strong> {{ curriculum.name }}</p>
                <p><strong>Учебный год:</strong> {{ curriculum.academicYear }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Объем дисциплины по формам обучения -->
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">Объем дисциплины по формам обучения</h5>
          </div>
          <div class="card-body">
            <div v-if="curriculumDisciplines.length === 0" class="text-center py-4">
              <p class="text-muted">еще не добавлены</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-bordered table-sm">
                <thead class="table-light">
                  <tr>
                    <th rowspan="2">Форма обучения</th>
                    <th rowspan="2">Семестр</th>
                    <th colspan="4" class="text-center">Контактная работа</th>
                    <th colspan="9" class="text-center">Самостоятельная работа</th>
                    <th rowspan="2">Аттестация</th>
                    <th rowspan="2">Всего часов</th>
                    <th rowspan="2">ЗЕТ</th>
                    <th rowspan="2">Форма контроля</th>
                  </tr>
                  <tr>
                    <th>Всего</th>
                    <th>Лекции</th>
                    <th>Практика</th>
                    <th>Лаб. работы</th>
                    <th>Всего</th>
                    <th>Консультации</th>
                    <th>Теория</th>
                    <th>Курсовая</th>
                    <th>РГР</th>
                    <th>Реферат</th>
                    <th>Подг. к практике</th>
                    <th>Подг. к лабам</th>
                    <th>ЭИОС</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cd in curriculumDisciplines" :key="cd.id">
                    <td>{{ cd.studyForm }}</td>
                    <td>{{ cd.semesterNumber }}</td>
                    <td>{{ cd.totalContactHours || 0 }}</td>
                    <td>{{ cd.lectureHours || 0 }}</td>
                    <td>{{ cd.practiceHours || 0 }}</td>
                    <td>{{ cd.labHours || 0 }}</td>
                    <td>{{ cd.totalSelfStudyHours || 0 }}</td>
                    <td>{{ cd.consultationHours || 0 }}</td>
                    <td>{{ cd.theoryStudyHours || 0 }}</td>
                    <td>{{ cd.courseProjectHours || 0 }}</td>
                    <td>{{ cd.rgrHours || 0 }}</td>
                    <td>{{ cd.essayHours || 0 }}</td>
                    <td>{{ cd.practicePreparationHours || 0 }}</td>
                    <td>{{ cd.labPreparationHours || 0 }}</td>
                    <td>{{ cd.eLearningHours || 0 }}</td>
                    <td>{{ cd.intermediateAssessmentHours || 0 }}</td>
                    <td>{{ cd.totalHours || 0 }}</td>
                    <td>{{ cd.credits || 0 }}</td>
                    <td>{{ cd.assessmentForm || 'Не указана' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API_URL } from '@/js/api';

const route = useRoute();
const router = useRouter();
const curriculum = ref(null);
const curriculumDisciplines = ref([]);
const studyDirections = ref([]);
const disciplines = ref([]);
const departments = ref([]);
const loading = ref(true);

const loadData = async () => {
  try {
    const curriculumId = route.params.id;
    
    // Загружаем основные данные учебного плана
    const curriculumResp = await fetch(`${API_URL}/curriculum/${curriculumId}`);
    curriculum.value = await curriculumResp.json();
    
    // Загружаем дисциплины учебного плана
    const disciplinesResp = await fetch(`${API_URL}/curriculumDiscipline/byCurriculum/${curriculumId}`);
    curriculumDisciplines.value = await disciplinesResp.json();
    console.log(curriculumDisciplines.value)
    
    // Загружаем справочники
    await Promise.all([
      loadStudyDirections(),
      loadDisciplines(),
      loadDepartments()
    ]);
    
  } catch (err) {
    console.error('Ошибка загрузки данных', err);
  } finally {
    loading.value = false;
  }
};

const loadStudyDirections = async () => {
  try {
    const resp = await fetch(`${API_URL}/studyDirection`);
    studyDirections.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки направлений', err);
  }
};

const loadDisciplines = async () => {
  try {
    const resp = await fetch(`${API_URL}/discipline`);
    disciplines.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки дисциплин', err);
  }
};

const loadDepartments = async () => {
  try {
    const resp = await fetch(`${API_URL}/department`);
    departments.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки кафедр', err);
  }
};

const studyDirectionName = computed(() => {
  if (!curriculum.value) return '';
  const direction = studyDirections.value.find(sd => sd.id === curriculum.value.studyDirectionId);
  return direction ? `${direction.code} - ${direction.name}` : 'Неизвестно';
});

const getDisciplineName = (disciplineId) => {
  const discipline = disciplines.value.find(d => d.id === disciplineId);
  return discipline ? discipline.name : 'Неизвестно';
};

const getDepartmentName = (departmentId) => {
  const department = departments.value.find(d => d.id === departmentId);
  return department ? department.name : 'Неизвестно';
};

onMounted(() => {
  loadData();
});
</script>