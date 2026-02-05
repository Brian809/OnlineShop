<template>
  <div class="payment-page">
    <div class="container">
      <div class="payment-header">
        <h1>支付订单</h1>
        <div class="countdown" v-if="order && remainingTime > 0">
          <el-icon><Timer /></el-icon>
          <span>支付剩余时间：{{ formatTime(remainingTime) }}</span>
        </div>
      </div>

      <div v-loading="loading" class="payment-content">
        <!-- 订单信息 -->
        <div class="order-info" v-if="order">
          <div class="section-title">订单信息</div>
          <div class="info-card">
            <div class="product-info">
              <img
                :src="getImageUrl(order.Product?.image)"
                :alt="order.Product?.name"
                class="product-image"
              />
              <div class="product-details">
                <div class="product-name">{{ order.Product?.name }}</div>
                <div class="product-desc">{{ order.Product?.description }}</div>
                <div class="product-meta">
                  <span class="quantity">数量: {{ order.quantity }}</span>
                  <span class="price">单价: ¥{{ order.Product?.price }}</span>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="amount-info">
              <div class="amount-row">
                <span>商品总价</span>
                <span>¥{{ parseFloat(order.Product?.price * order.quantity).toFixed(2) }}</span>
              </div>
              <div class="amount-row total">
                <span>应付金额</span>
                <span class="total-price">¥{{ parseFloat(order.totalPrice).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 收货地址 -->
        <div class="address-info" v-if="order">
          <div class="section-title">收货地址</div>
          <div class="info-card">
            <div class="address-item">
              <el-icon><Location /></el-icon>
              <div class="address-content">
                <div class="receiver">
                  <span class="name">{{ order.receiverName }}</span>
                  <span class="phone">{{ order.receiverPhone }}</span>
                </div>
                <div class="address-text">{{ order.fullAddress }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-method">
          <div class="section-title">支付方式</div>
          <div class="method-card selected">
            <img src="https://gw.alipayobjects.com/zos/bmw-prod/b3b4fb7d-9884-483a-9a8a-6f7d0c9a9f9d.svg" alt="支付宝" class="alipay-icon" />
            <span class="method-name">支付宝</span>
            <el-tag type="success" size="small">推荐</el-tag>
          </div>
        </div>

        <!-- 支付按钮 -->
        <div class="payment-actions">
          <el-button
            type="primary"
            size="large"
            :loading="paying"
            :disabled="!canPay"
            @click="handlePay"
            class="pay-button"
          >
            <el-icon><Wallet /></el-icon>
            立即支付 ¥{{ parseFloat(order?.totalPrice).toFixed(2) }}
          </el-button>
          <el-button @click="handleCancel" size="large">取消订单</el-button>
        </div>

        <!-- 支付成功提示 -->
        <el-dialog
          v-model="paymentSuccessVisible"
          title="支付成功"
          width="400px"
          :show-close="false"
          :close-on-click-modal="false"
        >
          <div class="success-content">
            <el-icon class="success-icon" :size="60" color="#67c23a">
              <CircleCheck />
            </el-icon>
            <p>支付成功！</p>
            <p class="order-id">订单号：{{ order?.id }}</p>
          </div>
          <template #footer>
            <el-button type="primary" @click="goToOrders">查看订单</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, Location, Wallet, CircleCheck } from '@element-plus/icons-vue'
import { get, post, del, getImageUrl } from '@/utils/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 获取订单 ID，处理可能的字符串/数字类型
const orderId = ref(route.params.id ? String(route.params.id) : null)
const order = ref(null)
const loading = ref(true)
const paying = ref(false)
const paymentSuccessVisible = ref(false)
let countdownTimer = null
let statusCheckTimer = null

// 确保定时器被正确初始化
const isPollingActive = ref(false)

// 计算剩余时间
const remainingTime = computed(() => {
  if (!order.value || !order.value.expiresAt) return 0
  const expiresAt = new Date(order.value.expiresAt)
  const now = new Date()
  const diff = expiresAt - now
  return Math.max(0, Math.floor(diff / 1000))
})

// 是否可以支付
const canPay = computed(() => {
  return order.value && order.value.status === 'pending' && remainingTime.value > 0
})

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取订单详情

const fetchOrder = async () => {

  try {

    loading.value = true

    console.log('正在获取订单详情:', orderId.value)

    const data = await get(`/orders/${orderId.value}`)

    console.log('订单详情:', data)

    

    if (!data) {

      ElMessage.error('订单不存在')

      router.push('/orders')

      return

    }



    order.value = data



    // 如果订单已支付，显示成功提示

    if (order.value.status === 'paid') {

      paymentSuccessVisible.value = true

      clearInterval(countdownTimer)

      clearInterval(statusCheckTimer)

    }



    // 如果订单已取消

    if (order.value.status === 'cancelled') {

      ElMessage.error('订单已取消')
      router.push('/orders')
    }
  } catch (error) {
    ElMessage.error(error.message || '获取订单信息失败')
  } finally {
    loading.value = false
  }
}

// 发起支付
const handlePay = async () => {
  if (!canPay.value) {
    if (remainingTime.value <= 0) {
      ElMessage.error('订单已过期，请重新下单')
    }
    return
  }

  try {
    paying.value = true

    // 启动状态轮询（在创建支付订单前启动，以便及时检测支付状态）
    if (!statusCheckTimer) {
      startStatusCheck()
    }

    // 创建支付订单
    const data = await post('/payment/create', {
      orderId: order.value.id,
      returnUrl: `${import.meta.env.VITE_BACKEND_URL}/api/payment/return`
    })

    if (data.payUrl) {
      // 跳转到支付宝支付页面
      window.location.href = data.payUrl
    } else {
      ElMessage.error('创建支付订单失败')
      paying.value = false
    }
  } catch (error) {
    ElMessage.error(error.message || '发起支付失败')
    paying.value = false
  }
}

// 取消订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消订单吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await del(`/orders/${order.value.id}`)
    ElMessage.success('订单已取消')
    router.push('/orders')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消订单失败')
    }
  }
}

