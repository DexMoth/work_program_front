<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API_URL } from '@/js/api';

const route = useRoute();
const router = useRouter();
const curriculumDiscipline = ref(null);
const curriculum = ref(null);
const studyForms = ref([]);
const loading = ref(true);
const saving = ref(false);

const loadData = async () => {
  try {
    const resp = await fetch(`${API_URL}/curriculumDiscipline/${route.params.id}`);
    curriculumDiscipline.value = await resp.json();
    
    await Promise.all([
      loadCurriculum(),
      loadStudyForms()
    ]);
  } catch (err) {
    console.error('Ошибка загрузки данных', err);
  } finally {
    loading.value = false;
  }
};

const loadCurriculum = async () => {
  try {
    const resp = await fetch(`${API_URL}/curriculum/${curriculumDiscipline.value.curriculumId}`);
    curriculum.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки учебного плана', err);
  }
};

const loadStudyForms = async () => {
  try {
    const resp = await fetch(`${API_URL}/study_form`);
    studyForms.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки форм обучения', err);
  }
};

const saveCurriculum = async () => {
    const validationError = validateHours();
    if (validationError) {
        if (!confirm(`${validationError}\n\nВсё равно сохранить?`)) {
        return;
        }
    }
  
  saving.value = true;
  try {
    const resp = await fetch(`${API_URL}/curriculumDiscipline/${curriculumDiscipline.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(curriculumDiscipline.value)
    });

    if (resp.ok) {
      alert('Изменения сохранены успешно!');
      router.back();
    } else {
      throw new Error('Ошибка сохранения');
    }
  } catch (err) {
    console.error('Ошибка сохранения', err);
    alert('Ошибка при сохранении изменений');
  } finally {
    saving.value = false;
  }
};

const validateHours = () => {
  const cd = curriculumDiscipline.value;
  
  // Проверка контактной работы
  const contactSum = (cd.lectureHours || 0) + (cd.practiceHours || 0) + (cd.labHours || 0);
  if (cd.totalContactHours !== contactSum) {
    return `Сумма контактной работы (${contactSum}) не совпадает с указанным итогом (${cd.totalContactHours || 0})`;
  }
  
  // Проверка самостоятельной работы
  const selfStudySum = (cd.consultationHours || 0) + 
                       (cd.theoryStudyHours || 0) + 
                       (cd.courseProjectHours || 0) + 
                       (cd.rgrHours || 0) + 
                       (cd.essayHours || 0) + 
                       (cd.practicePreparationHours || 0) + 
                       (cd.labPreparationHours || 0) + 
                       (cd.eLearningHours || 0);
  
  if (cd.totalSelfStudyHours !== selfStudySum) {
    return `Сумма самостоятельной работы (${selfStudySum}) не совпадает с указанным итогом (${cd.totalSelfStudyHours || 0})`;
  }
  
  // Проверка общих часов
  const totalSum = (cd.totalContactHours || 0) + (cd.totalSelfStudyHours || 0) + (cd.intermediateAssessmentHours || 0);
  if (cd.totalHours !== totalSum) {
    return `Общая сумма часов (${totalSum}) не совпадает с указанным итогом (${cd.totalHours || 0})`;
  }
  
  return null;
};

const cancelEdit = () => {
  router.back();
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4 mt-5">
    <button @click="cancelEdit" class="btn btn-outline-secondary">
      Назад
    </button>
    <h2>Редактирование объема часов</h2>
    <div>
      <button @click="saveCurriculum" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
        {{ saving ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </div>
  </div>

  <div v-if="loading" class="text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Загрузка...</span>
    </div>
  </div>

  <div v-else-if="curriculumDiscipline" class="row">
    <!-- Объем дисциплины -->
    <div class="col-12">
      <h4 class="mb-0">Объем дисциплины</h4>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr>
              <th>Форма обучения</th>
              <th>Семестр</th>
              <th colspan="4" class="text-center">Контактная работа</th>
              <th colspan="9" class="text-center">Самостоятельная работа</th>
              <th>Аттестация</th>
              <th class="table-primary">Всего часов</th>
              <th>ЗЕТ</th>
              <th>Форма контроля</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th class="table-primary">Всего</th>
              <th>Лекции</th>
              <th>Практика</th>
              <th>Лаб. работы</th>
              <th class="table-primary">Всего</th>
              <th>Консультации</th>
              <th>Теория</th>
              <th>Курсовая</th>
              <th>РГР</th>
              <th>Реферат</th>
              <th>Подг. к практике</th>
              <th>Подг. к лабам</th>
              <th>ЭИОС</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <!-- Форма обучения -->
              <td>
                <select v-model="curriculum.studyFormId" class="form-select" disabled>
                  <option v-for="form in studyForms" :key="form.id" :value="form.id">
                    {{ form.name }}
                  </option>
                </select>
              </td>
                    
              <!-- Семестр -->
              <td>
                <input 
                  v-model="curriculumDiscipline.semesterNumber" 
                  type="number" 
                  min="1" 
                  max="12"
                  class="form-control"
                >
              </td>
                    
              <!-- Контактная работа -->
              <td class="table-primary">
                <input 
                  v-model="curriculumDiscipline.totalContactHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                  style=""
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.lectureHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.practiceHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.labHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
                    
              <!-- Самостоятельная работа -->
              <td class="table-primary">
                <input 
                  v-model="curriculumDiscipline.totalSelfStudyHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.consultationHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.theoryStudyHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.courseProjectHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.rgrHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.essayHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.practicePreparationHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.labPreparationHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.eLearningHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
                    
              <!-- Аттестация и итоги -->
              <td>
                <input 
                  v-model="curriculumDiscipline.intermediateAssessmentHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td class="table-primary">
                <input 
                  v-model="curriculumDiscipline.totalHours" 
                  type="number" 
                  min="0"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.credits" 
                  type="number" 
                  min="0"
                  step="0.5"
                  class="form-control"
                >
              </td>
              <td>
                <input 
                  v-model="curriculumDiscipline.assessmentForm" 
                  type="text" 
                  class="form-control"
                  placeholder="Экзамен, Зачет"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Кнопки действий -->
    <div class="col-12">
      <div class="d-flex gap-2 justify-content-end">
        <button @click="cancelEdit" class="btn btn-secondary">Отмена</button>
        <button @click="saveCurriculum" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-control {
  min-width: 70px;
}

.table input {
  padding: 0.3rem 0.5rem;
}
</style>