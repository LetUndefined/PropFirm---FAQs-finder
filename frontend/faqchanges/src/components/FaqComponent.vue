<script setup lang="ts">
import { allFaqs, getFaqs } from '@/services/api';
import { computed, onMounted, ref } from 'vue';

const inputValue = ref('');

const filterFaq = computed(() => {
  if (inputValue.value === '') {
    return allFaqs.value;
  } else {
    const storedFaqs = allFaqs.value.filter((e) => e.website_name.includes(inputValue.value));
    return storedFaqs;
  }
});

onMounted(() => {
  getFaqs();
});
</script>

<template>
  <div>
    <input type="text" v-model="inputValue" />
  </div>

  <li v-for="(item, index) in filterFaq" :key="index">
    <div>ID: {{ item.id }}</div>
    <div>Website ID: {{ item.website_id }}</div>
    <div>Name: {{ item.website_name }}</div>
    <div>URL: {{ item.website_url }}</div>
  </li>
</template>