// 跳转到订单列表
const goToOrders = () => {
  paymentSuccessVisible.value = false
  router.push('/orders')
}

// 启动倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (remainingTime.value <= 0) {
      clearInterval(countdownTimer)
      ElMessage.error('订单已过期，请重新下单')
      router.push('/orders')
    }
  }, 1000)
}

// 轮询查询订单状态
const startStatusCheck = () => {
  if (isPollingActive.value) {
    console.log('轮询已经在运行中，跳过')
    return
  }
  
  console.log('启动支付状态轮询')
  isPollingActive.value = true
  
  statusCheckTimer = setInterval(async () => {
    try {
      const data = await get(`/payment/query/${orderId.value}`)
      
      if (data.status === 'paid') {
        // 支付成功
        await fetchOrder()
        paymentSuccessVisible.value = true
        clearInterval(countdownTimer)
        clearInterval(statusCheckTimer)
        isPollingActive.value = false
      }
    } catch (error) {
      // 忽略"交易不存在"的错误（还未创建支付订单）
      if (error.message && !error.message.includes('交易不存在')) {
        console.error('查询支付状态失败:', error)
      }
    }
  }, 3000) // 每3秒查询一次
}

onMounted(() => {
  console.log('Payment 页面加载');
  console.log('orderId:', orderId.value);
  console.log('route.params.id:', route.params.id);
  
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (!orderId.value) {
    ElMessage.error('订单ID不能为空')
    router.push('/orders')
    return
  }

  fetchOrder()
  startCountdown()
  // 不在这里启动状态轮询，而是在用户点击支付后启动
})

onUnmounted(() => {
  console.log('Payment 页面卸载，清除定时器')
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (statusCheckTimer) {
    clearInterval(statusCheckTimer)
    statusCheckTimer = null
  }
  isPollingActive.value = false
})
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.payment-header h1 {
  margin: 0;
  color: #303133;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
  font-size: 16px;
  font-weight: 500;
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.info-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-info {
  display: flex;
  gap: 16px;
}

.product-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.product-desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.amount-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.amount-row.total {
  font-size: 16px;
  font-weight: 500;
  padding-top: 12px;
  border-top: 1px solid #e6e6e6;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.address-item {
  display: flex;
  gap: 12px;
}

.address-content {
  flex: 1;
}

.receiver {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.name {
  font-weight: 500;
  color: #303133;
}

.phone {
  color: #606266;
}

.address-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.method-card.selected {
  border-color: #409eff;
}

.alipay-icon {
  width: 32px;
  height: 32px;
}

.method-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.payment-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.pay-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
}

.success-content {
  text-align: center;
  padding: 20px;
}

.success-icon {
  margin-bottom: 16px;
}

.success-content p {
  margin: 8px 0;
  font-size: 16px;
}

.order-id {
  font-size: 14px;
  color: #909399;
}

/* 移动端适配 */
@media (max-width: 600px) {
  .payment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .product-image {
    width: 80px;
    height: 80px;
  }

  .payment-actions {
    flex-direction: column;
  }

  .pay-button {
    width: 100%;
  }
}
</style>