import { all } from '../db.js';
import { getApp } from './data.js';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatShortDate(d) {
  if (!d) return 'Oct 16, 2026';
  const str = String(d).slice(0, 10);
  const [y, m, day] = str.split('-').map(Number);
  if (!y || !m || !day) return 'Oct 16, 2026';
  return `${SHORT_MONTHS[m - 1]} ${day}, ${y}`;
}

export function getTodayMeta() {
  const now = new Date();
  const dayEpoch = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
  
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const yDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yy = yDate.getUTCFullYear();
  const ym = String(yDate.getUTCMonth() + 1).padStart(2, '0');
  const yd = String(yDate.getUTCDate()).padStart(2, '0');
  const yesterdayStr = `${yy}-${ym}-${yd}`;

  const twoDaysAgoDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const tdy = twoDaysAgoDate.getUTCFullYear();
  const tdm = String(twoDaysAgoDate.getUTCMonth() + 1).padStart(2, '0');
  const tdd = String(twoDaysAgoDate.getUTCDate()).padStart(2, '0');
  const twoDaysAgoStr = `${tdy}-${tdm}-${tdd}`;

  return {
    now,
    dayEpoch,
    todayStr,
    yesterdayStr,
    twoDaysAgoStr,
    formattedToday: formatShortDate(todayStr),
    formattedYesterday: formatShortDate(yesterdayStr),
    formattedTwoDaysAgo: formatShortDate(twoDaysAgoStr)
  };
}

/**
 * Deterministically pick and rotate apps based on dayEpoch
 */
function rotateList(list, offset, limit) {
  if (!list.length) return [];
  const start = offset % list.length;
  const result = [];
  for (let i = 0; i < limit; i++) {
    result.push(list[(start + i) % list.length]);
  }
  return result;
}

export function getDailyUpdatedGames(limit = 9) {
  const meta = getTodayMeta();
  const allGames = all(`
    SELECT a.id, a.name, a.slug, a.version, a.updated_at, a.version_updated_on, a.app_type,
           c.name AS cat_name, c.slug AS cat_slug, a.rating_score, a.rating_votes, a.size_bytes
    FROM apps a
    JOIN categories c ON c.id=a.category_id
    WHERE a.app_type='game' AND a.status='published'
    ORDER BY a.rating_votes DESC, a.id ASC
  `);

  if (!allGames.length) return [];
  // Rotate by dayEpoch * 5
  const rotated = rotateList(allGames, meta.dayEpoch * 5, limit);

  return rotated.map((game, idx) => {
    let displayDate = meta.formattedToday;
    let badgeText = '🟢 Updated Today';
    let isToday = true;
    let isoDate = meta.todayStr;

    if (idx >= 5 && idx < 8) {
      displayDate = meta.formattedYesterday;
      badgeText = '🟡 Yesterday';
      isToday = false;
      isoDate = meta.yesterdayStr;
    } else if (idx >= 8) {
      displayDate = meta.formattedTwoDaysAgo;
      badgeText = '2 days ago';
      isToday = false;
      isoDate = meta.twoDaysAgoStr;
    }

    return {
      ...game,
      fresh_display_date: displayDate,
      fresh_badge: badgeText,
      is_today: isToday,
      fresh_iso_date: isoDate
    };
  });
}

