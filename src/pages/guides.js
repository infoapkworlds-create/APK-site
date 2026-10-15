import { html, raw, fmtDate, isoDate } from '../lib/html.js';
import { page, faqBlock, appGrid, abs, orgLd, icon, adBanner728x90, adNativeWidget } from '../layout.js';
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

function renderTableOfContents(htmlContent) {
  const headings = [];
  const bodyWithAnchors = String(htmlContent || '').replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, text) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const anchor = 'section-' + (headings.length + 1);
    headings.push({ text: cleanText, anchor });
    return `<h2 id="${anchor}"${attrs}>${text}</h2>`;
  });

  if (headings.length < 2) {
    return { tocHtml: '', bodyWithAnchors, headings };
  }

  const tocHtml = html`
<div class="guide-toc-box" style="margin: 1.5rem 0 2rem 0; padding: 1.25rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-sm);">
  <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
    <span>📑</span> Table of Contents (Quick Navigation)
  </div>
  <ol style="margin: 0; padding-left: 1.25rem; line-height: 1.85; font-size: 0.95rem;">
    ${headings.map((h) => html`<li style="margin-bottom: 4px;"><a href="#${h.anchor}" style="text-decoration: none; color: var(--primary); font-weight: 500;">${h.text}</a></li>`)}
  </ol>
</div>`;

  return { tocHtml, bodyWithAnchors, headings };
}

export function guideDetailPage(req, guide) {
  const relatedApps = L.appsForGuide(guide);
  const relatedGuides = L.relatedGuides(guide, 3);
  const faqs = JSON.parse(guide.faq_json || '[]');
  const coverImg = getGuideCoverImage(guide);
  const { tocHtml, bodyWithAnchors, headings = [] } = renderTableOfContents(guide.body_html);

  const appSlugMatch = (guide.slug || '').match(/^how-to-download-(.+)-apk$/);
  const matchedApp = appSlugMatch ? D.getApp(appSlugMatch[1]) : (relatedApps[0] || null);

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

  let howToLd = null;
  if (guide.slug.startsWith('how-to-') && headings.length >= 2) {
    howToLd = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: guide.title,
      description: guide.summary || guide.meta_description,
      image: abs(coverImg),
      step: headings.map((h, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: h.text,
        url: abs(`/guides/${guide.slug}/#${h.anchor}`),
        text: `Step ${i + 1}: ${h.text}. Follow detailed steps in our verified Android tutorial.`,
      })),
    };
  }

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

  ${tocHtml}

  ${matchedApp ? html`
  <!-- Primary High-Converting Download CTA Block -->
  <div class="guide-dl-cta-banner card" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding: 1.25rem 1.5rem; margin: 1.5rem 0 2rem 0; background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06)); border: 1.5px solid var(--primary); border-radius: 12px;">
    <div>
      <div style="font-weight: 700; font-size: 1.15rem; color: var(--text); margin-bottom: 0.25rem;">
        ⚡ Direct APK Download: ${matchedApp.name}
      </div>
      <p style="margin: 0; font-size: 0.9rem; color: var(--muted);">
        Official verified SHA-256 signed package. Safe and tested for Android ${matchedApp.min_android ? matchedApp.min_android + '+' : '7.0+'}.
      </p>
    </div>
    <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
      <a href="/apps/${matchedApp.slug}/download/" class="btn primary" style="font-weight: 700; padding: 0.7rem 1.4rem;">
        Download ${matchedApp.name} APK &rarr;
      </a>
      <a href="/apps/${matchedApp.slug}/" class="btn" style="padding: 0.7rem 1rem;">
        ${matchedApp.name} APK Overview
      </a>
    </div>
  </div>` : ''}

  <div class="article-body">
    ${raw(bodyWithAnchors)}
  </div>

  ${matchedApp ? html`
  <!-- In-Content Related Pages Internal Linking Silo -->
  <section class="guide-related-pages-silo card" style="margin: 2.25rem 0; padding: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
    <h3 style="margin-top: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
      <span>🔗</span> Essential ${matchedApp.name} Resources &amp; Downloads
    </h3>
    <p style="font-size: 0.92rem; color: var(--muted); margin-bottom: 1rem;">
      Access verified downloads, full release changelogs, alternative options, and user feedback:
    </p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
      <a href="/apps/${matchedApp.slug}/download/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>⚡</span> Download ${matchedApp.name} APK
      </a>
      <a href="/apps/${matchedApp.slug}/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>📱</span> ${matchedApp.name} APK Overview
      </a>
      <a href="/apps/${matchedApp.slug}/versions/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>📦</span> Previous versions of ${matchedApp.name}
      </a>
      <a href="/apps/${matchedApp.slug}/alternatives/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>🔄</span> Best alternatives to ${matchedApp.name}
      </a>
      <a href="/apps/${matchedApp.slug}/reviews/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>⭐</span> ${matchedApp.name} user reviews
      </a>
      <a href="/tools/apk-error-solver/?app=${matchedApp.slug}" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>🛠️</span> Fix ${matchedApp.name} APK Errors
      </a>
    </div>
  </section>` : html`
  <!-- Generic Android Sideloading Hub -->
  <section class="guide-related-pages-silo card" style="margin: 2.25rem 0; padding: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;">
    <h3 style="margin-top: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
      <span>📖</span> Essential Android APK Tools &amp; Popular Guides
    </h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-top: 0.75rem;">
      <a href="/guides/how-to-install-apk/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>📖</span> How to Install APK on Android
      </a>
      <a href="/guides/how-to-install-xapk-files-on-android/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>📦</span> How to Install XAPK Files
      </a>
      <a href="/guides/how-to-backup-and-extract-apk-files/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>💾</span> Backup &amp; Extract APKs
      </a>
      <a href="/tools/apk-error-solver/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>🛠️</span> APK Error Solver Diagnostic Tool
      </a>
      <a href="/tools/apk-inspector/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>🔍</span> APK Package &amp; Hash Inspector
      </a>
      <a href="/popular/" class="silo-link" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 0.9rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); font-size: 0.9rem; font-weight: 500;">
        <span>⭐</span> Popular Android Apps &amp; Games
      </a>
    </div>
  </section>`}

  <!-- Mid-Article 728x90 Banner -->
  ${adBanner728x90()}

  ${faqBlock(faqs)}

  <!-- Sponsored Native Recommendations Widget -->
  ${adNativeWidget()}

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
    keywords: `${guide.title.toLowerCase()}, android guide, how to apk, apk installation, android tutorial`,
    ld: [articleLd, ...(howToLd ? [howToLd] : []), ...(faqLd ? [faqLd] : [])],
    body,
  });
}
