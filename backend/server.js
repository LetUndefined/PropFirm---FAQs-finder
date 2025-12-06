const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { initDatabase } = require('./config/database');
const { scrapeAllWebsites } = require('./services/scraper');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FAQ Changes Tracker API',
        version: '1.0.0'
    });
});

// Scheduled scraping - Every 2 hours
cron.schedule('0 */2 * * *', () => {
    console.log('\n=== Running scheduled scrape ===');
    scrapeAllWebsites().catch(err => {
        console.error('Scheduled scrape error:', err);
    });
});

// Initial scrape on startup (after 10 seconds)
setTimeout(() => {
    console.log('\n=== Running initial scrape ===');
    scrapeAllWebsites().catch(err => {
        console.error('Initial scrape error:', err);
    });
}, 10000);

// Start server
app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  FAQ Changes Tracker API Running      ║`);
    console.log(`║  Port: ${PORT}                            ║`);
    console.log(`║  Scraping interval: Every 2 hours      ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
});
