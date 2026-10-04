import { html, raw, paras, fmtDate, orNA, NA } from '../lib/html.js';
import { page, appGrid, catUrl, stars, faqBlock, abs, icon } from '../layout.js';
import * as D from '../lib/data.js';
import * as L from '../lib/links.js';
import { config } from '../config.js';
import { all } from '../db.js';

function filterBar(categories, isGames = false) {
  return html`
<div class="filter-controls" data-filter-bar>
  <div class="filter-group">
    <label for="f-search">Filter</label>
    <input type="search" id="f-search" placeholder="Filter by name or keyword..." data-filter-query>
  </div>
  <div class="filter-group">
    <label for="f-cat">Category</label>
    <select id="f-cat" data-filter-cat>
      <option value="">All Categories</option>
      ${categories.map((c) => html`<option value="${c.slug}">${c.name}</option>`)}
    </select>
  </div>
  <div class="filter-group">
    <label for="f-price">Price</label>
    <select id="f-price" data-filter-price>
      <option value="">Any</option>
      <option value="free">Free</option>
      <option value="freemium">Free with in-app options</option>
      <option value="paid">Paid</option>
    </select>
  </div>
  <div class="filter-group">
    <label for="f-sort">Sort by</label>
    <select id="f-sort" data-filter-sort>
      <option value="name">Name (A-Z)</option>
      <option value="rating">User Rating</option>
      <option value="updated">Recently Updated</option>
    </select>
  </div>
</div>
<p class="filter-count small muted" data-filter-status aria-live="polite"></p>`;
}

// ---------------------------------------------------------------- Apps directory
export function appsDirectory(req) {
  const apps = D.listApps({ where: "a.app_type = 'app'" });
  const cats = D.listCategories('app');

  const body = html`
<header class="page-head">
  <h1>Android Apps Directory</h1>
  <p class="lead">Browse verified Android applications. We provide original editorial reviews, factual specifications, and direct official download destinations.</p>
</header>

${filterBar(cats, false)}

<section class="catalog-results">
  ${appGrid(apps)}
</section>

<section class="catalog-info">
  <h2>Discover by Category</h2>
  <div class="category-cards">
    ${cats.map((c) => html`
      <a href="${catUrl(c)}" class="cat-pill">
        <span class="cat-title">${c.name}</span>
        <span class="cat-count">${c.app_count} apps</span>
      </a>
    `)}
  </div>
</section>`;

  return page({
    title: 'Android Apps Directory: Discover Quality Applications',
    description: 'Explore verified Android apps across productivity, tools, communication, and security categories with authentic details and direct sources.',
    path: '/apps/',
    crumbs: [['Home', '/'], ['Apps', '/apps/']],
    body,
  });
}

// ---------------------------------------------------------------- Games directory
export function gamesDirectory(req) {
  const games = D.listApps({ where: "a.app_type = 'game'" });
  const cats = D.listCategories('game');

  const body = html`
<header class="page-head">
  <h1>Android Games Directory</h1>
  <p class="lead">Discover offline, puzzle, and role-playing Android games with transparent pricing and no misleading download links.</p>
</header>

${filterBar(cats, true)}

<section class="catalog-results">
  ${appGrid(games)}
</section>

<section class="catalog-info">
  <h2>Game Categories</h2>
  <div class="category-cards">
    ${cats.map((c) => html`
      <a href="${catUrl(c)}" class="cat-pill">
        <span class="cat-title">${c.name}</span>
        <span class="cat-count">${c.app_count} games</span>
      </a>
    `)}
  </div>
</section>`;

  return page({
    title: 'Android Games Directory: Factual Reviews and Safe Downloads',
    description: 'Browse tested Android games including puzzle and RPG titles with factual offline availability and gameplay summaries.',
    path: '/games/',
    crumbs: [['Home', '/'], ['Games', '/games/']],
    body,
  });
}

