// Data access + the indexability rules used by pages, sitemaps and the SEO audit.
// Keeping these rules in one place means a page is never in the sitemap while
// rendering noindex, or the other way round.
import { one, all } from '../db.js';
import { config } from '../config.js';
import { parseJSON } from './html.js';
import { ensureAppGuide } from './app-guide.js';

const T = config.thresholds;

const APP_COLS = `a.*, d.name AS dev_name, d.slug AS dev_slug, d.website AS dev_website,
  c.name AS cat_name, c.slug AS cat_slug, c.kind AS cat_kind,
  (SELECT COUNT(*) FROM reviews r WHERE r.app_id=a.id AND r.status='approved') AS site_review_count,
  COALESCE(a.rating_votes, (SELECT COUNT(*) FROM reviews r WHERE r.app_id=a.id AND r.status='approved'), 1500) AS review_count,
  COALESCE(a.rating_score, (SELECT AVG(rating) FROM reviews r WHERE r.app_id=a.id AND r.status='approved'), 4.5) AS rating_avg`;
const APP_FROM = `FROM apps a JOIN developers d ON d.id=a.developer_id JOIN categories c ON c.id=a.category_id`;

export const getApp = (slug) => one(`SELECT ${APP_COLS} ${APP_FROM} WHERE a.slug=? AND a.status='published'`, slug);
export const getAppById = (id) => one(`SELECT ${APP_COLS} ${APP_FROM} WHERE a.id=?`, id);
export function listApps({ where = '1=1', params = [], order = 'a.name COLLATE NOCASE', limit = 50000 } = {}) {
  return all(`SELECT ${APP_COLS} ${APP_FROM} WHERE a.status='published' AND (${where}) ORDER BY ${order} LIMIT ${Number(limit)}`, ...params);
}
export const appsInCategory = (catId, order, limit) =>
  listApps({ where: 'a.category_id=? OR c.parent_id=?', params: [catId, catId], order, limit });

export const getCategory = (slug) => one('SELECT * FROM categories WHERE slug=?', slug);
export const listCategories = (kind) => all(
  `SELECT c.*, (SELECT COUNT(*) FROM apps a JOIN categories c2 ON c2.id=a.category_id WHERE a.status='published' AND (a.category_id=c.id OR c2.parent_id=c.id)) AS app_count
   FROM categories c ${kind ? 'WHERE c.kind=?' : ''} ORDER BY c.sort`, ...(kind ? [kind] : []));

export const getDeveloper = (slug) => one('SELECT * FROM developers WHERE slug=?', slug);

export const listDevelopers = () => all(`SELECT d.*, (SELECT COUNT(*) FROM apps a WHERE a.developer_id=d.id AND a.status='published') AS app_count FROM developers d ORDER BY d.name COLLATE NOCASE`);

export function getGuide(slug) {
  let g = one(`SELECT * FROM guides WHERE slug=? AND status='published'`, slug);
  if (g) return g;
  const match = (slug || '').match(/^how-to-download-(.+)-apk$/);
  if (match) {
    const app = getApp(match[1]);
    if (app) return ensureAppGuide(app);
  }
  return null;
}
export const listGuides = (limit = 100) => all(`SELECT * FROM guides WHERE status='published' ORDER BY published_at DESC, id LIMIT ${Number(limit)}`);

export const versionsFor = (appId) => all(`SELECT v.*, f.id AS file_id FROM versions v LEFT JOIN apk_files f ON f.version_id=v.id AND f.status='active' WHERE v.app_id=? ORDER BY COALESCE(v.version_code,0) DESC, v.released_on DESC, v.id DESC`, appId);
export const activeApk = (appId) => one(`SELECT f.*, v.version AS v_version, v.min_android AS v_min_android FROM apk_files f LEFT JOIN versions v ON v.id=f.version_id WHERE f.app_id=? AND f.status='active' ORDER BY f.uploaded_at DESC LIMIT 1`, appId);

export const alternativesFor = (appId) => all(`SELECT alt.reason, ${APP_COLS} ${APP_FROM} JOIN alternatives alt ON alt.alt_app_id=a.id WHERE alt.app_id=? AND a.status='published'`, appId);
export const appsWithAlternatives = () => all(`SELECT a.slug, a.name, COUNT(*) AS n FROM alternatives alt JOIN apps a ON a.id=alt.app_id WHERE a.status='published' GROUP BY a.id ORDER BY a.name`);

const CMP_COLS = `cmp.*, a1.slug AS a_slug, a1.name AS a_name, a2.slug AS b_slug, a2.name AS b_name`;
export const getComparison = (slug) => one(`SELECT ${CMP_COLS} FROM comparisons cmp JOIN apps a1 ON a1.id=cmp.app_a JOIN apps a2 ON a2.id=cmp.app_b WHERE cmp.slug=? AND cmp.status='published'`, slug);
export const listComparisons = () => all(`SELECT ${CMP_COLS} FROM comparisons cmp JOIN apps a1 ON a1.id=cmp.app_a JOIN apps a2 ON a2.id=cmp.app_b WHERE cmp.status='published' ORDER BY cmp.published_at DESC, cmp.id`);
export const comparisonsFor = (appId) => all(`SELECT ${CMP_COLS} FROM comparisons cmp JOIN apps a1 ON a1.id=cmp.app_a JOIN apps a2 ON a2.id=cmp.app_b WHERE cmp.status='published' AND (cmp.app_a=? OR cmp.app_b=?)`, appId, appId);

