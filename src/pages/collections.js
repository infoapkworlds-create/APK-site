import { html, raw, fmtBytes, fmtDate } from '../lib/html.js';
import { page, icon, stars, adNativeWidget, socialShareBar } from '../layout.js';
import { config } from '../config.js';
import * as D from '../lib/data.js';

export const COLLECTIONS = [
  {
    slug: 'best-offline-games',
    title: 'Top 10 Best Offline Android Games (No WiFi or Internet Needed)',
    shortTitle: 'Best Offline Games',
    tag: 'Gamer Favorites',
    desc: 'Play console-grade Android games anywhere without internet connection. Handpicked action, endless runners, racing, and puzzle titles that require zero cellular data.',
    appSlugs: [
      { slug: 'subway-surfers', verdict: 'The undisputed king of casual arcade runners. Vibrant visuals and zero internet required for offline high-score chasing.' },
      { slug: 'shadow-fight-2', verdict: 'Legendary martial arts RPG fighting with fluid animations, lethal weapons, and deep offline campaign mode.' },
      { slug: 'temple-run-2', verdict: 'Classic high-octane 3D temple escaping action with cliff ziplines and offline artifact collection.' },
      { slug: 'hill-climb-racing', verdict: 'Addictive physics-based 2D driving game with dozens of upgradeable vehicles and endless hills.' },
      { slug: 'candy-crush-saga', verdict: 'Millions of delicious match-3 puzzle levels that work seamlessly offline during flights or commutes.' },
      { slug: '8-ball-pool', verdict: 'Play offline practice mode vs AI to sharpen your billiards trick shots without consuming mobile data.' },
      { slug: 'ludo-king', verdict: 'Pass-and-play 4-player local multiplayer board gaming on a single phone screen without internet.' },
      { slug: 'asphalt-8-airborne', verdict: 'Stunning arcade nitro racing featuring licensed hypercars and high-speed stunt ramps.' },
      { slug: 'among-us', verdict: 'Includes local offline WiFi and single-player freeplay mode to learn map vents and tasks.' },
      { slug: 'clash-of-clans', verdict: 'Classic village building and army strategy with single-player goblin campaign offline mechanics.' }
    ]
  },
  {
    slug: 'video-editors-no-watermark',
    title: 'Best Free Video Editors for Android (Clean Exports Without Watermark)',
    shortTitle: 'Video Editors (No Watermark)',
    tag: 'Creator Tools',
    desc: 'Create viral TikToks, YouTube Shorts, and Instagram Reels on Android. Top timeline editors with keyframing, speed curves, chroma key, and watermark-free exports.',
    appSlugs: [
      { slug: 'capcut', verdict: 'The #1 mobile video editor with trending template integration, auto-captions, and clean watermark deletion.' },
      { slug: 'inshot', verdict: 'Intuitive timeline editing, canvas aspect ratio adjustment, and royalty-free audio layering.' },
      { slug: 'picsart', verdict: 'Creative AI video effects, graphic sticker overlays, and multi-track animation editing.' },
      { slug: 'canva', verdict: 'Design YouTube thumbnails and video intros with thousands of free designer templates.' },
      { slug: 'vlc', verdict: 'Plays any video format with 4K hardware acceleration, audio boosting, and subtitle timing adjustments.' },
      { slug: 'mx-player', verdict: 'Powerful multi-core decoding with gesture controls for volume, brightness, and fast-forwarding.' }
    ]
  },
  {
    slug: 'fast-free-vpn',
    title: 'Top Free, Fast & Unlimited VPN Apps for Android (High Privacy)',
    shortTitle: 'Fast Free VPNs',
    tag: 'Security & Privacy',
    desc: 'Bypass ISP throttling, protect your phone on public WiFi hotspots, and access global content with verified high-speed VPN proxies.',
    appSlugs: [
      { slug: 'turbo-vpn', verdict: 'Reliable one-tap connection with high-speed proxy servers optimized for smooth streaming and gaming.' },
      { slug: 'supervpn', verdict: 'Easy one-click connection with global servers and zero registration requirements.' },
      { slug: '1111-cloudflare', verdict: 'Modern DNS-over-HTTPS encryption that boosts mobile internet speeds and prevents ISP snooping.' },
      { slug: 'brave-browser', verdict: 'Built-in privacy shields and tracker blocking that saves bandwidth while encrypting traffic.' }
    ]
  },
  {
    slug: 'lite-apps-low-end-phones',
    title: 'Best Lightweight Lite Apps for Low-End Android Phones (Save RAM & Storage)',
    shortTitle: 'Lite Apps for Low RAM',
    tag: 'Performance Booster',
    desc: 'High-performance official lightweight editions that use under 15MB storage and run smoothly on 1GB/2GB RAM budget Android smartphones.',
    appSlugs: [
      { slug: 'facebook-lite', verdict: 'Full Facebook social experience in a tiny 3MB package optimized for 2G/3G connections.' },
      { slug: 'instagram-lite', verdict: 'Smooth photo sharing and Reels viewing without draining device battery or background RAM.' },
      { slug: 'tiktok-lite', verdict: 'Data-efficient vertical video playback that loads instantly on budget hardware.' },
      { slug: 'spotify-lite', verdict: 'Stream millions of tracks while controlling monthly data consumption limits.' },
      { slug: 'opera-mini', verdict: 'Saves up to 90% mobile data by compressing heavy web pages through cloud servers.' },
      { slug: 'messenger-lite', verdict: 'Fast, lightweight chat client that sends messages instantly without background lag.' }
    ]
  },
  {
    slug: 'region-restricted-apps',
    title: 'Region-Restricted & Global Unlocked APKs (Banned Apps Archive)',
    shortTitle: 'Region-Restricted APKs',
    tag: 'Global Access',
    desc: 'Download authentic, unmodified global APK packages for apps restricted or blocked in specific countries (India, Pakistan, Middle East). 100% genuine developer signatures.',
    appSlugs: [
      { slug: 'tiktok', verdict: 'Authentic global release with full feature access, verified genuine digital cryptographic signature.' },
      { slug: 'capcut', verdict: 'Official global version with trending templates and high-resolution video export capabilities.' },
      { slug: 'pubg-mobile', verdict: 'Global Battle Royale release with international matchmaking and latest seasonal updates.' },
      { slug: 'free-fire', verdict: 'Fast-paced Battle Royale action with active international servers and character abilities.' },
      { slug: 'telegram', verdict: 'Secure cloud messaging with global channels and unblocked file sharing up to 2GB.' },
      { slug: 'truecaller', verdict: 'Global caller ID and spam blocking database trusted by over 300 million users worldwide.' }
    ]
  }
];