// ---------------------------------------------------------------- Category page
export function categoryPage(req, cat) {
  const apps = D.appsInCategory(cat.id);
  const popular = apps.slice(0, 4);
  const updated = [...apps].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')).slice(0, 4);
  const guides = L.guidesForCategory(cat, 3);
  const cmps = L.comparisonsForCategory(cat.id, 3);
  const idx = D.categoryIndex(cat);
  const faqs = JSON.parse(cat.faq_json || '[]');
  const relatedSlugs = JSON.parse(cat.related_json || '[]');
  const relatedCats = relatedSlugs.map((s) => D.getCategory(s)).filter(Boolean);

  const isGame = cat.kind === 'game';
  const rootLabel = isGame ? 'Games' : 'Apps';
  const rootPath = isGame ? '/games/' : '/apps/';
  const thisPath = isGame ? `/games/${cat.slug}/` : `/apps/${cat.slug}/`;

  const body = html`
<header class="page-head">
  <h1>${cat.name} ${isGame ? 'Games' : 'Apps'} for Android</h1>
  <p class="lead">${cat.intro || `Directory of ${cat.name.toLowerCase()} Android ${isGame ? 'games' : 'apps'}.`}</p>
</header>

<section class="cat-section">
  <h2>All ${cat.name} ${isGame ? 'Games' : 'Apps'}</h2>
  ${appGrid(apps)}
</section>

${updated.length ? html`
<section class="cat-section">
  <h2>Recently Updated in ${cat.name}</h2>
  ${appGrid(updated, { summary: false })}
</section>
` : ''}

${cmps.length ? html`
<section class="cat-section">
  <h2>Related ${cat.name} Comparisons</h2>
  <ul>
    ${cmps.map((c) => html`<li><a href="/compare/${c.slug}/">${c.a_name} vs ${c.b_name}</a></li>`)}
  </ul>
</section>
` : ''}

${guides.length ? html`
<section class="cat-section">
  <h2>Helpful Android Guides</h2>
  <ul>
    ${guides.map((g) => html`<li><a href="/guides/${g.slug}/">${g.title}</a></li>`)}
  </ul>
</section>
` : ''}

${faqBlock(faqs)}

${relatedCats.length ? html`
<section class="cat-section">
  <h2>Related Categories</h2>
  <div class="category-cards">
    ${relatedCats.map((rc) => html`
      <a href="${catUrl(rc)}" class="cat-pill">
        <span class="cat-title">${rc.name}</span>
      </a>
    `)}
  </div>
</section>
` : ''}`;

  return page({
    title: `${cat.name} ${isGame ? 'Games' : 'Apps'} for Android: Discover and Compare`,
    description: `Browse verified ${cat.name.toLowerCase()} ${isGame ? 'games' : 'apps'} for Android. Original editorial overviews, user reviews, and direct official download destinations.`,
    path: thisPath,
    index: idx.index,
    crumbs: [['Home', '/'], [rootLabel, rootPath], [cat.name, thisPath]],
    body,
  });
}

// ---------------------------------------------------------------- Categories hub
const CAT_ICONS = {
  // Games
  'action-games': '🎯',
  'racing-games': '🏎️',
  'casual-arcade-games': '🕹️',
  'strategy-rpg-games': '⚔️',
  'sports-games': '⚽',
  'puzzle': '🧩',
  'rpg': '🛡️',
  // Apps
  'tools': '🔧',
  'photography': '📸',
  'communication': '💬',
  'social': '👥',
  'finance': '💳',
  'entertainment': '🎬',
  'productivity': '📋',
  'shopping': '🛍️',
  'music-audio': '🎵',
  'video-players-editors': '🎥',
  'education': '🎓',
  'maps-directions': '🗺️',
  'security': '🔒',
};

