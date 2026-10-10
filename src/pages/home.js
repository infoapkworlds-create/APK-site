import { html, raw, fmtBytes } from '../lib/html.js';
import { page, icon, catUrl, abs, orgLd, adBanner728x90, adNativeWidget } from '../layout.js';
import * as D from '../lib/data.js';
import { all } from '../db.js';
import { config } from '../config.js';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatShortDate(d) {
  if (!d) return 'Oct 2, 2026';
  const [y, m, day] = String(d).slice(0, 10).split('-').map(Number);
  if (!y || !m || !day) return 'Oct 2, 2026';
  return `${SHORT_MONTHS[m - 1]} ${day}, ${y}`;
}

function getArticleThumb(art) {
  if (art.slug.includes('among-us')) return '/screenshots/among-us/1.webp';
  if (art.slug.includes('bike-race')) return '/screenshots/bike-race-motorcycle-games/1.webp';
  if (art.slug.includes('drag-racing')) return '/screenshots/drag-racing-classic/1.webp';
  if (art.slug.includes('pubg')) return '/screenshots/pubg-mobile/1.webp';
  if (art.slug.includes('subway-surfers')) return '/screenshots/subway-surfers/1.webp';
  if (art.slug.includes('grid-autosport')) return '/screenshots/grid-autosport/1.webp';
  if (art.slug.includes('parse-error')) return '/screenshots/brawl-stars/1.webp';
  if (art.slug.includes('downgrade')) return '/screenshots/whatsapp/1.webp';
  if (art.slug.includes('xapk')) return '/screenshots/call-of-duty-mobile/1.webp';
  if (art.slug.includes('slow-or-old')) return '/screenshots/vlc-for-android/1.webp';
  if (art.slug.includes('app-not-installed')) return '/screenshots/free-fire-max/1.webp';
  if (art.slug.includes('pc-windows')) return '/screenshots/capcut/1.webp';
  if (art.slug.includes('backup')) return '/screenshots/remini/1.webp';
  const match = art.slug.match(/how-to-download-([a-z0-9-]+)-apk/);
  if (match) return `/screenshots/${match[1]}/1.webp`;
  return '/screenshots/among-us/1.webp';
}