export function collectionsHubPage(req) {
  const body = html`
<header class="page-head">
  <h1>Curated Android App Collections</h1>
  <p class="lead">Handpicked, editor-reviewed app roundups for every Android user. Discover top offline games, watermark-free editors, lightweight apps, and region-unlocked releases.</p>
</header>

<div class="collections-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem; margin:2rem 0;">
  ${COLLECTIONS.map((c) => html`
    <article class="card collection-card" style="display:flex; flex-direction:column; justify-content:space-between; padding:1.5rem; border:1px solid var(--border); border-radius:14px; background:var(--bg-surface); transition:transform 0.2s ease, box-shadow 0.2s ease;">
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
          <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; background:#ecfdf5; color:#059669; padding:3px 10px; border-radius:9999px;">${c.tag}</span>
          <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">${c.appSlugs.length} Top Apps</span>
        </div>
        <h2 style="font-size:1.25rem; font-weight:800; margin:0.25rem 0 0.5rem 0;">
          <a href="/collections/${c.slug}/" style="color:var(--text); text-decoration:none;">${c.shortTitle}</a>
        </h2>
        <p style="font-size:0.92rem; color:var(--text-muted); line-height:1.5; margin-bottom:1.25rem;">${c.desc}</p>
      </div>

      <div>
        <div class="collection-icons-preview" style="display:flex; gap:8px; margin-bottom:1.25rem; overflow:hidden;">
          ${c.appSlugs.slice(0, 5).map((item) => {
            const app = D.getApp(item.slug);
            return app ? icon(app, 36) : '';
          })}
        </div>
        <a href="/collections/${c.slug}/" class="btn primary" style="width:100%; text-align:center; padding:0.65rem 1rem; font-size:0.92rem; font-weight:700;">
          Explore Collection &rarr;
        </a>
      </div>
    </article>
  `)}
</div>
`;

  return page({
    title: 'Best Android App Collections & Curated Roundups | APKWorlds',
    description: 'Explore handpicked Android app collections: Best offline games, video editors without watermark, lightweight apps for budget phones, and region-unlocked APKs.',
    path: '/collections/',
    crumbs: [['Home', '/'], ['Collections', '/collections/']],
    body,
  });
}

