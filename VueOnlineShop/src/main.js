import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './routers/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(ElementPlus)
app.use(pinia)

// 在应用挂载前恢复用户登录状态
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
userStore.restoreUser()

app.mount('#app')
