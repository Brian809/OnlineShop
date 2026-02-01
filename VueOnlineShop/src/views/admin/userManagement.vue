<template>
  <div class="admin-layout">
    <slide-navigation-bar />
    <div class="admin-content">
      <div class="user-management">
        <div class="header">
          <h1>用户管理</h1>
          <el-button type="primary" @click="fetchUsers">刷新列表</el-button>
        </div>

        <el-table :data="users" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="email" label="邮箱" width="250" />
          <el-table-column prop="createdAt" label="注册时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && users.length === 0" description="暂无用户数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, del } from '@/utils/api'
import { useUserStore } from '@/stores/user'
import SlideNavigationBar from '@/components/admin/slideNavigationBar.vue'

const userStore = useUserStore()
const users = ref([])
const loading = ref(false)

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const data = await get('/admin/users')
    users.value = data.users || []
  } catch (error) {
    ElMessage.error(error.message || '获取用户列表失败')
    console.error('获取用户列表错误:', error)
  } finally {
    loading.value = false
  }
}

// 删除用户
const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await del(`/admin/users/${user.id}`)
    ElMessage.success('删除成功')
    // 刷新列表
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
      console.error('删除用户错误:', error)
    }
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.user-management {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}
</style>