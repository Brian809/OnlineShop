import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import ProductDetail from '../views/ProductDetail.vue';
import Orders from '../views/Orders.vue';
import Profile from '../views/Profile.vue';
import UserManagement from '../views/admin/userManagement.vue';
import ProductManagement from '../views/admin/productManagement.vue';
import OrderManagement from '../views/admin/orderManagement.vue';

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
      path: '/product/:id',
      name: 'ProductDetail',
      component: ProductDetail
    },
    {
      path: '/orders',
      name: 'Orders',
      component: Orders,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      name: 'UserManagement',
      component: UserManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/products',
      name: 'ProductManagement',
      component: ProductManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/orders',
      name: 'OrderManagement',
      component: OrderManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
});

// 路由守卫 - 检查用户登录状态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // 确保从 localStorage 恢复用户信息
  userStore.restoreUser();

  const isLoggedIn = userStore.isLoggedIn;
  const isAdmin = userStore.user?.isAdmin || false;

  console.log('路由守卫:', {
    to: to.path,
    isLoggedIn,
    isAdmin,
    user: userStore.user
  });

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
  // 移除对已登录用户访问登录页的限制 - 允许访问
  else {
    next();
  }
});

export default router;