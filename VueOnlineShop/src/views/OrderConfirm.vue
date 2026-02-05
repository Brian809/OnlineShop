<template>
  <div class="order-confirm-container">
    <div class="page-header">
      <h2>确认订单</h2>
    </div>

    <!-- 收货地址选择 -->
    <div class="address-section">
      <div class="section-header">
        <h3>收货地址</h3>
        <el-button type="primary" size="small" @click="showAddressDialog = true">
          <el-icon><Plus /></el-icon>
          添加地址
        </el-button>
      </div>

      <div v-if="loading.address" class="loading">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="addressList.length === 0" class="empty-address">
        <el-empty description="暂无收货地址，请先添加地址">
          <el-button type="primary" @click="showAddressDialog = true">添加地址</el-button>
        </el-empty>
      </div>

      <div v-else class="address-list">
        <div
          v-for="address in addressList"
          :key="address.id"
          :class="['address-card', { active: selectedAddress?.id === address.id, default: address.isDefault }]"
          @click="selectAddress(address)"
        >
          <div class="address-info">
            <div class="address-header">
              <span class="name">{{ address.fullName }}</span>
              <span class="phone">{{ address.phone }}</span>
              <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
            </div>
          </div>
          <el-icon class="check-icon" v-if="selectedAddress?.id === address.id">
            <CircleCheck />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="product-section">
      <div class="section-header">
        <h3>商品信息</h3>
      </div>

      <div v-if="loading.product" class="loading">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="product" class="product-card">
        <img :src="product.image" :alt="product.name" class="product-image" />
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-description">{{ product.description }}</div>
          <div class="product-meta">
            <span class="product-price">¥{{ parseFloat(product.price).toFixed(2) }}</span>
            <span class="product-quantity">× {{ quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单金额 -->
    <div class="amount-section">
      <div class="amount-row">
        <span>商品总价</span>
        <span>¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <div class="amount-row total">
        <span>应付金额</span>
        <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
      </div>
    </div>

    <!-- 提交订单按钮 -->
    <div class="submit-section">
      <el-button
        type="primary"
        size="large"
        :disabled="!canSubmit"
        :loading="submitting"
        @click="submitOrder"
        class="submit-button"
      >
        <el-icon><ShoppingCart /></el-icon>
        提交订单 ¥{{ totalPrice.toFixed(2) }}
      </el-button>
    </div>

    <!-- 添加地址对话框 -->
    <el-dialog
      v-model="showAddressDialog"
      title="添加收货地址"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="80px">
        <el-form-item label="姓名" prop="fullName">
          <el-input v-model="addressForm.fullName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="addressForm.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="addressForm.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="addressForm.district" placeholder="请输入区县" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input
            v-model="addressForm.detailAddress"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddAddress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, CircleCheck, ShoppingCart } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { get, post } from '@/utils/api';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 加载状态
const loading = ref({
  address: false,
  product: false
});

// 提交状态
const submitting = ref(false);

// 地址列表
const addressList = ref([]);
const selectedAddress = ref(null);

// 商品信息
const product = ref(null);
const quantity = ref(1);

// 对话框
const showAddressDialog = ref(false);
const addressFormRef = ref(null);

// 地址表单
const addressForm = ref({
  fullName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false
});

// 地址表单验证规则
const addressRules = {
  fullName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
};

// 计算总价
const totalPrice = computed(() => {
  if (!product.value) return 0;
  return parseFloat(product.value.price) * quantity.value;
});

// 是否可以提交
const canSubmit = computed(() => {
  return selectedAddress.value !== null && product.value !== null && !submitting.value;
});

// 获取地址列表
const fetchAddresses = async () => {
  loading.value.address = true;
  try {
    const data = await get('/users/me/addresses');
    addressList.value = data || [];

    // 选择默认地址或第一个地址
    const defaultAddress = addressList.value.find(addr => addr.isDefault);
    selectedAddress.value = defaultAddress || addressList.value[0] || null;
  } catch (error) {
    ElMessage.error('获取地址列表失败');
  } finally {
    loading.value.address = false;
  }
};

// 选择地址
const selectAddress = (address) => {
  selectedAddress.value = address;
};

// 添加地址
const handleAddAddress = async () => {
  if (!addressFormRef.value) return;

  try {
    await addressFormRef.value.validate();
    await post('/users/me/addresses', addressForm.value);
    ElMessage.success('添加地址成功');
    showAddressDialog.value = false;
    addressForm.value = {
      fullName: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detailAddress: '',
      isDefault: false
    };
    await fetchAddresses();
  } catch (error) {
    if (error !== false) {
      ElMessage.error('添加地址失败');
    }
  }
};

// 获取商品信息
const fetchProduct = async () => {
  loading.value.product = true;
  try {
    const productId = route.query.productId;
    if (!productId) {
      ElMessage.error('商品信息缺失');
      router.back();
      return;
    }
    product.value = await get(`/products/${productId}`);
    quantity.value = parseInt(route.query.quantity) || 1;
  } catch (error) {
    ElMessage.error('获取商品信息失败');
    router.back();
  } finally {
    loading.value.product = false;
  }
};

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  if (!product.value) {
    ElMessage.error('商品信息缺失');
    return;
  }

  submitting.value = true;
  try {
    const order = await post('/orders/create', {
      userId: userStore.user.id,
      productId: product.value.id,
      quantity: quantity.value,
      totalPrice: totalPrice.value.toFixed(2)
    });

    ElMessage.success('订单创建成功');
    router.push(`/payment/${order.id}`);
  } catch (error) {
    ElMessage.error('创建订单失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchAddresses();
  fetchProduct();
});
</script>

<style scoped>
.order-confirm-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.address-section,
.product-section,
.amount-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.address-list {
  display: grid;
  gap: 12px;
}

.address-card {
  position: relative;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-card:hover {
  border-color: #409eff;
}

.address-card.active {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.address-card.default {
  border-color: #67c23a;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.name {
  font-size: 16px;
  font-weight: 500;
}

.phone {
  color: #666;
  font-size: 14px;
}

.address-detail {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  color: #409eff;
}

.empty-address {
  padding: 40px 0;
  text-align: center;
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

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
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

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.submit-button {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

@media (min-width: 800px) {
  .submit-button {
    margin: 0 auto;
    display: inline-flex;
    width: auto;
    min-width: 300px;
  }
}
</style>