export function getDailyUpdatedApps(limit = 9) {
  const meta = getTodayMeta();
  const allApps = all(`
    SELECT a.id, a.name, a.slug, a.version, a.updated_at, a.version_updated_on, a.app_type,
           c.name AS cat_name, c.slug AS cat_slug, a.rating_score, a.rating_votes, a.size_bytes
    FROM apps a
    JOIN categories c ON c.id=a.category_id
    WHERE a.app_type='app' AND a.status='published'
    ORDER BY a.rating_votes DESC, a.id ASC
  `);

  if (!allApps.length) return [];
  // Rotate by dayEpoch * 7 + 13
  const rotated = rotateList(allApps, (meta.dayEpoch * 7) + 13, limit);

  return rotated.map((app, idx) => {
    let displayDate = meta.formattedToday;
    let badgeText = '🟢 Updated Today';
    let isToday = true;
    let isoDate = meta.todayStr;

    if (idx >= 5 && idx < 8) {
      displayDate = meta.formattedYesterday;
      badgeText = '🟡 Yesterday';
      isToday = false;
      isoDate = meta.yesterdayStr;
    } else if (idx >= 8) {
      displayDate = meta.formattedTwoDaysAgo;
      badgeText = '2 days ago';
      isToday = false;
      isoDate = meta.twoDaysAgoStr;
    }

    return {
      ...app,
      fresh_display_date: displayDate,
      fresh_badge: badgeText,
      is_today: isToday,
      fresh_iso_date: isoDate
    };
  });
}

export function getDailyCatalogUpdates(limit = 30) {
  const meta = getTodayMeta();
  const allPublished = all(`
    SELECT a.id, a.name, a.slug, a.version, a.updated_at, a.version_updated_on, a.app_type,
           a.summary, a.size_bytes, a.rating_score, a.rating_votes,
           c.name AS cat_name, c.slug AS cat_slug, c.kind AS cat_kind
    FROM apps a
    JOIN categories c ON c.id=a.category_id
    WHERE a.status='published'
    ORDER BY a.rating_votes DESC, a.id ASC
  `);

  if (!allPublished.length) return [];
  const rotated = rotateList(allPublished, (meta.dayEpoch * 9) + 23, limit);

  return rotated.map((app, idx) => {
    let displayDate = meta.formattedToday;
    let badgeText = 'Updated Today';
    let isoDate = meta.todayStr;

    if (idx >= 12 && idx < 22) {
      displayDate = meta.formattedYesterday;
      badgeText = 'Yesterday';
      isoDate = meta.yesterdayStr;
    } else if (idx >= 22) {
      displayDate = meta.formattedTwoDaysAgo;
      badgeText = '2 days ago';
      isoDate = meta.twoDaysAgoStr;
    }

    return {
      ...app,
      updated_at: isoDate,
      version_updated_on: isoDate,
      fresh_display_date: displayDate,
      fresh_badge: badgeText
    };
  });
}

/**
 * Returns freshness metadata for a specific app
 */
export function getAppFreshness(app) {
  if (!app) return null;
  const meta = getTodayMeta();
  
  // Hash app id or slug with dayEpoch to see if it qualifies for today/yesterday
  const val = (app.id * 17 + meta.dayEpoch * 3) % 100;

  if (val < 18) {
    // 18% of apps rotate as "Updated Today"
    return {
      isToday: true,
      isYesterday: false,
      dateStr: meta.formattedToday,
      isoDate: meta.todayStr,
      badgeText: '🟢 Updated Today'
    };
  } else if (val < 36) {
    // 18% rotate as "Updated Yesterday"
    return {
      isToday: false,
      isYesterday: true,
      dateStr: meta.formattedYesterday,
      isoDate: meta.yesterdayStr,
      badgeText: '🟡 Yesterday'
    };
  }

  return {
    isToday: false,
    isYesterday: false,
    dateStr: formatShortDate(app.updated_at || app.version_updated_on),
    isoDate: (app.updated_at || app.version_updated_on || meta.todayStr).slice(0, 10),
    badgeText: null
  };
}

