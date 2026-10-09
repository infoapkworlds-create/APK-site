import { html, raw, esc, fmtDate, isoDate, fmtBytes } from './lib/html.js';
import { config } from './config.js';

export const abs = (p) => config.siteUrl + p;
const ASSET_V = '3';

export function logoMark(size = 36) {
  return raw(`<svg class="logo-icon" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">
    <defs>
      <linearGradient id="navCyan_${size}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00E5FF"/>
        <stop offset="100%" stop-color="#0088FF"/>
      </linearGradient>
      <linearGradient id="navRed_${size}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF2A4D"/>
        <stop offset="100%" stop-color="#C20A20"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7.5" fill="#0A0E17"/>
    <path d="M 17 8 C 23 9, 27 12, 27 16" fill="none" stroke="#00C8FF" stroke-width="0.8" opacity="0.4" stroke-linecap="round"/>
    <path d="M 18 9 C 23 10, 26 13, 26 16" fill="none" stroke="url(#navRed_${size})" stroke-width="1.2" opacity="0.3" stroke-linecap="round"/>
    <path d="M 6 22.5 L 9.3 10 L 11.7 10 L 15 22.5 L 12.6 22.5 L 12 19.8 L 9 19.8 L 8.4 22.5 Z M 9.5 17.6 L 11.5 17.6 L 10.5 13.2 Z" fill="url(#navCyan_${size})"/>
    <path d="M 14.2 22.5 L 14.2 10 L 18.5 10 C 20.6 10, 22 11.4, 22 13.5 C 22 15.6, 20.6 17, 18.5 17 L 16.5 17 L 16.5 22.5 Z M 16.5 15 L 18.2 15 C 19.3 15, 20 14.4, 20 13.5 C 20 12.6, 19.3 12, 18.2 12 L 16.5 12 Z" fill="url(#navCyan_${size})"/>
    <path d="M 21.2 22.5 L 21.2 10 L 23.5 10 L 23.5 15.3 L 26.6 10 L 29.5 10 L 25.8 15.8 L 29.8 22.5 L 26.9 22.5 L 23.8 17.2 L 23.5 17.8 L 23.5 22.5 Z" fill="url(#navCyan_${size})"/>
    <path d="M 16 7.5 C 10 7.5, 5 10, 5 15 C 5 20.5, 11 26.5, 23 27.5 C 26.5 27.8, 29.5 26.5, 30 25 C 30 24.5, 29.5 24.5, 29 24.8 C 27 25.6, 24 26, 21 25.8 C 10.5 24.8, 6.2 19.2, 6.2 15 C 6.2 11, 10.5 8.5, 16 8.5 Z" fill="#00E5FF"/>
    <path d="M 16.5 8 C 11 8.2, 6.5 11, 6.5 15 C 6.5 19.5, 11.5 25.2, 22 26.3 C 25.5 26.6, 28.5 25.5, 29.5 24.5 C 29 24, 28 24, 26 24.3 C 18 25, 10 21, 8.5 16 C 7.8 13.5, 9 11.5, 11.8 9.5 C 13.2 8.5, 15 8.1, 16.5 8 Z" fill="url(#navRed_${size})"/>
  </svg>`);
}

export function jsonld(obj) {
  // Escape "<" so content can never close the script element.
  return raw(`<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`);
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(href) })),
  };
}

export function breadcrumbs(items) {
  return html`<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([name, href], i) =>
    i === items.length - 1
      ? html`<li><span aria-current="page">${name}</span></li>`
      : html`<li><a href="${href}">${name}</a></li>`)}</ol></nav>`;
}

const NAV = [
  ['/games/', 'Games'], ['/apps/', 'Apps'], ['/guides/', 'Articles & Guides'], ['/latest/', 'Latest'],
  ['/updated/', 'Updated'], ['/popular/', 'Top Charts'], ['/categories/', 'Categories'], ['/developers/', 'Developers'],
];

