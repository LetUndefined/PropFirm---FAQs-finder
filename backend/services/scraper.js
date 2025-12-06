const axios = require('axios');
const cheerio = require('cheerio');
const md5 = require('md5');
const { query, run, get } = require('../config/database');

// Trading-related keywords for filtering
const TRADING_KEYWORDS = [
    'trading', 'trade', 'challenge', 'rule', 'account', 'funded',
    'profit', 'loss', 'drawdown', 'payout', 'withdrawal', 'target',
    'limit', 'risk', 'restriction', 'prohibited', 'allowed', 'evaluation',
    'consistency', 'scaling', 'phase', 'objective', 'requirement'
];

// Check if category is trading-related
function isTradingRelated(categoryName) {
    const lower = categoryName.toLowerCase();
    return TRADING_KEYWORDS.some(keyword => lower.includes(keyword));
}

// Clean up category name
function cleanCategoryName(title) {
    let cleaned = title
        .replace(/By\s+[\w\s]+\d+\s+author/gi, '') // Remove "By Kyle1 author"
        .replace(/\d+\s+articles?/gi, '')           // Remove "15 articles"
        .replace(/\s+\|\s+/g, ' - ')                // Clean separators
        .trim();

    // Split on capital letters without space (e.g., "Getting StartedGet Started" -> "Getting Started")
    // Take only the first meaningful part before redundant text
    const parts = cleaned.split(/(?=[A-Z][a-z])/);
    if (parts.length > 1 && parts[0].length > 0) {
        // Find where the repetition or description starts
        const firstPart = parts[0] + (parts[1] || '');
        if (firstPart.length > 10 && firstPart.length < 50) {
            return firstPart.trim();
        }
    }

    // Fallback: take first 50 chars or until first repetition
    if (cleaned.length > 50) {
        cleaned = cleaned.substring(0, 50).trim();
    }

    return cleaned;
}

