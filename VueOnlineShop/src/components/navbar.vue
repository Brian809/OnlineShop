<template>
  <!-- 桌面端顶部导航栏 -->
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    :ellipsis="false"
    class="desktop-nav"
    router
    @select="handleMenuSelect"
  >
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="/about">
      <el-icon><InfoFilled /></el-icon>
      <span>关于</span>
    </el-menu-item>
    <el-menu-item index="/contact">
      <el-icon><PhoneFilled /></el-icon>
      <span>联系</span>
    </el-menu-item>

    <div class="flex-grow" />

    <template v-if="!isLoggedIn">
      <el-menu-item index="/login">
        <el-icon><UserFilled /></el-icon>
        <span>登录</span>
      </el-menu-item>
    </template>

    <template v-else>
      <el-menu-item index="/admin/users" v-if="isAdmin">
        <el-icon><Setting /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/products" v-if="isAdmin">
        <el-icon><Box /></el-icon>
        <span>商品管理</span>
      </el-menu-item>
      <el-menu-item index="logout">
        <el-icon><SwitchButton /></el-icon>
        <span>退出</span>
      </el-menu-item>
    </template>
  </el-menu>

  <!-- 移动端底部导航栏 -->
  <el-tab-bar class="mobile-nav" v-model="activeMenu" @tab-change="handleTabChange">
    <el-tab-pane name="/">
      <template #label>
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </template>
    </el-tab-pane>
    <el-tab-pane name="/about">
      <template #label>
        <el-icon><InfoFilled /></el-icon>
        <span>关于</span>
      </template>
    </el-tab-pane>
    <el-tab-pane name="/contact">
      <template #label>
        <el-icon><PhoneFilled /></el-icon>
        <span>联系</span>
      </template>
    </el-tab-pane>
    <el-tab-pane name="/login" v-if="!isLoggedIn">
      <template #label>
        <el-icon><UserFilled /></el-icon>
        <span>登录</span>
      </template>
    </el-tab-pane>
    <el-tab-pane name="logout" v-else>
      <template #label>
        <el-icon><SwitchButton /></el-icon>
        <span>退出</span>
      </template>
    </el-tab-pane>
  </el-tab-bar>
</template>

<style scoped>
/* 桌面端导航栏 */
.desktop-nav {
  display: none;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.flex-grow {
  flex-grow: 1;
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
}

/* 桌面端显示顶部导航，隐藏底部导航 */
@media (min-width: 600px) {
  .desktop-nav {
    display: flex;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .mobile-nav {
    display: none;
  }
}
</style>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  InfoFilled,
  PhoneFilled,
  UserFilled,
  Setting,
  Box,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.user?.isAdmin || false)
const activeMenu = computed(() => route.path)

const handleMenuSelect = (index) => {
  if (index === 'logout') {
    logout()
  }
}

const handleTabChange = (name) => {
  if (name === 'logout') {
    logout()
  } else {
    router.push(name)
  }
}

const logout = () => {
  userStore.clearUser()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>