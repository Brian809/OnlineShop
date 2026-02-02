<template>
  <div class="admin-layout">
    <slide-navigation-bar />
    <div class="admin-content">
      <div class="user-management">
        <div class="header">
          <h1>用户管理</h1>
          <div class="header-actions">
            <el-button type="success" @click="openAddUserDialog">添加用户</el-button>
            <el-button type="primary" @click="fetchUsers">刷新列表</el-button>
          </div>
        </div>

        <el-table :data="users" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="email" label="邮箱" width="250" />
          <el-table-column prop="isAdmin" label="是否为管理员" width="120">
            <template #default="{ row }">
              {{ row.isAdmin ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column prop="coin" label="余额" width="120">
            <template #default="{ row }">
              {{ (row.coin || 0).toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="isdisabled" label="账户状态" width="120">
            <template #default="{ row }">
              {{ row.isdisabled ? '已禁用' : '正常' }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="openAddCoinDialog(row)">修改金币</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              <el-button type="warning" size="small" @click="toggleDisable(row)">{{ row.isdisabled ? '启用' : '禁用' }}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && users.length === 0" description="暂无用户数据" />
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addUserDialogVisible"
      title="添加用户"
      width="500px"
      @close="resetAddUserForm"
    >
      <el-form
        ref="addUserFormRef"
        :model="addUserForm"
        :rules="addUserRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addUserForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="addUserForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="管理员权限" prop="isAdmin">
          <el-switch v-model="addUserForm.isAdmin" />
          <span style="margin-left: 10px; color: #909399; font-size: 12px;">
            启用后该用户将拥有管理员权限
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddUser" :loading="addUserLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
<!-- 加金币对话框 -->
    <el-dialog
      v-model="addCoinDialogVisible"
      title="修改金币"
      width="400px"
      @close="resetAddCoinForm"
    >
      <el-form
        ref="addCoinFormRef"
        :model="addCoinForm"
        :rules="addCoinRules"
        label-width="100px"
      >
        <el-form-item label="用户">
          <el-input :value="selectedUser?.username" disabled />
        </el-form-item>

        <el-form-item label="当前余额">
          <el-input :value="(selectedUser?.coin || 0).toFixed(2) + ' 元'" disabled />
        </el-form-item>

        <el-form-item label="修改金额" prop="amount">
          <el-input-number
            v-model="addCoinForm.amount"
            :min="0.01"
            :max="100000"
            :precision="2"
            :step="10"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addCoinDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddCoin" :loading="addCoinLoading">确定</el-button>
      </template>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, del, put, post } from '@/utils/api'
import { useUserStore } from '@/stores/user'
import SlideNavigationBar from '@/components/admin/slideNavigationBar.vue'

const userStore = useUserStore()
const users = ref([])
const loading = ref(false)

// 金币对话框相关
const addCoinDialogVisible = ref(false)
const addCoinLoading = ref(false)
const addCoinFormRef = ref(null)
const selectedUser = ref(null)
const addCoinForm = ref({
  amount: 10
})

const addCoinRules = {
  amount: [
    { required: true, message: '请输入增加金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于 0', trigger: 'blur' }
  ]
}

// 添加用户对话框相关
const addUserDialogVisible = ref(false)
const addUserLoading = ref(false)
const addUserFormRef = ref(null)
const addUserForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  isAdmin: false
})

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== addUserForm.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const addUserRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

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

// 打开添加用户对话框
const openAddUserDialog = () => {
  addUserDialogVisible.value = true
}

// 重置添加用户表单
const resetAddUserForm = () => {
  addUserForm.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false
  }
  addUserFormRef.value?.clearValidate()
}

// 添加用户
const handleAddUser = async () => {
  if (!addUserFormRef.value) return

  try {
    // 表单验证
    await addUserFormRef.value.validate()

    addUserLoading.value = true

    const data = await post('/admin/users', {
      username: addUserForm.value.username,
      email: addUserForm.value.email,
      password: addUserForm.value.password,
      confirmPassword: addUserForm.value.confirmPassword,
      isAdmin: addUserForm.value.isAdmin
    })

    ElMessage.success('用户创建成功')
    addUserDialogVisible.value = false
    resetAddUserForm()
    // 刷新列表
    await fetchUsers()
  } catch (error) {
    if (error && typeof error === 'object' && error.errorFields) {
      // 表单验证失败
      console.log('表单验证未通过')
    } else {
      ElMessage.error(error.message || '创建用户失败')
      console.error('创建用户错误:', error)
    }
  } finally {
    addUserLoading.value = false
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

// 禁用和启用用户
const toggleDisable = async (user) => {
  try {
    const action = user.isdisabled ? '启用' : '禁用'
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.username}" 吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 使用后端正确的 API 路径
    const data = await put(`/admin/users/${user.id}/toogleDisable`, {})
    ElMessage.success(`${action}成功`)
    // 刷新列表
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || `${action}失败`)
      console.error(`${action}用户错误:`, error)
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

// 打开修改金币对话框
const openAddCoinDialog = (user) => {
  selectedUser.value = user
  addCoinForm.value.amount = user.coin || 10
  addCoinDialogVisible.value = true
}

// 重置金币表单
const resetAddCoinForm = () => {
  addCoinForm.value.amount = 10
  addCoinFormRef.value?.clearValidate()
  selectedUser.value = null
}

// 修改金币
const handleAddCoin = async () => {
  if (!addCoinFormRef.value || !selectedUser.value) return

  try {
    await addCoinFormRef.value.validate()

    addCoinLoading.value = true

    // 调用后端 API 更新用户余额
    const data = await put(`/admin/users/${selectedUser.value.id}/coin`, {
      amount: addCoinForm.value.amount
    })

    ElMessage.success(`成功为用户 "${selectedUser.value.username}" 修改金币为 ${addCoinForm.value.amount.toFixed(2)} 元`)
    addCoinDialogVisible.value = false
    resetAddCoinForm()
    // 刷新列表
    await fetchUsers()
  } catch (error) {
    if (error && typeof error === 'object' && error.errorFields) {
      console.log('表单验证未通过')
    } else {
      ElMessage.error(error.message || '修改金币失败')
      console.error('修改金币错误:', error)
    }
  } finally {
    addCoinLoading.value = false
  }
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

.header-actions {
  display: flex;
  gap: 10px;
}
</style>