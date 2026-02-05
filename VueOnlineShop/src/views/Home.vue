<script setup>
import Card from '../components/card.vue';
import Navbar from '../components/navbar.vue';
import Cart from '../components/cart.vue';
import { ref, onMounted, computed } from 'vue';
import { get } from '@/utils/api';
import { ElMessage } from 'element-plus';

const products = ref([]);
const loading = ref(false);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// 获取图片 URL
const getImageUrl = (image) => {
  if (!image) {
    return '';
  }
  // 如果是 base64 数据，直接返回
  if (image.startsWith('data:image/')) {
    return image;
  }
  // 如果是相对路径（如 /static/xxx.png），拼接后端地址
  if (image.startsWith('/static/') || image.startsWith('/images/')) {
    return `${BACKEND_URL}${image}`;
  }
  // 如果是完整 URL，直接返回
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  // 其他情况返回空字符串
  return '';
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const data = await get('/products');
    products.value = data || [];
  } catch (error) {
    ElMessage.error(error.message || '获取商品列表失败');
    console.error('获取商品数据失败:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProducts);
</script>

<template>
  <Navbar />

  <div class="home-container">
    <div class="banner">
      <h1>欢迎来到 OnlineShop</h1>
      <p>发现更多优质商品</p>
    </div>

    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <div v-else-if="products.length > 0" class="products-grid">
      <Card
        v-for="product in products"
        :key="product.id"
        :productId="product.id"
        :imageSrc="getImageUrl(product.image) || `https://placehold.co/400x400/e2e8f0/64748b?text=${product.name}`"
        :imageAlt="product.name"
        :title="product.name"
        :description="product.description"
        :price="product.price"
      />
    </div>

    <div v-else class="empty-state">
      <h1>暂无商品</h1>
      <p>敬请期待更多优质商品上线</p>
    </div>
  </div>

  <Cart />
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100px; /* 为购物车按钮留出空间 */
}

.banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 30px;
}

.banner h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
}

.banner p {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  font-size: 18px;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: #666;
}

.empty-state h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 16px;
}
</style>