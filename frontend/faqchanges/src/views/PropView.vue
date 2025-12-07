<script setup lang="ts">
import { getFaqs } from '@/services/api';
import { filterWebsite, newArray } from '@/services/faq';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import SingleFaq from '@/components/SingleFaq.vue';
import { filterChanges } from '@/services/faq';

const route = useRoute();
const websiteId = computed(() => Number(route.params.id));

onMounted(() => {
  getFaqs();
  filterWebsite();
});
</script>

<template>
  <div class="button-wrapper">
    <div class="background-wrapper">
      <v-btn
        variant="outlined"
        v-for="(item, index) in newArray"
        :key="index"
        @click="router.push({ name: 'propviewId', params: { id: item.id } })"
      >
        {{ item.name }}
      </v-btn>
    </div>
  </div>
  <div class="type-wrapper">
    <h5>Filter by</h5>
    <div class="background-wrapper">
      <v-btn variant="tonal" @click="filterChanges('all')">all</v-btn>
      <v-btn variant="tonal" @click="filterChanges('added')">added</v-btn>
      <v-btn variant="tonal" @click="filterChanges('modified')">modified</v-btn>
      <v-btn variant="tonal" @click="filterChanges('deleted')">deleted</v-btn>
    </div>
  </div>
  <div class="prop-container">
    <section v-if="!websiteId" class="intro-section">
      <h1>FAQ Change Tracker</h1>
      <p class="intro-text">
        Track and monitor changes to FAQ pages for specific Firms. Select your desired Firm to
        start.
      </p>
    </section>

    <SingleFaq v-if="websiteId" :websiteId="websiteId" />
  </div>
</template>

<style scoped>
.button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
  gap: 1rem;
}

.type-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.background-wrapper {
  display: flex;
  gap: 0.5rem;
}

.background-wrapper .v-btn:hover {
  border: 0.5px solid white;
}
</style>