function header(path) {
  return html`
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap hdr">
    <a class="logo" href="/" aria-label="${config.siteName} home">
      ${logoMark(36)}
      <span class="logo-name"><span class="brand-apk">APK</span><span class="brand-worlds">worlds</span></span>
      <span class="logo-badge">PRO</span>
    </a>
    <form class="hdr-search" action="/search/" method="get" role="search">
      <label class="sr" for="hq">Search apps</label>
      <div class="hdr-search-box">
        <svg class="hdr-search-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input id="hq" name="q" type="search" placeholder="Search Games, Apps, APKs..." autocomplete="off" data-suggest>
        <button type="submit" aria-label="Search" class="hdr-search-btn">Search</button>
      </div>
    </form>
    <div class="hdr-actions">
      <a href="/submit-app/" class="btn-hdr-submit">+ Submit APK</a>
      <details class="menu">
        <summary aria-label="Menu"><span></span><span></span><span></span></summary>
        <nav aria-label="Main menu"><ul>${NAV.map(([h, l]) => html`<li><a href="${h}"${path.startsWith(h) ? raw(' aria-current="page"') : ''}>${l}</a></li>`)}<li><a href="/search/">Search</a></li></ul></nav>
      </details>
    </div>
  </div>
  <nav class="wrap topnav" aria-label="Sections">
    <ul>${NAV.map(([h, l]) => html`<li><a href="${h}"${path.startsWith(h) ? raw(' aria-current="page"') : ''}>${l}</a></li>`)}</ul>
  </nav>
</header>`;
}

function footer() {
  const col = (title, links) => html`<div class="f-col"><h3>${title}</h3><ul>${links.map(([h, l]) => html`<li><a href="${h}">${l}</a></li>`)}</ul></div>`;
  return html`
<footer class="site-footer">
  <div class="wrap f-top">
    <div class="f-brand">
      <div class="f-logo">
        ${logoMark(32)}
        <span class="f-brand-title"><span class="brand-apk">APK</span><span class="brand-worlds">worlds</span></span>
      </div>
      <p class="f-desc">Discover and download safe Android APKs with authentic developer verification, virus scans, and comprehensive guides.</p>
      <div class="f-badge">100% Virus-Free &amp; Verified APKs</div>
    </div>
    <div class="f-links-grid">
      ${col('Top Discoveries', [['/popular/', 'Top Charts'], ['/latest/', 'Latest Apps'], ['/updated/', 'Recently Updated'], ['/games/', 'Android Games'], ['/apps/', 'Android Apps']])}
      ${col('Categories', [['/categories/', 'All Categories'], ['/apps/communication/', 'Communication'], ['/apps/tools/', 'Tools & Utilities'], ['/apps/security/', 'VPN & Security'], ['/apps/productivity/', 'Productivity']])}
      ${col('Articles & How-To', [['/guides/', 'Android Guides'], ['/guides/how-to-install-apk/', 'How to Install APK'], ['/guides/how-to-check-app-permissions/', 'App Permissions'], ['/guides/how-to-update-android-apps/', 'Update APK Files']])}
      ${col('Company & Legal', [['/about/', 'About Us'], ['/editorial-policy/', 'Editorial Policy'], ['/download-policy/', 'Download Policy'], ['/copyright/', 'DMCA & Copyright'], ['/privacy/', 'Privacy Policy'], ['/contact/', 'Contact Support']])}
    </div>
  </div>
  <div class="wrap f-bottom">
    <p>&copy; 2025–${new Date().getFullYear()} ${config.siteName}. All rights reserved. Independent Android application discovery platform.</p>
    <p class="f-disclaimer">${config.siteName} is an independent platform and is not affiliated with Google LLC or Google Play. Android is a trademark of Google LLC.</p>
  </div>
</footer>`;
}

/**
 * Render a full page.
 * @param {object} o
 * @param {string} o.title       - unique <title>
 * @param {string} o.description - unique meta description
 * @param {string} o.path        - canonical path (always the clean URL)
 * @param {boolean} [o.index=true]
 * @param {Array} [o.crumbs]     - [[name, href], ...]
 * @param {Array} [o.ld]         - JSON-LD objects
 * @param {string} [o.ogType]
 * @param {string} [o.ogImage]
 * @param {*} o.body
 */
