<script setup>
import Card from '../components/card.vue';
import Navbar from '../components/navbar.vue';
import { ref, onMounted } from 'vue';

const products = ref([]);
const loading = ref(false);
const emptyList = ref(false);

// 示例商品数据（当后端没有数据时使用）
const sampleProducts = [
  {
    id: 1,
    name: '智能手表 Pro',
    description: '高端智能手表，支持心率监测、GPS定位和多种运动模式',
    price: 1299,
    image: 'https://placehold.co/400x400/e2e8f0/64748b?text=智能手表'
  },
  {
    id: 2,
    name: '无线蓝牙耳机',
    description: '主动降噪，超长续航，带来沉浸式音乐体验',
    price: 399,
    image: 'https://placehold.co/400x400/e2e8f0/64748b?text=蓝牙耳机'
  },
  {
    id: 3,
    name: '机械键盘 RGB',
    description: '青轴手感，全键无冲，RGB背光灯效，游戏办公两不误',
    price: 599,
    image: 'https://placehold.co/400x400/e2e8f0/64748b?text=机械键盘'
  },
  {
    id: 4,
    name: '4K 超清显示器',
    description: '27英寸IPS面板，144Hz刷新率，色彩精准，适合专业设计和游戏',
    price: 2499,
    image: 'https://placehold.co/400x400/e2e8f0/64748b?text=显示器'
  },
  {
    id: 5,
    name: '便携式充电宝',
    description: '20000mAh大容量，快充支持，多设备兼容，出行必备',
    price: 129,
    image: 'https://placehold.co/400x400/e2e8f0/64748b?text=充电宝'
  },
  {
    id: 6,
    name: '智能摄像头',
    description: '1080P高清画质，夜视功能，移动侦测，支持云存储',
    price: 199,
    image: 'https://placehold.co/400x400/e2e8f0/64748b?text=摄像头'
  }
];

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();

    if (data && data.length > 0) {
      products.value = data;
      emptyList.value = false;
    } else {
      // 后端没有数据时使用示例数据
      products.value = sampleProducts;
      emptyList.value = false;
    }
  } catch (error) {
    console.error('获取商品数据失败:', error);
    // 网络错误时使用示例数据
    products.value = sampleProducts;
    emptyList.value = false;
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

    <div v-else-if="!emptyList" class="products-grid">
      <Card
        v-for="product in products"
        :key="product.id"
        :imageSrc="product.image || `https://placehold.co/400x400/e2e8f0/64748b?text=${product.name}`"
        :imageAlt="product.name"
        :title="product.name"
        :description="product.description"
        :price="`¥${product.price}`"
      />
    </div>

    <div v-else class="empty-state">
      <h1>暂无商品</h1>
      <p>敬请期待更多优质商品上线</p>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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