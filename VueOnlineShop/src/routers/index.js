import { createRouter,createWebHistory } from "vue-router";

import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        }
    ]});