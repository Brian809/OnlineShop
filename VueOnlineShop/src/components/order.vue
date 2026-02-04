<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElCard, ElTable, ElTableColumn, ElTag, ElEmpty } from 'element-plus';
import { get, useUserStore } from '@/utils/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const orders = ref([]);
const loading = ref(false);

// 订单状态映射
const statusMap = {
  pending: { label: '待支付', type: 'warning' },
  paid: { label: '已支付', type: 'success' },
  shipped: { label: '已发货', type: 'primary' },
  delivered: { label: '已送达', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
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

    <ElTable v-else :data="orders" stripe style="width: 100%">
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
          <span class="price">¥{{ row.totalPrice }}</span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="状态" width="100" align="center">
        <template #default="{ row }">
          <ElTag :type="statusMap[row.status]?.type || 'info'">
            {{ statusMap[row.status]?.label || row.status }}
          </ElTag>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
        </template>
      </ElTableColumn>
    </ElTable>
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

:deep(.el-table) {
  font-size: 14px;
}
</style>