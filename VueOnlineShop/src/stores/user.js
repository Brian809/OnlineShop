import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 用户状态
  const user = ref(null)
  const token = ref('')

  // 计算属性：是否已登录
  const isLoggedIn = computed(() => {
    return !!user.value && !!token.value
  })

  // 计算属性：用户名
  const username = computed(() => {
    return user.value?.username || ''
  })

  // 计算属性：用户邮箱
  const email = computed(() => {
    return user.value?.email || ''
  })

  // 设置用户信息
  function setUser(userData) {
    user.value = userData
    token.value = userData.token || ''
    
    // 持久化到 localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userData.token || '')
  }

  // 清除用户信息（登出）
  function clearUser() {
    user.value = null
    token.value = ''
    
    // 清除 localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // 从 localStorage 恢复用户信息
  function restoreUser() {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
      } catch (error) {
        console.error('恢复用户信息失败:', error)
        clearUser()
      }
    }
  }

  // 更新用户信息
  function updateUser(updatedData) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    username,
    email,
    setUser,
    clearUser,
    restoreUser,
    updateUser
  }
})