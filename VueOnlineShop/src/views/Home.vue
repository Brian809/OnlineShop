<script setup>
import Card from '../components/card.vue';
import Navbar from '../components/navbar.vue';
import { ref, onMounted } from 'vue';

const emptyList = ref(false);

const fetchProducts = () => {
  fetch('http://localhost:3000/api/products', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
    .then(data => {
      console.log(data);
      // 处理数据
      if (!data || data.length === 0) {
        emptyList.value = true;
      }
    }).catch(error => {
      console.error('Error fetching data:', error);
      emptyList.value = true;
    });
};

onMounted(fetchProducts);
</script>

<template>
  <Navbar />
    
    <div v-if="!emptyList">
    <Card 
      imageSrc="https://via.placeholder.com/300"
      imageAlt="Sample Product"
      title="Sample Product"
      description="This is a sample product description."
      price="$19.99"
    />
    </div>
    <div v-if="emptyList" style="text-align: center; margin-top: 50px;">
      <h1>
        We are sorry, but there are no products available at the moment.
      </h1>
    </div>
  
</template>