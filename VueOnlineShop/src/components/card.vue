
<template>
  <div class="container-card">
    <img :src="imageSrc" :alt="imageAlt" />
    <div class="card-info" @click="go2InformationPage">
      <h4>{{ title }}</h4>
      <p>{{ description }}</p>
      <span class="price">¥{{ price }}</span>
    </div>
    <div class="card-actions">
      <button @click="addToCart" class="btn-cart">加入购物车</button>
      <button @click="buyNow" class="btn-buy">立即购买</button>
    </div>
  </div>
</template>

<style scoped>
.container-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  max-width: 320px;
  background: white;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.container-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  object-position: center;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.card-info {
  cursor: pointer;
  margin-top: 12px;
}

h4 {
  margin: 8px 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

p {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  height: 40px;
}

.price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
  display: block;
  margin: 8px 0;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

button:hover {
  opacity: 0.9;
}

.btn-cart {
  background-color: #e28b18;
  color: white;
}

.btn-buy {
  background-color: #f56c6c;
  color: white;
}
</style>

<script setup>
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { post } from '@/utils/api';

const router = useRouter();

// 定义 props
const props = defineProps({
  productId: {
    type: Number,
    required: true
  },
  imageSrc: {
    type: String,
    required: true
  },
  imageAlt: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

// 跳转到商品详情页
function go2InformationPage() {
  router.push(`/product/${props.productId}`);
}

// 添加到购物车
async function addToCart() {
  try {
    await post('/cart/add', {
      productId: props.productId,
      quantity: 1
    });
    ElMessage.success('已添加到购物车');
  } catch (error) {
    console.error('添加到购物车失败:', error);
    ElMessage.error(error.message || '添加到购物车失败');
  }
}

// 立即购买
function buyNow() {
  // TODO: 实现立即购买功能
  ElMessage.info('立即购买功能待实现');
}
</script>