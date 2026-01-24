import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './routers/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App).use(router);
app.use(ElementPlus);

app.use(createPinia());

app.mount('#app');
