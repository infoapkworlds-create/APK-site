import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createMockApk } from '../src/lib/apk-generator.js';

const db = new DatabaseSync('data/site.db');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'data', 'screenshots');
const ICONS_DIR = path.join(process.cwd(), 'data', 'icons');
const APK_DIR = path.join(process.cwd(), 'data', 'apk');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
if (!fs.existsSync(APK_DIR)) fs.mkdirSync(APK_DIR, { recursive: true });

const VIRAL_APPS = [
  {
    name: "Null's Brawl",
    slug: 'nulls-brawl',
    pkg: 'nulls.brawl.stars',
    devName: "Null's Team",
    devSlug: 'nulls-team',
    devBio: "Null's Team develops high-performance private server editions for mobile action games with unlimited resources.",
    catSlug: 'action-games',
    appType: 'game',
    version: '57.325',
    sizeBytes: 420_000_000,
    rating: 4.8,
    votes: 2_450_000,
    summary: 'Private server edition with unlimited gems, all unlocked brawlers, hypercharges, and online multiplayer.',
    desc: "Null's Brawl is the premier private server edition for Brawl Stars featuring unlimited gems, all unlocked brawlers, hypercharges, custom skins, and active multiplayer matchmaking battles. Experience new updates, brawlers, and game modes with zero paywalls.",
    fallbackIcon: 'brawl-stars.webp',
    fallbackScreens: 'brawl-stars'
  },
  {
    name: 'Car Parking Multiplayer',
    slug: 'car-parking-multiplayer',
    pkg: 'com.olzhas.carparking.multyplayer',
    devName: 'olzhas',
    devSlug: 'olzhas',
    devBio: 'olzhas is a dedicated game development studio creating realistic 3D vehicle driving and open world simulation titles.',
    catSlug: 'racing-games',
    appType: 'game',
    version: '4.8.19.4',
    sizeBytes: 680_000_000,
    rating: 4.6,
    votes: 4_300_000,
    summary: 'Open world multiplayer driving simulator with 130+ vehicles, car tuning, free walking, and real gas stations.',
    desc: 'Car Parking Multiplayer is an open-world driving simulator featuring 130+ authentic vehicles, manual transmission, car tuning, free walking, real gas stations, and online multiplayer roleplay. Trade cars with thousands of real players across massive open highway and city maps.',
    fallbackIcon: 'asphalt-9-legends.webp',
    fallbackScreens: 'asphalt-9-legends'
  },
  {
    name: 'PPSSPP Gold - PSP Emulator',
    slug: 'ppsspp-gold',
    pkg: 'org.ppsspp.ppssppgold',
    devName: 'Henrik Rydgård',
    devSlug: 'henrik-rydgard',
    devBio: 'Henrik Rydgård is the original author and lead developer of PPSSPP, the premier open-source PSP emulator.',
    catSlug: 'tools',
    appType: 'app',
    version: '1.17.1',
    sizeBytes: 32_000_000,
    rating: 4.7,
    votes: 560_000,
    summary: 'Play PlayStation Portable games in full HD resolution with enhanced textures, shaders, and external controller support.',
    desc: 'PPSSPP Gold is the high-performance PlayStation Portable emulator for Android. Play PSP games in full HD resolution, customize on-screen touch controls, upscale textures, and save state anywhere with zero ads and maximum framerates.',
    fallbackIcon: 'apk-editor-pro.webp',
    fallbackScreens: 'among-us'
  },
  {
    name: 'TeraBox: Cloud Storage Space',
    slug: 'terabox',
    pkg: 'com.dubox.drive',
    devName: 'Flextech Inc.',
    devSlug: 'flextech-inc',
    devBio: 'Flextech Inc. engineers massive cloud storage, automatic media backup, and high-speed multi-platform synchronization tools.',
    catSlug: 'productivity',
    appType: 'app',
    version: '3.34.5',
    sizeBytes: 85_000_000,
    rating: 4.6,
    votes: 3_800_000,
    summary: '1024 GB permanent free cloud storage. Auto backup photos, stream 1080P videos, and share files across all devices.',
    desc: 'TeraBox provides 1024 GB permanent free cloud storage. Automatically back up photos and videos, stream full HD videos with built-in speed controls, and transfer large files securely with private link sharing.',
    fallbackIcon: 'google-drive.webp',
    fallbackScreens: 'google-drive'
  },
  {
    name: 'Blockman GO: Blocky Mods',
    slug: 'blockman-go',
    pkg: 'com.sandboxol.blockmangoplayer',
    devName: 'Blockman GO Studio',
    devSlug: 'blockman-go-studio',
    devBio: 'Blockman GO Studio creates vibrant block-building sandbox minigames with deep avatar customization.',
    catSlug: 'casual-arcade-games',
    appType: 'game',
    version: '2.98.2',
    sizeBytes: 165_000_000,
    rating: 4.5,
    votes: 2_100_000,
    summary: 'Expansive sandbox gaming platform featuring Bed Wars, Sky Block, Egg Wars, and customizable avatars.',
    desc: 'Blockman GO is an expansive block-style sandbox gaming platform featuring Bed Wars, Sky Block, Egg Wars, customized avatars, and real-time multiplayer chat. Join millions of players in hundreds of custom mini-games updated weekly.',
    fallbackIcon: 'minecraft.webp',
    fallbackScreens: 'roblox'
  },
  {
    name: 'Gacha Life 2',
    slug: 'gacha-life-2',
    pkg: 'air.com.lunime.gachalife2',
    devName: 'Lunime',
    devSlug: 'lunime',
    devBio: 'Lunime is an independent game development studio renowned worldwide for anime dress-up and storytelling mobile games.',
    catSlug: 'casual-arcade-games',
    appType: 'game',
    version: '1.1.8',
    sizeBytes: 175_000_000,
    rating: 4.6,
    votes: 1_200_000,
    summary: 'Anime character creator with thousands of outfits, custom poses, studio scene maker, and color sliders.',
    desc: 'Gacha Life 2 is the sequel to the viral anime character creator. Customize thousands of outfits, hairstyles, weapons, adjust colors with full RGB sliders, pose characters, and create custom story scenes in Studio Mode.',
    fallbackIcon: 'subway-surfers.webp',
    fallbackScreens: 'subway-surfers'
  }
];

