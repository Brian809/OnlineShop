<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElCard, ElTable, ElTableColumn, ElTag, ElEmpty, ElIcon } from 'element-plus';
import { Location } from '@element-plus/icons-vue';
import { get, useUserStore } from '@/utils/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const orders = ref([]);
const loading = ref(false);

// 订单状态映射
const statusMap = {
  pending: { label: '待支付', type: 'warning' },
  paying: { label: '支付中', type: 'info' },
  paid: { label: '已支付', type: 'success' },
  shipped: { label: '已发货', type: 'primary' },
  delivered: { label: '已送达', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
};

// 跳转到支付页面
const goToPayment = (orderId) => {
  router.push(`/payment/${orderId}`);
};

// 获取用户订单列表
const fetchOrders = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  loading.value = true;
  try {
    const userId = userStore.user.id;
    const response = await get(`/orders/user/${userId}`);
    orders.value = response;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 跳转到商品详情
const goToProduct = (productId) => {
  router.push(`/product/${productId}`);
};

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  router.push(`/order/${orderId}`);
};

// 获取状态类型
const getStatusType = (status) => {
  return statusMap[status]?.type || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  return statusMap[status]?.label || status;
};

onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <ElCard class="order-card">
    <template #header>
      <div class="card-header">
        <h3>我的订单</h3>
      </div>
    </template>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <ElEmpty v-else-if="orders.length === 0" description="暂无订单" />

    <!-- 桌面端：表格视图 -->
    <ElTable v-if="!loading && orders.length > 0" class="desktop-view" :data="orders" stripe style="width: 100%">
      <ElTableColumn prop="id" label="订单编号" width="100" />
      
      <ElTableColumn label="商品信息" min-width="200">
        <template #default="{ row }">
          <div v-if="row.Product" class="product-info" @click="goToProduct(row.productId)">
            <img 
              v-if="row.Product.image" 
              :src="row.Product.image" 
              :alt="row.Product.name" 
              class="product-image"
            />
            <div class="product-details">
              <div class="product-name">{{ row.Product.name }}</div>
              <div class="product-description">{{ row.Product.description }}</div>
            </div>
          </div>
          <span v-else>商品信息不可用</span>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="quantity" label="数量" width="80" align="center" />

      <ElTableColumn prop="totalPrice" label="总价" width="100" align="right">
        <template #default="{ row }">
          <span class="price">¥{{ parseFloat(row.totalPrice).toFixed(2) }}</span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="收货地址" min-width="200">
        <template #default="{ row }">
          <div v-if="row.receiverName" class="address-info">
            <div class="receiver">
              {{ row.receiverName }} {{ row.receiverPhone }}
            </div>
            <div class="address-text">{{ row.fullAddress }}</div>
          </div>
          <span v-else class="no-address">无地址信息</span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="状态" width="100" align="center">
        <template #default="{ row }">
          <ElTag :type="statusMap[row.status]?.type || 'info'">
            {{ statusMap[row.status]?.label || row.status }}
          </ElTag>
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending' || row.status === 'paying'"
            type="primary"
            size="small"
            @click="goToPayment(row.id)"
          >
            去支付
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="goToOrderDetail(row.id)"
          >
            查看详情
          </el-button>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 移动端：卡片视图 -->
    <div v-if="!loading && orders.length > 0" class="mobile-view">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-card-item"
        @click="goToOrderDetail(order.id)"
      >
        <div class="order-header">
          <span class="order-id">订单 #{{ order.id }}</span>
          <ElTag :type="statusMap[order.status]?.type || 'info'" size="small">
            {{ statusMap[order.status]?.label || order.status }}
          </ElTag>
        </div>

        <div v-if="order.Product" class="order-product">
          <img :src="order.Product.image" :alt="order.Product.name" class="mobile-product-image" />
          <div class="mobile-product-info">
            <div class="mobile-product-name">{{ order.Product.name }}</div>
            <div class="mobile-product-meta">
              <span class="mobile-quantity">× {{ order.quantity }}</span>
              <span class="mobile-price">¥{{ parseFloat(order.totalPrice).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div v-if="order.receiverName" class="order-address">
          <el-icon><Location /></el-icon>
          <span>{{ order.receiverName }} {{ order.receiverPhone }}</span>
        </div>

        <div class="order-footer">
          <span class="order-time">{{ new Date(order.createdAt).toLocaleString('zh-CN') }}</span>
          <el-button
            v-if="order.status === 'pending' || order.status === 'paying'"
            type="primary"
            size="small"
            @click.stop="goToPayment(order.id)"
          >
            去支付
          </el-button>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #909399;
}

/* 桌面端：表格视图 */
.desktop-view {
  display: table;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.product-info:hover {
  opacity: 0.8;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  font-weight: 600;
  color: #f56c6c;
}

.address-info {
  font-size: 12px;
}

.receiver {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.address-text {
  color: #606266;
  line-height: 1.4;
}

.no-address {
  color: #909399;
  font-size: 12px;
}

/* 移动端：卡片视图 */
.mobile-view {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.order-card-item {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.order-card-item:active {
  background: #f5f7fa;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.order-id {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.order-product {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.mobile-product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.mobile-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mobile-product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.mobile-product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-quantity {
  font-size: 12px;
  color: #909399;
}

.mobile-price {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.order-address {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-address .el-icon {
  flex-shrink: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.order-time {
  font-size: 12px;
  color: #909399;
}

/* 响应式：小于 768px 显示卡片视图 */
@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: flex;
  }
}
</style>