export function page(o) {
  const index = o.index !== false;
  const canonical = abs(o.path);
  const img = o.ogImage ? abs(o.ogImage) : abs('/static/og-default.png');
  const ld = [...(o.ld || [])];
  if (o.crumbs?.length > 1) ld.push(breadcrumbLd(o.crumbs));
  const doc = html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${o.title}</title>
<meta name="description" content="${o.description}">
<meta name="google-site-verification" content="jS5SQakfXRhkImoOZzvBX6qluXHCTlTRo-TaaHyKXCQ">
<meta name="msvalidate.01" content="25038A8801D42437BBC34723A41AC6C4">
<meta name="google-adsense-account" content="ca-pub-4766868021895107">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4766868021895107" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K601WNC1HR"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-K601WNC1HR');
</script>
<link rel="canonical" href="${canonical}">
${index ? '' : raw('<meta name="robots" content="noindex, follow">\n')}<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="${config.siteName}">
<meta property="og:title" content="${o.title}">
<meta property="og:description" content="${o.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${o.title}">
<meta name="twitter:description" content="${o.description}">
<meta name="theme-color" content="#182337">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="/favicon.ico" type="image/svg+xml">
<link rel="apple-touch-icon" href="/static/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="${config.siteName} RSS Feed" href="/rss.xml">
<link rel="stylesheet" href="/static/site.css?v=${ASSET_V}">
<script src="/static/site.js?v=${ASSET_V}" defer></script>
${ld.map(jsonld)}
</head>
<body>
${header(o.path)}
<main id="main" class="wrap">
${o.crumbs ? breadcrumbs(o.crumbs) : ''}
${o.body}
</main>
${footer()}
</body>
</html>`;
  return { status: o.status || 200, html: doc.s, index };
}

// ---------- shared components ----------
export const icon = (app, size = 56, lazy = true) =>
  html`<img class="icon" src="/icons/${app.slug}.webp" onerror="this.onerror=null;this.src='/icons/${app.slug}.svg'" width="${size}" height="${size}" alt="${app.name} icon"${lazy ? raw(' loading="lazy" decoding="async"') : ''}>`;

export function formatCount(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Number(n).toLocaleString('en-US');
}

export function stars(avg, count, min = config.thresholds.minReviewsForAverage) {
  if (!count) return html`<span class="rating none">No ratings yet</span>`;
  if (count < min) return html`<span class="rating few">${count} ${count === 1 ? 'rating' : 'ratings'}</span>`;
  const v = Math.round(avg * 10) / 10;
  const numFormatted = typeof count === 'number' ? formatCount(count) : count;
  const fullCount = typeof count === 'number' ? count.toLocaleString('en-US') : count;
  return html`<span class="rating" aria-label="Rated ${v} out of 5 from ${fullCount} reviews"><span class="stars" aria-hidden="true">★</span> <strong class="rating-score">${v.toFixed(1)}</strong> <span class="rating-votes">(${numFormatted})</span></span>`;
}

export function appCard(a, opts = {}) {
  const sizeText = a.size_bytes ? fmtBytes(a.size_bytes) : (a.version ? `v${a.version}` : '');
  return html`<li class="card app-card" data-cat="${a.cat_slug}" data-price="${a.price_model || ''}" data-type="${a.app_type}" data-rating="${a.review_count >= config.thresholds.minReviewsForAverage ? (a.rating_avg || 0).toFixed(1) : 0}" data-dev="${a.dev_slug}" data-dl="${a.download_type}" data-updated="${a.updated_at}" data-name="${a.name.toLowerCase()}">
  ${icon(a, 56)}
  <div class="app-card-body">
    <h3 class="app-card-title"><a href="/apps/${a.slug}/">${a.name}</a></h3>
    <p class="app-card-meta"><a href="/developer/${a.dev_slug}/" class="dev">${a.dev_name}</a> · <a href="${catUrl({ kind: a.cat_kind, slug: a.cat_slug })}" class="cat">${a.cat_name}</a></p>
    ${opts.summary ? html`<p class="sum">${a.summary}</p>` : ''}
    <div class="app-card-bottom">
      ${stars(a.rating_avg, a.review_count)}
      ${sizeText ? html`<span class="app-card-sep">·</span><span class="app-card-size">${sizeText}</span>` : ''}
    </div>
  </div>
  <a href="/apps/${a.slug}/" class="btn-apk-dl" aria-label="Download ${a.name} APK">Download</a>
</li>`;
}

export const appGrid = (apps, opts) => apps.length
  ? html`<ul class="grid">${apps.map((a) => appCard(a, opts))}</ul>`
  : html`<p class="muted">${opts?.empty || 'Nothing listed here yet.'}</p>`;

export const catUrl = (c) => (c.kind === 'game' ? `/games/${c.slug}/` : `/apps/${c.slug}/`);

export function faqBlock(faqs, heading = 'Frequently asked questions') {
  if (!faqs?.length) return '';
  return html`<section class="faq"><h2>${heading}</h2>${faqs.map((f) => html`<details><summary>${f.q}</summary><p>${f.a}</p></details>`)}</section>`;
}

export function dated(published, updated) {
  return html`<p class="dates">Published <time datetime="${isoDate(published)}">${fmtDate(published)}</time>${updated && isoDate(updated) !== isoDate(published) ? html` · Updated <time datetime="${isoDate(updated)}">${fmtDate(updated)}</time>` : ''}</p>`;
}

export const orgLd = () => ({
  '@context': 'https://schema.org', '@type': 'Organization', '@id': abs('/#org'),
  name: config.siteName, url: abs('/'), logo: abs('/favicon.svg'), email: config.contactEmail,
});
export { esc };