// -------------------------------------------------------------
// Daily Featured Hero Slider Pool (28 top-tier games & apps)
// -------------------------------------------------------------
const HERO_POOL = [
  { slug: 'stumble-guys', subtitle: 'Massive multiplayer knockout party game with 32 players' },
  { slug: 'squad-busters', subtitle: 'Fast-paced multiplayer action starring Supercell legends' },
  { slug: 'pubg-mobile', subtitle: 'Original tactical battle royale mobile combat experience' },
  { slug: 'subway-surfers', subtitle: 'Endless world-tour runner dashing through train tracks' },
  { slug: 'free-fire-max', subtitle: 'Ultra-HD graphics battle royale combat experience' },
  { slug: 'call-of-duty-mobile', subtitle: 'Console-quality multiplayer FPS & Battle Royale' },
  { slug: 'asphalt-9-legends', subtitle: 'Arcade supercar racing with hypercars and nitro boosts' },
  { slug: 'brawl-stars', subtitle: 'Fast-paced 3v3 multiplayer and battle royale brawler' },
  { slug: 'minecraft', subtitle: 'Explore infinite block worlds and build whatever you imagine' },
  { slug: 'roblox', subtitle: 'Infinite virtual universe to create, share, and play' },
  { slug: 'shadow-fight-2', subtitle: 'Martial arts fighting RPG with devastating shadow energy' },
  { slug: 'grid-autosport', subtitle: 'Console-quality AAA pro circuit racing simulator' },
  { slug: 'bike-race-motorcycle-games', subtitle: 'Physics-based motorcycle stunt & racing game' },
  { slug: 'among-us', subtitle: 'Multiplayer social deduction hit game on spaceship Skeld' },
  { slug: 'extreme-car-driving-simulator', subtitle: 'Open-world sports car simulator with realistic drift physics' },
  { slug: 'traffic-tour', subtitle: 'Real-time multiplayer highway racing with cockpit interiors' },
  { slug: 'new-state-mobile', subtitle: 'Next-gen 2051 battle royale with futuristic tactical drones' },
  { slug: 'shadowgun-legends', subtitle: 'Console-grade sci-fi FPS with epic co-op raids' },
  { slug: 'granny', subtitle: 'Cult survival horror game escaping the terrifying house' },
  { slug: 'altos-adventure', subtitle: 'Tranquil alpine snowboarding odyssey across mountain ruins' },
  { slug: 'wcc3-world-cricket-championship-3', subtitle: 'Next-gen motion captured mobile cricket simulation' },
  { slug: 'plague-inc', subtitle: 'Realistic epidemic strategy evolving a global pathogen' },
  { slug: 'dead-trigger-2', subtitle: 'Zombie survival first-person shooter with intense boss fights' },
  { slug: 'gangstar-vegas', subtitle: 'Open-world crime action shooter in the city of sin' },
  { slug: 'kick-the-buddy', subtitle: 'Ultimate interactive stress-relief ragdoll game' },
  { slug: 'robbery-bob', subtitle: 'Comical stealth puzzle game sneaking past security guards' },
  { slug: 'rider', subtitle: 'Neon-lit physics arcade bike racer with wild flips' },
  { slug: 'genshin-impact', subtitle: 'Open-world fantasy adventure RPG across the world of Teyvat' }
];

export function getDailyHeroSlides(limit = 4) {
  const meta = getTodayMeta();
  const offset = (meta.dayEpoch * 4) % HERO_POOL.length;
  const picked = rotateList(HERO_POOL, offset, limit);

  const fallbackApp = getApp('subway-surfers') || getApp('pubg-mobile') || getApp('among-us');
  return picked.map(item => {
    const app = getApp(item.slug) || fallbackApp;
    return {
      app,
      banner: `/screenshots/${app.slug}/1.webp`,
      subtitle: item.subtitle || app.summary || 'Top rated trending Android download'
    };
  });
}

// -------------------------------------------------------------
// Daily Discover Shelf Pool (40 diverse apps & games)
// -------------------------------------------------------------
const DISCOVER_POOL = [
  'stumble-guys', 'windscribe-vpn', 'remini', 'capcut', 'shizuku', 'newpipe', 'subway-surfers', 'signal',
  'squad-busters', 'tunnelbear-vpn', 'inshot', 'files-by-google', 'among-us', 'canva', 'truecaller', 'pubg-mobile',
  'free-fire-max', 'adguard-vpn', 'picsart', 'anydesk-remote-desktop', 'tiktok', 'wireguard', 'zarchiver', 'vlc-for-android',
  'extreme-car-driving-simulator', 'hotspot-shield-vpn', 'snapseed', 'airdroid-remote-access', 'discord', 'speedify-vpn', '8-ball-pool', 'apkmirror-installer',
  'granny', 'touch-vpn', 'vivavideo-video-editor', 'wcc3-world-cricket-championship-3', 'rider', 'secure-vpn', 'brawl-stars', 'opera-mini'
];

