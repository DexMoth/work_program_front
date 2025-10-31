
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { API_URL } from '@/js/api';
import { PDFGenerator } from '@/js/pdfGenerator'

const route = useRoute();
const program = ref(null);
const curriculumDisciplines = ref(null);
const curriculum = ref(null);
const department = ref(null);
const studyDirection = ref(null);
const dis = ref(null);
const teacher = ref(null);
const studyForms = ref([]);
const status = ref(null);
const faculties = ref([]);
const departments = ref([]);
const studyDirections = ref([]);
const competencies = ref([]);
const competenceIndicators = ref([]);
const loading = ref(true);
const generatingPdf = ref(false);

// генерируем и сохраняем pdf
const generatePDF = async () => {
  if (!program.value || !curriculumDisciplines.value) {
    alert('Данные еще не загружены');
    return;
  }

  generatingPdf.value = true;
  try {
    const pdfData = {
      program: program.value,
      curriculumDisciplines: curriculumDisciplines.value,
      curriculum: curriculum.value,
      dis: dis.value,
      teacher: teacher.value,
      status: status.value,
      studyForms: studyForms.value,
      department: department.value,
      studyDirection: studyDirection.value,
      faculty: getFacultyForDepartment(department.value?.id),
      competencies: competencies.value,
      competenceIndicators: competenceIndicators.value,
      getStudyFormName,
      formatDate,
      getCompetenceName,
      getIndicatorsForCompetence
    };

    await PDFGenerator.saveWorkProgramPDF(pdfData);
    
  } catch (error) {
    console.error('Ошибка генерации PDF:', error);
    alert('Ошибка при создании PDF файла: ' + error.message);
  } finally {
    generatingPdf.value = false;
  }
};

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
      loadDepartments(),
      loadStudyDirections(),
      loadCompetencies(),
      loadCompetenceIndicators()
    ]);
  } catch (err) {
    console.error('Ошибка загрузки рабочей программы', err);
  } finally {
    loading.value = false;
  }
};

