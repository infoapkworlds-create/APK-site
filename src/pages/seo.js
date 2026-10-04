import { config } from '../config.js';
import * as D from '../lib/data.js';
import { run, all } from '../db.js';

export function getIndexableUrls() {
  const base = config.siteUrl;
  const urls = [];

  // Query actual latest dates across main segments for natural hub timestamps
  const latestAppDateRow = all(`SELECT MAX(updated_at) as latest_upd, MAX(published_at) as latest_pub FROM apps WHERE status='published'`)[0];
  const latestAppDate = (latestAppDateRow?.latest_upd || '2026-10-02').slice(0, 10);
  const latestGuideDateRow = all(`SELECT MAX(COALESCE(updated_at, published_at)) as latest FROM guides WHERE status='published'`)[0];
  const latestGuideDate = (latestGuideDateRow?.latest || '2026-09-28').slice(0, 10);
  const latestReviewDateRow = all(`SELECT MAX(created_at) as latest FROM reviews WHERE status='approved'`)[0];
  const latestReviewDate = (latestReviewDateRow?.latest || '2026-09-25').slice(0, 10);
  const latestGameDateRow = all(`SELECT MAX(a.updated_at) as latest FROM apps a JOIN categories c ON c.id=a.category_id WHERE a.status='published' AND (a.app_type='game' OR c.kind='game')`)[0];
  const latestGameDate = (latestGameDateRow?.latest || '2026-10-01').slice(0, 10);

  const add = (path, lastmod, priority = '0.7', changefreq = 'weekly') => {
    urls.push({
      loc: base + path,
      lastmod: lastmod ? String(lastmod).slice(0, 10) : latestAppDate,
      priority,
      changefreq,
    });
  };

  // 1. Dynamic hubs with high crawl priority
  add('/', latestAppDate, '1.0', 'daily');
  add('/apps/', latestAppDate, '0.9', 'daily');
  add('/games/', latestGameDate, '0.9', 'daily');
  add('/categories/', '2026-09-28', '0.8', 'weekly');
  add('/latest/', latestAppDate, '0.9', 'daily');
  add('/updated/', latestAppDate, '0.9', 'daily');
  add('/popular/', '2026-10-02', '0.9', 'daily');
  add('/reviews/', latestReviewDate, '0.8', 'weekly');
  add('/guides/', latestGuideDate, '0.9', 'weekly');
  add('/developers/', '2026-09-30', '0.8', 'weekly');
  add('/compare/', '2026-09-20', '0.8', 'weekly');
  add('/alternatives/', '2026-09-20', '0.8', 'weekly');
  add('/sitemap/', '2026-10-02', '0.5', 'weekly');

  // 2. Static governance & policy pages (established late 2025, refreshed August 2026)
  add('/about/', '2026-08-25', '0.5', 'monthly');
  add('/contact/', '2026-08-25', '0.5', 'monthly');
  add('/editorial-policy/', '2026-08-15', '0.4', 'monthly');
  add('/review-policy/', '2026-08-15', '0.4', 'monthly');
  add('/download-policy/', '2026-08-18', '0.4', 'monthly');
  add('/privacy/', '2026-08-18', '0.4', 'monthly');
  add('/terms/', '2026-08-18', '0.4', 'monthly');
  add('/cookies/', '2026-08-18', '0.4', 'monthly');
  add('/copyright/', '2026-08-20', '0.4', 'monthly');
  add('/disclaimer/', '2026-08-20', '0.4', 'monthly');

  // 3. Categories (dynamic per-category lastmod based on max app update inside it)
  const catLastMods = new Map(all(`
    SELECT c.id, MAX(COALESCE(a.updated_at, a.published_at)) AS latest
    FROM categories c
    LEFT JOIN apps a ON (a.category_id = c.id OR a.category_id IN (SELECT id FROM categories WHERE parent_id = c.id)) AND a.status = 'published'
    GROUP BY c.id
  `).map(r => [r.id, r.latest]));

  for (const c of D.listCategories()) {
    if (D.categoryIndex(c).index) {
      const catMod = catLastMods.get(c.id) || '2026-09-10';
      add(c.kind === 'game' ? `/games/${c.slug}/` : `/apps/${c.slug}/`, catMod, '0.8', 'weekly');
    }
  }

  // 4. Developers
  for (const d of D.listDevelopers()) {
    if (D.developerIndex(d).index) {
      add(`/developer/${d.slug}/`, d.updated_at || d.created_at, '0.7', 'weekly');
    }
  }

  // 5. Guides
  for (const g of D.listGuides(25000)) {
    add(`/guides/${g.slug}/`, g.updated_at || g.published_at, '0.8', 'weekly');
  }

  // 6. Comparisons
  for (const cmp of D.listComparisons()) {
    if (D.comparisonIndex(cmp).index) {
      add(`/compare/${cmp.slug}/`, cmp.updated_at || cmp.published_at, '0.7', 'monthly');
    }
  }

  // 7. Apps & Subpages (optimized with bulk maps for high-performance generation)
  const T = config.thresholds;
  const versionCounts = new Map(all(`SELECT app_id, COUNT(*) AS n FROM versions GROUP BY app_id`).map(r => [r.app_id, r.n]));
  const altCounts = new Map(all(`SELECT app_id, COUNT(*) AS n FROM alternatives GROUP BY app_id`).map(r => [r.app_id, r.n]));
  const activeApkApps = new Set(all(`SELECT DISTINCT app_id FROM apk_files WHERE status='active'`).map(r => r.app_id));

  for (const app of D.listApps()) {
    const appMod = app.updated_at || app.published_at;
    if (D.appIndex(app).index) {
      add(`/apps/${app.slug}/`, appMod, '0.8', 'weekly');
    }
    if (D.reviewsIndex(app).index) {
      add(`/apps/${app.slug}/reviews/`, appMod, '0.6', 'weekly');
    }
    if ((versionCounts.get(app.id) || 0) >= T.minVersionsForIndex) {
      add(`/apps/${app.slug}/versions/`, app.version_updated_on || appMod, '0.7', 'monthly');
    }
    if ((altCounts.get(app.id) || 0) >= T.minAlternativesForIndex) {
      add(`/apps/${app.slug}/alternatives/`, appMod, '0.6', 'monthly');
    }
    if (app.download_type === 'authorized_apk' && activeApkApps.has(app.id)) {
      add(`/apps/${app.slug}/download/`, appMod, '0.7', 'weekly');
    }
  }

  return urls;
}

