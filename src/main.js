import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './js/router.js'
import { useAuthStore } from '@/js/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// загружаем веб только после аутентификации
const initApp = async () => {
    const authStore = useAuthStore()
    try {
        await authStore.checkAuth()
    } catch (error) {
        console.log('Ошибка проверки аутентификации')
    }
    app.use(router).mount('#app')
}

initApp()