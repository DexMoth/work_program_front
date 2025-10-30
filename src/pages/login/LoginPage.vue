<template>
  <div class="container mt-5">
      <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
              <div class="card">
                  <div class="card-header bg-primary text-white text-center">
                      <h4 class="mb-0">Вход для преподавателей</h4>
                  </div>
                  <div class="card-body">
                      <form @submit.prevent="handleLogin">
                          <div class="mb-3">
                              <label for="login" class="form-label">Логин</label>
                              <input
                                  v-model="login"
                                  type="text"
                                  class="form-control"
                                  id="login"
                                  required
                                  :disabled="loading"
                              >
                          </div>
                          <div class="mb-3">
                              <label for="password" class="form-label">Пароль</label>
                              <input
                                  v-model="password"
                                  type="password"
                                  class="form-control"
                                  id="password"
                                  required
                                  :disabled="loading"
                              >
                          </div>
                          <div v-if="error" class="alert alert-danger">
                              {{ error }}
                          </div>
                          <button 
                              type="submit" 
                              class="btn btn-primary w-100"
                              :disabled="loading"
                          >
                              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                              {{ loading ? 'Вход...' : 'Войти' }}
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/js/auth'

const router = useRouter()
const authStore = useAuthStore()

const login = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  console.log(login, password)
  const result = await authStore.login(login.value, password.value)
  
  if (result.success) {
      // Переходим на страницу выбора метода верификации
      router.push('/verify-method')
  } else {
      error.value = result.error
  }
  
  loading.value = false
}
</script>