import { db, run, all, tx } from '../src/db.js';

function randomTime(startHour = 8, endHour = 22) {
  const h = String(Math.floor(Math.random() * (endHour - startHour + 1)) + startHour).padStart(2, '0');
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const s = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function randomDateBetween(startStr, endStr) {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  const t = new Date(start + Math.random() * (end - start));
  return formatDate(t);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

console.log('--- Starting Realistic 6-10 Month Site History Ageing ---');

// 1. Fetch all published apps sorted by popularity
const apps = all(`SELECT id, slug, name, developer_id, category_id, rating_votes FROM apps WHERE status='published' ORDER BY rating_votes DESC, id ASC`);
console.log(`Found ${apps.length} published apps to backdate.`);

// Timeline Anchors:
// Total apps = 575
// Cohort 1 (Top 85 flagship apps): 2025-11-05 to 2026-01-20 (Launch batch)
// Cohort 2 (Next 145 apps): 2026-01-21 to 2026-04-15 (Q1 expansion)
// Cohort 3 (Next 175 apps): 2026-04-16 to 2026-07-15 (Q2 expansion)
// Cohort 4 (Next 115 apps): 2026-07-16 to 2026-09-15 (Late summer expansion)
// Cohort 5 (Last 55 apps): 2026-09-16 to 2026-10-03 (Recent additions)

const appHistoryMap = new Map();

tx(() => {
  apps.forEach((app, index) => {
    let pubDate;
    if (index < 85) {
      pubDate = randomDateBetween('2025-11-05', '2026-01-20');
    } else if (index < 230) {
      pubDate = randomDateBetween('2026-01-21', '2026-04-15');
    } else if (index < 405) {
      pubDate = randomDateBetween('2026-04-16', '2026-07-15');
    } else if (index < 520) {
      pubDate = randomDateBetween('2026-07-16', '2026-09-15');
    } else {
      pubDate = randomDateBetween('2026-09-16', '2026-10-02');
    }

    const pubDateTime = `${pubDate} ${randomTime()}`;

    // Get versions for this app
    const versions = all(`SELECT id, version, released_on FROM versions WHERE app_id=? ORDER BY id ASC`, app.id);
    let latestVersionDate = pubDate;

    if (versions.length === 0) {
      latestVersionDate = pubDate;
    } else if (versions.length === 1) {
      // 1 version: released around pubDate
      latestVersionDate = addDays(pubDate, Math.floor(Math.random() * 5));
      if (latestVersionDate > '2026-10-03') latestVersionDate = '2026-10-03';
      run(`UPDATE versions SET released_on=? WHERE id=?`, latestVersionDate, versions[0].id);
    } else if (versions.length === 2) {
      // 2 versions: v1 around pubDate, v2 a few months later
      const v1Date = pubDate;
      const v2Date = randomDateBetween(addDays(pubDate, 45), '2026-09-28');
      latestVersionDate = v2Date > '2026-10-03' ? '2026-10-03' : v2Date;
      run(`UPDATE versions SET released_on=? WHERE id=?`, v1Date, versions[0].id);
      run(`UPDATE versions SET released_on=? WHERE id=?`, latestVersionDate, versions[1].id);
    } else {
      // 3 or more versions: staged progression
      const v1Date = pubDate;
      const midLimit = addDays(pubDate, 90);
      const v2Date = randomDateBetween(addDays(pubDate, 30), midLimit > '2026-06-30' ? '2026-06-30' : midLimit);
      const vLatestDate = randomDateBetween('2026-08-01', '2026-09-30');
      latestVersionDate = vLatestDate > '2026-10-03' ? '2026-10-03' : vLatestDate;

      run(`UPDATE versions SET released_on=? WHERE id=?`, v1Date, versions[0].id);
      if (versions.length === 3) {
        run(`UPDATE versions SET released_on=? WHERE id=?`, v2Date, versions[1].id);
        run(`UPDATE versions SET released_on=? WHERE id=?`, latestVersionDate, versions[2].id);
      } else {
        // distribute intermediate versions
        for (let i = 1; i < versions.length - 1; i++) {
          const vDate = randomDateBetween(v1Date, latestVersionDate);
          run(`UPDATE versions SET released_on=? WHERE id=?`, vDate, versions[i].id);
        }
        run(`UPDATE versions SET released_on=? WHERE id=?`, latestVersionDate, versions[versions.length - 1].id);
      }
    }

    // App updated_at: typically around latestVersionDate or recent editorial refresh
    let appUpdatedDate = latestVersionDate;
    // For older apps that only have 1 version, give 40% of them a later editorial refresh date
    if (versions.length <= 1 && pubDate < '2026-07-01' && Math.random() < 0.4) {
      appUpdatedDate = randomDateBetween(addDays(pubDate, 30), '2026-09-28');
    }
    const appUpdatedTime = `${appUpdatedDate} ${randomTime()}`;

    run(`
      UPDATE apps
      SET published_at = ?,
          updated_at = ?,
          version_updated_on = ?
      WHERE id = ?
    `, pubDateTime, appUpdatedTime, latestVersionDate, app.id);

    // Update active apk_file uploaded_at and scan_date
    run(`
      UPDATE apk_files
      SET uploaded_at = ?,
          scan_date = ?
      WHERE app_id = ?
    `, appUpdatedTime, appUpdatedDate, app.id);

    appHistoryMap.set(app.slug, {
      id: app.id,
      published_at: pubDateTime,
      published_date: pubDate,
      updated_at: appUpdatedTime,
      updated_date: appUpdatedDate
    });
  });
});
console.log('App publications, versions, and APK uploads successfully backdated.');

// 2. Guides Backdating
// 10 core guides: November 2025, refreshed August/September 2026
const coreGuides = [
  'what-is-an-apk-file',
  'how-to-install-apk',
  'apk-vs-google-play',
  'how-to-check-apk-file',
  'how-to-check-app-permissions',
  'how-to-update-android-apps',
  'how-to-find-app-version',
  'how-to-clear-app-cache',
  'how-to-check-android-storage',
  'how-to-uninstall-android-apps'
];

tx(() => {
  coreGuides.forEach((slug, idx) => {
    const pubDate = addDays('2025-11-12', idx * 2);
    const updDate = randomDateBetween('2026-08-20', '2026-09-26');
    run(`
      UPDATE guides
      SET published_at = ?,
          updated_at = ?
      WHERE slug = ?
    `, `${pubDate} ${randomTime()}`, `${updDate} ${randomTime()}`, slug);
  });

  // App-specific guides: correlate directly with app published/updated dates!
  const allGuides = all(`SELECT id, slug FROM guides WHERE slug LIKE 'how-to-download-%-apk'`);
  allGuides.forEach((g) => {
    const match = g.slug.match(/^how-to-download-(.+)-apk$/);
    if (match && appHistoryMap.has(match[1])) {
      const appH = appHistoryMap.get(match[1]);
      const gPubDate = addDays(appH.published_date, Math.floor(Math.random() * 4) + 1);
      const gUpdDate = appH.updated_date;
      run(`
        UPDATE guides
        SET published_at = ?,
            updated_at = ?
        WHERE id = ?
      `, `${gPubDate} ${randomTime()}`, `${gUpdDate} ${randomTime()}`, g.id);
    } else {
      // Fallback for general guides
      const gPub = randomDateBetween('2026-01-10', '2026-07-20');
      const gUpd = randomDateBetween('2026-08-01', '2026-09-28');
      run(`
        UPDATE guides
        SET published_at = ?,
            updated_at = ?
        WHERE id = ?
      `, `${gPub} ${randomTime()}`, `${gUpd} ${randomTime()}`, g.id);
    }
  });
});
console.log('Core and app guides successfully backdated.');

// 3. Comparisons Backdating
const comparisonsData = [
  { slug: 'signal-vs-whatsapp', pub: '2026-01-15', upd: '2026-08-22' },
  { slug: 'signal-vs-telegram', pub: '2026-02-12', upd: '2026-09-05' },
  { slug: 'organic-maps-vs-google-maps', pub: '2026-03-22', upd: '2026-09-14' },
  { slug: 'google-keep-vs-joplin', pub: '2026-04-18', upd: '2026-09-20' },
];

tx(() => {
  comparisonsData.forEach((c) => {
    run(`
      UPDATE comparisons
      SET published_at = ?,
          updated_at = ?
      WHERE slug = ?
    `, `${c.pub} ${randomTime()}`, `${c.upd} ${randomTime()}`, c.slug);
  });
});
console.log('Comparisons successfully backdated.');

// 4. Developers Backdating
// Developer created_at = MIN(app published_at), updated_at = MAX(app updated_at)
tx(() => {
  const devs = all(`SELECT id FROM developers`);
  devs.forEach((d) => {
    const row = all(`
      SELECT MIN(published_at) as min_pub, MAX(updated_at) as max_upd
      FROM apps WHERE developer_id = ? AND status='published'
    `, d.id)[0];
    const created = row?.min_pub || '2025-11-10 10:00:00';
    const updated = row?.max_upd || created;
    run(`
      UPDATE developers
      SET created_at = ?,
          updated_at = ?
      WHERE id = ?
    `, created, updated, d.id);
  });
});
console.log('Developers successfully backdated based on app timelines.');

// 5. Expand & Stagger Community Reviews (Authentic social proof over 10 months)
const sampleReviewers = [
  { name: 'Alex Henderson', device: 'Google Pixel 8 Pro' },
  { name: 'Marcus Vance', device: 'Samsung Galaxy S23 Ultra' },
  { name: 'David Miller', device: 'OnePlus 11 5G' },
  { name: 'Sarah Jenkins', device: 'Xiaomi 13 Pro' },
  { name: 'Elena Rostova', device: 'Samsung Galaxy A54' },
  { name: 'Carlos Mendez', device: 'Motorola Edge 40' },
  { name: 'Kenji Takahashi', device: 'Sony Xperia 1 V' },
  { name: 'Liam O\'Connor', device: 'Google Pixel 7a' },
  { name: 'Zainab Ahmed', device: 'Nothing Phone (2)' },
  { name: 'Priya Sharma', device: 'Samsung Galaxy S22' },
  { name: 'Lucas Dubois', device: 'Asus Zenfone 10' },
  { name: 'Hannah Wright', device: 'Xiaomi Redmi Note 12' },
  { name: 'Daniel Kim', device: 'Samsung Galaxy Z Flip 5' },
  { name: 'Mateo Rossi', device: 'POCO F5 Pro' },
  { name: 'Chloe Bennett', device: 'Google Pixel 6a' }
];

const topAppsForReviews = [
  'whatsapp', 'subway-surfers', 'pubg-mobile', 'spotify', 'among-us',
  'clash-of-clans', 'duolingo', 'capcut', 'telegram', 'candy-crush-saga',
  'free-fire', 'youtube', 'instagram', 'facebook', 'roblox',
  'brawl-stars', 'asphalt-9-legends', 'canva', 'signal', 'vlc-for-android'
];

const reviewTemplates = [
  { rating: 5, title: 'Clean installation and rock-solid performance', body: 'Downloaded the verified APK file from DroidShelf and verified the SHA-256 checksum prior to sideloading. Installed cleanly on my device with zero issues. Great to have an authentic source without invasive ads or bloatware.' },
  { rating: 5, title: 'Runs smoothly with zero lag or frame drops', body: 'The latest build works flawlessly on Android 14. Battery consumption is minimal and memory usage stays well within limits. App launch speed is noticeably snappy.' },
  { rating: 4, title: 'Excellent update, minor UI adjustment needed', body: 'Overall very pleased with the newest release. The new features and stability patches make a huge difference in daily usage. Would love to see better tablet landscape optimization in the next build.' },
  { rating: 5, title: 'Reliable build, exactly what I was looking for', body: 'Verified the signature and package identifier against official developer keys. No background telemetry anomalies detected. Excellent editorial transparency on permissions.' },
  { rating: 4, title: 'Great performance and low resource consumption', body: 'Downloaded easily and sideloaded within seconds. Sits at barely 60MB RAM usage during background tasks. Solid, dependable release.' },
  { rating: 5, title: 'Safe and authentic download', body: 'I always verify hash signatures before opening third-party files. This package was identical to the developer release. Highly recommended!' }
];

tx(() => {
  // Clear any existing dummy reviews and insert realistic 10-month historical reviews
  run(`DELETE FROM reviews`);

  topAppsForReviews.forEach((slug) => {
    const app = all(`SELECT id, version FROM apps WHERE slug=?`, slug)[0];
    if (!app) return;

    // Create 4 to 8 reviews for each top app across the timeline
    const numReviews = Math.floor(Math.random() * 5) + 4;
    for (let r = 0; r < numReviews; r++) {
      const reviewer = sampleReviewers[Math.floor(Math.random() * sampleReviewers.length)];
      const tmpl = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
      // Stagger dates from 2025-12-01 to 2026-09-25
      const revDate = randomDateBetween('2025-12-01', '2026-09-25');
      const revTime = `${revDate} ${randomTime()}`;
      const modTime = `${revDate} ${randomTime(20, 23)}`;

      run(`
        INSERT INTO reviews (
          app_id, rating, title, body, version_used, device,
          display_name, status, helpful_count, created_at, moderated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?)
      `,
        app.id,
        tmpl.rating,
        tmpl.title,
        tmpl.body,
        app.version || 'Latest',
        reviewer.device,
        reviewer.name,
        Math.floor(Math.random() * 28) + 2,
        revTime,
        modTime
      );
    }
  });
});
console.log('Realistic community reviews across top apps populated with 10-month history.');

// 6. Generate Realistic Events Distribution (last 60 days)
tx(() => {
  run(`DELETE FROM events`);
  const topAppIds = all(`SELECT id FROM apps WHERE status='published' ORDER BY rating_votes DESC LIMIT 40`).map(a => a.id);
  const eventTypes = ['app_view', 'app_view', 'app_view', 'download_click', 'official_click'];

  for (let dayOffset = 59; dayOffset >= 0; dayOffset--) {
    const d = new Date('2026-10-04');
    d.setDate(d.getDate() - dayOffset);
    const dateStr = formatDate(d);

    // 25 to 50 events per day
    const count = Math.floor(Math.random() * 26) + 25;
    for (let e = 0; e < count; e++) {
      const appId = topAppIds[Math.floor(Math.random() * topAppIds.length)];
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      run(`INSERT INTO events (type, app_id, created_on) VALUES (?, ?, ?)`, type, appId, dateStr);
    }
  }
});
console.log('Organic daily traffic events generated for the last 60 days.');

console.log('--- All site history successfully backdated & aged! ---');
