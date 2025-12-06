-- Websites being tracked
CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    last_scraped DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FAQ entries
CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    hash TEXT NOT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (website_id) REFERENCES websites(id)
);

-- Change history
CREATE TABLE IF NOT EXISTS changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faq_id INTEGER,
    website_id INTEGER NOT NULL,
    question TEXT,
    change_type TEXT NOT NULL,
    old_content TEXT,
    new_content TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faq_id) REFERENCES faqs(id),
    FOREIGN KEY (website_id) REFERENCES websites(id)
);

-- Insert FundedNext as default website
INSERT OR IGNORE INTO websites (name, url)
VALUES ('FundedNext', 'https://help.fundednext.com/en/');