export function sitemapXml() {
  const urls = getIndexableUrls();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;
  return xml;
}

export function rssXml() {
  const base = config.siteUrl;
  const recentApps = D.listApps({ order: 'a.updated_at DESC', limit: 30 });
  const recentGuides = D.listGuides(15);

  const items = [];
  for (const a of recentApps) {
    items.push({
      title: `${a.name} APK v${a.version || 'Latest'} - Download for Android`,
      link: `${base}/apps/${a.slug}/`,
      guid: `${base}/apps/${a.slug}/#v${a.version || 'current'}`,
      pubDate: new Date(a.updated_at || a.published_at).toUTCString(),
      description: a.summary || (a.description || '').slice(0, 200),
      category: a.cat_name
    });
  }
  for (const g of recentGuides) {
    items.push({
      title: g.title,
      link: `${base}/guides/${g.slug}/`,
      guid: `${base}/guides/${g.slug}/`,
      pubDate: new Date(g.updated_at || g.published_at).toUTCString(),
      description: g.meta_description || g.summary,
      category: 'Android Guides'
    });
  }

  // Sort by pubDate descending
  items.sort((x, y) => new Date(y.pubDate).getTime() - new Date(x.pubDate).getTime());

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.siteName} - Android APK Downloads &amp; Guides</title>
    <link>${base}/</link>
    <description>Independent Android APK discovery platform with malware-checked packages, verified checksums, and expert sideloading guides.</description>
    <language>en-us</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map(it => `    <item>
      <title><![CDATA[${it.title}]]></title>
      <link>${it.link}</link>
      <guid isPermaLink="false">${it.guid}</guid>
      <pubDate>${it.pubDate}</pubDate>
      <category><![CDATA[${it.category}]]></category>
      <description><![CDATA[${it.description}]]></description>
    </item>`).join('\n')}
  </channel>
</rss>`;
}

export function robotsTxt() {
  return `User-agent: *
Allow: /
Allow: /static/
Allow: /icons/
Allow: /screenshots/
Disallow: /admin/
Disallow: /action/
Disallow: /search/
Disallow: /dl/
Disallow: /api/

Sitemap: ${config.siteUrl}/sitemap.xml
`;
}

export async function notifyIndexNow(urlList, reason = 'publish') {
  if (!config.indexNowEnabled || !config.indexNowKey) return { ok: false, reason: 'IndexNow disabled or key missing' };
  const host = new URL(config.siteUrl).hostname;
  const payload = {
    host,
    key: config.indexNowKey,
    keyLocation: `${config.siteUrl}/${config.indexNowKey}.txt`,
    urlList,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    for (const u of urlList) {
      run(`INSERT INTO indexnow_log (url, reason, response_status) VALUES (?, ?, ?)`, u, reason, res.status);
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    for (const u of urlList) {
      run(`INSERT INTO indexnow_log (url, reason, response_status) VALUES (?, ?, ?)`, u, reason, 0);
    }
    return { ok: false, error: err.message };
  }
}