export function collectionDetailPage(req, slug) {
  const collection = COLLECTIONS.find((c) => c.slug === slug);
  if (!collection) return null;

  const appItems = collection.appSlugs.map((item, idx) => {
    const app = D.getApp(item.slug);
    return { ...item, app, rank: idx + 1 };
  }).filter((item) => item.app !== null);

  const body = html`
<header class="page-head">
  <span style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; background:rgba(37,99,235,0.1); color:#2563eb; padding:4px 12px; border-radius:9999px; display:inline-block; margin-bottom:0.75rem;">${collection.tag}</span>
  <h1 style="font-size:2rem; font-weight:900; margin-bottom:0.5rem;">${collection.title}</h1>
  <p class="lead" style="font-size:1.05rem; color:var(--text-muted); line-height:1.6;">${collection.desc}</p>
</header>

<div class="collection-detail-wrap" style="max-width:860px; margin:2rem auto;">
  <!-- Ranked Apps List -->
  <div class="ranked-list" style="display:flex; flex-direction:column; gap:1.5rem;">
    ${appItems.map((item) => {
      const a = item.app;
      const sizeText = a.size_bytes ? fmtBytes(a.size_bytes) : (a.version ? `v${a.version}` : 'Verified APK');
      return html`
      <div class="card ranked-app-card" style="padding:1.5rem; border:1px solid var(--border); border-radius:14px; background:var(--bg-surface); position:relative;">
        <div style="display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap;">
          <div style="position:relative;">
            <span style="position:absolute; top:-8px; left:-8px; width:26px; height:26px; background:#2563eb; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem; z-index:2; box-shadow:0 2px 6px rgba(37,99,235,0.4);">#${item.rank}</span>
            ${icon(a, 64, false)}
          </div>
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
              <h2 style="font-size:1.35rem; font-weight:800; margin:0;"><a href="/apps/${a.slug}/" style="color:var(--text); text-decoration:none;">${a.name}</a></h2>
              <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted); background:var(--bg-alt); padding:3px 10px; border-radius:6px; border:1px solid var(--border);">${sizeText}</span>
            </div>
            <div style="margin:4px 0 10px 0;">
              ${stars(a.rating_avg, a.review_count)}
              <span style="color:var(--text-light); margin:0 6px;">&bull;</span>
              <span style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">Requires Android ${a.min_android ? a.min_android + '+' : '7.0+'}</span>
            </div>
            <p style="font-size:0.92rem; color:var(--text); margin-bottom:0.75rem; line-height:1.5;">${a.summary}</p>
            <div style="padding:10px 14px; background:rgba(16,185,129,0.06); border-left:3px solid #10b981; border-radius:4px; font-size:0.88rem; color:var(--text); line-height:1.5; margin-bottom:1rem;">
              <strong>Editor's Verdict:</strong> ${item.verdict}
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <a href="/apps/${a.slug}/download/" class="btn primary" style="font-size:0.9rem; padding:0.6rem 1.4rem; display:inline-flex; align-items:center; gap:6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download ${a.name} APK &rarr;
              </a>
              <a href="/apps/${a.slug}/" class="btn secondary" style="font-size:0.85rem; padding:0.6rem 1rem;">View Details</a>
            </div>
          </div>
        </div>
      </div>
      `;
    })}
  </div>

  <div style="margin:2.5rem 0;">
    ${adNativeWidget()}
  </div>

  <!-- Social Share Bar -->
  ${socialShareBar(collection.title, `/collections/${collection.slug}/`, collection.desc)}
</div>
`;

  return page({
    title: `${collection.title} | APKWorlds`,
    description: `${collection.desc.slice(0, 280)}`,
    path: `/collections/${collection.slug}/`,
    crumbs: [['Home', '/'], ['Collections', '/collections/'], [collection.shortTitle, `/collections/${collection.slug}/`]],
    ld: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: collection.title,
        description: collection.desc,
        itemListElement: appItems.map((item) => ({
          '@type': 'ListItem',
          position: item.rank,
          url: `${config.siteUrl}/apps/${item.app.slug}/`,
          name: item.app.name,
        }))
      }
    ],
    body,
  });
}
