# API Documentation for Vue.js Frontend

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Get All Tracked Websites

**GET** `/api/websites`

Returns list of all websites being tracked with metadata.

**Response:**
```json
[
  {
    "id": 1,
    "name": "FundedNext",
    "url": "https://help.fundednext.com/en/",
    "last_scraped": "2025-12-05T16:54:57.000Z",
    "created_at": "2025-12-05T16:54:47.000Z",
    "faq_count": 8
  }
]
```

**Vue.js Example:**
```javascript
const websites = await fetch('http://localhost:3000/api/websites')
  .then(res => res.json());
```

---

### 2. Get FAQs

**GET** `/api/faqs?website_id={id}`

Get all active FAQs. Filter by website_id (optional).

**Query Parameters:**
- `website_id` (optional) - Filter by specific website

**Response:**
```json
[
  {
    "id": 1,
    "website_id": 1,
    "question": "What Is The Copy Trading Rule at FundedNext?",
    "answer": "Copy trading details...",
    "category": "General",
    "hash": "abc123...",
    "first_seen": "2025-12-05T16:54:57.000Z",
    "last_seen": "2025-12-05T16:54:57.000Z",
    "is_active": 1,
    "website_name": "FundedNext",
    "website_url": "https://help.fundednext.com/en/"
  }
]
```

**Vue.js Example:**
```javascript
// Get all FAQs
const allFaqs = await fetch('http://localhost:3000/api/faqs')
  .then(res => res.json());

// Get FAQs for specific website
const fundedNextFaqs = await fetch('http://localhost:3000/api/faqs?website_id=1')
  .then(res => res.json());
```

---

### 3. Get Recent Changes

**GET** `/api/changes?limit={num}&website_id={id}`

Get recent changes across all websites or filtered by website.

**Query Parameters:**
- `limit` (optional, default: 50) - Number of changes to return
- `website_id` (optional) - Filter by specific website

**Response:**
```json
[
  {
    "id": 1,
    "faq_id": 5,
    "website_id": 1,
    "question": "What are the trading rules?",
    "change_type": "added",
    "old_content": null,
    "new_content": "New FAQ content...",
    "detected_at": "2025-12-05T16:54:57.000Z",
    "website_name": "FundedNext",
    "website_url": "https://help.fundednext.com/en/"
  },
  {
    "id": 2,
    "faq_id": 3,
    "website_id": 1,
    "question": "What is the daily loss limit?",
    "change_type": "modified",
    "old_content": "Old answer...",
    "new_content": "Updated answer...",
    "detected_at": "2025-12-05T14:00:00.000Z",
    "website_name": "FundedNext",
    "website_url": "https://help.fundednext.com/en/"
  }
]
```

**Change Types:**
- `added` - New FAQ added to the website
- `modified` - Existing FAQ answer was changed
- `deleted` - FAQ was removed from the website

**Vue.js Example:**
```javascript
// Get last 20 changes
const recentChanges = await fetch('http://localhost:3000/api/changes?limit=20')
  .then(res => res.json());

// Get changes for specific website
const fundedNextChanges = await fetch('http://localhost:3000/api/changes?website_id=1&limit=10')
  .then(res => res.json());
```

---

### 4. Get FAQ Change History

**GET** `/api/faqs/:id/history`

Get complete change history for a specific FAQ.

**Response:**
```json
[
  {
    "id": 1,
    "faq_id": 5,
    "website_id": 1,
    "question": "What are the trading rules?",
    "change_type": "modified",
    "old_content": "Previous version...",
    "new_content": "Current version...",
    "detected_at": "2025-12-05T14:00:00.000Z"
  },
  {
    "id": 2,
    "faq_id": 5,
    "website_id": 1,
    "question": "What are the trading rules?",
    "change_type": "added",
    "old_content": null,
    "new_content": "Initial version...",
    "detected_at": "2025-12-01T00:00:00.000Z"
  }
]
```

**Vue.js Example:**
```javascript
const faqId = 5;
const history = await fetch(`http://localhost:3000/api/faqs/${faqId}/history`)
  .then(res => res.json());
```

---

### 5. Manually Trigger Scrape

**POST** `/api/scrape/trigger`

Manually trigger a scrape (useful for testing or refresh button).

**Request Body (optional):**
```json
{
  "website_id": 1
}
```
If no body provided, scrapes all websites.

**Response:**
```json
{
  "success": true,
  "faqsFound": 8,
  "changes": {
    "added": 2,
    "modified": 1,
    "deleted": 0
  }
}
```

**Vue.js Example:**
```javascript
// Scrape all websites
const result = await fetch('http://localhost:3000/api/scrape/trigger', {
  method: 'POST'
}).then(res => res.json());

