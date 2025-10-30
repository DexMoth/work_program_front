<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from '@/js/api';
import { useAuthStore } from '@/js/auth';

const router = useRouter();
const authStore = useAuthStore();

const program = ref({
  curriculumDisciplineId: null,
  teacherId: null,
  statusId: 1, // По умолчанию "Черновик" или первый статус
  languages: '',
  goals: '',
  tasks: '',
  competencies: '',
  learningOutcomes: '',
  requirements: '',
  contentByWeeks: '',
  assessmentTools: '',
  gradingSystem: '',
  educationalTechnology: '',
  logistics: '',
  references_t: ''
});

const allCurriculumDisciplines = ref([]);
const allTeachers = ref([]);
const allStatuses = ref([]);
const allDisciplines = ref([]);
const loading = ref(false);
const saving = ref(false);

// Вычисляемые свойства для прав доступа
const canEditTeacher = computed(() => {
  return authStore.isDepartmentHead; // Только зав. кафедрой может менять составителя
});

const canEditStatus = computed(() => {
  return authStore.isDepartmentHead; // Только зав. кафедрой может менять статус
});

// Фильтруем учебные планы по выбранной дисциплине
const filteredCurriculumDisciplines = computed(() => {
  if (!program.value.curriculumDisciplineId || !allCurriculumDisciplines.value.length) {
    return allCurriculumDisciplines.value;
  }
  
  // Находим текущую выбранную дисциплину
  const currentCd = allCurriculumDisciplines.value.find(cd => cd.id === program.value.curriculumDisciplineId);
  if (!currentCd) return allCurriculumDisciplines.value;
  
  // Фильтруем по disciplineId текущей выбранной дисциплины
  return allCurriculumDisciplines.value.filter(cd => cd.disciplineId === currentCd.disciplineId);
});

const loadAllCurriculumDisciplines = async () => {
  try {
    const resp = await fetch(`${API_URL}/curriculumDiscipline`);
    allCurriculumDisciplines.value = await resp.json();

    // Для каждого curriculum discipline загружаем название дисциплины и учебного плана
    for (let cd of allCurriculumDisciplines.value) {
      const disciplineResp = await fetch(`${API_URL}/discipline/${cd.disciplineId}`);
      const discipline = await disciplineResp.json();
      cd.disciplineName = discipline.name;
      
      const curriculumResp = await fetch(`${API_URL}/curriculum/${cd.curriculumId}`);
      const curriculum = await curriculumResp.json();
      cd.curriculumName = curriculum.name;
    }
  } catch (err) {
    console.error('Ошибка загрузки учебных дисциплин', err);
  }
};

const loadAllTeachers = async () => {
  try {
    const resp = await fetch(`${API_URL}/teacher`);
    allTeachers.value = await resp.json();
    
    if (authStore.currentUser) {
      program.value.teacherId = authStore.currentUser.id;
    }
  } catch (err) {
    console.error('Ошибка загрузки преподавателей', err);
  }
};

