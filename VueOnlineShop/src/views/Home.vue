<script setup>
import Card from '../components/card.vue';
import Navbar from '../components/navbar.vue';
import cart from '../components/cart.vue';
import { ref, onMounted, computed } from 'vue';
import { get } from '@/utils/api';
import { ElMessage } from 'element-plus';

const products = ref([]);
const loading = ref(false);

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
    return `http://localhost:3000${image}`;
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
  <div class="home-page">
    <Navbar />

    <div class="main-container">
      <div class="banner">
        <h1>欢迎来到 OnlineShop</h1>
        <p>发现更多优质商品</p>
      </div>

      <div class="content-wrapper">
        <!-- 加载中状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 商品列表 -->
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

        <!-- 空状态 -->
        <el-empty v-else description="暂无商品，敬请期待" class="empty-state">
          <el-button type="primary" @click="fetchProducts">刷新页面</el-button>
        </el-empty>
      </div>
    </div>

    <cart />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-container {
  min-height: 100vh;
  padding-top: 60px; /* 为桌面导航栏留出空间 */
  padding-bottom: 80px; /* 为底部导航栏留出空间 */
}

.banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 60px 20px;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.banner h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
  font-weight: 600;
}

.banner p {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-container {
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  margin: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  padding: 60px 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-container {
    padding-top: 0;
    padding-bottom: 70px;
  }

  .banner {
    padding: 40px 20px;
    margin: 10px;
  }

  .banner h1 {
    font-size: 28px;
  }

  .banner p {
    font-size: 16px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }

  .content-wrapper {
    padding: 0 10px;
  }
}
</style>