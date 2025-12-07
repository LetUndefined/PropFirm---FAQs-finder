<script setup lang="ts">
import router from '@/router';
</script>

<template>
  <nav class="wrapper">
    <ul>
      <li @click="router.push('/')">All Faqs</li>
      <li @click="router.push('propview')">Prop Faqs</li>
      <li>Feedback</li>
    </ul>
  </nav>
</template>

<style scoped>
nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: rgb(247, 244, 235, 0.8);
  border-radius: 5px;
  box-shadow: 0px 2px 10px black;
  z-index: 9000;
  backdrop-filter: blur(10px);
}

ul {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
}

li {
  list-style: none;
  transition: ease-in-out 0.2s;
  font-weight: bolder;
  text-transform: uppercase;
}

li:hover {
  cursor: pointer;
  transform: translateY(-4px);
}
</style>
