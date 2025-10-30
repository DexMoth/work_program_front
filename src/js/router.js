import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/login/LoginPage.vue'
import FacultiesPage from '@/pages/faculties/FacultiesPage.vue'
import DepartmentsPage from '@/pages/departments/DepartmentsPage.vue'
import StudyDirectionsPage from '@/pages/study_directions/StudyDirectionsPage.vue'
import DisciplinesPage from '@/pages/disciplines/DisciplinesPage.vue'
import ProfilePage from '@/pages/profile/ProfilePage.vue'
import WorkProgramsPage from '@/pages/work_programs/WorkProgramsPage.vue'
import WorkProgramPage from '@/pages/work_program/WorkProgramPage.vue'
import WorkProgramEditPage from '@/pages/work_program_edit/WorkProgramEditPage.vue'
import WorkProgramCreatePage from '@/pages/work_program_edit/WorkProgramCreatePage.vue'
import CurriculumEditPage from '@/pages/work_program_edit/CurriculumEditPage.vue'
import CurriculumsPage from '@/pages/curriculum/CurriculumsPage.vue'
import CurriculumPage from '@/pages/curriculum/CurriculumPage.vue'
import CurriculumCreatePage from '@/pages/curriculum/create/CurriculumCreatePage.vue'
import VerifyCodePage from '@/pages/verifyMethod/VerifyCodePage.vue'
import VerifyMethodPage from '@/pages/verifyMethod/VerifyMethodPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/verify-method',
    name: 'VerifyMethod',
    component: VerifyMethodPage
  },
  {
    path: '/verify-code',
    name: 'VerifyCode',
    component: VerifyCodePage
  },
  {
    path: '/faculties',
    name: 'Faculties',
    component: FacultiesPage
  },
  {
    path: '/departments',
    name: 'Departments',
    component: DepartmentsPage
  },
  {
    path: '/study_directions',
    name: 'StudyDirections',
    component: StudyDirectionsPage
  },
  {
    path: '/disciplines',
    name: 'Disciplines',
    component: DisciplinesPage
  },
  {
    path: '/',
    name: 'Profile',
    component: ProfilePage
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage
  },
  {
    path: '/work_programs',
    name: 'WorkPrograms',
    component: WorkProgramsPage
  },
  {
    path: '/work_programs/:id',
    name: 'WorkProgram',
    component: WorkProgramPage
  },
  {
    path: '/work_programs/edit/:id',
    name: 'WorkProgramEdit',
    component: WorkProgramEditPage
  },
  {
    path: '/work_programs/create',
    name: 'WorkProgramCreate',
    component: WorkProgramCreatePage
  },
  {
    path: '/work_programs/curriculum/edit/:id',
    name: 'CurriculumEditPage',
    component: CurriculumEditPage
  },
  {
    path: '/curriculums',
    name: 'CurriculumsPage',
    component: CurriculumsPage
  },
  {
    path: '/curriculums/:id',
    name: 'CurriculumPage',
    component: CurriculumPage
  },
  {
    path: '/curriculums/create',
    name: 'CurriculumCreatePages',
    component: CurriculumCreatePage
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router