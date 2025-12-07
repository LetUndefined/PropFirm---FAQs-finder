import SingleFaq from '@/components/SingleFaq.vue';
import { ref, type Ref } from 'vue';

export interface API {
  id: number;
  name: string;
  url: string;
  last_scraped?: string;
  created_at?: string;
  faq_count?: number;
}

export interface FAQs {
  id: number;
  website_id: number;
  category: string;
  website_name: string;
  website_url: string;
}

export interface SingleFaq {
  id: number;
  faq_id: number;
  website_id: number;
  question?: string;
  change_type: string;
  new_content: string;
  article_url: string;
  website_name: string;
  detected_at: string;
  website_url?: string;
  category: string;
}

export const allFaqs: Ref<FAQs[]> = ref([]);
export const allPropFaq: Ref<SingleFaq[]> = ref([]);
export const singlePropFaq: Ref<SingleFaq[]> = ref([]);

export async function getAllData(): Promise<API[] | undefined> {
  try {
    const response = await fetch('http://localhost:3000/api/websites');

    if (!response.ok) {
      throw new Error('Failed to fetch API');
    }
    const data: API[] = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllFaqs(): Promise<FAQs[] | undefined> {
  try {
    const response = await fetch('http://localhost:3000/api/faqs');

    if (!response.ok) {
      throw new Error('Failed to fetch API');
    }
    const data: FAQs[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching', error);
  }
}

// Get all changes
export async function getSpecificPropFaq(): Promise<SingleFaq[] | undefined> {
  try {
    const response = await fetch(`http://localhost:3000/api/changes?limit=20`);
    if (!response.ok) {
      throw new Error('Failed to fetch API');
    }
    const data: SingleFaq[] = await response.json();
    data.forEach((e) => console.log(` Data for ${e.website_name} fetched  `));

    return data;
  } catch (error) {
    console.error('Error fetching', error);
  }
}

export async function getFaqs() {
  const data = await getAllFaqs();
  if (data) allFaqs.value = data;
}

// polls the latest changes and updates the data (even if there are no changes)
export const PollFaqs = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/changes?limit=10`);
    console.log('Polling for new data');
    if (!response.ok) {
      throw new Error('Fetching Failed');
    }
    const newPoll: SingleFaq[] = await response.json();
    allPropFaq.value = newPoll;
    console.log('New Data Added');
  } catch (error) {
    console.error('Fetch Failed', error);
  }
};

// export async function createTestChange() {
//   await fetch('http://localhost:3000/api/test/create-change', { method: 'POST' });
//   console.log('New Changes Made');
//   PollFaqs(); // Refresh to see new change
// }

export async function getFaqPerProp(id: number): Promise<SingleFaq[] | undefined> {
  try {
    const response = await fetch(`http://localhost:3000/api/changes?website_id=${id}&limit=10`);
    if (!response.ok) {
      throw new Error('Fetching failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Feching failed', error);
  }
}
