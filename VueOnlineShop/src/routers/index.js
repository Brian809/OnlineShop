import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import UserManagement from '../views/admin/userManagement.vue';

const router = createRouter({
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
    },
    {
      path: '/admin/users',
      name: 'UserManagement',
      component: UserManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
});

// 路由守卫 - 检查用户登录状态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;
  const isAdmin = userStore.user?.isAdmin || false;

  // 检查是否需要登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    ElMessage.warning('请先登录');
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
  // 检查是否需要管理员权限
  else if (to.meta.requiresAdmin && !isAdmin) {
    ElMessage.error('需要管理员权限');
    next({ path: '/' });
  }
  // 如果已登录用户访问登录页，重定向到首页
  else if (to.path === '/login' && isLoggedIn) {
    next({ path: '/' });
  }
  else {
    next();
  }
});

export default router;