const loadFaculties = async () => {
  try {
    const resp = await fetch(`${API_URL}/faculty`);
    faculties.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки факультетов', err);
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

const loadStudyDirections = async () => {
  try {
    const resp = await fetch(`${API_URL}/studyDirection`);
    studyDirections.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки направлений', err);
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
    await loadDepartmentAndStudyDirection();
  } catch (err) {
    console.error('Ошибка загрузки учебной дисциплины', err);
  }
};

const loadDepartmentAndStudyDirection = async () => {
  try {
    if (dis.value?.departmentId) {
      const resp = await fetch(`${API_URL}/department/${dis.value.departmentId}`);
      department.value = await resp.json();
    }
    if (curriculum.value?.studyDirectionId) {
      const resp = await fetch(`${API_URL}/studyDirection/${curriculum.value.studyDirectionId}`);
      studyDirection.value = await resp.json();
    }
  } catch (err) {
    console.error('Ошибка загрузки кафедры или направления', err);
  }
};


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

const loadCompetencies = async () => {
  try {
    if (!dis.value?.id) return;
    
    const resp = await fetch(`${API_URL}/discipline/${dis.value.id}/competencies`);
    competencies.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки компетенций', err);
  }
};

const loadCompetenceIndicators = async () => {
  try {
    const resp = await fetch(`${API_URL}/competenceIndicators`);
    competenceIndicators.value = await resp.json();
  } catch (err) {
    console.error('Ошибка загрузки индикаторов компетенций', err);
  }
};

const getFacultyForDepartment = (departmentId) => {
  if (!departmentId) return null;
  const dept = departments.value.find(d => d.id === departmentId);
  if (!dept) return null;
  return faculties.value.find(f => f.id === dept.facultyId);
};

const getDepartmentName = (departmentId) => {
  const department = departments.value.find(d => d.id === departmentId);
  return department ? department.name : 'Неизвестно';
};

const getStudyDirectionName = (directionId) => {
  const direction = studyDirections.value.find(sd => sd.id === directionId);
  return direction ? `${direction.code} - ${direction.name}` : 'Неизвестно';
};

const getStudyFormName = (studyFormId) => {
  const form = studyForms.value.find(sf => sf.id === studyFormId);
  return form ? form.name : 'Неизвестно';
};

const getCompetenceName = (competenceId) => {
  const competence = competencies.value.find(c => c.id === competenceId);
  return competence ? `${competence.code} - ${competence.description}` : 'Неизвестно';
};

const getIndicatorsForCompetence = (competenceId) => {
  return competenceIndicators.value.filter(ci => ci.competenceId === competenceId);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const changeStatus = async (newStatus) => {
  try {
    const resp = await fetch(`${API_URL}/workProgram/${program.value.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (resp.ok) {
      program.value.status = newStatus;
    }
  } catch (err) {
    console.error('Ошибка изменения статуса', err);
  }
};

const deleteProgram = async () => {
  var choose = confirm("Удалить рабочую программу?")
  if (choose == true) {
    const resp = await fetch(`${API_URL}/workProgram/${route.params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  alert("Рабочая программа удалена")
  }
};

onMounted(() => {
  loadWorkProgram();
});
</script>

<template>
    <div class="container mt-4">
      <button @click="$router.back()" class="btn btn-outline-secondary mb-4">
          Назад
      </button>
      <router-link 
          :to="`/work_programs/edit/${route.params.id}`"
          class="btn btn-outline-secondary mb-4 ms-2"
      >
          Редактировать основную информацию
      </router-link>
      <button
        @click="generatePDF"
        class="btn btn-outline-secondary mb-4 ms-2"
        :disabled="generatingPdf || loading"
      >
        {{ generatingPdf ? 'Генерация PDF...' : 'Сохранить в PDF' }}
      </button>
      <button @click="deleteProgram" class="btn btn-outline-secondary mb-4 ms-4">
          Удалить
      </button>
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
                  <p><strong>Дисциплина:</strong> {{ dis?.name }}</p>
                  <p><strong>Составитель:</strong> {{ teacher?.fio }}</p>
                  <p><strong>Статус:</strong> 
                      {{ status.name }}
                  </p>
                </div>
                <div class="col-md-6">
                  <p><strong>Язык преподавания:</strong> {{ program.languages || 'Не указан' }}</p>
                  <p><strong>Дата создания:</strong> {{ formatDate(program.createdAt) }}</p>
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
              <div class="table-responsive">
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
                    <tr>
                      <td>{{ getStudyFormName(curriculum.studyFormId) }}</td>
                      <td>{{ curriculumDisciplines.semesterNumber }}</td>
                      <td>{{ curriculumDisciplines.totalContactHours }}</td>
                      <td>{{ curriculumDisciplines.lectureHours }}</td>
                      <td>{{ curriculumDisciplines.practiceHours }}</td>
                      <td>{{ curriculumDisciplines.labHours }}</td>
                      <td>{{ curriculumDisciplines.totalSelfStudyHours }}</td>
                      <td>{{ curriculumDisciplines.consultationHours }}</td>
                      <td>{{ curriculumDisciplines.theoryStudyHours }}</td>
                      <td>{{ curriculumDisciplines.courseProjectHours }}</td>
                      <td>{{ curriculumDisciplines.rgrHours }}</td>
                      <td>{{ curriculumDisciplines.essayHours }}</td>
                      <td>{{ curriculumDisciplines.practicePreparationHours }}</td>
                      <td>{{ curriculumDisciplines.labPreparationHours }}</td>
                      <td>{{ curriculumDisciplines.eLearningHours }}</td>
                      <td>{{ curriculumDisciplines.intermediateAssessmentHours }}</td>
                      <td>{{ curriculumDisciplines.totalHours }}</td>
                      <td>{{ curriculumDisciplines.credits }}</td>
                      <td>{{ curriculumDisciplines.assessmentForm }}</td>
                    </tr>
                  </tbody>
                </table>
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
                  <h6>Цели дисциплины</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.goals || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <h6>Задачи дисциплины</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.tasks || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-12 mb-3">
                  <h6>Формируемые компетенции</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.competencies || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-12 mb-3">
                  <h6>Результаты обучения</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.learningOutcomes || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-12 mb-3">
                  <h6>Требования</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.requirements || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-12 mb-3">
                  <h6>Содержание по неделям</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.contentByWeeks || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <h6>Фонды оценочных средств</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.assessmentTools || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <h6>Система оценивания</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.gradingSystem || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <h6>Образовательные технологии</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.educationalTechnology || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <h6>Материально-техническое обеспечение</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.logistics || 'Не заполнено' }}
                  </div>
                </div>
                <div class="col-12 mb-3">
                  <h6>Литература</h6>
                  <div class="border p-3 bg-light rounded">
                    {{ program.references_t || 'Не заполнено' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Кнопки действий -->
        <div class="col-12">
          <div class="d-flex gap-2">
            <router-link :to="`/work-programs/edit/${$route.params.id}`" 
                        class="btn btn-primary"
                        v-if="program.status === 'draft'">
              Редактировать
            </router-link>
            <button class="btn btn-success" 
                    @click="changeStatus('in_review')"
                    v-if="program.status === 'draft'">
              На проверку
            </button>
            <router-link to="/work_programs" class="btn btn-secondary">
              Назад к списку
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </template>