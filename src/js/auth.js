import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_URL } from './api'

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref(null)
    const isAuthenticated = ref(false)
    const isVerified = ref(false) // для письма
    const verificationMethod = ref(null)
    const verificationCode = ref(null)
    const codeExpiresAt = ref(null)

    const checkAuth = async () => {
        try {
            const response = await fetch(API_URL + '/teacher/me', {
                credentials: 'include'
            })
            if (response.ok) {
                currentUser.value = await response.json()
                isAuthenticated.value = true
                isVerified.value = currentUser.verified || false
                return true
            } else {
                currentUser.value = null
                isAuthenticated.value = false
                return false
            }
        } catch {
            currentUser.value = null
            isAuthenticated.value = false
            return false
        }
    }

    const userRole = computed(() => {
        if (!currentUser.value) {
            return null
        }
        return currentUser.value.roleId || 1
    })
    
    const isDepartmentHead = computed(() => {
        const role = userRole.value
        return role === 2
    })

    const login = async (login, password) => {
        try {
            const response = await fetch(API_URL + '/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ login, password })
            })

            if (response.ok) {
                return { success: true }
            } else {
                const error = await response.json()
                return { success: false, error: error.message || 'Ошибка авторизации' }
            }
        } catch (error) {
            return { success: false, error: 'Ошибка сети' }
        }
    }

    const requestVerificationCode = async (method) => {
    try {
        const response = await fetch(API_URL + '/auth/request-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ method })
        })

        if (response.ok) {
            const data = await response.json()
            verificationMethod.value = method
            codeExpiresAt.value = new Date(Date.now() + 2 * 60 * 1000)
            console.log('Debug code:', data.debug_code)
            return { success: true }
        } else {
            const error = await response.json()
            return { success: false, error: error.message || 'Ошибка отправки кода' }
        }
    } catch (error) {
        return { success: false, error: 'Ошибка сети' }
    }
}

    const verifyCode = async (code) => {
        try {
            const response = await fetch(API_URL + '/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    code, 
                    method: verificationMethod.value 
                })
            })

            if (response.ok) {
                const data = await response.json()
                currentUser.value = data.teacher
                isAuthenticated.value = true
                verificationMethod.value = null
                codeExpiresAt.value = null
                return { success: true }
            } else {
                const error = await response.json()
                return { success: false, error: error.message || 'Неверный код' }
            }
        } catch (error) {
            return { success: false, error: 'Ошибка сети' }
        }
    }

    const logout = async () => {
        try {
            await fetch(API_URL + '/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
        } catch (error) {
            console.error('Ошибка при выходе:', error)
        } finally {
            currentUser.value = null
            isAuthenticated.value = false
            verificationMethod.value = null
            verificationCode.value = null
            codeExpiresAt.value = null
        }
    }

    const getRemainingTime = () => {
        if (!codeExpiresAt.value) return 0
        const now = new Date()
        const remaining = codeExpiresAt.value - now
        return Math.max(0, Math.floor(remaining / 1000))
    }

    return { 
        currentUser, 
        isAuthenticated,
        verificationMethod,
        codeExpiresAt,
        isDepartmentHead,
        checkAuth,
        login,
        requestVerificationCode,
        verifyCode,
        logout,
        getRemainingTime
    }
})