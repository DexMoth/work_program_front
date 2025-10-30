<template>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-header bg-info text-white text-center">
                        <h4 class="mb-0">Проверка безопасности</h4>
                    </div>
                    <div class="card-body">
                        <p class="text-muted mb-4">
                            Защищаем ваш аккаунт. Пожалуйста, подтвердите вашу личность через код верификации
                        </p>
                        <div class="d-grid gap-2">
                            <button 
                                @click="requestCode('email')"
                                class="btn btn-outline-primary"
                                :disabled="loading"
                            >
                                <i class="fas fa-envelope me-2"></i>
                                Получить код по Email
                            </button>
                        </div>

                        <div v-if="error" class="alert alert-danger mt-3">
                            {{ error }}
                        </div>

                        <div class="text-center mt-3">
                            <button @click="goBack" class="btn btn-link btn-sm">
                                Назад к входу
                            </button>
                        </div>
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

const loading = ref(false)
const error = ref('')

const requestCode = async (method) => {
    loading.value = true
    error.value = ''

    const result = await authStore.requestVerificationCode(method)
    
    if (result.success) {
        router.push('/verify-code')
    } else {
        error.value = result.error
    }
    
    loading.value = false
}

const goBack = () => {
    router.push('/login')
}
</script>