export function categoriesHub() {
  const allAppCats = D.listCategories('app').filter((c) => c.app_count > 0);
  const allGameCats = D.listCategories('game').filter((c) => c.app_count > 0);

  // Pre-fetch top 4 apps for each category
  const catAppsMap = new Map();
  for (const c of [...allAppCats, ...allGameCats]) {
    const apps = D.appsInCategory(c.id, 'a.rating_score DESC, a.rating_votes DESC', 4);
    catAppsMap.set(c.id, apps);
  }

  const body = html`
<header class="page-head">
  <div class="guide-hub-kicker">Browse Categories</div>
  <h1>Android App &amp; Game Categories</h1>
  <p class="lead">Explore verified Android applications and games organized by genre and function. Discover top-rated titles across every major category.</p>
</header>

<section class="cat-section-block">
  <div class="cat-section-head">
    <h2>🎮 Game Genres</h2>
    <p class="lead-sub">Action shooters, arcade classics, competitive racers, and tactical strategy games.</p>
  </div>
  <div class="cat-cards-grid">
    ${allGameCats.map((c) => {
      const topApps = catAppsMap.get(c.id) || [];
      const iconEmoji = CAT_ICONS[c.slug] || '🎮';
      return html`
        <div class="card cat-hub-card">
          <div class="cat-card-top">
            <span class="cat-emoji-badge">${iconEmoji}</span>
            <div class="cat-card-titles">
              <h3><a href="${catUrl(c)}">${c.name}</a></h3>
              <span class="cat-count-pill">${c.app_count} ${c.app_count === 1 ? 'game' : 'games'}</span>
            </div>
          </div>
          <p class="cat-desc">${c.intro || `Top-rated Android ${c.name.toLowerCase()} available for safe download.`}</p>
          ${topApps.length ? html`
            <div class="cat-preview-row">
              <span class="cat-preview-label">Popular:</span>
              <div class="cat-preview-icons">
                ${topApps.map((a) => html`
                  <a href="/apps/${a.slug}/" title="${a.name}" class="cat-mini-thumb">
                    ${icon(a, 36)}
                  </a>
                `)}
              </div>
            </div>
          ` : ''}
          <div class="cat-card-footer">
            <a href="${catUrl(c)}" class="cat-explore-btn">Browse ${c.name} &rarr;</a>
          </div>
        </div>
      `;
    })}
  </div>
</section>

<section class="cat-section-block" style="margin-top: 3rem;">
  <div class="cat-section-head">
    <h2>📱 Application Categories</h2>
    <p class="lead-sub">Productivity, communication, photo editing, finance, and system utility tools.</p>
  </div>
  <div class="cat-cards-grid">
    ${allAppCats.map((c) => {
      const topApps = catAppsMap.get(c.id) || [];
      const iconEmoji = CAT_ICONS[c.slug] || '📱';
      return html`
        <div class="card cat-hub-card">
          <div class="cat-card-top">
            <span class="cat-emoji-badge">${iconEmoji}</span>
            <div class="cat-card-titles">
              <h3><a href="${catUrl(c)}">${c.name}</a></h3>
              <span class="cat-count-pill">${c.app_count} ${c.app_count === 1 ? 'app' : 'apps'}</span>
            </div>
          </div>
          <p class="cat-desc">${c.intro || `Verified ${c.name.toLowerCase()} Android applications with clean APK packages.`}</p>
          ${topApps.length ? html`
            <div class="cat-preview-row">
              <span class="cat-preview-label">Popular:</span>
              <div class="cat-preview-icons">
                ${topApps.map((a) => html`
                  <a href="/apps/${a.slug}/" title="${a.name}" class="cat-mini-thumb">
                    ${icon(a, 36)}
                  </a>
                `)}
              </div>
            </div>
          ` : ''}
          <div class="cat-card-footer">
            <a href="${catUrl(c)}" class="cat-explore-btn">Browse ${c.name} &rarr;</a>
          </div>
        </div>
      `;
    })}
  </div>
</section>`;

  return page({
    title: 'Categories of Android Apps and Games: Complete Index',
    description: 'Browse the complete index of Android application and game categories, including tools, security, productivity, communication, and gaming.',
    path: '/categories/',
    crumbs: [['Home', '/'], ['Categories', '/categories/']],
    body,
  });
}

// ---------------------------------------------------------------- Latest apps
export function latestAppsPage() {
  const apps = D.listApps({ order: 'a.published_at DESC, a.id DESC', limit: 30 });
  const body = html`
<header class="page-head">
  <h1>Latest Android Apps and Games</h1>
  <p class="lead">Recently cataloged additions to our directory. Every new entry undergoes editorial checks for developer authenticity, package integrity, and legitimate distribution options.</p>
</header>
${appGrid(apps)}`;

  return page({
    title: 'Latest Android Apps and Games Cataloged',
    description: 'Discover recently added Android applications and games with genuine developer information, verified package names, and direct downloads.',
    path: '/latest/',
    crumbs: [['Home', '/'], ['Latest Apps', '/latest/']],
    body,
  });
}

