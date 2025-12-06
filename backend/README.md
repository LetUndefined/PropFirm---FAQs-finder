# FAQ Changes Tracker - Backend

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Or for development with auto-reload
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

- `GET /api/websites` - List tracked websites
- `GET /api/faqs?website_id=1` - Get FAQs
- `GET /api/changes?limit=50` - Get recent changes
- `GET /api/faqs/:id/history` - Get FAQ change history
- `POST /api/scrape/trigger` - Manually trigger scrape
- `POST /api/websites` - Add new website
- `DELETE /api/websites/:id` - Remove website

## Features

- Scrapes FundedNext FAQ every 2 hours
- Detects added, modified, and deleted FAQs
- SQLite database (no setup needed)
- REST API for Vue.js frontend
- CORS enabled

## Database

SQLite database located at `data/faqs.db`

Tables:
- `websites` - Tracked websites
- `faqs` - FAQ entries with version history
- `changes` - Change log

## Adding More Websites

```bash
curl -X POST http://localhost:3000/api/websites \
  -H "Content-Type: application/json" \
  -d '{"name":"Site Name","url":"https://example.com/faq"}'
```

Note: You may need to adjust scraper selectors in `services/scraper.js` for different website structures.
