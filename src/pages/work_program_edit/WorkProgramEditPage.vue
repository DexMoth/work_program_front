<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API_URL } from '@/js/api';
import { useAuthStore } from '@/js/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const program = ref(null);
const curriculumDisciplines = ref(null);
const allCurriculumDisciplines = ref([]);
const curriculum = ref(null);
const dis = ref(null);
const teacher = ref(null);
const studyForms = ref([]);
const status = ref(null);
const allTeachers = ref([]);
const allDisciplines = ref([]);
const allStatuses = ref([]);
const loading = ref(true);
const saving = ref(false);

// Вычисляемые свойства для прав доступа
const canEditTeacher = computed(() => {
  return authStore.isDepartmentHead; // Только зав. кафедрой может менять составителя
});

const canEditStatus = computed(() => {
  return authStore.isDepartmentHead; // Только зав. кафедрой может менять статус
});

const loadWorkProgram = async () => {
  try {
    const resp = await fetch(`${API_URL}/workProgram/${route.params.id}`);
    program.value = await resp.json();
    
    // Загружаем связанные данные
    await Promise.all([
      loadCurriculumDisciplines(),
      loadTeacher(),
      loadStudyForms(),
      loadStatus(),
      loadAllTeachers(),
      loadAllDisciplines(),
      loadAllStatuses(),
      loadAllCurriculumDisciplines()
    ]);
  } catch (err) {
    console.error('Ошибка загрузки рабочей программы', err);
  } finally {
    loading.value = false;
  }
};

const loadCurriculumDisciplines = async () => {
  try {
    const resp = await fetch(`${API_URL}/curriculumDiscipline/${program.value.curriculumDisciplineId}`);
    curriculumDisciplines.value = await resp.json();
    const resp2 = await fetch(`${API_URL}/discipline/${curriculumDisciplines.value.disciplineId}`);
    dis.value = await resp2.json();
    const resp3 = await fetch(`${API_URL}/curriculum/${curriculumDisciplines.value.curriculumId}`);
    curriculum.value = await resp3.json();
  } catch (err) {
    console.error('Ошибка загрузки учебной дисциплины', err);
  }
};

const loadAllCurriculumDisciplines = async () => {
  try {
    // Загружаем все доступные curriculum disciplines
    const resp = await fetch(`${API_URL}/curriculumDiscipline`);
    allCurriculumDisciplines.value = await resp.json();

    // Для каждого curriculum discipline загружаем название дисциплины
    for (let cd of allCurriculumDisciplines.value) {
      const disciplineResp = await fetch(`${API_URL}/discipline/${cd.disciplineId}`);
      const discipline = await disciplineResp.json();
      cd.disciplineName = discipline.name;
      
      // Также загружаем информацию о curriculum для отображения
      const curriculumResp = await fetch(`${API_URL}/curriculum/${cd.curriculumId}`);
      const curriculum = await curriculumResp.json();
      cd.curriculumName = curriculum.name;
    }
  } catch (err) {
    console.error('Ошибка загрузки всех учебных дисциплин', err);
  }
};

// Фильтруем учебные планы по выбранной дисциплине
const filteredCurriculumDisciplines = computed(() => {
  if (!program.value?.curriculumDisciplineId || !allCurriculumDisciplines.value.length) {
    return allCurriculumDisciplines.value;
  }
  
  // Находим текущую выбранную дисциплину
  const currentCd = allCurriculumDisciplines.value.find(cd => cd.id === program.value.curriculumDisciplineId);
  if (!currentCd) return allCurriculumDisciplines.value;
  
  // Фильтруем по disciplineId текущей выбранной дисциплины
  return allCurriculumDisciplines.value.filter(cd => cd.disciplineId === currentCd.disciplineId);
});