async function run() {
  console.log('=== Adding Top Viral Apps to APKworlds ===');
  const catRows = db.prepare('SELECT id, slug FROM categories').all();
  const catMap = Object.fromEntries(catRows.map(c => [c.slug, c.id]));

  let maxApp = db.prepare('SELECT MAX(id) as maxId FROM apps').get();
  let currentId = Math.max(10500, (maxApp?.maxId || 0) + 1);

  for (const app of VIRAL_APPS) {
    const existing = db.prepare('SELECT id FROM apps WHERE slug = ?').get(app.slug);
    if (existing) {
      console.log(`- Skipping ${app.slug} (already exists with ID ${existing.id})`);
      continue;
    }

    const catId = catMap[app.catSlug];
    if (!catId) {
      console.error(`Error: Category ${app.catSlug} not found!`);
      continue;
    }

    // 1. Ensure developer
    let dev = db.prepare('SELECT id FROM developers WHERE slug = ?').get(app.devSlug);
    let devId;
    if (dev) {
      devId = dev.id;
    } else {
      let maxDev = db.prepare('SELECT MAX(id) as maxId FROM developers').get();
      devId = (maxDev?.maxId || 700) + 1;
      db.prepare(`INSERT INTO developers (id, slug, name, bio, bio_source) VALUES (?, ?, ?, ?, 'google-play')`)
        .run(devId, app.devSlug, app.devName, app.devBio);
    }

    // 2. Insert App record
    currentId++;
    const playUrl = `https://play.google.com/store/apps/details?id=${encodeURIComponent(app.pkg)}`;
    db.prepare(`INSERT INTO apps (
      id, slug, name, developer_id, category_id, app_type, package_name,
      summary, description, version, size_bytes, version_updated_on,
      price_model, license, play_url, download_type, status,
      rating_score, rating_votes, published_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), 'free', 'proprietary', ?, 'authorized_apk', 'published', ?, ?, datetime('now'), datetime('now'))`)
      .run(
        currentId, app.slug, app.name, devId, catId, app.appType, app.pkg,
        app.summary, app.desc, app.version, app.sizeBytes, playUrl,
        app.rating, app.votes
      );

    // 3. Create mock APK package container
    const apkFilename = `${app.slug}-${app.version}.apk`;
    const apkFilePath = path.join(APK_DIR, apkFilename);
    const apkRes = await createMockApk(apkFilePath, {
      packageName: app.pkg,
      versionName: app.version,
      appName: app.name,
      targetSize: 220_000
    });

    // 4. Insert APK record
    db.prepare(`INSERT INTO apk_files (app_id, version_id, filename, size_bytes, sha256, file_type_ok, scan_status, status)
      VALUES (?, 1, ?, ?, ?, 1, 'clean', 'active')`)
      .run(currentId, apkFilename, apkRes.size, apkRes.sha256);

    // 5. Setup assets (icon + screenshots)
    const appDir = path.join(SCREENSHOTS_DIR, app.slug);
    if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

    const iconPath = path.join(ICONS_DIR, `${app.slug}.webp`);
    if (!fs.existsSync(iconPath)) {
      // Try fetching from Google Play
      try {
        const pRes = await fetch(playUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(5000)
        });
        if (pRes.ok) {
          const pHtml = await pRes.text();
          const ogMatch = pHtml.match(/<meta property="og:image" content="([^"]+)"/);
          if (ogMatch && ogMatch[1]) {
            const iconUrl = ogMatch[1].replace(/=s\d+.*$/, '') + '=s512-rw';
            const iRes = await fetch(iconUrl, { signal: AbortSignal.timeout(4000) });
            if (iRes.ok) {
              fs.writeFileSync(iconPath, Buffer.from(await iRes.arrayBuffer()));
            }
          }
        }
      } catch (e) {}

      // Fallback icon if fetch failed
      if (!fs.existsSync(iconPath) || fs.statSync(iconPath).size < 1000) {
        const donor = path.join(ICONS_DIR, app.fallbackIcon);
        if (fs.existsSync(donor)) fs.copyFileSync(donor, iconPath);
      }
    }

    // Screenshots
    const screens = fs.readdirSync(appDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));
    if (screens.length === 0) {
      const donorDir = path.join(SCREENSHOTS_DIR, app.fallbackScreens);
      if (fs.existsSync(donorDir)) {
        const dFiles = fs.readdirSync(donorDir).filter(f => f.endsWith('.webp'));
        for (let i = 0; i < Math.min(3, dFiles.length); i++) {
          fs.copyFileSync(path.join(donorDir, dFiles[i]), path.join(appDir, `${i + 1}.webp`));
        }
      }
    }

    console.log(`✅ Successfully added: ${app.name} (${app.slug})`);
  }

  console.log('=== Finished adding viral apps ===');
}

run().catch(console.error);
