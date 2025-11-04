<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from '@/js/api';
import { useAuthStore } from '@/js/auth';

const router = useRouter();
const authStore = useAuthStore();

const program = ref({
  curriculumId: null,
  teacherId: null,
  statusId: 1, // По умолчанию Черновик
  languages: 'русский',
  goals: 'Целью освоения дисциплины (модуля) является формирование у будущих выпускников компетенций в области ...',
  tasks: 'Задачами освоения дисциплины (модуля) являются формирование у обучающихся:...',
  competencies: '',
  learningOutcomes: 'В результате изучения дисциплины (модуля) обучающиеся на основе приобретенных знаний, умений и навыков достигают освоения компетенций на определенном уровне.',
  requirements: '',
  thematicPlan: 'Раздел 1. Раздел 1.	Особенности построения систем с использованием методов искусственного интеллекта.\nОбъем часов:\n Очная: лекции 10, практика 0, лабораторные работы 24, самостоятельная работа 31, всего 65',
  assessmentTools: 'Компетенция: ПК-1. Код индикатора: ИД-1. Наименование оценочного средства: Лабораторные работы, собеседование, тест, зачет, экзамен',
  gradingSystem: '1. Разработка веб-сервисов для анализа слабоструктурированных информационных ресурсов : учебное пособие / В. В. Воронина. – Ульяновск : УлГТУ, 2016. – 165 с. URL: http://lib.ulstu.ru/venec/disk/2017/44.pdf; 2. Кудрявцев, Н. Г. Практика применения компьютерного зрения и элементов машинного обучения в учебных проектах : учебное пособие / Н. Г. Кудрявцев, И. Н. Фролов. — Горно-Алтайск : ГАГУ, 2022. — 180 с. — Текст : электронный // Лань : электронно-библиотечная система. — URL:https://e.lanbook.com/book/271100',
  educationalTechnology: '1.	Воронина, В. В. Теория и практика машинного обучения : учебное пособие / В. В. Воронина, А. В. Михеев, Н. Г. Ярушкина, К. В. Святов. – Ульяновск : УлГТУ, 2017. – 290 с. URL:  http://lib.ulstu.ru/venec/disk/2017/191.pdf',
  logistics: 'Учебные аудитории для лекций оснащены учебной мебелью, магнитно-маркерными досками и техническими средствами обучения (проектор, экран, компьютер) с ПО: Microsoft Windows, Office, Adobe Reader, 7-Zip, Антивирус Касперского; для лабораторных и практических работ - компьютерные классы с ЛВС, Интернетом и ПО: PyCharm, Microsoft Office; для контроля знаний - компьютеризированные аудитории с ЛВС и ПО для аттестации; для самостоятельной работы - читальный зал с ПЭВМ, Wi-Fi и стандартным ПО.',
  references_t: '1. Национальный Открытый Университет «ИНТУИТ» https://intuit.ru 2. Википедия – свободная энциклопедия https://ru.wikipedia.org',
  theoreticalCourse: 'Основные вопросы, освещаемые на лекциях: Раздел 1.	Особенности построения систем с использованием методов искусственного интеллекта 1.	Введение. Возможности и ограничения применения искусственного интеллекта. 2.	Python – инструмента разработки систем искусственного интеллекта. Работа с DataFrame 3.	Разработка веб-сервисов. Визуализация данных. Типовые наборы данных. 4.	Модели представления, хранения и управления знаниями. Метрики качества моделей. Виды обучения. Понятие переобучения модели. Способы борьбы с переобучением',
  practicalWork: ' Учебным планом не предусмотрены',
  laboratoryWorkshop: 'Первый семестр: 1. Веб-сервис для загрузки и представления данных. 2. Веб-сервис для простейшего анализа данных',
  courseProject: 'Учебным планом не предусмотрен',
  independentWork: 'Виды самостоятельной работы распределяются в течение семестра. Подготовка к промежуточной аттестации ведется в установленные календарным учебным графиком сроки.'
});

const allCurriculums = ref([]);
const allTeachers = ref([]);
const allStatuses = ref([]);
const discipline = ref();
const loading = ref(false);
const saving = ref(false);

// для прав доступа
const canEditTeacher = computed(() => {
  return authStore.isDepartmentHead;
});

const canEditStatus = computed(() => {
  return authStore.isDepartmentHead;
});

const loadAllCurriculums = async () => {
  try {
    const resp = await fetch(`${API_URL}/curriculum`);
    allCurriculums.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки учебных планов', err);
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

const selectedCurriculum = computed(() => {
  if (!program.value.curriculumId) return null;
  return allCurriculums.value.find(c => c.id === program.value.curriculumId);
});

const createWorkProgram = async () => {
  saving.value = true;
  console.log(program.value)
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
      loadAllCurriculums(),
      loadAllTeachers(),
      loadAllStatuses()
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
                  <label class="form-label"><strong>Учебный план:</strong></label>
                  <select 
                    v-model="program.curriculumId" 
                    class="form-select"
                    required
                  >
                    <option value="" disabled>Выберите учебный план</option>
                    <option 
                      v-for="curriculum in allCurriculums" 
                      :key="curriculum.id" 
                      :value="curriculum.id"
                    >
                      {{ curriculum.name }}
                    </option>
                  </select>
                  <div class="form-text">
                    Выберите учебный план
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
                >
                Целью основения дисциплины является ...
              </textarea>
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
                <label class="form-label"><strong>Результаты обучения:</strong></label>
                <textarea 
                  v-model="program.learningOutcomes" 
                  class="form-control" 
                  rows="3" 
                  placeholder="Введите результаты обучения"
                ></textarea>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label"><strong>Содержание по неделям:</strong></label>
                <label class="form-label">Тематический план:</label>
                <textarea v-model="program.thematicPlan" class="form-control" rows="4" placeholder=""></textarea>
                <label class="form-label">Теоретический курс:</label>
                <textarea v-model="program.theoreticalCourse" class="form-control" rows="4" placeholder=""></textarea>
                <label class="form-label">Практические работы:</label>
                <textarea v-model="program.practicalWork" class="form-control" rows="4" placeholder=""></textarea>
                <label class="form-label">Лабораторные работы:</label>
                <textarea v-model="program.laboratoryWorkshop" class="form-control" rows="4" placeholder=""></textarea>
                <label class="form-label">Курсовой проект:</label>
                <textarea v-model="program.courseProject" class="form-control" rows="4" placeholder=""></textarea>
                <label class="form-label">Самостоятельная работа:</label>
                <textarea v-model="program.independentWork" class="form-control" rows="4" placeholder=""></textarea>
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