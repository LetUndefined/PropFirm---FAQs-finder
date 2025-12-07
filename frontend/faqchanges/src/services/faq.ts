import { ref, type Ref } from 'vue';
import { getSpecificPropFaq, PollFaqs, allPropFaq, getAllData } from './api';

export const newArray: Ref<{ id: number; name: string }[]> = ref([]);

// polling every 2 hours

setInterval(() => {
  PollFaqs();
}, 7200000);

export async function getPropFaq() {
  const SinglePropData = await getSpecificPropFaq();
  if (SinglePropData) allPropFaq.value = SinglePropData;
}

export const addColor = (changeType: string) => {
  switch (changeType) {
    case 'added':
      return 'danger';
    case 'modified':
      return 'warning';
    case 'deleted':
      return 'info';
  }
};

export const addSymbol = (changeType: string) => {
  switch (changeType) {
    case 'added':
      return 'fas fa-question';
    case 'modified':
      return 'fas fa-exclamation';
    case 'deleted':
      return 'fas fa-check';
  }
};

export async function filterWebsite() {
  const response = await getAllData();
  response?.forEach((e) => {
    if (!newArray.value.find((item) => item.id === e.id)) {
      newArray.value.push({ id: e.id, name: e.name });
    }
  });
}