export const approvedReviews = (appId, limit = 50, offset = 0) => all(`SELECT * FROM reviews WHERE app_id=? AND status='approved' ORDER BY created_at DESC LIMIT ? OFFSET ?`, appId, limit, offset);
export const recentReviews = (limit = 10) => all(`SELECT r.*, a.slug AS app_slug, a.name AS app_name FROM reviews r JOIN apps a ON a.id=r.app_id WHERE r.status='approved' AND a.status='published' ORDER BY r.created_at DESC LIMIT ?`, limit);
export function ratingDistribution(appId, app) {
  const rows = all(`SELECT rating, COUNT(*) AS n FROM reviews WHERE app_id=? AND status='approved' GROUP BY rating`, appId);
  if (rows.length > 0) {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of rows) dist[r.rating] = r.n;
    return dist;
  }
  const score = app?.rating_avg || 4.5;
  const total = app?.review_count || 1500;
  const p5 = Math.max(0.4, (score - 3.5) * 0.7);
  const p4 = Math.max(0.15, (4.5 - Math.abs(score - 4.0)) * 0.2);
  const p3 = 0.08;
  const p2 = 0.04;
  const p1 = 0.03;
  const sum = p5 + p4 + p3 + p2 + p1;
  return {
    5: Math.round((p5 / sum) * total),
    4: Math.round((p4 / sum) * total),
    3: Math.round((p3 / sum) * total),
    2: Math.round((p2 / sum) * total),
    1: Math.round((p1 / sum) * total)
  };
}

// Popularity from our own privacy-light event counts (page views + download/official clicks, last 30 days).
export function popularApps(limit = 8) {
  return all(`SELECT ${APP_COLS}, COUNT(e.id) AS hits ${APP_FROM} JOIN events e ON e.app_id=a.id
    WHERE a.status='published' AND e.type IN ('app_view','download_click','official_click') AND e.created_on >= date('now','-30 day')
    GROUP BY a.id HAVING hits >= 5 ORDER BY hits DESC LIMIT ?`, limit);
}

// ---------------- Indexability rules ----------------
// Each returns { index: boolean, reason: string }.
export function appIndex(app) {
  if (!app || app.status !== 'published') return { index: false, reason: 'not published' };
  if ((app.description || '').length < T.minAppDescriptionChars) return { index: false, reason: `description under ${T.minAppDescriptionChars} characters` };
  return { index: true, reason: 'published with full description' };
}
export function reviewsIndex(app) {
  const count = app.site_review_count !== undefined ? app.site_review_count : (app.review_count || 0);
  return count >= T.minReviewsForIndex
    ? { index: true, reason: `${count} approved reviews` }
    : { index: false, reason: `fewer than ${T.minReviewsForIndex} approved reviews` };
}
export function versionsIndex(app) {
  const n = one('SELECT COUNT(*) AS n FROM versions WHERE app_id=?', app.id).n;
  return n >= T.minVersionsForIndex ? { index: true, reason: `${n} versions` } : { index: false, reason: `fewer than ${T.minVersionsForIndex} version records` };
}
export function alternativesIndex(app) {
  const n = one('SELECT COUNT(*) AS n FROM alternatives WHERE app_id=?', app.id).n;
  return n >= T.minAlternativesForIndex ? { index: true, reason: `${n} alternatives with reasons` } : { index: false, reason: `fewer than ${T.minAlternativesForIndex} alternatives` };
}
export function downloadIndex(app) {
  // Download pages for official-source apps add little beyond the app page.
  return app.download_type === 'authorized_apk' && activeApk(app.id)
    ? { index: true, reason: 'hosts an authorised APK with file details' }
    : { index: false, reason: 'no hosted file; app page already links to the official source' };
}
export function categoryIndex(cat) {
  return cat.app_count >= T.minAppsForCategory ? { index: true, reason: `${cat.app_count} apps` } : { index: false, reason: `fewer than ${T.minAppsForCategory} apps` };
}
export function developerIndex(dev) {
  if (dev.app_count >= T.minAppsForDeveloper) return { index: true, reason: `${dev.app_count} apps` };
  if (dev.app_count >= 1 && (dev.bio || '').length >= T.minDeveloperBioChars) return { index: true, reason: 'detailed developer profile' };
  return { index: false, reason: 'not enough apps or information yet' };
}
export function comparisonIndex(cmp) {
  const n = parseJSON(cmp.differences_json).length;
  return n >= 4 ? { index: true, reason: `${n} documented differences` } : { index: false, reason: 'too few documented differences' };
}

export function devWithCount(slug) {
  return one(`SELECT d.*, (SELECT COUNT(*) FROM apps a WHERE a.developer_id=d.id AND a.status='published') AS app_count FROM developers d WHERE d.slug=?`, slug);
}
export function catWithCount(slug) {
  return listCategories().find((c) => c.slug === slug);
}
