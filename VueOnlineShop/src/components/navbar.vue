<template>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
      <li v-if="!isLoggedIn"><a href="/login">Login & Register</a></li>
      <li v-if="isLoggedIn"><a href="/admin/users">用户管理</a></li>
      <li v-if="isLoggedIn"><button @click="logout">Logout</button></li>
    </ul>
  </nav>
</template>

<style scoped>
/* mobile first design (bottom nav bar) */
nav {
  background-color: #333;
  padding: 10px;
  position: fixed;
  bottom: 0;
  width: 100%;
  margin: 0;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-around;
}

li {
  display: flex;
  align-items: center;
}

li a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

li a:hover {
  text-decoration: underline;
}

li button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 4px;
}

li button:hover {
  background-color: #d32f2f;
}

@media (min-width: 600px) {
  /* desktop design (top nav bar) */
  nav {
    position: static;
  }
  ul {
    justify-content: flex-start;
  }
  li {
    margin-right: 20px;
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