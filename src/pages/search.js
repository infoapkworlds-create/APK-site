import { html, raw, esc, fmtDate } from '../lib/html.js';
import { page, appGrid, icon, stars, catUrl } from '../layout.js';
import * as D from '../lib/data.js';
import { run } from '../db.js';

export function searchApps(query, { log = true } = {}) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];

  // Record privacy-safe search event
  if (log) {
    try {
      run(`INSERT INTO events (type, detail) VALUES ('search', ?)`, q.slice(0, 50));
    } catch (err) {
      // Ignore event insert errors
    }
  }

  // Pre-filter with SQL for fast candidate retrieval across 10,000 apps
  const pattern = `%${q}%`;
  const apps = D.listApps({
    where: `a.name LIKE ? OR a.slug LIKE ? OR d.name LIKE ? OR c.name LIKE ? OR a.tags LIKE ? OR a.package_name LIKE ?`,
    params: [pattern, pattern, pattern, pattern, pattern, pattern],
    limit: 500,
  });

  return apps
    .map((app) => {
      let score = 0;
      const name = (app.name || '').toLowerCase();
      const dev = (app.dev_name || '').toLowerCase();
      const cat = (app.cat_name || '').toLowerCase();
      const summary = (app.summary || '').toLowerCase();
      const tags = (app.tags || '').toLowerCase();
      const pkg = (app.package_name || '').toLowerCase();

      if (name === q) score += 100;
      else if (name.startsWith(q)) score += 50;
      else if (name.includes(q)) score += 30;

      if (dev.includes(q)) score += 20;
      if (cat.includes(q)) score += 15;
      if (tags.includes(q)) score += 10;
      if (pkg.includes(q)) score += 25;
      if (summary.includes(q)) score += 5;

      return { app, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.app.name.localeCompare(b.app.name))
    .map((x) => x.app);
}

export function searchPage(req) {
  const query = (req.query.get('q') || '').trim();
  const results = query ? searchApps(query) : [];

  const body = html`
<header class="page-head">
  <h1>Search Android Apps and Games</h1>
  <p class="lead">Find applications by name, developer, package identifier, or category.</p>
</header>

<form class="search-page-form" action="/search/" method="get" role="search">
  <div class="search-input-wrap">
    <label class="sr" for="sq">Search term</label>
    <input id="sq" name="q" type="search" value="${query}" placeholder="Search apps, games, developers or categories" required autofocus autocomplete="off" data-suggest>
    <button type="submit" class="btn primary">Search</button>
  </div>
</form>

${query ? html`
<div class="search-summary">
  <h2>Search Results for &ldquo;${query}&rdquo;</h2>
  <p class="muted">${results.length} ${results.length === 1 ? 'match found' : 'matches found'}</p>
</div>

${results.length ? appGrid(results, { date: 'Updated recently' }) : html`
  <div class="no-results card">
    <p>No matching apps found for &ldquo;${query}&rdquo;.</p>
    <p>Suggestions:</p>
    <ul>
      <li>Check your spelling.</li>
      <li>Try broader terms (such as "notes" or "browser").</li>
      <li>Browse our <a href="/categories/">categories</a>.</li>
      <li><a href="/request-app/">Request an app</a> to be cataloged.</li>
    </ul>
  </div>
`}
` : html`
<div class="search-tips card">
  <h2>Search Tips</h2>
  <p>You can search for:</p>
  <ul>
    <li><strong>App names:</strong> e.g., Signal, Firefox, VLC</li>
    <li><strong>Categories:</strong> e.g., Productivity, Security, Maps</li>
    <li><strong>Developers:</strong> e.g., Mozilla, VideoLAN</li>
    <li><strong>Package names:</strong> e.g., org.videolan.vlc</li>
  </ul>
</div>
`}
`;

  return page({
    title: query ? `Search Results for "${query}"` : 'Search Android Apps and Games',
    description: 'Search Android applications and games across our independent catalog. Accurate details, verified links, and direct sources.',
    path: query ? `/search/?q=${encodeURIComponent(query)}` : '/search/',
    index: false, // Internal search result pages are non-indexable per search engine quality guidelines
    crumbs: [['Home', '/'], ['Search', '/search/']],
    body,
  });
}

// JSON API endpoint for autocomplete
export function suggestApi(req) {
  const q = (req.query.get('q') || '').trim().toLowerCase();
  if (!q || q.length < 2) return JSON.stringify([]);

  const results = searchApps(q, { log: false }).slice(0, 6).map((a) => ({
    name: a.name,
    slug: a.slug,
    dev: a.dev_name,
    cat: a.cat_name,
    url: `/apps/${a.slug}/`,
    icon: `/icons/${a.slug}.svg`,
  }));

  return JSON.stringify(results);
}
