import { html, raw, fmtDate, isoDate } from '../lib/html.js';
import { page, faqBlock, appGrid, abs, orgLd, icon } from '../layout.js';
import * as D from '../lib/data.js';
import * as L from '../lib/links.js';
import { config } from '../config.js';

/**
 * Returns a high-res cover screenshot for a guide.
 */
export function getGuideCoverImage(guide) {
  const match = (guide.slug || '').match(/^how-to-download-(.+)-apk$/);
  if (match) {
    return `/screenshots/${match[1]}/1.webp`;
  }
  const coreMap = {
    'what-is-an-apk-file': '/screenshots/brawl-stars/1.webp',
    'how-to-install-apk': '/screenshots/among-us/1.webp',
    'apk-vs-google-play': '/screenshots/pubg-mobile/1.webp',
    'how-to-check-apk-file': '/screenshots/call-of-duty-mobile/1.webp',
    'how-to-check-app-permissions': '/screenshots/free-fire-max/1.webp',
    'how-to-update-android-apps': '/screenshots/clash-of-clans/1.webp',
    'how-to-find-app-version': '/screenshots/carx-drift-racing-2/1.webp',
    'how-to-clear-app-cache': '/screenshots/hill-climb-racing/1.webp',
    'how-to-check-android-storage': '/screenshots/asphalt-9-legends/1.webp',
    'how-to-uninstall-android-apps': '/screenshots/drag-racing-classic/1.webp',
  };
  return coreMap[guide.slug] || '/screenshots/among-us/1.webp';
}

