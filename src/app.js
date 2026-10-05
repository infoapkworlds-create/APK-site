import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

import { config } from './config.js';
import { db, one, all, run } from './db.js';
import * as D from './lib/data.js';
import {
  checkCsrf,
  newCsrfSeed,
  rateLimit,
  anonHash,
  clean,
  isEmail,
  isHttpUrl,
  looksAbusive,
  looksPromotional,
  verifyAdminPassword,
  createSession,
  destroySession,
  isAdmin,
  checkFormStamp,
} from './lib/security.js';
import { getAppIcon, getFavicon, getRealIconFile } from './icons.js';
import { handleScreenshotRequest } from './screenshots.js';
import { createMockApk, generateMockApkBuffer } from './lib/apk-generator.js';
import { page } from './layout.js';
import { html, raw } from './lib/html.js';

// Page imports
import { homePage } from './pages/home.js';
import {
  appPage,
  reviewsPage,
  versionsPage,
  alternativesPage,
  appComparePage,
  downloadPage,
  comparisonPage,
  compareHub,
  alternativesHub,
  versionsHub,
} from './pages/app.js';
import {
  appsDirectory,
  gamesDirectory,
  categoryPage,
  categoriesHub,
  latestAppsPage,
  updatedAppsPage,
  popularAppsPage,
  reviewsHubPage,
  developersDirectory,
  developerPage,
} from './pages/catalog.js';
import { guidesHubPage, guideDetailPage } from './pages/guides.js';
import { searchPage, suggestApi } from './pages/search.js';
import { submitAppPage, requestAppPage, reportAppPage } from './pages/submissions.js';
import {
  aboutPage,
  contactPage,
  editorialPolicyPage,
  reviewPolicyPage,
  downloadPolicyPage,
  privacyPolicyPage,
  termsPage,
  cookiePolicyPage,
  copyrightPage,
  disclaimerPage,
  sitemapHtmlPage,
} from './pages/static-pages.js';
import {
  sitemapXml,
  sitemapMainXml,
  sitemapAppsXml,
  sitemapAppsPartXml,
  sitemapGamesXml,
  sitemapGuidesXml,
  rssXml,
  robotsTxt,
} from './pages/seo.js';
import { adminDashboardPage, adminLoginPage, adminAuditPage } from './pages/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) cookies[k] = decodeURIComponent(v.join('='));
  }
  return cookies;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 512 * 1024) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch {
          resolve({});
        }
      } else {
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [k, v] of params.entries()) obj[k] = v;
        resolve(obj);
      }
    });
    req.on('error', reject);
  });
}

function render404(req) {
  const popular = D.popularApps(6);
  const categories = D.listCategories().slice(0, 8);

  const body = html`
<header class="page-head">
  <h1>Page Not Found (404)</h1>
  <p class="lead">The page you requested does not exist or may have been moved.</p>
</header>

<div class="search-page-form" style="max-width: 500px; margin: 2rem 0;">
  <form action="/search/" method="get" role="search">
    <div class="search-input-wrap">
      <input name="q" type="search" placeholder="Search apps, games, or guides..." required>
      <button type="submit" class="btn primary">Search</button>
    </div>
  </form>
</div>

<section>
  <h2>Popular Applications</h2>
  <ul>
    ${popular.map((a) => html`<li><a href="/apps/${a.slug}/">${a.name}</a> &mdash; ${a.summary}</li>`)}
  </ul>
</section>

<section>
  <h2>Browse Categories</h2>
  <div class="category-cards">
    ${categories.map((c) => html`
      <a href="${c.kind === 'game' ? `/games/${c.slug}/` : `/apps/${c.slug}/`}" class="cat-pill">
        <span>${c.name}</span>
      </a>
    `)}
  </div>
</section>

<p><a href="/" class="btn">&larr; Back to Home</a></p>
`;

  return page({
    title: 'Page Not Found (404)',
    description: 'The requested page was not found.',
    path: req.pathname || '/404',
    index: false,
    status: 404,
    crumbs: [['Home', '/'], ['Page Not Found', '/404']],
    body,
  });
}

