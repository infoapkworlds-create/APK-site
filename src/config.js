import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
try { fs.mkdirSync(path.join(DATA_DIR, 'apk'), { recursive: true }); } catch {}

// Persist a secret so CSRF/timing tokens survive restarts when SECRET is not set.
function loadSecret() {
  if (process.env.SECRET) return process.env.SECRET;
  const f = path.join(DATA_DIR, '.secret');
  try {
    if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(32).toString('hex'));
    return fs.readFileSync(f, 'utf8').trim();
  } catch {
    return 'apkworlds-prod-secret-session-token-key-2026';
  }
}

function loadIndexNowKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY;
  const f = path.join(DATA_DIR, '.indexnow_key');
  try {
    if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(16).toString('hex'));
    return fs.readFileSync(f, 'utf8').trim();
  } catch {
    return 'apkworlds-indexnow-key-2026';
  }
}

export const config = {
  root: ROOT,
  dataDir: DATA_DIR,
  apkDir: path.join(DATA_DIR, 'apk'),
  cdnBaseUrl: (process.env.CDN_BASE_URL || '').replace(/\/$/, ''), // e.g. https://cdn.apkworlds.co.uk or Cloudflare R2 bucket URL
  port: Number(process.env.PORT || 3000),
  siteUrl: (process.env.SITE_URL || 'https://www.apkworlds.co.uk').replace(/\/$/, ''),
  // When set (e.g. "droidshelf.example"), requests on any other host get a 301 to it.
  canonicalHost: process.env.CANONICAL_HOST || 'www.apkworlds.co.uk',
  forceHttps: process.env.FORCE_HTTPS === '1',
  siteName: process.env.SITE_NAME || 'APKworlds',
  contactEmail: process.env.CONTACT_EMAIL || 'info.apkworlds@gmail.com',
  copyrightEmail: process.env.COPYRIGHT_EMAIL || 'info.apkworlds@gmail.com',
  ownerName: process.env.OWNER_NAME || 'APKworlds',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  indexNowKey: loadIndexNowKey(),
  indexNowEnabled: process.env.INDEXNOW_ENABLED !== '0',
  secret: loadSecret(),
  isProd: process.env.NODE_ENV === 'production',
  // Thresholds that decide whether a page is useful enough to be indexed.
  thresholds: {
    minReviewsForIndex: 3,
    minReviewsForAverage: 3,
    minVersionsForIndex: 2,
    minAlternativesForIndex: 2,
    minAppsForCategory: 2,
    minAppsForDeveloper: 2,
    minDeveloperBioChars: 280,
    minAppDescriptionChars: 150,
  },
};