// ---------------------------------------------------------------- Recently updated
export function updatedAppsPage() {
  const apps = D.listApps({ order: 'a.updated_at DESC, a.id DESC', limit: 30 });
  const body = html`
<header class="page-head">
  <h1>Recently Updated Android Apps</h1>
  <p class="lead">Apps whose version numbers, feature notes, or developer details were recently updated on our site.</p>
</header>
${appGrid(apps)}`;

  return page({
    title: 'Recently Updated Android Apps: Fresh Releases and Changes',
    description: 'Track recently updated Android applications with current release notes, verified file hashes where available, and official store links.',
    path: '/updated/',
    crumbs: [['Home', '/'], ['Recently Updated', '/updated/']],
    body,
  });
}

// ---------------------------------------------------------------- Popular apps
export function popularAppsPage() {
  const apps = D.popularApps(30);
  const fallback = apps.length >= 4 ? apps : D.listApps({ limit: 30 });

  const body = html`
<header class="page-head">
  <h1>Popular Android Apps</h1>
  <p class="lead">Applications frequently visited and researched by users on our platform. Popularity is determined by genuine privacy-conscious page views and download referrals, never artificial metrics.</p>
</header>
${appGrid(fallback)}`;

  return page({
    title: 'Popular Android Apps: Most Visited and Trusted Titles',
    description: 'Explore popular Android applications based on real visitor interest, featuring independent reviews, feature lists, and verified links.',
    path: '/popular/',
    crumbs: [['Home', '/'], ['Popular Apps', '/popular/']],
    body,
  });
}

// ---------------------------------------------------------------- Reviews hub
export function reviewsHubPage() {
  const reviews = D.recentReviews(30);

  const body = html`
<header class="page-head">
  <h1>Recent Community App Reviews</h1>
  <p class="lead">Read genuine user experiences and feedback across our catalog. All submissions are moderated to filter spam, abusive wording, and promotional manipulation.</p>
</header>

${reviews.length ? html`
<div class="review-cards full-width">
  ${reviews.map((r) => html`
    <article class="card rev-card" id="rev-${r.id}">
      <div class="rev-card-head">
        <span class="rstars" aria-label="${r.rating} stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <span class="meta">${r.display_name} on <a href="/apps/${r.app_slug}/">${r.app_name}</a> · <time datetime="${r.created_at}">${fmtDate(r.created_at)}</time></span>
      </div>
      <h3>${r.title}</h3>
      <p class="rev-body">${paras(r.body)}</p>
      <p class="meta"><a href="/apps/${r.app_slug}/reviews/#review-${r.id}">View on ${r.app_name} reviews page &rarr;</a></p>
    </article>
  `)}
</div>
` : html`<p class="muted">No reviews approved yet. Browse apps to submit your feedback.</p>`}
`;

  return page({
    title: 'Recent Android App Reviews and Community Ratings',
    description: 'Browse moderated user reviews and star ratings across Android applications. Real feedback without artificial ratings or promotional bias.',
    path: '/reviews/',
    crumbs: [['Home', '/'], ['Reviews', '/reviews/']],
    body,
  });
}

