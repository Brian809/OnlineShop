<template>
  <div class="login-container">
    <div class="login-box">
      <h1>{{ isLogin ? '登录' : '注册' }}</h1>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="账号" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱或用户名"
            clearable
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="用户名" prop="username" v-if="!isLogin">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
            clearable
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isLogin">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            show-password
            clearable
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
        
        <el-form-item v-if="isLogin">
          <el-checkbox v-model="form.rememberMe">记住密码</el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="loading"
            style="width: 100%"
          >
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="text"
            @click="toggleMode"
            style="width: 100%"
          >
            {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button
            type="warning"
            @click="clearLocalStorage"
            style="width: 100%; font-size: 12px;"
          >
            清除缓存 (如果无法访问登录页)
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { post } from '@/utils/api'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false
})

// 从localStorage加载记住的密码
const loadRememberedPassword = () => {
  const remembered = localStorage.getItem('remembered_user')
  if (remembered) {
    try {
      const data = JSON.parse(remembered)
      form.email = data.email || ''
      form.password = data.password || ''
      form.rememberMe = true
    } catch (error) {
      console.error('加载记住的密码失败:', error)
    }
  }
}

// 组件挂载时加载记住的密码
loadRememberedPassword()

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (!isLogin.value && value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 清除 localStorage
const clearLocalStorage = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  localStorage.removeItem('remembered_user')
  userStore.clearUser()
  ElMessage.success('缓存已清除，请刷新页面')
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

const rules = computed(() => ({
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
}))

const toggleMode = () => {
  isLogin.value = !isLogin.value
  // 清空表单
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.rememberMe = false
  // 重置表单验证
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    loading.value = true
    
    if (isLogin.value) {
      // 登录逻辑
      await handleLogin()
    } else {
      // 注册逻辑
      await handleRegister()
    }
  } catch (error) {
    // 表单验证失败或业务逻辑错误已在各自方法中处理
    if (error && typeof error === 'object' && error.errorFields) {
      // Element Plus 表单验证错误
      console.log('表单验证未通过')
    } else {
      // 其他错误已在handleLogin/handleRegister中处理
    }
  } finally {
    loading.value = false
  }
}

const handleLogin = async () => {
  try {
    const data = await post('/auth/login', {
      email: form.email,
      password: form.password
    })

    // 保存用户信息到 store
    userStore.setUser({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      isAdmin: data.user.isAdmin,
      isdisabled: data.user.isdisabled,
      token: data.token
    })

    // 记住密码功能
    if (form.rememberMe) {
      localStorage.setItem('remembered_user', JSON.stringify({
        email: form.email,
        password: form.password
      }))
    } else {
      localStorage.removeItem('remembered_user')
    }

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message || '登录失败，请检查邮箱和密码')
    console.error('登录错误:', error)
    throw error
  }
}

const handleRegister = async () => {
  try {
    const data = await post('/auth/register', {
      username: form.username,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword
    })

    ElMessage.success('注册成功，请登录')
    isLogin.value = true
    form.password = ''
    form.confirmPassword = ''
  } catch (error) {
    ElMessage.error(error.message || '注册失败，请重试')
    console.error('注册错误:', error)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

.login-form {
  margin-top: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-button--primary) {
  border-radius: 6px;
  font-size: 16px;
  padding: 12px 20px;
  margin-top: 10px;
}

:deep(.el-button--text) {
  color: #667eea;
  font-size: 14px;
}

:deep(.el-button--text:hover) {
  color: #764ba2;
}
</style>