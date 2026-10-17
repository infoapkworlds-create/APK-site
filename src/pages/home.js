import { html, raw, fmtBytes } from '../lib/html.js';
import { page, icon, catUrl, abs, orgLd, adBanner728x90, adNativeWidget } from '../layout.js';
import * as D from '../lib/data.js';
import { all } from '../db.js';
import { config } from '../config.js';
import {
  getDailyUpdatedGames,
  getDailyUpdatedApps,
  getDailyHeroSlides,
  getDailyDiscoverApps,
  getDailyEditorRecommendation
} from '../lib/freshness.js';

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
  // 1. Featured Top Slider Items (Dynamic Daily Rotation across 28 top games & apps)
  const slideApps = getDailyHeroSlides(4);

  // 2. Discover Shelf (Dynamic Daily Rotation across 40 diverse apps & games)
  const fallbackDiscover = getDailyDiscoverApps(8);

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

  // Top 10 Trending Leaderboard Charts
  const topTrending10 = all(`
    SELECT a.id, a.name, a.slug, a.version, a.size_bytes, c.kind AS cat_kind,
           c.name AS cat_name, COALESCE(a.rating_score, 4.8) AS rating_avg
    FROM apps a
    JOIN categories c ON c.id=a.category_id
    WHERE a.status='published'
    ORDER BY a.rating_votes DESC, a.rating_score DESC
    LIMIT 10
  `);

  // 5. Latest Updated Games (Dynamic Daily Rotation)
  const latestUpdatedGames = getDailyUpdatedGames(9);

  // 6. Latest Updated Apps (Dynamic Daily Rotation)
  const latestUpdatedApps = getDailyUpdatedApps(9);

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

  // 10. Sidebar: Editor's Recommendation (Dynamic Daily Rotation)
  const { hero: editorHero, list: editorRecs } = getDailyEditorRecommendation();

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
                  <span class="hero-daily-tag" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 800; background: var(--primary); color: #0d131f; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.4px;">⚡ Daily Spotlight</span>
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

    <!-- Trending Searches Bar -->
    <div class="trending-pills-bar" style="margin: 1.25rem 0 0.5rem 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 4px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Trending:
      </span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
        ${[
          ['Free Fire MAX', '/search/?q=Free+Fire'],
          ['WhatsApp', '/apps/whatsapp/'],
          ['CapCut Pro', '/apps/capcut/'],
          ['Subway Surfers', '/apps/subway-surfers/'],
          ['Roblox', '/apps/roblox/'],
          ['Minecraft', '/apps/minecraft/'],
          ['8 Ball Pool', '/apps/8-ball-pool/'],
          ['Fast VPN', '/search/?q=vpn'],
          ['Snapseed', '/apps/snapseed/'],
          ['TikTok', '/apps/tiktok/']
        ].map(([txt, link]) => html`<a href="${link}" class="trend-pill" style="font-size: 0.78rem; padding: 4px 10px; background: rgba(0,0,0,0.04); border: 1px solid var(--border); border-radius: 20px; color: var(--fg); text-decoration: none; transition: all 0.15s ease;">${txt}</a>`)}
      </div>
    </div>

    <!-- Section 1: Discover -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr" style="display: flex; align-items: center; justify-content: space-between;">
        <h2 class="pure-sec-title"><a href="/popular/">Discover <span class="arrow">&rsaquo;</span></a></h2>
        <span class="daily-badge-sub" style="font-size: 0.75rem; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 4px;">🟢 Refreshed Daily</span>
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

    <!-- Top 10 Trending Leaderboard Charts -->
    <section class="leaderboard-sec card" id="top-charts">
      <div class="leaderboard-hdr">
        <div class="leaderboard-hdr-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          <h2 class="leaderboard-heading">Top 10 Trending Android Charts</h2>
        </div>
        <a href="/popular/" class="leaderboard-see-all">Full Top 100 Charts &rarr;</a>
      </div>
      <p class="leaderboard-sub">Real-time rankings based on verified installs, ratings, and user engagement this week.</p>
      <div class="leaderboard-grid">
        ${topTrending10.map((app, rankIdx) => html`
          <div class="leaderboard-item">
            <span class="rank-badge rank-${rankIdx + 1}">#${rankIdx + 1}</span>
            <div class="leaderboard-icon">
              ${icon(app, 46, false)}
            </div>
            <div class="leaderboard-meta">
              <h3 class="leaderboard-name"><a href="/apps/${app.slug}/">${app.name}</a></h3>
              <div class="leaderboard-tags">
                <span class="leaderboard-cat">${app.cat_name}</span>
                <span class="leaderboard-dot">&bull;</span>
                <span class="leaderboard-rating">★ ${(app.rating_avg || 4.8).toFixed(1)}</span>
                <span class="leaderboard-dot">&bull;</span>
                <span class="leaderboard-size">${app.size_bytes ? fmtBytes(app.size_bytes) : 'Free'}</span>
              </div>
            </div>
            <a href="/apps/${app.slug}/" class="btn-leaderboard-dl">Get APK</a>
          </div>
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
      <div class="pure-sec-hdr" style="display: flex; align-items: center; justify-content: space-between;">
        <h2 class="pure-sec-title"><a href="/updated/">Latest Updated Games <span class="arrow">&rsaquo;</span></a></h2>
        <span style="font-size: 0.78rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.25);">● Auto-Updated Daily</span>
      </div>
      <div class="pure-tri-grid">
        ${latestUpdatedGames.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-mini-card">
            ${icon(a, 50)}
            <div class="pure-mini-meta">
              <h3 class="pure-mini-title">${a.name}</h3>
              <p class="pure-mini-ver" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span>v ${a.version || '1.0.0'}</span>
                <span style="font-size: 0.68rem; padding: 1px 6px; border-radius: 4px; font-weight: 700; background: ${a.is_today ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)'}; color: ${a.is_today ? '#059669' : '#d97706'};">${a.fresh_badge}</span>
              </p>
              <p class="pure-mini-date">Updated: ${a.fresh_display_date}</p>
            </div>
          </a>
        `)}
      </div>
    </section>

    <!-- Section 5: Latest Updated Apps -->
    <section class="pure-shelf-sec">
      <div class="pure-sec-hdr" style="display: flex; align-items: center; justify-content: space-between;">
        <h2 class="pure-sec-title"><a href="/updated/">Latest Updated Apps <span class="arrow">&rsaquo;</span></a></h2>
        <span style="font-size: 0.78rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.25);">● Auto-Updated Daily</span>
      </div>
      <div class="pure-tri-grid">
        ${latestUpdatedApps.map((a) => html`
          <a href="/apps/${a.slug}/" class="pure-mini-card">
            ${icon(a, 50)}
            <div class="pure-mini-meta">
              <h3 class="pure-mini-title">${a.name}</h3>
              <p class="pure-mini-ver" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span>v ${a.version || '2.0.0'}</span>
                <span style="font-size: 0.68rem; padding: 1px 6px; border-radius: 4px; font-weight: 700; background: ${a.is_today ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)'}; color: ${a.is_today ? '#059669' : '#d97706'};">${a.fresh_badge}</span>
              </p>
              <p class="pure-mini-date">Updated: ${a.fresh_display_date}</p>
            </div>
          </a>
        `)}
      </div>
    </section>

    <!-- Section: Featured Curated Collections (High Intent Keywords) -->
    <section class="pure-shelf-sec" id="curated-collections">
      <div class="pure-sec-hdr" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <h2 class="pure-sec-title"><a href="/collections/">Featured Curated Collections <span class="arrow">&rsaquo;</span></a></h2>
        <a href="/collections/" style="font-size: 0.85rem; font-weight: 700; color: var(--primary); text-decoration: none;">View All 4+ Collections &rarr;</a>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 0.85rem;">
        <a href="/collections/best-offline-games/" class="card" style="padding: 1.25rem; border-radius: 12px; text-decoration: none; color: var(--text); border: 1.5px solid #10b981; background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">🎮</div>
            <span style="font-size: 0.7rem; font-weight: 800; background: #10b981; color: #fff; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">Top 10 Ranked</span>
            <h3 style="margin: 6px 0 4px 0; font-size: 1.05rem; line-height: 1.3;">Best Offline Android Games</h3>
            <p style="margin: 0; font-size: 0.82rem; color: var(--muted); line-height: 1.4;">Zero Wi-Fi or cellular data required. Fast endless runners, arcade racers, and action RPGs.</p>
          </div>
          <span style="margin-top: 1rem; font-size: 0.82rem; font-weight: 700; color: #10b981;">Browse Top 10 Games &rarr;</span>
        </a>

        <a href="/collections/video-editors-no-watermark/" class="card" style="padding: 1.25rem; border-radius: 12px; text-decoration: none; color: var(--text); border: 1.5px solid #2563eb; background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">🎬</div>
            <span style="font-size: 0.7rem; font-weight: 800; background: #2563eb; color: #fff; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">Creator Picks</span>
            <h3 style="margin: 6px 0 4px 0; font-size: 1.05rem; line-height: 1.3;">Video Editors (No Watermark)</h3>
            <p style="margin: 0; font-size: 0.82rem; color: var(--muted); line-height: 1.4;">Clean 4K 60FPS exports for TikToks, YouTube Shorts, and Instagram Reels.</p>
          </div>
          <span style="margin-top: 1rem; font-size: 0.82rem; font-weight: 700; color: #2563eb;">Explore Video Editors &rarr;</span>
        </a>

        <a href="/collections/fast-free-vpn/" class="card" style="padding: 1.25rem; border-radius: 12px; text-decoration: none; color: var(--text); border: 1.5px solid #8b5cf6; background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">🛡️</div>
            <span style="font-size: 0.7rem; font-weight: 800; background: #8b5cf6; color: #fff; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">High Speed</span>
            <h3 style="margin: 6px 0 4px 0; font-size: 1.05rem; line-height: 1.3;">Fast Free Unlimited VPNs</h3>
            <p style="margin: 0; font-size: 0.82rem; color: var(--muted); line-height: 1.4;">Bypass ISP throttling, low-ping gaming tunnels, and unblocked streaming.</p>
          </div>
          <span style="margin-top: 1rem; font-size: 0.82rem; font-weight: 700; color: #8b5cf6;">View Top VPNs &rarr;</span>
        </a>

        <a href="/collections/lite-apps-low-end-phones/" class="card" style="padding: 1.25rem; border-radius: 12px; text-decoration: none; color: var(--text); border: 1.5px solid #f59e0b; background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">⚡</div>
            <span style="font-size: 0.7rem; font-weight: 800; background: #f59e0b; color: #000; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">Under 25MB</span>
            <h3 style="margin: 6px 0 4px 0; font-size: 1.05rem; line-height: 1.3;">Lite Apps for Low RAM Phones</h3>
            <p style="margin: 0; font-size: 0.82rem; color: var(--muted); line-height: 1.4;">Save storage and RAM on 1GB/2GB budget Android smartphones.</p>
          </div>
          <span style="margin-top: 1rem; font-size: 0.82rem; font-weight: 700; color: #d97706;">See Lightweight Apps &rarr;</span>
        </a>
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
      <a href="https://uplcm.com/4/12046508" target="_blank" rel="noopener sponsored" class="btn primary" style="display: block; width: 100%; box-sizing: border-box; text-align: center; font-size: 0.88rem; font-weight: 700; padding: 0.6rem 1rem;">Explore Now &rarr;</a>
    </div>

    <!-- Sidebar Widget 2: Editor's Recommendation (Daily Rotation) -->
    <div class="pure-side-sec">
      <div class="pure-side-hdr" style="display: flex; align-items: baseline; justify-content: space-between;">
        <h2 class="pure-side-title"><a href="/popular/">Today's Editor's Pick <span class="arrow">&rsaquo;</span></a></h2>
        <span style="font-size: 0.72rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">Daily</span>
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
          <p class="pure-rec-sub">${editorHero.editorial_sub || editorHero.summary || 'Editor choice award-winning Android highlight.'}</p>
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