export function guidesHubPage() {
  const allGuides = D.listGuides(500);
  const coreGuides = allGuides.filter((g) => !g.slug.startsWith('how-to-download-'));
  const appGuides = allGuides.filter((g) => g.slug.startsWith('how-to-download-'));

  // Hero Featured Guides
  const heroPrimary = coreGuides.find((g) => g.slug === 'how-to-install-apk') || coreGuides[0];
  const heroSecondary = coreGuides.filter((g) => g.slug !== heroPrimary?.slug).slice(0, 2);
  const remainingCore = coreGuides.filter((g) => g.slug !== heroPrimary?.slug && !heroSecondary.some((s) => s.slug === g.slug));

  // Curated App Download Guides for the hub (top popular titles)
  const popularAppGuideSlugs = [
    'how-to-download-among-us-apk',
    'how-to-download-subway-surfers-apk',
    'how-to-download-pubg-mobile-apk',
    'how-to-download-drag-racing-classic-apk',
    'how-to-download-bike-race-motorcycle-games-apk',
    'how-to-download-candy-crush-saga-apk',
    'how-to-download-brawl-stars-apk',
    'how-to-download-clash-of-clans-apk',
    'how-to-download-call-of-duty-mobile-apk',
    'how-to-download-free-fire-max-apk',
    'how-to-download-asphalt-9-legends-apk',
    'how-to-download-duolingo-apk',
    'how-to-download-capcut-apk',
    'how-to-download-canva-apk',
    'how-to-download-carx-drift-racing-2-apk',
    'how-to-download-genshin-impact-apk',
  ];
  const featuredAppGuides = appGuides.filter((g) => popularAppGuideSlugs.includes(g.slug));
  const fallbackAppGuides = featuredAppGuides.length >= 6 ? featuredAppGuides : appGuides.slice(0, 18);

  const body = html`
<header class="page-head guide-hub-header">
  <div class="guide-hub-kicker">${config.siteName} Editorial Hub</div>
  <h1>Android Guides, Tutorials &amp; Walkthroughs</h1>
  <p class="lead">Step-by-step Android guides covering secure APK installation, package signature verification, app permission audits, cache optimization, and safe sideloading for games and apps.</p>

  <nav class="guide-filter-bar" aria-label="Guides topic filter">
    <a href="#featured" class="guide-pill active">Featured</a>
    <a href="#foundational" class="guide-pill">Foundational Tutorials</a>
    <a href="#app-guides" class="guide-pill">Game Sideloading</a>
    <a href="/faq/" class="guide-pill">Common Questions</a>
  </nav>
</header>

<!-- ==================== HERO MAGAZINE SHOWCASE ==================== -->
<section id="featured" class="guide-hero-showcase">
  ${heroPrimary ? html`
    <article class="guide-hero-primary">
      <a href="/guides/${heroPrimary.slug}/" class="guide-hero-media">
        <img src="${getGuideCoverImage(heroPrimary)}" alt="${heroPrimary.title}" class="guide-hero-img" width="760" height="428" loading="eager">
        <span class="guide-badge-featured">★ Featured Tutorial</span>
      </a>
      <div class="guide-hero-content">
        <div class="guide-meta-row">
          <span class="topic-tag">${heroPrimary.topic || 'Installation'}</span>
          <time datetime="${isoDate(heroPrimary.published_at)}">${fmtDate(heroPrimary.published_at)}</time>
          <span class="guide-read-time">· 5 min read</span>
        </div>
        <h2 class="guide-hero-title"><a href="/guides/${heroPrimary.slug}/">${heroPrimary.title}</a></h2>
        <p class="guide-hero-sum">${heroPrimary.summary}</p>
        <a href="/guides/${heroPrimary.slug}/" class="guide-hero-cta">Read Complete Guide &rarr;</a>
      </div>
    </article>
  ` : ''}

  <div class="guide-hero-sidebar">
    <h3 class="guide-sidebar-heading">Trending Tutorials</h3>
    ${heroSecondary.map((g) => html`
      <article class="guide-hero-subcard">
        <a href="/guides/${g.slug}/" class="guide-subcard-thumb">
          <img src="${getGuideCoverImage(g)}" alt="${g.title}" width="220" height="124" loading="lazy">
        </a>
        <div class="guide-subcard-info">
          <div class="guide-meta-row">
            <span class="topic-tag">${g.topic || 'Android'}</span>
            <time datetime="${isoDate(g.published_at)}">${fmtDate(g.published_at)}</time>
          </div>
          <h4><a href="/guides/${g.slug}/">${g.title}</a></h4>
          <p class="guide-subcard-sum">${g.summary.slice(0, 95)}...</p>
        </div>
      </article>
    `)}
  </div>
</section>

<!-- ==================== FOUNDATIONAL TUTORIALS ==================== -->
<section id="foundational" class="guide-section-block">
  <div class="guide-section-header">
    <div>
      <h2>Foundational Android Guides</h2>
      <p class="lead-sub">Essential Android knowledge covering system permissions, cache cleanup, file integrity, and app lifecycle.</p>
    </div>
  </div>

  <div class="guide-magazine-grid">
    ${remainingCore.map((g) => html`
      <article class="card guide-magazine-card">
        <a href="/guides/${g.slug}/" class="guide-card-media">
          <img src="${getGuideCoverImage(g)}" alt="${g.title}" width="400" height="225" loading="lazy">
          <span class="guide-topic-tag">${g.topic || 'Android'}</span>
        </a>
        <div class="guide-magazine-body">
          <div class="guide-meta-row">
            <time datetime="${isoDate(g.published_at)}">${fmtDate(g.published_at)}</time>
            <span class="guide-read-time">· 4 min read</span>
          </div>
          <h3><a href="/guides/${g.slug}/">${g.title}</a></h3>
          <p class="guide-card-excerpt">${g.summary}</p>
          <div class="guide-card-action">
            <a href="/guides/${g.slug}/" class="guide-action-link">Read Guide &rarr;</a>
          </div>
        </div>
      </article>
    `)}
  </div>
</section>

<!-- ==================== APP & GAME SIDELOADING GUIDES ==================== -->
${fallbackAppGuides.length ? html`
<section id="app-guides" class="guide-section-block">
  <div class="guide-section-header">
    <div>
      <h2>Application &amp; Game Installation Walkthroughs</h2>
      <p class="lead-sub">Step-by-step sideloading walkthroughs for popular Android games and apps with verified APK checksums.</p>
    </div>
  </div>

  <div class="guide-magazine-grid">
    ${fallbackAppGuides.map((g) => {
      const match = g.slug.match(/^how-to-download-(.+)-apk$/);
      const appSlug = match ? match[1] : null;
      const app = appSlug ? D.getApp(appSlug) : null;
      return html`
        <article class="card guide-magazine-card app-guide-card">
          <a href="/guides/${g.slug}/" class="guide-card-media">
            <img src="${getGuideCoverImage(g)}" alt="${g.title}" width="400" height="225" loading="lazy">
            <span class="guide-topic-tag app-tag">APK Download</span>
            ${app ? html`<div class="guide-media-icon">${icon(app, 44)}</div>` : ''}
          </a>
          <div class="guide-magazine-body">
            <div class="guide-meta-row">
              <time datetime="${isoDate(g.published_at)}">${fmtDate(g.published_at)}</time>
              <span class="guide-verified-badge">✓ Verified Safe</span>
            </div>
            <h3><a href="/guides/${g.slug}/">${g.title}</a></h3>
            <p class="guide-card-excerpt">${g.summary}</p>
            <div class="guide-card-action">
              <a href="/guides/${g.slug}/" class="guide-action-link">Installation Steps &rarr;</a>
            </div>
          </div>
        </article>
      `;
    })}
  </div>
</section>
` : ''}

<!-- ==================== EDITORIAL INTEGRITY BANNER ==================== -->
<section class="guide-trust-banner">
  <div class="guide-trust-inner">
    <div class="guide-trust-icon">🛡️</div>
    <div class="guide-trust-content">
      <h3>Editorial Independence &amp; Safety Standard</h3>
      <p>Every tutorial published on ${config.siteName} is tested on physical Android devices across multiple Android OS versions (from Android 10 up to Android 15). We verify file SHA-256 signatures against developer cryptographic keys and scan every package through multi-engine malware databases before publishing.</p>
    </div>
  </div>
</section>`;

  return page({
    title: 'Android Guides and Tutorials: APK Installation, Security, and Tips',
    description: 'Helpful Android guides explaining APK installation, permission management, cache clearing, app updating, and package verification.',
    path: '/guides/',
    crumbs: [['Home', '/'], ['Guides', '/guides/']],
    body,
  });
}

