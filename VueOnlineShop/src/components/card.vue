<template>
<div class="container-card">
    <img :src="imageSrc" :alt="imageAlt" />
    <div @click="go2InformationPage">
        <h4>{{ title }}</h4>
        <p>{{ description }}</p>
        <span class="price">{{ price }}</span>
    </div>
    <div>
        <button @click="addToCart">Add to Cart</button>
        <button @click="buyNow">Buy Now</button>
    </div>
</div>
</template>
<style scoped>
.container-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding:3px;
  /* text-align: ; */
  max-width: 320px;
}
h4{
    margin: 8px 0;
}
p{
    font-size: 0.9em;
    color: #555;
}
img {
  width: 300px;
  height: 300px;
}

.price {
    font-size: 1.2em;
    color: #dd0000;
    font-weight: bold;
}
button {
    margin: 8px 4px;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
button:first-of-type {
    background-color: #e28b18;
    color: white;
}
button:last-of-type {
    background-color: #e21212;
    color: white;
}
</style>
<script>
export default {
  name: "Card",
  props: {
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
      type: String,
      required: true
    }
  },
};

</script>