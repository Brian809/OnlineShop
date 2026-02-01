<template>
  <div class="sidebar-container">
    <div class="collapse-toggle" @click="toggleCollapse">
      <el-icon class="toggle-icon">
        <Menu />
      </el-icon>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
      router
    >
      <el-sub-menu index="user">
        <template #title>
          <el-icon><user /></el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/admin/users">
          <el-icon><list /></el-icon>
          <span>查看用户</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="product">
        <template #title>
          <el-icon><goods /></el-icon>
          <span>商品管理</span>
        </template>
        <el-menu-item index="/admin/products/create">
          <el-icon><plus /></el-icon>
          <span>创建商品</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><list /></el-icon>
          <span>商品列表</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="order">
        <template #title>
          <el-icon><shopping-cart /></el-icon>
          <span>订单管理</span>
        </template>
        <el-menu-item index="/admin/orders">
          <el-icon><document /></el-icon>
          <span>订单列表</span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/">
        <el-icon><house /></el-icon>
        <template #title>返回首页</template>
      </el-menu-item>

      <el-menu-item @click="handleLogout" class="logout-item">
        <el-icon><switch-button /></el-icon>
        <template #title>退出登录</template>
      </el-menu-item>
    </el-menu>

    <div class="user-info" v-if="!isCollapse">
      <el-avatar :size="40" :icon="UserFilled" />
      <div class="user-details">
        <div class="username">{{ userStore.username }}</div>
        <div class="role">{{ userStore.user?.isAdmin ? '管理员' : '普通用户' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  User,
  UserFilled,
  List,
  Goods,
  Plus,
  ShoppingCart,
  Document,
  House,
  SwitchButton,
  Menu,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(true)
const activeMenu = computed(() => route.path)

const handleOpen = (key, keyPath) => {
  console.log('菜单展开:', key, keyPath)
}

const handleClose = (key, keyPath) => {
  console.log('菜单收起:', key, keyPath)
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    userStore.clearUser()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}

// 检查用户是否已登录
onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-bottom: 1px solid #e6e6e6;
  cursor: pointer;
  transition: background-color 0.3s;
}

.collapse-toggle:hover {
  background-color: #f5f5f5;
}

.toggle-icon {
  font-size: 24px;
  color: #409eff;
}

.el-menu-vertical-demo {
  flex: 1;
  border-right: none;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 240px;
}

.logout-item {
  margin-top: auto;
  color: #f56c6c;
}

.logout-item:hover {
  background-color: #fef0f0 !important;
}

.user-info {
  padding: 15px;
  border-top: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.username {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