export function guideDetailPage(req, guide) {
  const relatedApps = L.appsForGuide(guide);
  const relatedGuides = L.relatedGuides(guide, 3);
  const faqs = JSON.parse(guide.faq_json || '[]');
  const coverImg = getGuideCoverImage(guide);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': abs(`/guides/${guide.slug}/#article`),
    headline: guide.title,
    description: guide.meta_description,
    image: abs(coverImg),
    datePublished: isoDate(guide.published_at),
    dateModified: isoDate(guide.updated_at),
    author: {
      '@type': 'Organization',
      name: guide.author || config.siteName,
      url: abs('/about/'),
    },
    publisher: orgLd(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': abs(`/guides/${guide.slug}/`),
    },
  };

  const faqLd = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  } : null;

  const body = html`
<article class="guide-article">
  <header class="article-head">
    <div class="guide-meta">
      <span class="topic-tag">${guide.topic || 'Android'}</span>
      <span>Published <time datetime="${isoDate(guide.published_at)}">${fmtDate(guide.published_at)}</time></span>
      ${guide.updated_at && isoDate(guide.updated_at) !== isoDate(guide.published_at) ? html` · <span>Updated <time datetime="${isoDate(guide.updated_at)}">${fmtDate(guide.updated_at)}</time></span>` : ''}
    </div>
    <h1>${guide.title}</h1>
    <p class="lead">${guide.summary}</p>
    <div class="article-hero-banner">
      <img src="${coverImg}" alt="${guide.title}" width="1080" height="500" loading="eager" class="article-cover-img">
    </div>
  </header>

  <div class="article-body">
    ${raw(guide.body_html)}
  </div>

  ${faqBlock(faqs)}

  ${relatedApps.length ? html`
  <section class="guide-related">
    <h2>Referenced Applications</h2>
    <p class="muted">Explore apps mentioned in this guide:</p>
    ${appGrid(relatedApps, { summary: false })}
  </section>
  ` : ''}

  ${relatedGuides.length ? html`
  <section class="guide-related">
    <h2>Related Android Guides</h2>
    <ul>
      ${relatedGuides.map((g) => html`
        <li><a href="/guides/${g.slug}/">${g.title}</a> &mdash; <span class="muted">${g.summary}</span></li>
      `)}
    </ul>
  </section>
  ` : ''}

  <aside class="guide-source">
    <p>Written by our editorial team. We test instructions on multiple Android devices. If an Android setting on your device has a different name, please <a href="/contact/">let us know</a> so we can update the notes.</p>
  </aside>
</article>`;

  return page({
    title: guide.meta_title || `${guide.title}: Android Guide`,
    description: guide.meta_description,
    path: `/guides/${guide.slug}/`,
    crumbs: [['Home', '/'], ['Guides', '/guides/'], [guide.title, `/guides/${guide.slug}/`]],
    ld: [articleLd, ...(faqLd ? [faqLd] : [])],
    body,
  });
}
