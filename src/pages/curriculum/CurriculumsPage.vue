<template>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Учебные планы</h2>
    </div>
  
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Название</th>
          <th>Направление</th>
          <th>Учебный год</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="curriculum in curriculums" :key="curriculum.id">
          <td>{{ curriculum.name }}</td>
          <td>{{ getStudyDirectionName(curriculum.studyDirectionId) }}</td>
          <td>{{ curriculum.academicYear }}</td>
          <td>
            <router-link 
              :to="`/curriculums/${curriculum.id}`" 
              class="btn btn-sm btn-outline-primary"
            >
              Просмотр
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { API_URL } from '@/js/api';
  
  const curriculums = ref([]);
  const studyDirections = ref([]);

  const loadData = async () => {
    try {
      const [curriculumsResp, directionsResp, formsResp] = await Promise.all([
        fetch(`${API_URL}/curriculum`),
        fetch(`${API_URL}/studyDirection`),
        fetch(`${API_URL}/study_form`)
      ]);
  
      curriculums.value = await curriculumsResp.json();
      studyDirections.value = await directionsResp.json();
    } catch (err) {
      console.error('Ошибка загрузки данных', err);
    }
  };
  
  const getStudyDirectionName = (id) => {
    const direction = studyDirections.value.find(sd => sd.id === id);
    return direction ? `${direction.code} - ${direction.name}` : 'Неизвестно';
  };
  
  onMounted(() => {
    loadData();
  });
  </script>