export function getDailyDiscoverApps(limit = 8) {
  const meta = getTodayMeta();
  const offset = (meta.dayEpoch * 8) % DISCOVER_POOL.length;
  const pickedSlugs = rotateList(DISCOVER_POOL, offset, limit);

  const apps = [];
  for (const slug of pickedSlugs) {
    const app = getApp(slug);
    if (app) apps.push(app);
  }
  return apps.length >= limit ? apps : apps.concat(getApp('pubg-mobile') ? [getApp('pubg-mobile')] : []);
}

// -------------------------------------------------------------
// Daily Editor's Recommendation (Hero + 8 ranked items)
// -------------------------------------------------------------
const EDITOR_HERO_POOL = [
  { slug: 'drag-racing-classic', sub: 'Classic nitro quarter-mile drag racing with 100M+ drivers worldwide.' },
  { slug: 'stumble-guys', sub: 'Hilarious 32-player knockout party races through chaotic obstacle courses.' },
  { slug: 'altos-adventure', sub: 'Award-winning tranquil alpine snowboarding odyssey across mountain ruins.' },
  { slug: 'plague-inc', sub: 'Acclaimed realistic global strategy simulation evolving a custom pathogen.' },
  { slug: 'traffic-rider', sub: 'First-person highway motorcycle racer with authentic bike engine acoustics.' },
  { slug: 'shadow-fight-2', sub: 'Iconic martial arts RPG blend with smooth silhouette combat animations.' },
  { slug: 'extreme-car-driving-simulator', sub: 'Realistic sports car physics simulator with full open-city exploration.' },
  { slug: 'wcc3-world-cricket-championship-3', sub: 'Authentic mobile cricket experience with professional Hindi & English commentary.' },
  { slug: 'windscribe-vpn', sub: 'Fast and secure VPN with 10GB free monthly bandwidth and Robert ad blocker.' },
  { slug: 'capcut', sub: 'Industry-standard mobile video editing suite with viral templates and music.' },
  { slug: 'files-by-google', sub: 'Smart storage cleaner, duplicate detector, and offline 480Mbps file sharing.' },
  { slug: 'dead-trigger-2', sub: 'Stunning zombie apocalypse FPS with real-time global tournament warfare.' },
  { slug: 'vector', sub: 'Thrilling parkour runner escaping futuristic totalitarian surveillance.' },
  { slug: 'grid-autosport', sub: 'Flawless 60fps console racing port without microtransactions or ads.' },
  { slug: 'subway-surfers', sub: 'World-famous endless runner dodging subway trains and grumpy inspectors.' },
  { slug: 'robbery-bob', sub: 'Comical stealth heist adventure evading guards, dogs, and laser alarms.' }
];

export function getDailyEditorRecommendation() {
  const meta = getTodayMeta();
  const heroItem = EDITOR_HERO_POOL[meta.dayEpoch % EDITOR_HERO_POOL.length];
  const heroApp = getApp(heroItem.slug) || getApp('drag-racing-classic');
  const hero = {
    ...heroApp,
    editorial_sub: heroItem.sub || heroApp.summary || 'Editor choice award-winning Android highlight.'
  };

  const allCandidates = all(`
    SELECT a.name, a.slug, c.name AS cat_name, COALESCE(a.rating_score, 4.8) AS rating_avg
    FROM apps a
    JOIN categories c ON c.id=a.category_id
    WHERE a.status='published' AND a.slug != ?
    ORDER BY a.rating_votes DESC, a.rating_score DESC
    LIMIT 48
  `, hero.slug);

  const list = rotateList(allCandidates, (meta.dayEpoch * 5) + 3, 8);

  return { hero, list };
}

