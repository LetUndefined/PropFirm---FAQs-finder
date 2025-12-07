<script setup lang="ts">
import { allPropFaq, getFaqPerProp } from '@/services/api';
import { addColor, addSymbol, dataSet, getPropFaq } from '@/services/faq';
import { onMounted, watch } from 'vue';

const props = defineProps<{
  websiteId?: number;
}>();

watch(
  () => props.websiteId,
  () => {
    fetchData();
  },
);

const fetchData = async () => {
  if (props.websiteId) {
    const data = await getFaqPerProp(props.websiteId);
    if (data) {
      allPropFaq.value = data;
      dataSet.value = data;
    }
  } else {
    getPropFaq();
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <!-- <button @click="PollFaqs">Get new data</button> -->
  <!-- <button @click="createTestChange">Create changes</button> -->
  <div v-if="allPropFaq.length === 0" class="no-changes">
    <v-card class="no-changes-card">
      <v-card-title>No Recent Changes Found</v-card-title>
      <v-card-text>There are no recent changes for this firm in this category.</v-card-text>
    </v-card>
  </div>
  <ul>
    <li v-for="(item, index) in allPropFaq" :key="index">
      <v-col cols="12" md="6">
        <v-card
          :class="addColor(item.change_type)"
          :prepend-icon="addSymbol(item.change_type)"
          :subtitle="`${item.detected_at}`"
          :title="`${item.website_name} ${item.change_type} FAQ's`"
        >
          <v-card-text
            >{{ item.question }}<br />
            <a :href="item.article_url" target="_blank">Visit FAQ</a>
          </v-card-text>
        </v-card>
      </v-col>
    </li>
  </ul>
</template>

<style scoped>
li {
  list-style: none;
}

.no-changes {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.no-changes-card {
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  padding: 2rem;
  max-width: 400px;
}

.info {
  background: linear-gradient(
    90deg,
    rgba(10, 151, 207, 0.7) 0%,
    rgba(29, 163, 204, 0.7) 50%,
    rgba(237, 221, 83, 0.7) 100%
  );
}

.danger {
  background: linear-gradient(
    90deg,
    rgba(207, 174, 10, 0.7) 0%,
    rgba(96, 204, 29, 0.7) 50%,
    rgba(83, 237, 175, 0.7) 100%
  );
}

.warning {
  background: linear-gradient(
    90deg,
    rgba(255, 0, 0, 0.7) 0%,
    rgba(253, 78, 29, 0.7) 50%,
    rgba(252, 176, 69, 0.7) 100%
  );
}

.v-card {
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: ease-in-out 0.2s;
}

.v-card:hover {
  transform: translateY(-5px);
}

:deep(.v-card-title) {
  font-weight: bolder;
  color: white;
  text-shadow: 2px 1px black;
}

:deep(.v-card-text) {
  font-weight: bold;
}

.v-card a {
  text-decoration: none;
  color: white;
  text-shadow: 2px 1px rgb(110, 110, 220);
}

.v-card a:hover {
  color: rgb(35, 162, 241);
  text-shadow: 1px 1px black;
}
</style>
