<template>
  <Navbar/>
  <div class="orders-page">
    <div class="container">
      <h1>我的订单</h1>
      <OrderComponent />
    </div>
  </div>
</template>

<script setup>
import OrderComponent from '@/components/order.vue';
import Navbar from '@/components/navbar.vue';
</script>

<style scoped>
.orders-page {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}
</style>