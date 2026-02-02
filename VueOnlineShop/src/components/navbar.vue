<template>
  <!-- 桌面端顶部导航栏 -->
  <nav class="desktop-nav">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/" class="nav-link">
          <span class="icon">🏠</span>
          <span>首页</span>
        </router-link>
        <router-link to="/about" class="nav-link">
          <span class="icon">ℹ️</span>
          <span>关于</span>
        </router-link>
        <router-link to="/contact" class="nav-link">
          <span class="icon">📞</span>
          <span>联系</span>
        </router-link>
      </div>

      <div class="nav-right">
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="nav-link">
            <span class="icon">👤</span>
            <span>登录</span>
          </router-link>
        </template>
        <template v-else>
          <router-link to="/admin/users" class="nav-link" v-if="isAdmin">
            <span class="icon">⚙️</span>
            <span>用户管理</span>
          </router-link>
          <router-link to="/admin/products" class="nav-link" v-if="isAdmin">
            <span class="icon">📦</span>
            <span>商品管理</span>
          </router-link>
          <a href="#" class="nav-link" @click.prevent="logout">
            <span class="icon">🚪</span>
            <span>退出</span>
          </a>
        </template>
      </div>
    </div>
  </nav>

  <!-- 移动端底部导航栏 -->
  <nav class="mobile-nav">
    <router-link to="/" class="mobile-nav-item">
      <span class="icon">🏠</span>
      <span>首页</span>
    </router-link>
    <router-link to="/about" class="mobile-nav-item">
      <span class="icon">ℹ️</span>
      <span>关于</span>
    </router-link>
    <router-link to="/contact" class="mobile-nav-item">
      <span class="icon">📞</span>
      <span>联系</span>
    </router-link>
    <router-link to="/login" class="mobile-nav-item" v-if="!isLoggedIn">
      <span class="icon">👤</span>
      <span>登录</span>
    </router-link>
    <a href="#" class="mobile-nav-item" @click.prevent="logout" v-else>
      <span class="icon">🚪</span>
      <span>退出</span>
    </a>
  </nav>
</template>

<style scoped>
/* 通用样式 */
nav {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 桌面端导航栏 */
.desktop-nav {
  display: none;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.nav-left,
.nav-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  text-decoration: none;
  color: #333;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: #f5f5f5;
  color: #409eff;
}

.nav-link.router-link-active {
  background-color: #409eff;
  color: white;
}

.nav-link .icon {
  font-size: 18px;
}

/* 移动端底部导航栏 */
.mobile-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  justify-content: space-around;
  padding: 8px 0;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  font-size: 12px;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-nav-item:hover {
  background-color: #f5f5f5;
  color: #409eff;
}

.mobile-nav-item.router-link-active {
  color: #409eff;
}

.mobile-nav-item .icon {
  font-size: 20px;
}

/* 响应式切换 */
@media (min-width: 600px) {
  .desktop-nav {
    display: block;
  }

  .mobile-nav {
    display: none;
  }
}
</style>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.user?.isAdmin || false)

const logout = () => {
  userStore.clearUser()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>