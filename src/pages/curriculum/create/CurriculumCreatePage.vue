<template>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <button @click="$router.back()" class="btn btn-outline-secondary">
          Назад
        </button>
        <h2>Создание учебного плана</h2>
        <div></div>
      </div>
  
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="createCurriculum">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Название учебного плана *</label>
                  <input 
                    v-model="curriculum.name" 
                    type="text" 
                    class="form-control" 
                    required
                    placeholder="Введите название"
                  >
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Направление обучения *</label>
                  <select 
                    v-model="curriculum.studyDirectionId" 
                    class="form-select" 
                    required
                  >
                    <option value="">Выберите направление</option>
                    <option 
                      v-for="direction in studyDirections" 
                      :key="direction.id" 
                      :value="direction.id"
                    >
                      {{ direction.code }} - {{ direction.name }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Форма обучения *</label>
                  <select 
                    v-model="curriculum.studyFormId" 
                    class="form-select" 
                    required
                  >
                    <option value="">Выберите форму обучения</option>
                    <option 
                      v-for="form in studyForms" 
                      :key="form.id" 
                      :value="form.id"
                    >
                      {{ form.name }}
                    </option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Учебный год *</label>
                  <input 
                    v-model="curriculum.academicYear" 
                    type="text" 
                    class="form-control" 
                    required
                    placeholder="Например: 2024-2025"
                  >
                </div>
              </div>
            </div>
            
            <div class="d-flex gap-2 justify-content-end">
              <button type="button" @click="$router.back()" class="btn btn-secondary">
                Отмена
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Создание...' : 'Создать' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { API_URL } from '@/js/api';
  
  const router = useRouter();
  const curriculum = ref({
    name: '',
    studyDirectionId: '',
    studyFormId: '',
    academicYear: ''
  });
  const studyDirections = ref([]);
  const studyForms = ref([]);
  const saving = ref(false);
  
  const loadData = async () => {
    try {
      const [directionsResp, formsResp] = await Promise.all([
        fetch(`${API_URL}/study_directions`),
        fetch(`${API_URL}/study_form`)
      ]);
  
      studyDirections.value = await directionsResp.json();
      studyForms.value = await formsResp.json();
    } catch (err) {
      console.error('Ошибка загрузки данных', err);
    }
  };
  
  const createCurriculum = async () => {
    saving.value = true;
    try {
      const resp = await fetch(`${API_URL}/curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(curriculum.value)
      });
  
      if (resp.ok) {
        const createdCurriculum = await resp.json();
        alert('Учебный план успешно создан!');
        router.push(`/curriculum/${createdCurriculum.id}`);
      } else {
        throw new Error('Ошибка создания');
      }
    } catch (err) {
      console.error('Ошибка создания учебного плана', err);
      alert('Ошибка при создании учебного плана');
    } finally {
      saving.value = false;
    }
  };
  
  onMounted(() => {
    loadData();
  });
  </script>