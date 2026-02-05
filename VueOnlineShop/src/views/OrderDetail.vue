<template>
  <div class="order-detail-container">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>订单详情</h2>
    </div>

    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="order" class="order-content">
      <!-- 订单状态 -->
      <div class="status-section">
        <div class="status-icon">
          <el-icon v-if="order.status === 'pending'" :size="48" color="#909399">
            <Clock />
          </el-icon>
          <el-icon v-else-if="order.status === 'paying'" :size="48" color="#409eff">
            <Wallet />
          </el-icon>
          <el-icon v-else-if="order.status === 'paid'" :size="48" color="#67c23a">
            <CircleCheck />
          </el-icon>
          <el-icon v-else-if="order.status === 'shipped'" :size="48" color="#409eff">
            <Van />
          </el-icon>
          <el-icon v-else-if="order.status === 'delivered'" :size="48" color="#e6a23c">
            <Box />
          </el-icon>
          <el-icon v-else-if="order.status === 'completed'" :size="48" color="#67c23a">
            <CircleCheckFilled />
          </el-icon>
          <el-icon v-else-if="order.status === 'cancelled'" :size="48" color="#f56c6c">
            <CircleClose />
          </el-icon>
        </div>
        <div class="status-text">
          <h3>{{ getStatusText(order.status) }}</h3>
          <p class="status-time">{{ formatTime(order.createdAt) }}</p>
        </div>
        <el-button
          v-if="order.status === 'pending' || order.status === 'paying'"
          type="primary"
          size="large"
          @click="goToPayment"
        >
          去支付
        </el-button>
      </div>

      <!-- 商品信息 -->
      <div class="section">
        <h3>商品信息</h3>
        <div v-if="order.Product" class="product-card">
          <img :src="order.Product.image" :alt="order.Product.name" class="product-image" />
          <div class="product-info">
            <div class="product-name">{{ order.Product.name }}</div>
            <div class="product-description">{{ order.Product.description }}</div>
            <div class="product-meta">
              <span class="product-price">¥{{ parseFloat(order.Product.price).toFixed(2) }}</span>
              <span class="product-quantity">× {{ order.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="section">
        <h3>订单信息</h3>
        <div class="info-row">
          <span>订单编号</span>
          <span>{{ order.id }}</span>
        </div>
        <div class="info-row">
          <span>下单时间</span>
          <span>{{ formatTime(order.createdAt) }}</span>
        </div>
        <div class="info-row">
          <span>支付方式</span>
          <span>支付宝</span>
        </div>
        <div v-if="order.alipayTradeNo" class="info-row">
          <span>交易号</span>
          <span>{{ order.alipayTradeNo }}</span>
        </div>
        <div v-if="order.paidAt" class="info-row">
          <span>支付时间</span>
          <span>{{ formatTime(order.paidAt) }}</span>
        </div>
      </div>

      <!-- 金额信息 -->
      <div class="section">
        <h3>金额信息</h3>
        <div class="amount-row">
          <span>商品总价</span>
          <span>¥{{ parseFloat(order.Product?.price * order.quantity).toFixed(2) }}</span>
        </div>
        <div class="amount-row total">
          <span>实付金额</span>
          <span class="total-price">¥{{ parseFloat(order.totalPrice).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <el-empty description="订单不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ArrowLeft,
  Loading,
  Clock,
  Wallet,
  CircleCheck,
  Van,
  Box,
  CircleCheckFilled,
  CircleClose
} from '@element-plus/icons-vue';
import { get } from '@/utils/api';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const order = ref(null);

// 获取订单详情
const fetchOrderDetail = async () => {
  const orderId = route.params.id;
  if (!orderId) {
    ElMessage.error('订单ID缺失');
    router.back();
    return;
  }

  loading.value = true;
  try {
    order.value = await get(`/orders/${orderId}`);
  } catch (error) {
    ElMessage.error('获取订单详情失败');
    order.value = null;
  } finally {
    loading.value = false;
  }
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paying: '支付中',
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 返回
const goBack = () => {
  router.back();
};

// 去支付
const goToPayment = () => {
  if (order.value) {
    router.push(`/payment/${order.value.id}`);
  }
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
.order-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: #909399;
  font-size: 16px;
}

.loading .el-icon {
  margin-bottom: 10px;
  font-size: 32px;
}

.status-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-icon {
  flex-shrink: 0;
}

.status-text {
  flex: 1;
}

.status-text h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
}

.status-time {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 500;
}

.product-card {
  display: flex;
  gap: 15px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}

.product-quantity {
  color: #666;
  font-size: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span:first-child {
  color: #666;
}

.info-row span:last-child {
  color: #333;
  font-weight: 500;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
}

.amount-row.total {
  border-top: 1px solid #e0e0e0;
  margin-top: 10px;
  padding-top: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: 600;
}

.empty {
  padding: 100px 0;
}
</style>