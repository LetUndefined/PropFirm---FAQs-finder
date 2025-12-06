<script setup lang="ts">
import PageNavigation from '@/components/PageNavigation.vue';
</script>

<template>
  <div class="main-layout">
    <header>
      <PageNavigation />
    </header>
    <main>
      <router-view />
    </main>
    <footer></footer>
  </div>
</template>

<style>
header {
  margin-bottom: 4rem;
}

body {
  background: linear-gradient(
    90deg,
    rgba(10, 171, 207, 1) 0%,
    rgba(29, 93, 204, 1) 50%,
    rgba(88, 83, 237, 1) 100%
  );
}
</style>
