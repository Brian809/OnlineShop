<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="product" class="detail-container">
      <!-- 商品主图 -->
      <div class="main-image">
        <el-image
          :src="mainImageUrl"
          :alt="product.name"
          fit="cover"
          style="width: 100%; height: 400px;"
        />
      </div>

      <!-- 商品信息 -->
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-description">{{ product.description }}</p>
        <div class="product-meta">
          <span class="price">¥{{ product.price }}</span>
          <span class="stock">库存: {{ product.stock }}</span>
          <span class="category">{{ product.category }}</span>
        </div>
        <el-rate v-model="product.rating" disabled show-score text-color="#ff9900" />
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="warning" size="large" @click="addToCart">
            加入购物车
          </el-button>
          <el-button type="danger" size="large" @click="buyNow">
            立即购买
          </el-button>
        </div>
      </div>

      <!-- 商品详情图 -->
      <div v-if="detailImages && detailImages.length > 0" class="detail-images">
        <h2>商品详情</h2>
        <div class="image-grid">
          <el-image
            v-for="(img, index) in detailImages"
            :key="index"
            :src="getImageUrl(img)"
            :alt="`详情图 ${index + 1}`"
            fit="cover"
            style="width: 100%; aspect-ratio: 1;"
            :preview-src-list="detailImages.map(getImageUrl)"
            :initial-index="index"
          />
        </div>
      </div>
    </div>
    <div v-else class="error">
      <el-icon><WarningFilled /></el-icon>
      <span>商品不存在</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { get, post, useUserStore } from '@/utils/api';
import { ElMessage } from 'element-plus';
import { Loading, WarningFilled } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const product = ref(null);
const loading = ref(true);

// 商品主图
const mainImageUrl = computed(() => {
  if (!product.value?.image) return 'https://placehold.co/600x400?text=No+Image';
  return product.value.image;
});

// 商品详情图数组
const detailImages = computed(() => {
  if (!product.value?.detailImages) return [];
  try {
    return JSON.parse(product.value.detailImages);
  } catch {
    return [];
  }
});

// 图片 URL 处理
const getImageUrl = (image) => {
  if (!image) return 'https://placehold.co/300x300?text=No+Image';
  if (image.startsWith('data:image')) return image;
  return image;
};

// 加载商品详情
const loadProductDetail = async () => {
  try {
    const productId = route.params.id;
    if (!productId) {
      ElMessage.error('商品 ID 不存在');
      return;
    }
    const data = await get(`/products/${productId}`);
    product.value = data;
  } catch (error) {
    console.error('加载商品详情失败:', error);
    ElMessage.error(error.message || '加载商品详情失败');
  } finally {
    loading.value = false;
  }
};

// 添加到购物车
async function addToCart() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    await post('/cart/add', {
      productId: product.value.id,
      quantity: 1
    });
    ElMessage.success('已添加到购物车');
  } catch (error) {
    console.error('添加到购物车失败:', error);
    ElMessage.error(error.message || '添加到购物车失败');
  }
}

// 立即购买
async function buyNow() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    const order = await post('/orders/create', {
      userId: userStore.user.id,
      productId: product.value.id,
      quantity: 1,
      totalPrice: product.value.price
    });
    ElMessage.success('订单创建成功');
    router.push(`/payment/${order.id}`);
  } catch (error) {
    console.error('创建订单失败:', error);
    ElMessage.error(error.message || '创建订单失败');
  }
}

onMounted(() => {
  loadProductDetail();
});
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 100px 0;
  font-size: 16px;
  color: #999;
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 100px 0;
  font-size: 16px;
  color: #f56c6c;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.main-image {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-info {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.product-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.product-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.stock,
.category {
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.action-buttons .el-button {
  flex: 1;
  font-size: 16px;
  padding: 15px 30px;
}

.detail-images {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.detail-images h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}
</style>