const loadTeacher = async () => {
  try {
    const resp = await fetch(`${API_URL}/teacher/${program.value.teacherId}`);
    teacher.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки преподавателя', err);
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

const loadStatus = async () => {
  try {
    const resp = await fetch(`${API_URL}/status/${program.value.statusId}`);
    status.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки статуса', err);
  }
};

const loadAllTeachers = async () => {
  try {
    const resp = await fetch(`${API_URL}/teacher`);
    allTeachers.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки преподавателей', err);
  }
};

const loadAllDisciplines = async () => {
  try {
    const resp = await fetch(`${API_URL}/discipline`);
    allDisciplines.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки дисциплин', err);
  }
};

const loadAllStatuses = async () => {
  try {
    const resp = await fetch(`${API_URL}/status`);
    allStatuses.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки статусов', err);
  }
};

// Метод для преобразования даты в формат input type="date"
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const saveWorkProgram = async () => {
  saving.value = true;
  try {
    const resp = await fetch(`${API_URL}/workProgram/${program.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(program.value)
    });

    if (resp.ok) {
      alert('Изменения сохранены успешно!');
      router.back();
    } else {
      throw new Error('Ошибка сохранения');
    }
  } catch (err) {
    console.error('Ошибка сохранения рабочей программы', err);
    alert('Ошибка при сохранении изменений');
  } finally {
    saving.value = false;
  }
};

const cancelEdit = () => {
  router.back();
};

// При изменении дисциплины обновляем список доступных учебных планов
const onDisciplineChange = () => {
  // Автоматически выбираем первый доступный учебный план для выбранной дисциплины
  const availablePlans = filteredCurriculumDisciplines.value;
  if (availablePlans.length > 0 && program.value) {
    program.value.curriculumDisciplineId = availablePlans[0].id;
  }
};

onMounted(() => {
  loadWorkProgram();
});
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="cancelEdit" class="btn btn-outline-secondary">
        Назад
      </button>
      <h2>Редактирование рабочей программы</h2>
      <div>
        <button @click="saveWorkProgram" class="btn btn-primary" :disabled="saving">
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

    <div v-else-if="program" class="row">
      <!-- Основная информация -->
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Основная информация</h4>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"><strong>Дисциплина:</strong></label>
                  <select 
                    v-model="program.curriculumDisciplineId" 
                    class="form-select"
                    @change="onDisciplineChange"
                  >
                    <option 
                      v-for="cd in allCurriculumDisciplines" 
                      :key="cd.id" 
                      :value="cd.id"
                    >
                      {{ cd.disciplineName }} ({{ cd.curriculumName }})
                    </option>
                  </select>
                </div>

                <!-- Учебный план (показывается только если есть выбор) -->
                <div class="mb-3" v-if="filteredCurriculumDisciplines.length > 1">
                  <label class="form-label"><strong>Учебный план:</strong></label>
                  <select 
                    v-model="program.curriculumDisciplineId" 
                    class="form-select"
                  >
                    <option 
                      v-for="cd in filteredCurriculumDisciplines" 
                      :key="cd.id" 
                      :value="cd.id"
                    >
                      {{ cd.curriculumName }} - Семестр {{ cd.semesterNumber }}
                    </option>
                  </select>
                  <div class="form-text">
                    Доступные учебные планы для выбранной дисциплины
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label"><strong>Составитель:</strong></label>
                  <select 
                    v-model="program.teacherId" 
                    class="form-select"
                    :disabled="!canEditTeacher"
                  >
                    <option v-for="teacher in allTeachers" :key="teacher.id" :value="teacher.id">
                      {{ teacher.fio }}
                    </option>
                  </select>
                  <div v-if="!canEditTeacher" class="form-text text-muted">
                    Только заведующий кафедрой может менять составителя
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label"><strong>Статус:</strong></label>
                  <select 
                    v-model="program.statusId" 
                    class="form-select"
                    :disabled="!canEditStatus"
                  >
                    <option v-for="status in allStatuses" :key="status.id" :value="status.id">
                      {{ status.name }}
                    </option>
                  </select>
                  <div v-if="!canEditStatus" class="form-text text-muted">
                    Только заведующий кафедрой может менять статус
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"><strong>Язык преподавания:</strong></label>
                  <input v-model="program.languages" type="text" class="form-control" placeholder="Введите язык преподавания">
                </div>

                <div class="mb-3">
                  <label class="form-label"><strong>Дата создания:</strong></label>
                  <input 
                    :value="formatDateForInput(program.createdAt)" 
                    type="date" 
                    class="form-control"
                    disabled
                    readonly
                  >
                  <div class="form-text text-muted">
                    Дата создания не может быть изменена
                  </div>
                </div>

                <!-- Информация о текущем учебном плане -->
                <div class="mb-3" v-if="curriculumDisciplines">
                  <label class="form-label"><strong>Текущий учебный план:</strong></label>
                  <div class="form-control bg-light" readonly>
                    <div v-if="curriculum">
                      <strong>Направление:</strong> {{ curriculum.name }}<br>
                      <strong>Семестр:</strong> {{ curriculumDisciplines.semesterNumber }}<br>
                      <strong>Часы:</strong> {{ curriculumDisciplines.totalHours }} ч.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Содержание рабочей программы -->
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Содержание рабочей программы</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Цели дисциплины:</strong></label>
                <textarea v-model="program.goals" class="form-control" rows="4" placeholder="Введите цели дисциплины"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Задачи дисциплины:</strong></label>
                <textarea v-model="program.tasks" class="form-control" rows="4" placeholder="Введите задачи дисциплины"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Формируемые компетенции:</strong></label>
                <textarea v-model="program.competencies" class="form-control" rows="3" placeholder="Введите формируемые компетенции"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Результаты обучения:</strong></label>
                <textarea v-model="program.learningOutcomes" class="form-control" rows="3" placeholder="Введите результаты обучения"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Требования:</strong></label>
                <textarea v-model="program.requirements" class="form-control" rows="3" placeholder="Введите требования"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Содержание по неделям:</strong></label>
                <textarea v-model="program.contentByWeeks" class="form-control" rows="4" placeholder="Введите содержание по неделям"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Фонды оценочных средств:</strong></label>
                <textarea v-model="program.assessmentTools" class="form-control" rows="3" placeholder="Введите фонды оценочных средств"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Система оценивания:</strong></label>
                <textarea v-model="program.gradingSystem" class="form-control" rows="3" placeholder="Введите систему оценивания"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Образовательные технологии:</strong></label>
                <textarea v-model="program.educationalTechnology" class="form-control" rows="3" placeholder="Введите образовательные технологии"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Материально-техническое обеспечение:</strong></label>
                <textarea v-model="program.logistics" class="form-control" rows="3" placeholder="Введите материально-техническое обеспечение"></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Литература:</strong></label>
                <textarea v-model="program.references_t" class="form-control" rows="4" placeholder="Введите литературу"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="col-12">
        <div class="d-flex gap-2 justify-content-end">
          <button @click="cancelEdit" class="btn btn-secondary">Отмена</button>
          <button @click="saveWorkProgram" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  font-weight: bold;
}

.form-control:disabled {
  background-color: #f8f9fa;
  opacity: 1;
}
</style>