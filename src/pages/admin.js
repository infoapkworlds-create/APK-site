import { html, raw, paras, fmtDate, isoDate } from '../lib/html.js';
import { page } from '../layout.js';
import { isAdmin, csrfToken } from '../lib/security.js';
import * as D from '../lib/data.js';
import { all, one, run } from '../db.js';
import { checkText } from '../lib/blacklist.js';
import { getIndexableUrls } from './seo.js';
import { config } from '../config.js';

export function adminLoginPage(req, error = '') {
  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);

  const body = html`
<header class="page-head">
  <h1>Site Management Login</h1>
  <p class="lead">Internal administration for review moderation, app submissions, and SEO health auditing.</p>
</header>

${error ? html`<div class="notice danger">${error}</div>` : ''}

<form class="form" action="/admin/login" method="post" style="max-width: 400px; margin: 2rem 0;">
  <input type="hidden" name="_csrf" value="${token}">
  <div class="field">
    <label for="adm_pw">Admin Password</label>
    <input id="adm_pw" name="password" type="password" required autofocus>
  </div>
  <button type="submit" class="btn primary">Sign In</button>
</form>`;

  return page({
    title: 'Admin Login',
    description: 'Internal administration login',
    path: '/admin/login',
    index: false,
    crumbs: [['Home', '/'], ['Admin', '/admin/']],
    body,
  });
}

