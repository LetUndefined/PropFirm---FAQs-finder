<script setup lang="ts">
import { getFaqs } from '@/services/api';
import { filterWebsite, newArray } from '@/services/faq';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import SingleFaq from '@/components/SingleFaq.vue';

const route = useRoute();
const websiteId = computed(() => Number(route.params.id));

onMounted(() => {
  getFaqs();
  filterWebsite();
});
</script>

<template>
  <div class="button-wrapper">
    <v-btn
      variant="outlined"
      v-for="(item, index) in newArray"
      :key="index"
      @click="router.push({ name: 'propviewId', params: { id: item.id } })"
    >
      {{ item.name }}
    </v-btn>
  </div>
  <SingleFaq v-if="websiteId" :websiteId="websiteId" />
</template>

<style scoped>
.button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
  gap: 1rem;
}
</style>
