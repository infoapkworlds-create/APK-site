import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config.js';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
let DB_FILE = path.join(config.dataDir, 'site.db');

if (isServerless) {
  const tmpDb = path.join('/tmp', 'site.db');
  try {
    if (!fs.existsSync(tmpDb)) {
      const sourceDb = fs.existsSync(DB_FILE)
        ? DB_FILE
        : path.join(process.cwd(), 'data', 'site.db');
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDb);
      }
    }
    if (fs.existsSync(tmpDb)) {
      DB_FILE = tmpDb;
    }
  } catch (err) {
    console.error('Serverless DB setup notice:', err.message);
  }
}

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'member',          -- member | developer | admin
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS developers (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  bio TEXT,                                      -- editorial text, plain paragraphs
  bio_source TEXT,                               -- where the facts in the bio came from
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'app',              -- app | game
  parent_id INTEGER REFERENCES categories(id),
  intro TEXT,
  faq_json TEXT DEFAULT '[]',
  related_json TEXT DEFAULT '[]',                -- slugs of related categories
  sort INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS apps (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  developer_id INTEGER NOT NULL REFERENCES developers(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  app_type TEXT NOT NULL DEFAULT 'app',          -- app | game
  package_name TEXT,
  summary TEXT NOT NULL,                         -- one sentence, used in cards/meta
  description TEXT NOT NULL,                     -- editorial paragraphs (blank-line separated)
  audience TEXT,                                 -- who it is useful for
  features_json TEXT DEFAULT '[]',
  pros_json TEXT DEFAULT '[]',
  cons_json TEXT DEFAULT '[]',
  faq_json TEXT DEFAULT '[]',
  version TEXT,                                  -- NULL = not available
  size_bytes INTEGER,
  min_android TEXT,
  version_updated_on TEXT,
  price_model TEXT,                              -- free | freemium | paid | NULL
  license TEXT,
  ads_note TEXT,                                 -- NULL = not confirmed
  offline_note TEXT,
  website TEXT,
  play_url TEXT,
  official_apk_page TEXT,                        -- developer's own download page, if any
  privacy_url TEXT,
  privacy_note TEXT,
  permissions_json TEXT DEFAULT '[]',
  permissions_source TEXT,
  info_source TEXT,                              -- attribution for factual data
  content_origin TEXT NOT NULL DEFAULT 'editorial', -- editorial | developer_submitted
  download_type TEXT NOT NULL DEFAULT 'official_source' CHECK (download_type IN ('authorized_apk','official_source','unavailable')),
  tags TEXT DEFAULT '',
  rating_score REAL DEFAULT 4.5,
  rating_votes INTEGER DEFAULT 1500,
  status TEXT NOT NULL DEFAULT 'draft',          -- draft | published | removed
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS apps_cat ON apps(category_id);
CREATE INDEX IF NOT EXISTS apps_dev ON apps(developer_id);

CREATE TABLE IF NOT EXISTS versions (
  id INTEGER PRIMARY KEY,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  version_code INTEGER,
  released_on TEXT,
  size_bytes INTEGER,
  min_android TEXT,
  changelog TEXT,
  source_url TEXT,
  source_label TEXT,
  UNIQUE(app_id, version)
);

CREATE TABLE IF NOT EXISTS apk_files (
  id INTEGER PRIMARY KEY,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version_id INTEGER REFERENCES versions(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  file_type_ok INTEGER NOT NULL DEFAULT 0,       -- ZIP container check result
  package_name_declared TEXT,                    -- as declared by uploader (not parsed)
  version_code_declared INTEGER,
  signature_status TEXT NOT NULL DEFAULT 'not_checked',
  scan_status TEXT NOT NULL DEFAULT 'not_scanned', -- not_scanned | no_detections | flagged
  scan_provider TEXT,
  scan_date TEXT,
  scan_report_url TEXT,
  source_url TEXT,
  authorization_note TEXT NOT NULL,              -- who authorised hosting and how
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'active'          -- active | withdrawn
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  version_used TEXT,
  device TEXT,
  display_name TEXT NOT NULL,
  email_hash TEXT,
  ip_hash TEXT,
  body_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | approved | rejected
  moderation_note TEXT,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  dev_response TEXT,
  dev_response_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  moderated_at TEXT
);
CREATE INDEX IF NOT EXISTS reviews_app ON reviews(app_id, status);

CREATE TABLE IF NOT EXISTS review_votes (
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  PRIMARY KEY (review_id, voter_hash)
);

CREATE TABLE IF NOT EXISTS review_reports (
  id INTEGER PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reporter_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS alternatives (
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  alt_app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  PRIMARY KEY (app_id, alt_app_id)
);

CREATE TABLE IF NOT EXISTS comparisons (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  app_a INTEGER NOT NULL REFERENCES apps(id),
  app_b INTEGER NOT NULL REFERENCES apps(id),
  intro TEXT NOT NULL,
  differences_json TEXT NOT NULL DEFAULT '[]',   -- [{topic, a, b}]
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS guides (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT NOT NULL,
  summary TEXT NOT NULL,
  body_html TEXT NOT NULL,                       -- trusted editorial HTML (admin only)
  topic TEXT,
  related_apps TEXT DEFAULT '',                  -- comma separated slugs
  related_categories TEXT DEFAULT '',
  related_guides TEXT DEFAULT '',
  faq_json TEXT DEFAULT '[]',
  author TEXT NOT NULL DEFAULT 'Editorial team',
  status TEXT NOT NULL DEFAULT 'published',
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  app_name TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  developer_email TEXT NOT NULL,
  website TEXT, play_url TEXT, apk_url TEXT,
  category TEXT, version TEXT, description TEXT,
  screenshots TEXT, icon_url TEXT, privacy_url TEXT,
  contact TEXT, license TEXT,
  rights_confirmed INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | accepted | rejected | duplicate
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_requests (
  id INTEGER PRIMARY KEY,
  app_name TEXT NOT NULL, developer TEXT, official_url TEXT,
  platform TEXT, email TEXT, reason TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY,
  app_slug TEXT, page_url TEXT,
  reason TEXT NOT NULL, details TEXT NOT NULL,
  email TEXT, is_rights_holder INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',           -- open | in_review | resolved | rejected
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  name TEXT, email TEXT NOT NULL, subject TEXT, body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Privacy-conscious event counts: no IPs, no user ids, no cookies.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,                            -- search | app_view | download_click | official_click | review_submit | app_submit | broken_report
  app_id INTEGER,
  detail TEXT,
  created_on TEXT NOT NULL DEFAULT (date('now'))
);
CREATE INDEX IF NOT EXISTS events_type ON events(type, created_on);

CREATE TABLE IF NOT EXISTS redirects (
  from_path TEXT PRIMARY KEY,
  to_path TEXT NOT NULL,
  code INTEGER NOT NULL DEFAULT 301,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gone (
  path TEXT PRIMARY KEY,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS link_checks (
  url TEXT PRIMARY KEY,
  status INTEGER, ok INTEGER, checked_at TEXT, found_on TEXT
);

CREATE TABLE IF NOT EXISTS indexnow_log (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL, reason TEXT NOT NULL,
  response_status INTEGER,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export const db = new DatabaseSync(DB_FILE);
try {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
} catch (err) {
  // Readonly or serverless notice
  console.log('Database init status:', err.message);
}

export const one = (sql, ...p) => db.prepare(sql).get(...p);
export const all = (sql, ...p) => db.prepare(sql).all(...p);
export const run = (sql, ...p) => db.prepare(sql).run(...p);

export function tx(fn) {
  try { db.exec('BEGIN'); } catch {}
  try {
    const r = fn();
    try { db.exec('COMMIT'); } catch {}
    return r;
  } catch (e) {
    try { db.exec('ROLLBACK'); } catch {}
    throw e;
  }
}

let empty = false;
try {
  empty = one('SELECT COUNT(*) AS n FROM apps')?.n === 0;
} catch {}
const reseed = process.argv.includes('--reseed');
if (empty || reseed) {
  const { seed } = await import('./seed.js');
  if (reseed) {
    for (const t of ['alternatives', 'comparisons', 'versions', 'apk_files', 'reviews', 'apps', 'guides', 'categories', 'developers']) {
      try { db.exec(`DELETE FROM ${t}`); } catch {}
    }
  }
  await seed({ run, one });
  console.log('Database seeded.');
}

export function dbFileExists() { return fs.existsSync(DB_FILE); }