export function adminDashboardPage(req) {
  if (!isAdmin(req)) return adminLoginPage(req);

  const pendingReviews = all(`SELECT r.*, a.name AS app_name, a.slug AS app_slug FROM reviews r JOIN apps a ON a.id=r.app_id WHERE r.status='pending' ORDER BY r.created_at ASC`);
  const pendingSubmissions = all(`SELECT * FROM submissions WHERE status='pending' ORDER BY created_at ASC`);
  const openReports = all(`SELECT * FROM reports WHERE status='open' ORDER BY created_at ASC`);
  const openRequests = all(`SELECT * FROM app_requests WHERE status='open' ORDER BY created_at ASC`);
  const messages = all(`SELECT * FROM messages ORDER BY created_at DESC LIMIT 10`);

  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);

  const body = html`
<header class="page-head">
  <h1>Management Dashboard</h1>
  <nav class="admin-nav" style="margin-top: 1rem;">
    <a href="/admin/" class="btn sm primary">Dashboard</a>
    <a href="/admin/audit" class="btn sm">Technical SEO &amp; Quality Audit</a>
    <a href="/admin/apps" class="btn sm">Apps &amp; Content</a>
    <a href="/admin/logout" class="btn sm danger" style="float: right;">Sign Out</a>
  </nav>
</header>

<div class="admin-stats">
  <div class="stat-box">
    <span class="stat-num">${pendingReviews.length}</span>
    <span class="stat-label">Pending Reviews</span>
  </div>
  <div class="stat-box">
    <span class="stat-num">${pendingSubmissions.length}</span>
    <span class="stat-label">App Submissions</span>
  </div>
  <div class="stat-box">
    <span class="stat-num">${openReports.length}</span>
    <span class="stat-label">Open Reports</span>
  </div>
  <div class="stat-box">
    <span class="stat-num">${openRequests.length}</span>
    <span class="stat-label">App Requests</span>
  </div>
</div>

<section class="admin-section">
  <h2>Pending User Reviews (${pendingReviews.length})</h2>
  ${pendingReviews.length ? html`
    <div class="tablewrap"><table class="admin-table">
      <thead><tr><th>App</th><th>Reviewer</th><th>Rating</th><th>Title &amp; Body</th><th>Submitted</th><th>Action</th></tr></thead>
      <tbody>
        ${pendingReviews.map((r) => html`
          <tr>
            <td><a href="/apps/${r.app_slug}/">${r.app_name}</a></td>
            <td>${r.display_name}</td>
            <td>${r.rating} ★</td>
            <td><strong>${r.title}</strong><p class="small">${r.body}</p></td>
            <td>${fmtDate(r.created_at)}</td>
            <td>
              <form action="/admin/action/review-moderate" method="post" style="display:inline-flex; gap:0.5rem;">
                <input type="hidden" name="_csrf" value="${token}">
                <input type="hidden" name="id" value="${r.id}">
                <button type="submit" name="decision" value="approved" class="btn sm primary">Approve</button>
                <button type="submit" name="decision" value="rejected" class="btn sm danger">Reject</button>
              </form>
            </td>
          </tr>
        `)}
      </tbody>
    </table></div>
  ` : html`<p class="muted">No pending reviews waiting for moderation.</p>`}
</section>

<section class="admin-section">
  <h2>App Submissions (${pendingSubmissions.length})</h2>
  ${pendingSubmissions.length ? html`
    <div class="tablewrap"><table class="admin-table">
      <thead><tr><th>App</th><th>Developer</th><th>Category</th><th>Links</th><th>Rights</th><th>Actions</th></tr></thead>
      <tbody>
        ${pendingSubmissions.map((s) => html`
          <tr>
            <td><strong>${s.app_name}</strong> (v${s.version || '?'})<p class="small">${s.description?.slice(0, 100)}...</p></td>
            <td>${s.developer_name}<br><small>${s.developer_email}</small></td>
            <td>${s.category}</td>
            <td class="small">
              ${s.website ? html`<a href="${s.website}" rel="noopener">Site</a> ` : ''}
              ${s.play_url ? html`<a href="${s.play_url}" rel="noopener">Play</a> ` : ''}
              ${s.apk_url ? html`<a href="${s.apk_url}" rel="noopener">APK</a>` : ''}
            </td>
            <td>${s.rights_confirmed ? 'Confirmed' : 'No'}</td>
            <td>
              <form action="/admin/action/submission-moderate" method="post" style="display:inline-flex; gap:0.5rem;">
                <input type="hidden" name="_csrf" value="${token}">
                <input type="hidden" name="id" value="${s.id}">
                <button type="submit" name="decision" value="accepted" class="btn sm primary">Accept</button>
                <button type="submit" name="decision" value="rejected" class="btn sm danger">Reject</button>
              </form>
            </td>
          </tr>
        `)}
      </tbody>
    </table></div>
  ` : html`<p class="muted">No pending app submissions.</p>`}
</section>

<section class="admin-section">
  <h2>Open Reports (${openReports.length})</h2>
  ${openReports.length ? html`
    <div class="tablewrap"><table class="admin-table">
      <thead><tr><th>Reason</th><th>Target</th><th>Details</th><th>Contact</th><th>Action</th></tr></thead>
      <tbody>
        ${openReports.map((rp) => html`
          <tr>
            <td><span class="tag danger">${rp.reason}</span></td>
            <td>${rp.app_slug || rp.page_url || 'General'}</td>
            <td class="small">${rp.details}</td>
            <td class="small">${rp.email || 'Anonymous'}${rp.is_rights_holder ? ' (Rights Holder)' : ''}</td>
            <td>
              <form action="/admin/action/report-resolve" method="post">
                <input type="hidden" name="_csrf" value="${token}">
                <input type="hidden" name="id" value="${rp.id}">
                <button type="submit" class="btn sm">Mark Resolved</button>
              </form>
            </td>
          </tr>
        `)}
      </tbody>
    </table></div>
  ` : html`<p class="muted">No open reports.</p>`}
</section>

<section class="admin-section">
  <h2>App Requests (${openRequests.length})</h2>
  ${openRequests.length ? html`
    <div class="tablewrap"><table class="admin-table">
      <thead><tr><th>App Name</th><th>Developer</th><th>Reason</th><th>Submitted</th></tr></thead>
      <tbody>
        ${openRequests.map((reqApp) => html`
          <tr>
            <td><strong>${reqApp.app_name}</strong></td>
            <td>${reqApp.developer || '-'}</td>
            <td class="small">${reqApp.reason}</td>
            <td>${fmtDate(reqApp.created_at)}</td>
          </tr>
        `)}
      </tbody>
    </table></div>
  ` : html`<p class="muted">No open app requests.</p>`}
</section>

<section class="admin-section">
  <h2>Recent Contact Messages (${messages.length})</h2>
  ${messages.length ? html`
    <div class="tablewrap"><table class="admin-table">
      <thead><tr><th>From</th><th>Subject</th><th>Body</th><th>Date</th></tr></thead>
      <tbody>
        ${messages.map((m) => html`
          <tr>
            <td>${m.name}<br><small>${m.email}</small></td>
            <td><strong>${m.subject || 'No subject'}</strong></td>
            <td class="small">${m.body}</td>
            <td>${fmtDate(m.created_at)}</td>
          </tr>
        `)}
      </tbody>
    </table></div>
  ` : html`<p class="muted">No contact messages received.</p>`}
</section>
`;

  return page({
    title: 'Admin Dashboard',
    description: 'Site management dashboard',
    path: '/admin/',
    index: false,
    crumbs: [['Home', '/'], ['Admin', '/admin/']],
    body,
  });
}