const loadAllStatuses = async () => {
  try {
    const resp = await fetch(`${API_URL}/status`);
    allStatuses.value = await resp.json();
    
    // По умолчанию устанавливаем первый статус (обычно "Черновик")
    if (allStatuses.value.length > 0 && !canEditStatus) {
      program.value.statusId = allStatuses.value[0].id;
    }
  } catch (err) {
    console.error('Ошибка загрузки статусов', err);
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

// При изменении дисциплины обновляем список доступных учебных планов
const onDisciplineChange = () => {
  // Автоматически выбираем первый доступный учебный план для выбранной дисциплины
  const availablePlans = filteredCurriculumDisciplines.value;
  if (availablePlans.length > 0) {
    program.value.curriculumDisciplineId = availablePlans[0].id;
  } else {
    program.value.curriculumDisciplineId = null;
  }
};

const createWorkProgram = async () => {
  saving.value = true;
  try {
    const resp = await fetch(`${API_URL}/workProgram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(program.value)
    });

    if (resp.ok) {
      alert('Рабочая программа успешно создана!');
      router.push('/work_programs');
    } else {
      throw new Error('Ошибка создания');
    }
  } catch (err) {
    console.error('Ошибка создания рабочей программы', err);
    alert('Ошибка при создании рабочей программы');
  } finally {
    saving.value = false;
  }
};

const cancelCreate = () => {
  router.back();
};

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadAllCurriculumDisciplines(),
      loadAllTeachers(),
      loadAllStatuses(),
      loadAllDisciplines()
    ]);
  } catch (err) {
    console.error('Ошибка загрузки данных', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button @click="cancelCreate" class="btn btn-outline-secondary">
        Назад
      </button>
      <h2>Создание рабочей программы</h2>
      <div>
        <button @click="createWorkProgram" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          {{ saving ? 'Создание...' : 'Создать' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else class="row">
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
                    required
                  >
                    <option value="" disabled>Выберите дисциплину</option>
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
                    required
                  >
                    <option value="" disabled>Выберите учебный план</option>
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
                    required
                  >
                    <option value="" disabled>Выберите составителя</option>
                    <option v-for="teacher in allTeachers" :key="teacher.id" :value="teacher.id">
                      {{ teacher.fio }}
                    </option>
                  </select>
                  <div v-if="!canEditTeacher" class="form-text text-muted">
                    Вы будете указаны как составитель программы
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label"><strong>Статус:</strong></label>
                  <select 
                    v-model="program.statusId" 
                    class="form-select"
                    :disabled="!canEditStatus"
                    required
                  >
                    <option value="" disabled>Выберите статус</option>
                    <option v-for="status in allStatuses" :key="status.id" :value="status.id">
                      {{ status.name }}
                    </option>
                  </select>
                  <div v-if="!canEditStatus" class="form-text text-muted">
                    Программа будет создана со статусом "{{ allStatuses.find(s => s.id === program.statusId)?.name }}"
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"><strong>Язык преподавания:</strong></label>
                  <input 
                    v-model="program.languages" 
                    type="text" 
                    class="form-control" 
                    placeholder="Введите язык преподавания"
                    required
                  >
                </div>

                <!-- Информация о текущем учебном плане -->
                <div class="mb-3" v-if="program.curriculumDisciplineId">
                  <label class="form-label"><strong>Информация о учебном плане:</strong></label>
                  <div class="form-control bg-light" readonly>
                    <div v-if="allCurriculumDisciplines.length > 0">
                      <template v-for="cd in allCurriculumDisciplines" :key="cd.id">
                        <div v-if="cd.id === program.curriculumDisciplineId">
                          <strong>Дисциплина:</strong> {{ cd.disciplineName }}<br>
                          <strong>Направление:</strong> {{ cd.curriculumName }}<br>
                          <strong>Семестр:</strong> {{ cd.semesterNumber }}<br>
                          <strong>Общее количество часов:</strong> {{ cd.totalHours }} ч.
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Подсказка если дисциплина не выбрана -->
                <div class="mb-3" v-else>
                  <div class="alert alert-info">
                    <small>
                      <i class="fas fa-info-circle me-1"></i>
                      Выберите дисциплину чтобы увидеть информацию о учебном плане
                    </small>
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
              <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Цели дисциплины:</strong></label>
                <textarea 
                  v-model="program.goals" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Введите цели дисциплины"
                  required
                ></textarea>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Задачи дисциплины:</strong></label>
                <textarea 
                  v-model="program.tasks" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Введите задачи дисциплины"
                  required
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Формируемые компетенции:</strong></label>
                <textarea 
                  v-model="program.competencies" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите формируемые компетенции"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Результаты обучения:</strong></label>
                <textarea 
                  v-model="program.learningOutcomes" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите результаты обучения"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Требования:</strong></label>
                <textarea 
                  v-model="program.requirements" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите требования"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Содержание по неделям:</strong></label>
                <textarea 
                  v-model="program.contentByWeeks" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Введите содержание по неделям"
                ></textarea>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Фонды оценочных средств:</strong></label>
                <textarea 
                  v-model="program.assessmentTools" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите фонды оценочных средств"
                ></textarea>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Система оценивания:</strong></label>
                <textarea 
                  v-model="program.gradingSystem" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите систему оценивания"
                ></textarea>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Образовательные технологии:</strong></label>
                <textarea 
                  v-model="program.educationalTechnology" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите образовательные технологии"
                ></textarea>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Материально-техническое обеспечение:</strong></label>
                <textarea 
                  v-model="program.logistics" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите материально-техническое обеспечение"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Литература:</strong></label>
                <textarea 
                  v-model="program.references_t" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Введите литературу"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="col-12">
        <div class="d-flex gap-2 justify-content-end">
          <button @click="cancelCreate" class="btn btn-secondary">Отмена</button>
          <button @click="createWorkProgram" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Создание...' : 'Создать программу' }}
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