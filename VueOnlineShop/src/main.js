import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './views/Home.vue'
import router from './routers/index.js'
const app = createApp(App).use(router)

app.use(createPinia())

app.mount('#app')