// Scrape a website and detect changes
async function scrapeWebsite(websiteId, url) {
    console.log(`Starting scrape for website ID ${websiteId}: ${url}`);

    try {
        const baseUrl = new URL(url);
        const scrapedFaqs = [];

        // Step 1: Fetch main page to find collections
        const mainResponse = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $main = cheerio.load(mainResponse.data);
        const collections = [];

        // Find all collection links
        $main('a[href*="/collections/"]').each((i, element) => {
            const href = $main(element).attr('href');
            const title = $main(element).text().trim();

            if (href && title && isTradingRelated(title)) {
                let collectionUrl = href;
                if (!collectionUrl.startsWith('http')) {
                    collectionUrl = baseUrl.origin + collectionUrl;
                }

                if (!collections.find(c => c.url === collectionUrl)) {
                    const cleanTitle = cleanCategoryName(title);
                    collections.push({ url: collectionUrl, title: cleanTitle });
                    console.log(`Found trading collection: ${cleanTitle}`);
                }
            }
        });

        console.log(`Found ${collections.length} trading-related collections`);

        // Step 2: Scrape each collection
        for (const collection of collections) {
            try {
                const collResponse = await axios.get(collection.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                const $coll = cheerio.load(collResponse.data);

                // Extract articles from this collection
                $coll('a[href*="/articles/"]').each((i, element) => {
                    const $element = $coll(element);
                    const question = $element.text().trim();
                    let articleUrl = $element.attr('href') || '';

                    // Construct full URL if relative
                    if (articleUrl && !articleUrl.startsWith('http')) {
                        articleUrl = baseUrl.origin + articleUrl;
                    }

                    if (question && question.length > 5 && !question.includes('http')) {
                        // Avoid duplicates
                        if (!scrapedFaqs.find(f => f.article_url === articleUrl)) {
                            scrapedFaqs.push({
                                question: question,
                                answer: 'Click to read more',
                                category: `${collection.title} - ${question}`,
                                article_url: articleUrl
                            });
                        }
                    }
                });

                console.log(`  ${collection.title}: ${scrapedFaqs.filter(f => f.category === collection.title).length} articles`);

                // Small delay to be respectful
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (err) {
                console.error(`Error scraping collection ${collection.title}:`, err.message);
            }
        }

        console.log(`Total scraped: ${scrapedFaqs.length} trading-related FAQs`);

        // Detect changes
        const changes = await detectChanges(websiteId, scrapedFaqs);

        // Update last scraped timestamp
        await run('UPDATE websites SET last_scraped = CURRENT_TIMESTAMP WHERE id = ?', [websiteId]);

        return {
            success: true,
            faqsFound: scrapedFaqs.length,
            changes: changes
        };

    } catch (error) {
        console.error('Scraping error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Detect changes between scraped data and database
async function detectChanges(websiteId, scrapedFaqs) {
    const changes = {
        added: 0,
        modified: 0,
        deleted: 0
    };

    // Get existing FAQs from database
    const existingFaqs = await query(
        'SELECT * FROM faqs WHERE website_id = ? AND is_active = 1',
        [websiteId]
    );

    const existingMap = new Map();
    existingFaqs.forEach(faq => {
        existingMap.set(faq.question.toLowerCase(), faq);
    });

    const scrapedQuestions = new Set();

    // Check each scraped FAQ
    for (const scraped of scrapedFaqs) {
        const questionLower = scraped.question.toLowerCase();
        scrapedQuestions.add(questionLower);

        const hash = md5(scraped.question + scraped.answer);
        const existing = existingMap.get(questionLower);

        if (!existing) {
            // NEW FAQ
            const result = await run(
                'INSERT INTO faqs (website_id, question, answer, category, hash, article_url) VALUES (?, ?, ?, ?, ?, ?)',
                [websiteId, scraped.question, scraped.answer, scraped.category, hash, scraped.article_url]
            );

            await run(
                'INSERT INTO changes (faq_id, website_id, question, change_type, new_content) VALUES (?, ?, ?, ?, ?)',
                [result.id, websiteId, scraped.question, 'added', scraped.answer]
            );

            changes.added++;
            console.log(`NEW: ${scraped.question}`);

        } else if (existing.hash !== hash) {
            // MODIFIED FAQ
            await run(
                'UPDATE faqs SET answer = ?, hash = ?, article_url = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
                [scraped.answer, hash, scraped.article_url, existing.id]
            );

            await run(
                'INSERT INTO changes (faq_id, website_id, question, change_type, old_content, new_content) VALUES (?, ?, ?, ?, ?, ?)',
                [existing.id, websiteId, scraped.question, 'modified', existing.answer, scraped.answer]
            );

            changes.modified++;
            console.log(`MODIFIED: ${scraped.question}`);

        } else {
            // NO CHANGE - just update last_seen
            await run(
                'UPDATE faqs SET last_seen = CURRENT_TIMESTAMP WHERE id = ?',
                [existing.id]
            );
        }
    }

    // Check for deleted FAQs
    for (const [question, existing] of existingMap) {
        if (!scrapedQuestions.has(question)) {
            // DELETED FAQ
            await run(
                'UPDATE faqs SET is_active = 0 WHERE id = ?',
                [existing.id]
            );

            await run(
                'INSERT INTO changes (faq_id, website_id, question, change_type, old_content) VALUES (?, ?, ?, ?, ?)',
                [existing.id, websiteId, existing.question, 'deleted', existing.answer]
            );

            changes.deleted++;
            console.log(`DELETED: ${existing.question}`);
        }
    }

    return changes;
}

// Scrape all websites
async function scrapeAllWebsites() {
    const websites = await query('SELECT * FROM websites');

    for (const website of websites) {
        console.log(`\nScraping ${website.name}...`);
        const result = await scrapeWebsite(website.id, website.url);
        console.log('Result:', result);
    }
}

module.exports = {
    scrapeWebsite,
    scrapeAllWebsites
};
