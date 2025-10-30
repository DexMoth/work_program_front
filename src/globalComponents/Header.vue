<template>
  <header class="bg-primary text-white shadow-sm">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center py-2">
        <!-- Логотип и название университета -->
        <div class="d-flex align-items-center">
          <div class="me-3 fs-2">
          </div>
          <div>
            <h1 class="h4 mb-0 fw-bold">Школа Чародейства и Волшебства Хогвартс</h1>
            <p class="mb-0 small">Электронно-образовательная среда</p>
          </div>
        </div>

        <!-- Навигация для авторизованных пользователей -->
        <nav class="d-none d-md-flex align-items-center" v-if="authStore.isAuthenticated">
          <router-link 
            to="/faculties" 
            class="text-white text-decoration-none mx-3 py-2"
            active-class="border-bottom border-white"
          >
            Факультеты
          </router-link>
          <router-link 
            to="/disciplines" 
            class="text-white text-decoration-none mx-3 py-2"
            active-class="border-bottom border-white"
          >
            Дисциплины
          </router-link>
          <router-link 
            to="/departments" 
            class="text-white text-decoration-none mx-3 py-2"
            active-class="border-bottom border-white"
          >
            Кафедры
          </router-link>
          <router-link 
            to="/study_directions" 
            class="text-white text-decoration-none mx-3 py-2"
            active-class="border-bottom border-white"
          >
            Направления
          </router-link>
          <router-link 
            to="/curriculums" 
            class="text-white text-decoration-none mx-3 py-2"
            active-class="border-bottom border-white"
          >
            Учебные планы
          </router-link>
          <router-link 
            to="/work_programs" 
            class="text-white text-decoration-none mx-3 py-2"
            active-class="border-bottom border-white"
          >
            Рабочие программы
          </router-link>
        </nav>

        <!-- Блок пользователя -->
        <div class="d-flex align-items-center" v-if="authStore.isAuthenticated && authStore.currentUser">
          <div class="dropdown">
            <button 
              class="btn btn-outline-light d-flex align-items-center dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div class="text-start me-2 d-none d-sm-block">
                <div class="small fw-bold">{{ authStore.currentUser.fio }}</div>
              </div>
              <i class="fas fa-user-circle ms-1"></i>
            </button>
            
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link to="/profile" class="dropdown-item">
                  <i class="fas fa-user me-2"></i>
                  Профиль
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button @click="logout" class="dropdown-item text-danger">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  Выйти
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Кнопка входа для неавторизованных -->
        <div v-else>
          <router-link to="/login" class="btn btn-outline-light">
            <i class="fas fa-sign-in-alt me-2"></i>
            Войти в систему
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/js/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

// При монтировании компонента проверяем авторизацию
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }
})
</script>

<style scoped>
header {
  width: 100%;
  background-color: var(--bs-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.router-link-active {
  font-weight: bold;
}

.dropdown-toggle::after {
  margin-left: 0.5rem;
}

/* Стили для активных ссылок навигации */
.router-link-active.router-link-exact-active {
  border-bottom: 2px solid white !important;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .container > div {
    flex-direction: column;
    gap: 1rem;
  }
  
  nav {
    order: 2;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  nav a {
    margin: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>