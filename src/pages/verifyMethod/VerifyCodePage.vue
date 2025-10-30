<template>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-header bg-warning text-white text-center">
                        <h4 class="mb-0">Введите код подтверждения</h4>
                    </div>
                    <div class="card-body">
                        <p class="text-muted mb-3">
                            Код отправлен на почту
                        </p>
                        
                        <p class="text-muted small mb-3">
                            Код действителен: 
                            <span :class="{ 'text-danger': remainingTime < 30 }">
                                {{ formatTime(remainingTime) }}
                            </span>
                        </p>

                        <form @submit.prevent="verifyCode">
                            <div class="mb-3">
                                <label for="code" class="form-label">Код подтверждения</label>
                                <input
                                    v-model="code"
                                    type="text"
                                    class="form-control text-center"
                                    id="code"
                                    maxlength="6"
                                    placeholder="000000"
                                    required
                                    :disabled="loading"
                                >
                            </div>

                            <div v-if="error" class="alert alert-danger">
                                {{ error }}
                            </div>

                            <button 
                                type="submit" 
                                class="btn btn-primary w-100 mb-2"
                                :disabled="loading || remainingTime === 0"
                            >
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ loading ? 'Проверка...' : 'Подтвердить' }}
                            </button>

                            <button 
                                type="button" 
                                @click="resendCode"
                                class="btn btn-outline-secondary w-100"
                                :disabled="loading || remainingTime > 0"
                            >
                                Отправить код повторно
                            </button>
                        </form>

                        <div class="text-center mt-3">
                            <button @click="goBack" class="btn btn-link">
                                Назад
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/js/auth'

const router = useRouter()
const authStore = useAuthStore()

const code = ref('')
const loading = ref(false)
const error = ref('')
const timer = ref(null)

const verificationTarget = computed(() => {
    const method = authStore.verificationMethod
    const user = authStore.currentUser
    if (method === 'sms' && user) return user.phone
    if (method === 'email' && user) return user.email
    return 'выбранный способ'
})

const remainingTime = computed(() => authStore.getRemainingTime())

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

const verifyCode = async () => {
    loading.value = true
    error.value = ''

    const result = await authStore.verifyCode(code.value)
    
    if (result.success) {
        router.push('/profile') //
    } else {
        error.value = result.error
    }
    
    loading.value = false
}

const resendCode = async () => {
    loading.value = true
    error.value = ''

    const result = await authStore.requestVerificationCode(authStore.verificationMethod)
    
    if (!result.success) {
        error.value = result.error
    }
    
    loading.value = false
}

const goBack = () => {
    router.push('/verify-method')
}

// Таймер для обновления оставшегося времени
onMounted(() => {
    timer.value = setInterval(() => {
        // Таймер обновляется автоматически через computed свойство
    }, 1000)
})

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value)
    }
})
</script>