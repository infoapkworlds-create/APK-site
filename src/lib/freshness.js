import { all } from '../db.js';

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