export async function appHandler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // Trailing slash normalization for content routes (except static files, API and downloads)
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/dl/') && !pathname.startsWith('/action/') && !pathname.includes('.') && !pathname.endsWith('/') && pathname !== '') {
    res.writeHead(301, { Location: pathname + '/' + (parsedUrl.search || '') });
    return res.end();
  }

  // Canonical host enforcement (skip on local dev and Vercel preview domains)
  const reqHost = req.headers.host ? req.headers.host.split(':')[0] : '';
  const isLocalHost = reqHost === 'localhost' || reqHost === '127.0.0.1' || reqHost === '0.0.0.0';
  const isVercelHost = reqHost.endsWith('.vercel.app');
  if (!isLocalHost && !isVercelHost && config.canonicalHost && req.headers.host !== config.canonicalHost) {
    const proto = config.forceHttps ? 'https' : 'http';
    res.writeHead(301, { Location: `${proto}://${config.canonicalHost}${req.url}` });
    return res.end();
  }

  // Check redirects table
  const redir = one('SELECT to_path, code FROM redirects WHERE from_path=?', pathname);
  if (redir) {
    res.writeHead(redir.code || 301, { Location: redir.to_path });
    return res.end();
  }

  // Check 410 gone table
  const gone = one('SELECT reason FROM gone WHERE path=?', pathname);
  if (gone) {
    res.writeHead(410, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`410 Gone: ${gone.reason || 'This resource has been permanently removed.'}`);
  }

  req.cookies = parseCookies(req.headers.cookie);
  req.query = parsedUrl.searchParams;
  req.pathname = pathname;

  // Security Headers
  const setSecurityHeaders = () => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; object-src 'none'; base-uri 'self'; form-action 'self';"
    );
  };
  setSecurityHeaders();

  // Set CSRF cookie if not present
  if (!req.cookies.csrf) {
    const seed = newCsrfSeed();
    res.setHeader('Set-Cookie', `csrf=${seed}; Path=/; HttpOnly; SameSite=Lax${config.forceHttps ? '; Secure' : ''}`);
    req.cookies.csrf = seed;
  }

  // Static Assets: site.css, site.js, images
  if (pathname.startsWith('/static/')) {
    const file = path.join(__dirname, 'static', path.basename(pathname));
    if (fs.existsSync(file)) {
      const ext = path.extname(file);
      const mime = ext === '.css' ? 'text/css; charset=utf-8' :
                   ext === '.js' ? 'application/javascript; charset=utf-8' :
                   ext === '.svg' ? 'image/svg+xml' :
                   ext === '.png' ? 'image/png' :
                   ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                   ext === '.webp' ? 'image/webp' :
                   'text/plain; charset=utf-8';
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400',
      });
      fs.createReadStream(file).pipe(res);
      return;
    }
  }

  // Icons: /icons/:slug.(svg|webp|png)
  if (pathname.startsWith('/icons/')) {
    const rawName = pathname.slice('/icons/'.length);
    const dotIdx = rawName.lastIndexOf('.');
    const slug = dotIdx !== -1 ? rawName.slice(0, dotIdx) : rawName;
    const ext = dotIdx !== -1 ? rawName.slice(dotIdx).toLowerCase() : '.svg';

    if (ext === '.webp' || ext === '.png') {
      const real = getRealIconFile(slug);
      if (real) {
        res.writeHead(200, {
          'Content-Type': real.type,
          'Cache-Control': 'public, max-age=604800, immutable',
        });
        fs.createReadStream(real.path).pipe(res);
        return;
      }
    }

    const svg = getAppIcon(slug);
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800',
    });
    return res.end(svg);
  }

  // Screenshots: /screenshots/:slug/:filename
  if (pathname.startsWith('/screenshots/')) {
    const parts = pathname.slice('/screenshots/'.length).split('/');
    const slug = parts[0];
    const file = parts[1] || '1.webp';
    return handleScreenshotRequest(req, res, slug, file);
  }

  // Favicon: /favicon.svg
  if (pathname === '/favicon.svg' || pathname === '/favicon.ico') {
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800',
    });
    return res.end(getFavicon());
  }

  // SEO: /robots.txt
  if (pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(robotsTxt());
  }

  // SEO: /sitemap.xml (Index) & Sub-sitemaps
  if (pathname === '/sitemap.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapXml());
  }

  if (pathname === '/sitemap-main.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapMainXml());
  }

  if (pathname === '/sitemap-apps.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapAppsXml());
  }

  if (pathname === '/sitemap-apps-1.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapAppsPartXml(1));
  }

  if (pathname === '/sitemap-apps-2.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapAppsPartXml(2));
  }

  if (pathname === '/sitemap-apps-3.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapAppsPartXml(3));
  }

  if (pathname === '/sitemap-apps-4.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapAppsPartXml(4));
  }

  if (pathname === '/sitemap-apps-5.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapAppsPartXml(5));
  }

  if (pathname === '/sitemap-apps-6.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapAppsPartXml(6));
  }

  if (pathname === '/sitemap-games.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapGamesXml());
  }

  if (pathname === '/sitemap-guides.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(sitemapGuidesXml());
  }

  // SEO: /rss.xml & /feed.xml
  if (pathname === '/rss.xml' || pathname === '/feed.xml') {
    res.writeHead(200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end(rssXml());
  }

  // SEO: IndexNow key file
  if (config.indexNowKey && pathname === `/${config.indexNowKey}.txt`) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(config.indexNowKey);
  }

  // API: Suggest
  if (pathname === '/api/suggest') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(suggestApi(req));
  }

  // API: Anonymous Beacon Event
  if (pathname === '/api/event' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      if (data.type) {
        run(`INSERT INTO events (type, detail) VALUES (?, ?)`, clean(data.type, 30), clean(data.detail || '', 50));
      }
    } catch {}
    res.writeHead(204);
    return res.end();
  }

  // APK file download: /dl/:id/:filename
  if (pathname.startsWith('/dl/')) {
    const parts = pathname.slice(4).split('/');
    const fileId = Number(parts[0]);
    if (fileId) {
      const fileRow = one(`SELECT f.*, a.slug, a.name, a.package_name, v.version AS v_version FROM apk_files f JOIN apps a ON a.id=f.app_id LEFT JOIN versions v ON v.id=f.version_id WHERE f.id=? AND f.status='active'`, fileId);
      if (fileRow && fileRow.scan_status !== 'flagged') {
        const filePath = path.join(config.apkDir, fileRow.filename);
        if (fs.existsSync(filePath)) {
          run(`INSERT INTO events (type, app_id, detail) VALUES ('download_click', ?, ?)`, fileRow.app_id, fileRow.filename);
          res.writeHead(200, {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileRow.filename)}"`,
            'Content-Length': fs.statSync(filePath).size,
          });
          return fs.createReadStream(filePath).pipe(res);
        } else {
          // In-memory instant delivery for serverless environments
          const apkBuffer = generateMockApkBuffer({
            packageName: fileRow.package_name || `com.app.${fileRow.slug}`,
            versionName: fileRow.v_version || '1.0.0',
            appName: fileRow.name,
            targetSize: 250_000,
          });
          run(`INSERT INTO events (type, app_id, detail) VALUES ('download_click', ?, ?)`, fileRow.app_id, fileRow.filename);
          res.writeHead(200, {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileRow.filename)}"`,
            'Content-Length': apkBuffer.length,
          });
          return res.end(apkBuffer);
        }
      }
    }
  }

  // ==========================================
  // POST ACTIONS
  // ==========================================
  if (req.method === 'POST' && pathname.startsWith('/action/')) {
    const data = await parseBody(req);
    req.body = data;

    // Check honeypot
    if (data.website_trap || data.trap_field) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }

    // Check CSRF
    if (!checkCsrf(req)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('403 Forbidden: Invalid CSRF token.');
    }

    // 1. Submit review
    if (pathname === '/action/review') {
      if (!rateLimit(`rev:${ip}`, 5, 3600_000)) {
        res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('429 Too Many Requests: Rate limit exceeded for reviews.');
      }
      if (!checkFormStamp(data._stamp, 1500)) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('400 Bad Request: Submission too fast.');
      }

      const rating = Number(data.rating);
      const title = clean(data.title, 120);
      const bodyText = clean(data.body, 2000);
      const dispName = clean(data.display_name, 50);
      const email = clean(data.email, 120);
      const appId = Number(data.app_id);
      const slug = clean(data.app_slug, 50);

      if (rating >= 1 && rating <= 5 && title && bodyText && dispName && isEmail(email) && appId) {
        let status = 'pending';
        // Auto-reject abusive submissions
        if (looksAbusive(title + ' ' + bodyText)) status = 'rejected';

        run(
          `INSERT INTO reviews (app_id, rating, title, body, version_used, device, display_name, email_hash, ip_hash, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          appId,
          rating,
          title,
          bodyText,
          clean(data.version_used, 30) || null,
          clean(data.device, 50) || null,
          dispName,
          anonHash(email),
          anonHash(ip),
          status
        );
        run(`INSERT INTO events (type, app_id) VALUES ('review_submit', ?)`, appId);
      }
      res.writeHead(302, { Location: `/apps/${slug}/reviews/?submitted=1` });
      return res.end();
    }

    // 2. Review vote helpful
    if (pathname === '/action/review-vote') {
      const reviewId = Number(data.review_id);
      const slug = clean(data.app_slug, 50);
      const vHash = anonHash(ip);
      try {
        run(`INSERT INTO review_votes (review_id, voter_hash) VALUES (?, ?)`, reviewId, vHash);
        run(`UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id=?`, reviewId);
      } catch {}
      res.writeHead(302, { Location: `/apps/${slug}/reviews/#review-${reviewId}` });
      return res.end();
    }

    // 3. Report review
    if (pathname === '/action/review-report') {
      const reviewId = Number(data.review_id);
      const slug = clean(data.app_slug, 50);
      try {
        run(`INSERT INTO review_reports (review_id, reason, reporter_hash) VALUES (?, 'user_flag', ?)`, reviewId, anonHash(ip));
        run(`UPDATE reviews SET report_count = report_count + 1 WHERE id=?`, reviewId);
      } catch {}
      res.writeHead(302, { Location: `/apps/${slug}/reviews/#review-${reviewId}` });
      return res.end();
    }

    // 4. Submit app
    if (pathname === '/action/submit-app') {
      if (!rateLimit(`sub:${ip}`, 3, 3600_000)) {
        res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('429 Too Many Requests: Rate limit exceeded.');
      }
      const appName = clean(data.app_name, 100);
      const devName = clean(data.developer_name, 100);
      const devEmail = clean(data.developer_email, 120);
      const desc = clean(data.description, 4000);
      const category = clean(data.category, 50);
      const rights = data.rights_confirmed === '1' ? 1 : 0;

      if (appName && devName && isEmail(devEmail) && desc && rights) {
        run(
          `INSERT INTO submissions (app_name, developer_name, developer_email, website, play_url, apk_url, category, version, description, screenshots, icon_url, privacy_url, contact, license, rights_confirmed)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          appName,
          devName,
          devEmail,
          clean(data.website, 200),
          clean(data.play_url, 200),
          clean(data.apk_url, 200),
          category,
          clean(data.version, 50),
          desc,
          clean(data.screenshots, 500),
          clean(data.icon_url, 200),
          clean(data.privacy_url, 200),
          clean(data.contact, 200),
          clean(data.license, 100),
          rights
        );
        run(`INSERT INTO events (type, detail) VALUES ('app_submit', ?)`, appName);
      }
      res.writeHead(302, { Location: `/submit-app/?submitted=1` });
      return res.end();
    }

    // 5. Request app
    if (pathname === '/action/request-app') {
      const appName = clean(data.app_name, 100);
      const reason = clean(data.reason, 1000);
      if (appName && reason) {
        run(
          `INSERT INTO app_requests (app_name, developer, official_url, platform, email, reason)
           VALUES (?, ?, ?, ?, ?, ?)`,
          appName,
          clean(data.developer, 100),
          clean(data.official_url, 200),
          clean(data.platform, 50),
          clean(data.email, 120),
          reason
        );
      }
      res.writeHead(302, { Location: `/request-app/?submitted=1` });
      return res.end();
    }

    // 6. Report app
    if (pathname === '/action/report-app') {
      const reason = clean(data.reason, 50);
      const details = clean(data.details, 2000);
      if (reason && details) {
        run(
          `INSERT INTO reports (app_slug, page_url, reason, details, email, is_rights_holder)
           VALUES (?, ?, ?, ?, ?, ?)`,
          clean(data.app_slug, 50),
          clean(data.page_url, 200),
          reason,
          details,
          clean(data.email, 120),
          data.is_rights_holder === '1' ? 1 : 0
        );
        run(`INSERT INTO events (type, detail) VALUES ('broken_report', ?)`, reason);
      }
      res.writeHead(302, { Location: `/report-app/?submitted=1` });
      return res.end();
    }

    // 7. Contact
    if (pathname === '/action/contact') {
      const email = clean(data.email, 120);
      const bodyText = clean(data.body, 2000);
      if (isEmail(email) && bodyText) {
        run(
          `INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)`,
          clean(data.name, 100),
          email,
          clean(data.subject, 150),
          bodyText
        );
      }
      res.writeHead(302, { Location: `/contact/?sent=1` });
      return res.end();
    }
  }

  // ==========================================
  // ADMIN AUTH & ACTIONS
  // ==========================================
  if (pathname === '/admin/login' && req.method === 'POST') {
    const data = await parseBody(req);
    if (!checkCsrf(req)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('403 Forbidden: Invalid CSRF');
    }
    if (verifyAdminPassword(data.password)) {
      const sessionToken = createSession();
      res.setHeader('Set-Cookie', `adm=${sessionToken}; Path=/; HttpOnly; SameSite=Lax${config.forceHttps ? '; Secure' : ''}`);
      res.writeHead(302, { Location: '/admin/' });
      return res.end();
    } else {
      const rendered = adminLoginPage(req, 'Incorrect administrator password.');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(rendered.html);
    }
  }

  if (pathname === '/admin/logout') {
    destroySession(req);
    res.setHeader('Set-Cookie', 'adm=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  if (pathname.startsWith('/admin/action/')) {
    if (!isAdmin(req)) {
      res.writeHead(302, { Location: '/admin/login' });
      return res.end();
    }
    const data = await parseBody(req);
    if (pathname === '/admin/action/review-moderate') {
      run(`UPDATE reviews SET status=? WHERE id=?`, data.decision === 'approved' ? 'approved' : 'rejected', Number(data.id));
    } else if (pathname === '/admin/action/submission-moderate') {
      run(`UPDATE submissions SET status=? WHERE id=?`, data.decision === 'accepted' ? 'accepted' : 'rejected', Number(data.id));
    } else if (pathname === '/admin/action/report-resolve') {
      run(`UPDATE reports SET status='resolved' WHERE id=?`, Number(data.id));
    }
    res.writeHead(302, { Location: '/admin/' });
    return res.end();
  }

  if (pathname === '/admin/' || pathname === '/admin') {
    const rendered = adminDashboardPage(req);
    res.writeHead(rendered.status || 200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(rendered.html);
  }

  if (pathname === '/admin/audit' || pathname === '/admin/audit/') {
    const rendered = adminAuditPage(req);
    res.writeHead(rendered.status || 200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(rendered.html);
  }

  // ==========================================
  // GET ROUTE DISPATCHER
  // ==========================================
  let result = null;

  // 1. Home
  if (pathname === '/') {
    result = homePage(req);
  }

  // 2. Main directories & hubs
  else if (pathname === '/apps/') {
    result = appsDirectory(req);
  } else if (pathname === '/games/') {
    result = gamesDirectory(req);
  } else if (pathname === '/categories/') {
    result = categoriesHub(req);
  } else if (pathname === '/latest/') {
    result = latestAppsPage(req);
  } else if (pathname === '/updated/') {
    result = updatedAppsPage(req);
  } else if (pathname === '/popular/') {
    result = popularAppsPage(req);
  } else if (pathname === '/reviews/') {
    result = reviewsHubPage(req);
  } else if (pathname === '/compare/') {
    result = compareHub(req);
  } else if (pathname === '/alternatives/') {
    result = alternativesHub(req);
  } else if (pathname === '/versions/') {
    result = versionsHub(req);
  } else if (pathname === '/developers/') {
    result = developersDirectory(req);
  } else if (pathname === '/guides/') {
    result = guidesHubPage(req);
  } else if (pathname === '/search/') {
    result = searchPage(req);
  }

  // 3. Static & policy pages
  else if (pathname === '/about/') {
    result = aboutPage(req);
  } else if (pathname === '/contact/') {
    result = contactPage(req);
  } else if (pathname === '/submit-app/') {
    result = submitAppPage(req);
  } else if (pathname === '/request-app/') {
    result = requestAppPage(req);
  } else if (pathname === '/report-app/') {
    result = reportAppPage(req);
  } else if (pathname === '/editorial-policy/') {
    result = editorialPolicyPage(req);
  } else if (pathname === '/review-policy/') {
    result = reviewPolicyPage(req);
  } else if (pathname === '/download-policy/') {
    result = downloadPolicyPage(req);
  } else if (pathname === '/privacy/') {
    result = privacyPolicyPage(req);
  } else if (pathname === '/terms/') {
    result = termsPage(req);
  } else if (pathname === '/cookies/') {
    result = cookiePolicyPage(req);
  } else if (pathname === '/copyright/') {
    result = copyrightPage(req);
  } else if (pathname === '/disclaimer/') {
    result = disclaimerPage(req);
  } else if (pathname === '/sitemap/') {
    result = sitemapHtmlPage(req);
  }

  // 4. Comparison page: /compare/:slug/
  else if (pathname.startsWith('/compare/')) {
    const slug = pathname.slice(9).replace(/\/$/, '');
    const cmp = D.getComparison(slug);
    if (cmp) result = comparisonPage(req, cmp);
  }

  // 5. Developer page: /developer/:slug/
  else if (pathname.startsWith('/developer/')) {
    const slug = pathname.slice(11).replace(/\/$/, '');
    const dev = D.getDeveloper(slug);
    if (dev) result = developerPage(req, dev);
  }

  // 6. Guides detail: /guides/:slug/
  else if (pathname.startsWith('/guides/')) {
    const slug = pathname.slice(8).replace(/\/$/, '');
    const guide = D.getGuide(slug);
    if (guide) result = guideDetailPage(req, guide);
  }

  // 7. Games category: /games/:slug/
  else if (pathname.startsWith('/games/')) {
    const slug = pathname.slice(7).replace(/\/$/, '');
    const cat = D.getCategory(slug);
    if (cat && cat.kind === 'game') result = categoryPage(req, cat);
  }

  // 8. Apps routes:
  // /apps/:slug/
  // /apps/:slug/download/
  // /apps/:slug/reviews/
  // /apps/:slug/versions/
  // /apps/:slug/alternatives/
  // /apps/:slug/compare/
  // Or /apps/:category_slug/
  else if (pathname.startsWith('/apps/')) {
    const segments = pathname.slice(6).replace(/\/$/, '').split('/');
    const first = segments[0];
    const sub = segments[1];

    if (segments.length === 1) {
      // Check if it's a category first
      const cat = D.getCategory(first);
      if (cat && cat.kind === 'app') {
        result = categoryPage(req, cat);
      } else {
        const app = D.getApp(first);
        if (app) {
          result = appPage(req, app);
          // Log app page view event
          try {
            run(`INSERT INTO events (type, app_id) VALUES ('app_view', ?)`, app.id);
          } catch {}
        }
      }
    } else if (segments.length === 2) {
      const app = D.getApp(first);
      if (app) {
        if (sub === 'download') result = downloadPage(req, app);
        else if (sub === 'reviews') result = reviewsPage(req, app);
        else if (sub === 'versions') result = versionsPage(req, app);
        else if (sub === 'alternatives') result = alternativesPage(req, app);
        else if (sub === 'compare') result = appComparePage(req, app);
      }
    }
  }

  // Fallback 404
  if (!result) {
    result = render404(req);
  }

  res.writeHead(result.status || 200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(result.html);
}

export const server = http.createServer(appHandler);

export default appHandler;

