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
const authStore = useAuthStore()
authStore.checkAuth()
app.use(router).mount('#app')