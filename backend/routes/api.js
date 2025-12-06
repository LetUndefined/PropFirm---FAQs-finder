const express = require('express');
const router = express.Router();
const { query, run, get } = require('../config/database');
const { scrapeWebsite, scrapeAllWebsites } = require('../services/scraper');

// GET /api/websites - List all tracked websites
router.get('/websites', async (req, res) => {
    try {
        const websites = await query(`
            SELECT
                w.*,
                COUNT(f.id) as faq_count
            FROM websites w
            LEFT JOIN faqs f ON w.id = f.website_id AND f.is_active = 1
            GROUP BY w.id
        `);
        res.json(websites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/faqs - Get all FAQs (optionally filter by website_id)
router.get('/faqs', async (req, res) => {
    try {
        const { website_id } = req.query;
        let sql = `
            SELECT
                f.*,
                w.name as website_name,
                w.url as website_url
            FROM faqs f
            JOIN websites w ON f.website_id = w.id
            WHERE f.is_active = 1
        `;
        const params = [];

        if (website_id) {
            sql += ' AND f.website_id = ?';
            params.push(website_id);
        }

        sql += ' ORDER BY f.last_seen DESC';

        const faqs = await query(sql, params);
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/faqs/:id/history - Get change history for a specific FAQ
router.get('/faqs/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const changes = await query(
            'SELECT * FROM changes WHERE faq_id = ? ORDER BY detected_at DESC',
            [id]
        );
        res.json(changes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/changes - Get recent changes (optionally filter by limit and website_id)
router.get('/changes', async (req, res) => {
    try {
        const { limit = 50, website_id } = req.query;
        let sql = `
            SELECT
                c.*,
                w.name as website_name,
                w.url as website_url,
                f.category as category,
                f.article_url as article_url
            FROM changes c
            JOIN websites w ON c.website_id = w.id
            LEFT JOIN faqs f ON c.faq_id = f.id
        `;
        const params = [];

        if (website_id) {
            sql += ' WHERE c.website_id = ?';
            params.push(website_id);
        }

        sql += ' ORDER BY c.detected_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const changes = await query(sql, params);
        res.json(changes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/scrape/trigger - Manually trigger a scrape
router.post('/scrape/trigger', async (req, res) => {
    try {
        const { website_id } = req.body;

        if (website_id) {
            // Scrape specific website
            const website = await get('SELECT * FROM websites WHERE id = ?', [website_id]);
            if (!website) {
                return res.status(404).json({ error: 'Website not found' });
            }
            const result = await scrapeWebsite(website.id, website.url);
            res.json(result);
        } else {
            // Scrape all websites
            await scrapeAllWebsites();
            res.json({ success: true, message: 'Scrape completed for all websites' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/websites - Add a new website to track
router.post('/websites', async (req, res) => {
    try {
        const { name, url } = req.body;

        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' });
        }

        const result = await run(
            'INSERT INTO websites (name, url) VALUES (?, ?)',
            [name, url]
        );

        res.json({ success: true, id: result.id });
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Website URL already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// DELETE /api/websites/:id - Remove a website
router.delete('/websites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM websites WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/test/create-change - Create a test change for testing frontend
router.post('/test/create-change', async (req, res) => {
    try {
        // Get a random FAQ
        const faqs = await query('SELECT * FROM faqs ORDER BY RANDOM() LIMIT 1');

        if (faqs.length === 0) {
            return res.status(404).json({ error: 'No FAQs found. Run a scrape first.' });
        }

        const faq = faqs[0];
        const changeTypes = ['modified', 'added', 'deleted'];
        const randomType = changeTypes[Math.floor(Math.random() * changeTypes.length)];

        // Sample prop trading FAQ content variations
        const sampleChanges = [
            {
                old: 'Maximum daily loss limit is 5% of initial balance.',
                new: 'Maximum daily loss limit has been updated to 4% of initial balance.'
            },
            {
                old: 'Profit target for Phase 1 is 8%.',
                new: 'Profit target for Phase 1 is now 10% with enhanced scaling plan.'
            },
            {
                old: 'Trading during news events is prohibited.',
                new: 'Trading during major news events (red flag) is now allowed with increased risk management.'
            },
            {
                old: 'Minimum trading days required: 5 days.',
                new: 'Minimum trading days requirement has been reduced to 3 days.'
            },
            {
                old: 'Maximum position size is 2% per trade.',
                new: 'Maximum position size increased to 3% per trade for funded accounts.'
            },
            {
                old: 'Copy trading is strictly prohibited.',
                new: 'Copy trading is now permitted with prior approval from risk management.'
            },
            {
                old: 'Weekend holding is not allowed.',
                new: 'Weekend holding is now allowed for positions with stop loss in profit.'
            },
            {
                old: 'First payout available after 14 days.',
                new: 'First payout processing time reduced to 7 days for verified accounts.'
            },
            {
                old: 'Maximum drawdown limit is 10% of initial balance.',
                new: 'Maximum drawdown limit has been adjusted to 12% with trailing drawdown option.'
            },
            {
                old: 'Scaling plan starts at $25,000 funded account.',
                new: 'Scaling plan now starts at $10,000 with faster progression tiers.'
            },
            {
                old: 'EA trading requires written approval.',
                new: 'EA trading is now automatically approved for all challenge accounts.'
            },
            {
                old: 'Profit split is 80/20 in trader favor.',
                new: 'Profit split increased to 90/10 for top performing traders.'
            },
            {
                old: 'Only major forex pairs are tradeable.',
                new: 'Trading expanded to include indices, commodities, and crypto CFDs.'
            },
            {
                old: 'Consistency rule: No single trade above 40% of total profit.',
                new: 'Consistency rule relaxed: No single trade above 50% of total profit.'
            },
            {
                old: 'Challenge fee: $299 for $100k account.',
                new: 'Limited time offer: Challenge fee reduced to $199 for $100k account.'
            }
        ];

        const randomChange = sampleChanges[Math.floor(Math.random() * sampleChanges.length)];

        let oldContent, newContent;
        if (randomType === 'added') {
            oldContent = null;
            newContent = randomChange.new;
        } else if (randomType === 'deleted') {
            oldContent = randomChange.old;
            newContent = null;
        } else {
            oldContent = randomChange.old;
            newContent = randomChange.new;
        }

        // Create test change
        const result = await run(
            'INSERT INTO changes (faq_id, website_id, question, change_type, old_content, new_content) VALUES (?, ?, ?, ?, ?, ?)',
            [
                faq.id,
                faq.website_id,
                faq.question,
                randomType,
                oldContent,
                newContent
            ]
        );

        res.json({
            success: true,
            change_id: result.id,
            message: `Test ${randomType} change created for: ${faq.question}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
