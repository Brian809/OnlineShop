<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElButton, ElMessage, ElEmpty, ElDialog, ElRadio, ElRadioGroup } from 'element-plus';
import { ShoppingBag, Close, Delete } from '@element-plus/icons-vue';
import { get, post, del, useUserStore } from '@/utils/api';

const userStore = useUserStore();

// 响应式状态
const isOpen = ref(false);
const cartItems = ref([]);
const loading = ref(false);
const needLogin = ref(false);
const checkoutDialogVisible = ref(false);
const selectedAddressId = ref(null);
const addresses = ref([]);
const addressesLoading = ref(false);

// 切换购物车显示
function toggleCart() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // 检查登录状态
    if (!userStore.isLoggedIn) {
      needLogin.value = true;
      ElMessage.warning('请先登录');
      return;
    }
    fetchCart();
  }
}

// 获取购物车数据
async function fetchCart() {
  if (!userStore.isLoggedIn) {
    needLogin.value = true;
    console.log('用户未登录，跳过获取购物车');
    return;
  }

  loading.value = true;
  needLogin.value = false;

  console.log('开始获取购物车，用户 token:', userStore.token ? userStore.token.substring(0, 20) + '...' : '无');

  try {
    const data = await get('/cart');
    console.log('购物车数据:', data);
    cartItems.value = data || [];
  } catch (error) {
    console.error('获取购物车错误:', error);
    ElMessage.error(error.message || '获取购物车失败');
    cartItems.value = [];
  } finally {
    loading.value = false;
  }
}

// 获取地址列表
async function fetchAddresses() {
  addressesLoading.value = true;
  try {
    const data = await get('/users/me/addresses');
    addresses.value = data || [];
    // 默认选中第一个地址
    if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id;
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
    ElMessage.error('获取地址列表失败');
  } finally {
    addressesLoading.value = false;
  }
}

// 从购物车移除商品
async function removeFromCart(cartId) {
  try {
    await del(`/cart/${cartId}`);
    ElMessage.success('已从购物车移除');
    fetchCart(); // 重新获取购物车
  } catch (error) {
    ElMessage.error(error.message || '移除失败');
  }
}

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + (item.Product?.price * item.quantity);
  }, 0).toFixed(2);
});

// 打开结算对话框
function openCheckoutDialog() {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空');
    return;
  }
  
  checkoutDialogVisible.value = true;
  fetchAddresses();
}

// 结算功能
async function handleCheckout() {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空');
    return;
  }

  // 跳转到订单确认页面（目前只支持单个商品结算）
  const item = cartItems.value[0];
  checkoutDialogVisible.value = false;
  window.location.href = `/order/confirm?productId=${item.productId}&quantity=${item.quantity}`;
}

// 组件挂载时获取购物车数据（仅当用户已登录）
onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchCart();
  }
});

// 暴露方法给父组件
defineExpose({
  fetchCart,
  toggleCart
});
</script>
<template>
  <!-- 浮动购物车按钮 -->
  <ElButton
    class="cart-button"
    type="primary"
    :icon="ShoppingBag"
    circle
    @click="toggleCart"
  />

  <!-- 购物车抽屉 -->
  <div class="cart-drawer" :class="{ open: isOpen }" v-show="isOpen">
    <div class="cart-header">
      <h3>购物车</h3>
      <ElButton :icon="Close" circle @click="toggleCart" />
    </div>

    <div class="cart-content">
      <!-- 加载中 -->
      <div v-if="loading" class="loading">
        加载中...
      </div>

      <!-- 未登录提示 -->
      <ElEmpty
        v-else-if="needLogin"
        description="请先登录查看购物车"
      >
        <router-link to="/login">
          <ElButton type="primary">去登录</ElButton>
        </router-link>
      </ElEmpty>

      <!-- 空购物车 -->
      <ElEmpty
        v-else-if="cartItems.length === 0"
        description="购物车是空的"
      />

      <!-- 购物车列表 -->
      <div v-else class="cart-items">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="cart-item"
        >
          <img
            :src="item.Product?.image"
            :alt="item.Product?.name"
            class="item-image"
          />
          <div class="item-info">
            <div class="item-name">{{ item.Product?.name }}</div>
            <div class="item-price">¥{{ item.Product?.price }}</div>
            <div class="item-quantity">数量: {{ item.quantity }}</div>
          </div>
          <ElButton
            type="danger"
            :icon="Delete"
            circle
            size="small"
            @click="removeFromCart(item.id)"
          />
        </div>
      </div>
    </div>

    <!-- 购物车底部 -->
    <div class="cart-footer" v-if="cartItems.length > 0">
      <div class="total">
        总计: <span class="total-price">¥{{ totalPrice }}</span>
      </div>
      <ElButton type="primary" @click="openCheckoutDialog">
        去结算
      </ElButton>
    </div>
  </div>

  <!-- 结算对话框 -->
  <ElDialog
    v-model="checkoutDialogVisible"
    title="选择收货地址"
    width="500px"
  >
    <div v-if="addressesLoading" class="loading">
      加载中...
    </div>
    <ElEmpty v-else-if="addresses.length === 0" description="暂无地址">
      <router-link to="/profile">
        <ElButton type="primary">添加地址</ElButton>
      </router-link>
    </ElEmpty>
    <div v-else>
      <ElRadioGroup v-model="selectedAddressId" style="width: 100%">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="address-option"
        >
          <ElRadio :label="address.id" style="width: 100%">
            <div class="address-item">
              <div class="address-header">
                <span class="receiver-name">{{ address.fullName }}</span>
                <span class="receiver-phone">{{ address.phone }}</span>
                <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
              </div>
            </div>
          </ElRadio>
        </div>
      </ElRadioGroup>
    </div>
    <template #footer>
      <ElButton @click="checkoutDialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleCheckout" :disabled="addresses.length === 0">
        确认结算
      </ElButton>
    </template>
  </ElDialog>
</template>
<style scoped>
.cart-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
  font-size: 20px;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.cart-drawer.open {
  right: 0;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.cart-header h3 {
  margin: 0;
  font-size: 18px;
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
}

.item-price {
  color: #f56c6c;
  font-weight: bold;
}

.item-quantity {
  font-size: 12px;
  color: #666;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total {
  font-size: 16px;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 20px;
}

/* 地址选择样式 */
.address-option {
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  transition: all 0.3s;
}

.address-option:hover {
  border-color: #409eff;
}

.address-item {
  width: 100%;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.receiver-name {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
}

.receiver-phone {
  font-size: 12px;
  color: #606266;
}

.address-detail {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

/* 移动端适配 */
@media (max-width: 600px) {
  .cart-drawer {
    width: 100%;
    right: -100%;
  }

  .cart-button {
    bottom: 70px;
  }
}
</style>