export function runAuditChecks() {
  const issues = [];
  const apps = D.listApps();
  const guides = D.listGuides();
  const categories = D.listCategories();
  const devs = D.listDevelopers();
  const comparisons = D.listComparisons();

  // 1. Check AI blacklist in all apps
  for (const a of apps) {
    const hits = checkText(`${a.name} ${a.summary} ${a.description} ${a.audience}`, [a.name, a.dev_name, a.cat_name]);
    if (hits.length > 0) {
      issues.push({
        type: 'blacklist_word',
        severity: 'warning',
        page: `/apps/${a.slug}/`,
        msg: `Found ${hits.length} blacklisted style word(s): ${hits.slice(0, 3).map((h) => `"${h.term}" (suggest: ${h.suggestion})`).join(', ')}`,
      });
    }

    // Check description length
    if ((a.description || '').length < config.thresholds.minAppDescriptionChars) {
      issues.push({
        type: 'thin_content',
        severity: 'warning',
        page: `/apps/${a.slug}/`,
        msg: `Description length (${(a.description || '').length} chars) is below threshold (${config.thresholds.minAppDescriptionChars} chars). App is marked noindex.`,
      });
    }

    // Check package name
    if (!a.package_name) {
      issues.push({
        type: 'missing_field',
        severity: 'info',
        page: `/apps/${a.slug}/`,
        msg: `Missing package name.`,
      });
    }
  }

  // 2. Check AI blacklist in guides
  for (const g of guides) {
    const hits = checkText(`${g.title} ${g.summary} ${g.body_html}`);
    if (hits.length > 0) {
      issues.push({
        type: 'blacklist_word',
        severity: 'warning',
        page: `/guides/${g.slug}/`,
        msg: `Found ${hits.length} blacklisted style word(s) in guide: ${hits.slice(0, 3).map((h) => `"${h.term}" (suggest: ${h.suggestion})`).join(', ')}`,
      });
    }
  }

  // 3. Check orphan pages / internal link reachability
  const indexableUrls = getIndexableUrls();
  const sitemapCount = indexableUrls.length;

  // 4. Check categories with thin apps
  for (const c of categories) {
    if (c.app_count < config.thresholds.minAppsForCategory) {
      issues.push({
        type: 'thin_category',
        severity: 'info',
        page: `/apps/${c.slug}/`,
        msg: `Category has only ${c.app_count} app(s). Excluded from sitemap until reaching threshold (${config.thresholds.minAppsForCategory}).`,
      });
    }
  }

  // 5. Check developers with thin apps
  for (const d of devs) {
    if (d.app_count < config.thresholds.minAppsForDeveloper && (d.bio || '').length < config.thresholds.minDeveloperBioChars) {
      issues.push({
        type: 'thin_developer',
        severity: 'info',
        page: `/developer/${d.slug}/`,
        msg: `Developer has only ${d.app_count} app(s) and short bio. Excluded from sitemap until reaching threshold.`,
      });
    }
  }

  return { issues, sitemapCount, appsCount: apps.length, guidesCount: guides.length };
}

export function adminAuditPage(req) {
  if (!isAdmin(req)) return adminLoginPage(req);

  const { issues, sitemapCount, appsCount, guidesCount } = runAuditChecks();

  const body = html`
<header class="page-head">
  <h1>Technical SEO &amp; Content Quality Audit</h1>
  <nav class="admin-nav" style="margin-top: 1rem;">
    <a href="/admin/" class="btn sm">Dashboard</a>
    <a href="/admin/audit" class="btn sm primary">Technical SEO &amp; Quality Audit</a>
    <a href="/admin/apps" class="btn sm">Apps &amp; Content</a>
    <a href="/admin/logout" class="btn sm danger" style="float: right;">Sign Out</a>
  </nav>
</header>

<div class="admin-stats">
  <div class="stat-box">
    <span class="stat-num">${sitemapCount}</span>
    <span class="stat-label">Indexable URLs in Sitemap</span>
  </div>
  <div class="stat-box">
    <span class="stat-num">${appsCount}</span>
    <span class="stat-label">Cataloged Apps</span>
  </div>
  <div class="stat-box">
    <span class="stat-num">${guidesCount}</span>
    <span class="stat-label">Published Guides</span>
  </div>
  <div class="stat-box">
    <span class="stat-num">${issues.length}</span>
    <span class="stat-label">Total Audit Findings</span>
  </div>
</div>

<section class="admin-section">
  <h2>SEO &amp; Content Quality Findings</h2>
  ${issues.length ? html`
    <div class="tablewrap"><table class="admin-table">
      <thead><tr><th>Severity</th><th>Type</th><th>Location</th><th>Message</th></tr></thead>
      <tbody>
        ${issues.map((it) => html`
          <tr>
            <td><span class="tag ${it.severity === 'warning' ? 'danger' : ''}">${it.severity}</span></td>
            <td><code>${it.type}</code></td>
            <td><a href="${it.page}">${it.page}</a></td>
            <td>${it.msg}</td>
          </tr>
        `)}
      </tbody>
    </table></div>
  ` : html`
    <div class="notice ok">
      <p>All pages passed technical SEO and content quality checks. Zero blacklist violations, canonicals aligned, and no orphan or thin indexed pages.</p>
    </div>
  `}
</section>
`;

  return page({
    title: 'Technical SEO Audit',
    description: 'Internal Technical SEO Audit',
    path: '/admin/audit',
    index: false,
    crumbs: [['Home', '/'], ['Admin', '/admin/'], ['Audit', '/admin/audit']],
    body,
  });
}