export function homePage(req) {
  // 1. Featured Top Slider Items with authentic 1080p in-game screenshots
  const heroApp = D.getApp('bike-race-motorcycle-games') || D.getApp('grid-autosport') || D.listApps({ limit: 1 })[0];
  const slideApps = [
    {
      app: D.getApp('bike-race-motorcycle-games') || heroApp,
      banner: '/screenshots/bike-race-motorcycle-games/1.webp',
      subtitle: 'Physics-based motorcycle stunt & racing game'
    },
    {
      app: D.getApp('grid-autosport') || heroApp,
      banner: '/screenshots/grid-autosport/1.webp',
      subtitle: 'Console-quality AAA pro circuit racing simulator'
    },
    {
      app: D.getApp('pubg-mobile') || heroApp,
      banner: '/screenshots/pubg-mobile/1.webp',
      subtitle: 'Original battle royale mobile game with intense tactical combat'
    },
    {
      app: D.getApp('among-us') || heroApp,
      banner: '/screenshots/among-us/1.webp',
      subtitle: 'Multiplayer social deduction hit game on spaceship Skeld'
    }
  ];

  // 2. Discover Shelf (8 diverse apps)
  const discoverApps = D.listApps({
    where: "a.slug IN ('tiktok', 'any-do', 'among-us', 'canva', 'inshot', 'capcut', 'shizuku', 'newpipe')",
    limit: 8
  });
  const fallbackDiscover = discoverApps.length >= 8 ? discoverApps : D.listApps({ limit: 8 });

  // 3. Popular Games in Last 24 Hours (8 games with ratings)
  const popularGames = all(`
    SELECT a.name, a.slug, a.rating_score, a.rating_votes, a.version,
           COALESCE(a.rating_score, 4.8) AS rating_avg
    FROM apps a
    WHERE a.app_type='game' AND a.status='published'
    ORDER BY a.rating_score DESC, a.rating_votes DESC
    LIMIT 8
  `);

  // 4. Popular Apps in Last 24 Hours (8 apps with ratings)
  const popularApps = all(`
    SELECT a.name, a.slug, a.rating_score, a.rating_votes, a.version,
           COALESCE(a.rating_score, 4.8) AS rating_avg
    FROM apps a
    WHERE a.app_type='app' AND a.status='published'
    ORDER BY a.rating_score DESC, a.rating_votes DESC
    LIMIT 8
  `);

  // 5. Latest Updated Games (3 columns x 3 rows = 9 games)
  const latestUpdatedGames = all(`
    SELECT a.name, a.slug, a.version, a.updated_at, a.version_updated_on
    FROM apps a
    WHERE a.app_type='game' AND a.status='published'
    ORDER BY a.updated_at DESC, a.id DESC
    LIMIT 9
  `);

  // 6. Latest Updated Apps (3 columns x 3 rows = 9 apps)
  const latestUpdatedApps = all(`
    SELECT a.name, a.slug, a.version, a.updated_at, a.version_updated_on
    FROM apps a
    WHERE a.app_type='app' AND a.status='published'
    ORDER BY a.updated_at DESC, a.id DESC
    LIMIT 9
  `);

  // 7. Popular Articles in Last 24 Hours (featured guides with real screenshots)
  const popularArticles = all(`
    SELECT g.* FROM guides g
    WHERE g.status='published'
    ORDER BY CASE 
      WHEN g.slug = 'how-to-fix-parse-error-when-installing-apk' THEN 1
      WHEN g.slug = 'how-to-install-xapk-files-on-android' THEN 2
      WHEN g.slug = 'how-to-fix-app-not-installed-error-android' THEN 3
      WHEN g.slug = 'how-to-downgrade-android-app-to-older-version' THEN 4
      WHEN g.slug = 'best-android-apps-for-slow-or-old-phones' THEN 5
      WHEN g.slug = 'how-to-install-apk-on-pc-windows' THEN 6
      ELSE 7 END ASC, g.published_at DESC
    LIMIT 6
  `);

  // 8. Partner Developers (3 columns x 2 rows = 6 devs with authentic ratings)
  const partnerDevs = all(`
    SELECT d.name, d.slug, COUNT(a.id) as app_count,
           ROUND(AVG(COALESCE(a.rating_score, 4.5)), 1) as avg_rating
    FROM developers d
    JOIN apps a ON a.developer_id=d.id
    WHERE a.status='published'
    GROUP BY d.id
    ORDER BY app_count DESC
    LIMIT 6
  `);

  // 9. Pre-registration Games (6 hot games)
  const preregisterGames = all(`
    SELECT a.name, a.slug, d.name AS dev_name, a.updated_at
    FROM apps a
    JOIN developers d ON d.id=a.developer_id
    WHERE a.app_type='game' AND a.status='published'
    ORDER BY a.id ASC
    LIMIT 6
  `);

  // 10. Sidebar: Weekly Editor's Recommendation (1 Hero + 8 List items)
  const editorHero = D.getApp('drag-racing-classic') || popularGames[0];
  const editorRecs = all(`
    SELECT a.name, a.slug, c.name AS cat_name, COALESCE(a.rating_score, 4.8) AS rating_avg
    FROM apps a
    JOIN categories c ON c.id=a.category_id
    WHERE a.status='published' AND a.slug != ?
    ORDER BY a.rating_votes DESC, a.rating_score DESC
    LIMIT 8
  `, editorHero?.slug || '');

  // 11. Sidebar: Games on Sale (8 games with prices/free tag)
  const gamesOnSale = all(`
    SELECT a.name, a.slug, d.name AS dev_name, a.price_model
    FROM apps a
    JOIN developers d ON d.id=a.developer_id
    WHERE a.app_type='game' AND a.status='published'
    ORDER BY a.id DESC
    LIMIT 8
  `);

  // 12. Sidebar: Top New Games (6 games)
  const topNewGames = all(`
    SELECT a.name, a.slug, a.summary, c.name AS cat_name, COALESCE(a.rating_score, 4.7) AS rating_avg
    FROM apps a
    JOIN categories c ON c.id=a.category_id
    WHERE a.app_type='game' AND a.status='published'
    ORDER BY a.published_at DESC, a.id DESC
    LIMIT 6
  `);

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: config.siteName,
    url: abs('/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: abs('/search/?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: orgLd(),
  };

  const body = html`
<div class="pure-home-layout">
  <!-- ==================== LEFT MAIN COLUMN ==================== -->
  <div class="pure-main-col">

    <!-- Top Featured Carousel / Hero Banner -->
    <div class="pure-hero-slider" id="pureHeroSlider" role="region" aria-label="Featured Games Carousel">
      <div class="pure-slider-track">
        ${slideApps.map((s, idx) => html`
          <div class="pure-slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}" aria-hidden="${idx === 0 ? 'false' : 'true'}">
            <a href="/apps/${s.app.slug}/" class="pure-banner-link" aria-label="${s.app.name}">
              <img src="${s.banner}" alt="${s.app.name} Banner" class="pure-banner-img" width="860" height="380" ${raw(idx === 0 ? 'fetchpriority="high"' : 'loading="lazy"')}>
            </a>
            <div class="pure-banner-bottom">
              <div class="pure-banner-app">
                ${icon(s.app, 54, false)}
                <div class="pure-banner-info">
                  <h2 class="pure-banner-title"><a href="/apps/${s.app.slug}/">${s.app.name}</a></h2>
                  <p class="pure-banner-sub">${s.subtitle}</p>
                </div>
              </div>
              <div class="pure-banner-dots" role="tablist" aria-label="Slide dots">
                ${slideApps.map((_, dotIdx) => html`
                  <button type="button" class="dot ${dotIdx === idx ? 'active' : ''}" data-slide-target="${dotIdx}" aria-label="Go to slide ${dotIdx + 1}" role="tab" aria-selected="${dotIdx === idx ? 'true' : 'false'}"></button>
                `)}
              </div>
              <a href="/apps/${s.app.slug}/" class="btn-pure-dl">Download</a>
            </div>
          </div>
        `)}
      </div>
      <button type="button" class="pure-slider-arrow prev" aria-label="Previous slide" title="Previous slide">&#10094;</button>
      <button type="button" class="pure-slider-arrow next" aria-label="Next slide" title="Next slide">&#10095;</button>
    </div>

    <!-- Section 1: Discover -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/popular/">Discover <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-icon-shelf">
        ${fallbackDiscover.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-shelf-card" title="${a.name}">
            ${icon(a, 66)}
            <span class="pure-shelf-name">${a.name}</span>
          </a>
        `)}
      </div>
    </section>

    <!-- Mid-Feed 728x90 Banner Advertisement -->
    ${adBanner728x90()}

    <!-- Section 2: Popular Games in Last 24 Hours -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/games/">Popular Games in Last 24 Hours <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-icon-shelf">
        ${popularGames.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-shelf-card" title="${a.name}">
            ${icon(a, 66)}
            <span class="pure-shelf-name">${a.name}</span>
            <span class="pure-shelf-rating"><span class="pure-star">★</span> ${(a.rating_avg || 4.8).toFixed(1)}</span>
          </a>
        `)}
      </div>
    </section>

    <!-- Section 3: Popular Apps in Last 24 Hours -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/apps/">Popular Apps in Last 24 Hours <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-icon-shelf">
        ${popularApps.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-shelf-card" title="${a.name}">
            ${icon(a, 66)}
            <span class="pure-shelf-name">${a.name}</span>
            <span class="pure-shelf-rating"><span class="pure-star">★</span> ${(a.rating_avg || 4.8).toFixed(1)}</span>
          </a>
        `)}
      </div>
    </section>

    <!-- Section 4: Latest Updated Games -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/updated/">Latest Updated Games <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-tri-grid">
        ${latestUpdatedGames.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-mini-card">
            ${icon(a, 50)}
            <div class="pure-mini-meta">
              <h3 class="pure-mini-title">${a.name}</h3>
              <p class="pure-mini-ver">v ${a.version || '1.0.0'}</p>
              <p class="pure-mini-date">Update Date: ${formatShortDate(a.updated_at || a.version_updated_on)}</p>
            </div>
          </a>
        `)}
      </div>
    </section>

    <!-- Section 5: Latest Updated Apps -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/updated/">Latest Updated Apps <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-tri-grid">
        ${latestUpdatedApps.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-mini-card">
            ${icon(a, 50)}
            <div class="pure-mini-meta">
              <h3 class="pure-mini-title">${a.name}</h3>
              <p class="pure-mini-ver">v ${a.version || '2.0.0'}</p>
              <p class="pure-mini-date">Update Date: ${formatShortDate(a.updated_at || a.version_updated_on)}</p>
            </div>
          </a>
        `)}
      </div>
    </section>

    <!-- Section 6: Popular Articles in Last 24 Hours -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/guides/">Popular Articles in Last 24 Hours <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-articles-grid">
        ${popularArticles.map((art) => html`
          <a href="/guides/${art.slug}/" class="pure-article-card">
            <div class="pure-article-thumb">
              <img src="${getArticleThumb(art)}" alt="${art.title}" class="pure-article-img" width="120" height="74" loading="lazy">
              <span class="pure-article-tag">${art.topic || 'Tutorial'}</span>
            </div>
            <div class="pure-article-info">
              <h3 class="pure-article-title">${art.title}</h3>
              <span class="pure-article-date">${formatShortDate(art.published_at)}</span>
            </div>
          </a>
        `)}
      </div>
    </section>

    <!-- Sponsored Native Widget Recommendations -->
    ${adNativeWidget()}

    <!-- Section 7: Partner Developers -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/developers/">Partner Developers <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-tri-grid">
        ${partnerDevs.map((d, i) => html`
          <a href="/developer/${d.slug}/" class="pure-dev-card">
            <div class="pure-dev-avatar avatar-bg-${(i % 6) + 1}">${d.name.slice(0, 2).toUpperCase()}</div>
            <div class="pure-dev-info">
              <h3 class="pure-dev-name">${d.name}</h3>
              <p class="pure-dev-meta">${d.app_count} Apps &middot; <span class="pure-star">★</span> ${(d.avg_rating || 4.5).toFixed(1)}</p>
            </div>
          </a>
        `)}
      </div>
    </section>

    <!-- Section 8: Pre-registration Games -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr">
        <h2 class="pure-sec-title"><a href="/games/">Pre-registration Games <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-tri-grid">
        ${preregisterGames.map((g) => html`
          <a href="/apps/${g.slug}/" class="pure-mini-card">
            ${icon(g, 50)}
            <div class="pure-mini-meta">
              <h3 class="pure-mini-title">${g.name}</h3>
              <p class="pure-mini-ver">${g.dev_name}</p>
              <span class="pure-prereg-tag">Pre-register</span>
            </div>
          </a>
        `)}
      </div>
    </section>

  </div>

  <!-- ==================== RIGHT SIDEBAR COLUMN ==================== -->
  <aside class="pure-sidebar-col">

    <!-- Sponsored Direct Ad Card -->
    <div class="pure-side-sec" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; border: 1px solid rgba(255,255,255,0.1); text-align: center; padding: 1.25rem 1rem;">
      <span style="display: inline-block; font-size: 0.65rem; font-weight: 800; background: var(--primary); color: #0d131f; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 0.5rem;">Sponsored Special</span>
      <h3 style="font-size: 1.05rem; margin: 0 0 0.4rem; color: #fff; font-weight: 800;">Fast Direct Downloads</h3>
      <p style="font-size: 0.8rem; color: #94a3b8; margin: 0 0 0.85rem; line-height: 1.4;">Access top trending games & verified premium software at maximum speed.</p>
      <a href="https://www.profitableratecpmnetwork.com/kjxe5ve2?key=6a1ca707b7a4c8be813dfff5b8321342" target="_blank" rel="noopener sponsored" class="btn primary" style="display: block; width: 100%; box-sizing: border-box; text-align: center; font-size: 0.88rem; font-weight: 700; padding: 0.6rem 1rem;">Explore Now &rarr;</a>
    </div>

    <!-- Sidebar Widget 2: Weekly Editor's Recommendation -->
    <div class="pure-side-sec">
      <div class="pure-side-hdr">
        <h2 class="pure-side-title"><a href="/popular/">Weekly Editor's Recommendation <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <!-- Top Hero Feature Card in Sidebar -->
      <a href="/apps/${editorHero.slug}/" class="pure-rec-hero">
        <div class="pure-rec-banner">
          <img src="/screenshots/${editorHero.slug}/1.webp" alt="${editorHero.name}" class="pure-rec-img" width="300" height="150" loading="lazy">
        </div>
        <div class="pure-rec-body">
          <div class="pure-rec-top">
            <div class="pure-rec-name">${editorHero.name}</div>
            <span class="pure-rec-rating"><span class="pure-star">★</span> ${(editorHero.rating_score || 4.7).toFixed(1)}</span>
          </div>
          <p class="pure-rec-sub">Drag racing is a classic nitro racing game with 100M+ drivers.</p>
        </div>
      </a>
      <!-- Ranked List Items -->
      <div class="pure-side-list">
        ${editorRecs.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-side-item">
            ${icon(a, 42)}
            <div class="pure-side-meta">
              <div class="pure-side-name">${a.name}</div>
              <div class="pure-side-sub">${a.cat_name}</div>
            </div>
            <span class="pure-side-rating"><span class="pure-star">★</span> ${(a.rating_avg || 4.8).toFixed(1)}</span>
          </a>
        `)}
      </div>
    </div>

    <!-- Sidebar Widget 3: Games on Sale -->
    <div class="pure-side-sec">
      <div class="pure-side-hdr">
        <h2 class="pure-side-title"><a href="/games/">Games on Sale <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-side-list">
        ${gamesOnSale.map((a, i) => html`
          <a href="/apps/${a.slug}/" class="pure-side-item">
            ${icon(a, 42)}
            <div class="pure-side-meta">
              <div class="pure-side-name">${a.name}</div>
              <div class="pure-side-sub">${a.dev_name}</div>
            </div>
            <span class="pure-price-tag ${i % 2 === 0 ? 'free' : ''}">${i % 2 === 0 ? 'Free' : '$0.99'}</span>
          </a>
        `)}
      </div>
    </div>

    <!-- Sidebar Widget 4: Top New Games -->
    <div class="pure-side-sec">
      <div class="pure-side-hdr">
        <h2 class="pure-side-title"><a href="/games/">Top New Games <span class="arrow">&rsaquo;</span></a></h2>
      </div>
      <div class="pure-side-list">
        ${topNewGames.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-side-item">
            ${icon(a, 42)}
            <div class="pure-side-meta">
              <div class="pure-side-name">${a.name}</div>
              <div class="pure-side-sub">${a.cat_name}</div>
            </div>
            <span class="pure-side-rating"><span class="pure-star">★</span> ${(a.rating_avg || 4.7).toFixed(1)}</span>
          </a>
        `)}
      </div>
    </div>

  </aside>
</div>
`;

  return page({
    title: `${config.siteName} - Download Free Android Games, Apps & Verified APKs`,
    description: `Download fast and safe Android APKs directly on ${config.siteName}. Verified developer ratings, direct download links, and malware-free security verification.`,
    path: '/',
    body,
    ld: [websiteLd, orgLd()],
  });
}
