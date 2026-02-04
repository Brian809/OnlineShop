<template>
  <div class="admin-layout">
    <slide-navigation-bar />
    <div class="admin-content">
      <div class="order-management">
        <div class="header">
          <h1>订单管理</h1>
          <div class="header-actions">
            <el-select v-model="statusFilter" placeholder="订单状态" style="width: 150px" @change="fetchOrders">
              <el-option label="全部" value="" />
              <el-option label="待支付" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已送达" value="delivered" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
            <el-button type="primary" @click="fetchOrders">刷新列表</el-button>
          </div>
        </div>

        <el-table :data="orders" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="订单编号" width="100" />
          
          <el-table-column label="用户信息" width="150">
            <template #default="{ row }">
              <div v-if="row.User">
                <div class="user-name">{{ row.User.username }}</div>
                <div class="user-email">{{ row.User.email }}</div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="商品信息" width="200">
            <template #default="{ row }">
              <div v-if="row.Product" class="product-info">
                <img v-if="row.Product.image" :src="row.Product.image" :alt="row.Product.name" class="product-image" />
                <div class="product-details">
                  <div class="product-name">{{ row.Product.name }}</div>
                  <div class="product-price">¥{{ row.Product.price }}</div>
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column prop="quantity" label="数量" width="80" align="center" />

          <el-table-column prop="totalPrice" label="总价" width="100" align="right">
            <template #default="{ row }">
              <span class="price">¥{{ row.totalPrice }}</span>
            </template>
          </el-table-column>

          <el-table-column label="收货地址" min-width="200">
            <template #default="{ row }">
              <div v-if="row.receiverName" class="address-info">
                <div class="receiver">{{ row.receiverName }} {{ row.receiverPhone }}</div>
                <div class="address-text">{{ row.fullAddress }}</div>
              </div>
              <span v-else class="no-address">无地址信息</span>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="statusMap[row.status]?.type || 'info'">
                {{ statusMap[row.status]?.label || row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="300" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                size="small"
                @click="handleStatusChange(row, 'paid')"
              >
                确认支付
              </el-button>
              <el-button
                v-if="row.status === 'paid'"
                type="primary"
                size="small"
                @click="handleStatusChange(row, 'shipped')"
              >
                发货
              </el-button>
              <el-button
                v-if="row.status === 'shipped'"
                type="warning"
                size="small"
                @click="handleStatusChange(row, 'delivered')"
              >
                确认送达
              </el-button>
              <el-button
                v-if="row.status === 'delivered'"
                type="success"
                size="small"
                @click="handleStatusChange(row, 'completed')"
              >
                完成订单
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="danger"
                size="small"
                @click="handleCancelOrder(row)"
              >
                取消订单
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && orders.length === 0" description="暂无订单数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { get, post, patch } from '@/utils/api';
import SlideNavigationBar from '@/components/admin/slideNavigationBar.vue';

const orders = ref([]);
const loading = ref(false);
const statusFilter = ref('');

// 订单状态映射
const statusMap = {
  pending: { label: '待支付', type: 'warning' },
  paid: { label: '已支付', type: 'success' },
  shipped: { label: '已发货', type: 'primary' },
  delivered: { label: '已送达', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
};

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true;
  try {
    // 获取所有订单（管理员权限）
    const data = await get('/admin/orders');
    orders.value = data || [];
    
    // 如果有状态筛选，进行过滤
    if (statusFilter.value) {
      orders.value = orders.value.filter(order => order.status === statusFilter.value);
    }
  } catch (error) {
    // 如果专门的 admin/orders 接口不存在，尝试获取所有用户的订单
    try {
      // 这里需要后端提供获取所有订单的接口
      ElMessage.warning('需要后端提供管理员获取所有订单的接口');
      orders.value = [];
    } catch (e) {
      ElMessage.error(error.message || '获取订单列表失败');
      orders.value = [];
    }
  } finally {
    loading.value = false;
  }
};

// 更改订单状态
const handleStatusChange = async (order, newStatus) => {
  try {
    const statusLabel = statusMap[newStatus]?.label || newStatus;
    await ElMessageBox.confirm(
      `确定要将订单 ${order.id} 的状态更改为 "${statusLabel}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await patch(`/admin/orders/${order.id}/status`, { status: newStatus });
    ElMessage.success('订单状态更新成功');
    await fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '更新订单状态失败');
    }
  }
};

// 取消订单
const handleCancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.id} 吗？此操作不可恢复，库存将被恢复。`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await post(`/orders/${order.id}/cancel`);
    ElMessage.success('订单已取消');
    await fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消订单失败');
    }
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 组件挂载时获取订单列表
onMounted(() => {
  fetchOrders();
});
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

.order-management {
  max-width: 1600px;
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

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.product-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 600;
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

.price {
  font-weight: 600;
  color: #f56c6c;
}
</style>