// Scrape specific website
const result = await fetch('http://localhost:3000/api/scrape/trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ website_id: 1 })
}).then(res => res.json());
```

---

### 6. Add New Website

**POST** `/api/websites`

Add a new website to track.

**Request Body:**
```json
{
  "name": "Another Prop Firm",
  "url": "https://example.com/faq"
}
```

**Response:**
```json
{
  "success": true,
  "id": 2
}
```

**Vue.js Example:**
```javascript
const newWebsite = await fetch('http://localhost:3000/api/websites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'FTMO',
    url: 'https://ftmo.com/faq'
  })
}).then(res => res.json());
```

---

### 7. Delete Website

**DELETE** `/api/websites/:id`

Remove a website from tracking.

**Response:**
```json
{
  "success": true
}
```

**Vue.js Example:**
```javascript
await fetch('http://localhost:3000/api/websites/2', {
  method: 'DELETE'
});
```

---

## Vue.js Integration Examples

### Composable for API calls

Create a `useApi.js` composable:

```javascript
// composables/useApi.js
import { ref } from 'vue';

const API_BASE = 'http://localhost:3000/api';

export function useApi() {
  const loading = ref(false);
  const error = ref(null);

  const fetchWebsites = async () => {
    loading.value = true;
    try {
      const res = await fetch(`${API_BASE}/websites`);
      return await res.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const fetchFaqs = async (websiteId = null) => {
    loading.value = true;
    try {
      const url = websiteId
        ? `${API_BASE}/faqs?website_id=${websiteId}`
        : `${API_BASE}/faqs`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const fetchChanges = async (limit = 50, websiteId = null) => {
    loading.value = true;
    try {
      let url = `${API_BASE}/changes?limit=${limit}`;
      if (websiteId) url += `&website_id=${websiteId}`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const triggerScrape = async (websiteId = null) => {
    loading.value = true;
    try {
      const res = await fetch(`${API_BASE}/scrape/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: websiteId ? JSON.stringify({ website_id: websiteId }) : null
      });
      return await res.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    fetchWebsites,
    fetchFaqs,
    fetchChanges,
    triggerScrape
  };
}
```

### Component Example

```vue
<template>
  <div>
    <h1>FAQ Changes</h1>

    <button @click="refresh">Refresh</button>

    <div v-if="loading">Loading...</div>

    <div v-for="change in changes" :key="change.id">
      <div :class="`change-${change.change_type}`">
        <h3>{{ change.question }}</h3>
        <p><strong>Type:</strong> {{ change.change_type }}</p>
        <p><strong>Website:</strong> {{ change.website_name }}</p>
        <p><strong>Detected:</strong> {{ new Date(change.detected_at).toLocaleString() }}</p>

        <div v-if="change.change_type === 'modified'">
          <p><strong>Old:</strong> {{ change.old_content }}</p>
          <p><strong>New:</strong> {{ change.new_content }}</p>
        </div>
        <div v-else-if="change.change_type === 'added'">
          <p>{{ change.new_content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from './composables/useApi';

const { loading, fetchChanges } = useApi();
const changes = ref([]);

async function loadChanges() {
  changes.value = await fetchChanges(50);
}

async function refresh() {
  await loadChanges();
}

onMounted(() => {
  loadChanges();
});
</script>

<style>
.change-added { border-left: 4px solid #22c55e; padding: 10px; margin: 10px 0; }
.change-modified { border-left: 4px solid #f59e0b; padding: 10px; margin: 10px 0; }
.change-deleted { border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0; }
</style>
```

---

## Notes

1. **CORS is enabled** - Your Vue.js dev server can call the API
2. **Automatic scraping** - Runs every 2 hours automatically
3. **Real-time updates** - Call `/api/changes` periodically to show new changes
4. **Initial data** - FundedNext is pre-loaded and scraped on startup

## Next Steps for Your Frontend

1. Create a dashboard showing tracked websites
2. Display recent changes with color coding (green=added, orange=modified, red=deleted)
3. Add a detail view for each FAQ with full history
4. Add refresh button that calls `/api/scrape/trigger`
5. Optional: Poll `/api/changes` every 5 minutes for live updates