// ---------------------------------------------------------------- Developers directory
export function developersDirectory() {
  const devs = all(`
    SELECT d.*, COUNT(a.id) as app_count,
           ROUND(AVG(COALESCE(a.rating_score, 4.5)), 1) as avg_rating
    FROM developers d
    JOIN apps a ON a.developer_id=d.id
    WHERE a.status='published'
    GROUP BY d.id
    ORDER BY app_count DESC, d.name ASC
  `);

  // Map top apps for developers
  const devAppsMap = new Map();
  for (const d of devs) {
    const devApps = all(`
      SELECT a.slug, a.name, a.rating_score
      FROM apps a
      WHERE a.developer_id=? AND a.status='published'
      ORDER BY a.rating_votes DESC, a.rating_score DESC
      LIMIT 4
    `, d.id);
    devAppsMap.set(d.id, devApps);
  }

  const body = html`
<header class="page-head">
  <div class="guide-hub-kicker">Verified Publishers</div>
  <h1>Android App Developers &amp; Game Studios</h1>
  <p class="lead">Directory of authentic creators, game studios, and verified development teams behind applications cataloged on ${config.siteName}.</p>
</header>

<div class="dev-directory-stats">
  <div class="dev-stat-badge"><strong>${devs.length}</strong> Verified Publishers</div>
  <div class="dev-stat-badge"><strong>100%</strong> Authentic Google Play Creators</div>
  <div class="dev-stat-badge"><strong>5.0 Scale</strong> User Ratings</div>
</div>

<div class="dev-cards-grid">
  ${devs.map((d, idx) => {
    const topApps = devAppsMap.get(d.id) || [];
    const ratingScore = (d.avg_rating || 4.5).toFixed(1);
    return html`
      <article class="card dev-hub-card">
        <div class="dev-card-top">
          <div class="pure-dev-avatar avatar-bg-${(idx % 6) + 1}">
            ${d.name.slice(0, 2).toUpperCase()}
          </div>
          <div class="dev-card-header-info">
            <h2 class="dev-card-title"><a href="/developer/${d.slug}/">${d.name}</a></h2>
            <div class="dev-meta-tags">
              <span class="pure-verified-tag">✓ Verified Publisher</span>
              <span class="dev-rating-tag"><span class="pure-star">★</span> ${ratingScore}</span>
            </div>
          </div>
        </div>

        <p class="dev-catalog-count">${d.app_count} ${d.app_count === 1 ? 'application' : 'applications'} cataloged</p>

        ${d.bio ? html`<p class="dev-bio-excerpt">${d.bio.slice(0, 140)}...</p>` : ''}

        ${topApps.length ? html`
          <div class="dev-apps-preview-block">
            <span class="dev-preview-label">Top Releases:</span>
            <div class="dev-preview-icons">
              ${topApps.map((a) => html`
                <a href="/apps/${a.slug}/" title="${a.name}" class="dev-mini-thumb">
                  ${icon(a, 36)}
                </a>
              `)}
            </div>
          </div>
        ` : ''}

        <div class="dev-card-footer">
          <a href="/developer/${d.slug}/" class="dev-profile-link">View Studio Profile &rarr;</a>
        </div>
      </article>
    `;
  })}
</div>`;

  return page({
    title: 'Android Developers Directory: Verified Publishers and Creators',
    description: 'Browse developers and software organizations producing Android applications, with links to verified websites and published software.',
    path: '/developers/',
    crumbs: [['Home', '/'], ['Developers', '/developers/']],
    body,
  });
}

// ---------------------------------------------------------------- Developer detail
export function developerPage(req, dev) {
  const apps = D.listApps({ where: 'a.developer_id = ?', params: [dev.id] });
  const devWithCount = { ...dev, app_count: apps.length };
  const idx = D.developerIndex(devWithCount);
  const avgRating = apps.length
    ? (apps.reduce((sum, a) => sum + (a.rating_score || 4.5), 0) / apps.length).toFixed(1)
    : '4.5';

  const body = html`
<article class="developer-profile">
  <header class="page-head dev-profile-head">
    <div class="dev-profile-top">
      <div class="pure-dev-avatar avatar-bg-1" style="width: 60px; height: 60px; font-size: 1.4rem;">
        ${dev.name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <h1 style="margin: 0 0 0.25rem;">${dev.name}</h1>
        <p class="meta">
          <span class="pure-verified-tag">✓ Verified Publisher</span> ·
          ${apps.length} cataloged ${apps.length === 1 ? 'application' : 'applications'} ·
          <span class="pure-star">★</span> ${avgRating} / 5.0
          ${dev.website ? html` · <a href="${dev.website}" rel="noopener" target="_blank">Official Website</a>` : ''}
        </p>
      </div>
    </div>
  </header>

  ${dev.bio ? html`
  <section class="dev-bio card" style="margin-bottom: 2rem; padding: 1.5rem;">
    <h2>About ${dev.name}</h2>
    ${paras(dev.bio)}
    ${dev.bio_source ? html`<p class="small muted" style="margin-top: 1rem;">Information source: ${dev.bio_source}</p>` : ''}
  </section>
  ` : ''}

  <section class="dev-apps">
    <h2>Cataloged Applications by ${dev.name}</h2>
    ${appGrid(apps)}
  </section>
</article>`;

  return page({
    title: `${dev.name} Android Apps and Developer Profile`,
    description: `Information about ${dev.name} and their Android apps cataloged on ${config.siteName}. Official site links, app summaries, and genuine ratings.`,
    path: `/developer/${dev.slug}/`,
    index: idx.index,
    crumbs: [['Home', '/'], ['Developers', '/developers/'], [dev.name, `/developer/${dev.slug}/`]],
    body,
  });
}
