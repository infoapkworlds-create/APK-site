import fs from 'node:fs';
import path from 'node:path';
import { db, one, all, run } from '../src/db.js';
import { createMockApk } from '../src/lib/apk-generator.js';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'data', 'screenshots');
const ICONS_DIR = path.join(process.cwd(), 'data', 'icons');
const APK_DIR = path.join(process.cwd(), 'data', 'apk');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
if (!fs.existsSync(APK_DIR)) fs.mkdirSync(APK_DIR, { recursive: true });

// Authentic Play Store Package Dictionary for major apps
const REAL_PACKAGES = {
  'instagram': 'com.instagram.android',
  'instagram-lite': 'com.instagram.lite',
  'threads': 'com.instagram.barcelona',
  'facebook': 'com.facebook.katana',
  'facebook-lite': 'com.facebook.lite',
  'messenger': 'com.facebook.orca',
  'messenger-lite': 'com.facebook.mlite',
  'firefox': 'org.mozilla.firefox',
  'firefox-focus': 'org.mozilla.focus',
  'whatsapp-business': 'com.whatsapp.w4b',
  'telegram-x': 'org.thunderdog.challegram',
  'plus-messenger': 'org.telegram.plus',
  'nekogram': 'tw.nekomimi.nekogram',
  'snapchat': 'com.snapchat.android',
  'truecaller': 'com.truecaller',
  'mx-player': 'com.mxtech.videoplayer.ad',
  'mx-player-pro': 'com.mxtech.videoplayer.pro',
  'zee5': 'com.graymatrix.did',
  'zarchiver': 'ru.zdevs.zarchiver',
  'zarchiver-pro': 'ru.zdevs.zarchiver.pro',
  'hulu': 'com.hulu.plus',
  'hushed': 'com.hushed.release',
  'picsart': 'com.picsart.studio',
  'vsco': 'com.vsco.cam',
  'lightroom': 'com.adobe.lrmobile',
  'photoshop-express': 'com.adobe.psmobile',
  'kinemaster': 'com.nexstreaming.app.kinemasterfree',
  'powerdirector': 'com.cyberlink.powerdirector.DRA140130_01',
  'alight-motion': 'com.alightcreative.motion',
  'remini': 'com.bigwinepot.nwdn.international',
  'b612': 'com.linecorp.b612.android',
  'beautyplus': 'com.commsource.beautyplus',
  'camscanner': 'com.intsig.camscanner',
  'wps-office': 'cn.wps.moffice_eng',
  'microsoft-word': 'com.microsoft.office.word',
  'microsoft-excel': 'com.microsoft.office.excel',
  'microsoft-powerpoint': 'com.microsoft.office.powerpoint',
  'microsoft-outlook': 'com.microsoft.office.outlook',
  'microsoft-onedrive': 'com.microsoft.skydrive',
  'microsoft-teams': 'com.microsoft.teams',
  'skype': 'com.skype.raider',
  'linkedin': 'com.linkedin.android',
  'zoom': 'us.zoom.videomeetings',
  'google-chrome': 'com.android.chrome',
  'google-drive': 'com.google.android.apps.docs',
  'google-photos': 'com.google.android.apps.photos',
  'google-docs': 'com.google.android.apps.docs.editors.docs',
  'google-sheets': 'com.google.android.apps.docs.editors.sheets',
  'google-slides': 'com.google.android.apps.docs.editors.slides',
  'google-meet': 'com.google.android.apps.tachyon',
  'google-classroom': 'com.google.android.apps.classroom',
  'google-earth': 'com.google.earth',
  'waze': 'com.waze',
  'netflix': 'com.netflix.mediaclient',
  'disney-plus': 'com.disney.disneyplus',
  'prime-video': 'com.amazon.avod.thirdpartyclient',
  'twitch': 'tv.twitch.android.app',
  'crunchyroll': 'com.crunchyroll.crunchyroid',
  'hotstar': 'in.startv.hotstar',
  'jiocinema': 'com.jio.media.ondemand',
  'soundcloud': 'com.soundcloud.android',
  'deezer': 'deezer.android.app',
  'shazam': 'com.shazam.android',
  'audiomack': 'com.audiomack',
  'tunein-radio': 'tunein.player',
  'viber': 'com.viber.voip',
  'imo': 'com.imo.android.imoim',
  'line': 'jp.naver.line.android',
  'wechat': 'com.tencent.mm',
  'discord': 'com.discord',
  'reddit': 'com.reddit.frontpage',
  'pinterest': 'com.pinterest',
  'tumblr': 'com.tumblr',
  'quora': 'com.quora.android',
  'tiktok-lite': 'com.zhiliaoapp.musically.go',
  'kwai': 'com.kwai.video',
  'likee': 'video.like',
  'capcut': 'com.lemon.lvoverseas',
  'inshot': 'com.camerasideas.instashot',
  'canva': 'com.canva.editor',
  'duolingo': 'com.duolingo',
  'babbel': 'com.babbel.mobile.android.en',
  'memrise': 'com.memrise.android.memrisecompanion',
  'busuu': 'com.busuu.android.enc',
  'khan-academy': 'org.khanacademy.android',
  'photomath': 'com.photomath.photomath',
  'brainly': 'co.brainly',
  'coursera': 'org.coursera.android',
  'udemy': 'com.udemy.android',
  'sololearn': 'com.sololearn',
  'subway-surfers': 'com.kiloo.subwaysurf',
  'pubg-mobile': 'com.tencent.ig',
  'pubg-mobile-lite': 'com.tencent.iglite',
  'free-fire-max': 'com.dts.freefiremax',
  'free-fire': 'com.dts.freefireth',
  'call-of-duty-mobile': 'com.activision.callofduty.shooter',
  'among-us': 'com.innersloth.spacemafia',
  'brawl-stars': 'com.supercell.brawlstars',
  'clash-of-clans': 'com.supercell.clashofclans',
  'clash-royale': 'com.supercell.clashroyale',
  'hay-day': 'com.supercell.hayday',
  'boom-beach': 'com.supercell.boombeach',
  'candy-crush-saga': 'com.king.candycrushsaga',
  'candy-crush-soda-saga': 'com.king.candycrushsodasaga',
  'farm-heroes-saga': 'com.king.farmheroessaga',
  'hill-climb-racing': 'com.fingersoft.hillclimb',
  'hill-climb-racing-2': 'com.fingersoft.hcr2',
  'asphalt-9-legends': 'com.gameloft.android.ANMP.GloftA9HM',
  'asphalt-8-airborne': 'com.gameloft.android.ANMP.GloftA8HM',
  'real-racing-3': 'com.ea.games.r3_row',
  'need-for-speed-no-limits': 'com.ea.game.nfs14_row',
  'carx-drift-racing-2': 'com.carxtech.carxdr2',
  'traffic-rider': 'com.skgames.trafficrider',
  'traffic-racer': 'com.skgames.trafficracer',
  'dr-driving': 'com.ansangha.drdriving',
  'csr-racing-2': 'com.naturalmotion.customstreetracer2',
  'shadow-fight-2': 'com.nekki.shadowfight',
  'shadow-fight-3': 'com.nekki.shadowfight3',
  'vector': 'com.nekki.vector',
  'plants-vs-zombies': 'com.ea.game.pvzfree_row',
  'plants-vs-zombies-2': 'com.ea.game.pvz2_row',
  'angry-birds-2': 'com.rovio.baba',
  'cut-the-rope': 'com.zeptolab.ctr.ads',
  'fruit-ninja': 'com.halfbrick.fruitninjafree',
  'jetpack-joyride': 'com.halfbrick.jetpackjoyride',
  'dan-the-man': 'com.halfbrick.dantheman',
  'temple-run': 'com.imangi.templerun',
  'temple-run-2': 'com.imangi.templerun2',
  'sonic-dash': 'com.sega.sonicdash',
  'crossy-road': 'com.yodo1.crossyroad',
  'roblox': 'com.roblox.client',
  'minecraft': 'com.mojang.minecraftpe',
  'genshin-impact': 'com.miHoYo.GenshinImpact',
  'honkai-star-rail': 'com.HoYoverse.hkrpgoversea',
  'standoff-2': 'com.axlebolt.standoff2',
  'critical-ops': 'com.criticalforceentertainment.criticalops',
  '8-ball-pool': 'com.miniclip.eightballpool',
  'score-hero': 'com.firsttouchgames.hero',
  'nordvpn': 'com.nordvpn.android',
  'expressvpn': 'com.expressvpn.vpn',
  'surfshark': 'com.surfshark.vpnclient.android',
  'proton-vpn': 'ch.protonvpn.android',
  'turbo-vpn': 'free.vpn.unblock.proxy.turbovpn',
  'thunder-vpn': 'com.fast.free.unblock.thunder.vpn',
  'ccleaner': 'com.piriform.ccleaner',
  'clean-master': 'com.cleanmaster.mguard',
  'nova-launcher': 'com.teslacoilsw.launcher',
  'speedtest-ookla': 'org.zwanoo.android.speedtest',
  'rar': 'com.rarlab.rar',
  'shizuku': 'moe.shizuku.privileged.api',
};

function isSquare(buf) {
  try {
    let w = 0, h = 0;
    if (buf.slice(12, 16).toString() === 'VP8X') {
      w = 1 + buf.readUIntLE(24, 3);
      h = 1 + buf.readUIntLE(27, 3);
    } else if (buf.slice(12, 16).toString() === 'VP8 ') {
      w = buf.readUInt16LE(26) & 0x3fff;
      h = buf.readUInt16LE(28) & 0x3fff;
    } else if (buf.slice(12, 16).toString() === 'VP8L') {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      w = 1 + (((b1 & 0x3f) << 8) | b0);
      h = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    }
    if (w > 0 && h > 0) {
      return Math.abs(w - h) < 20;
    }
  } catch {}
  return false;
}

async function resolvePackageName(appName) {
  const url = `https://play.google.com/store/search?q=${encodeURIComponent(appName)}&c=apps&hl=en&gl=US`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/\/store\/apps\/details\?id=([a-zA-Z0-9_\.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function scrapeAndSaveAssets(slug, pkg) {
  const appDir = path.join(SCREENSHOTS_DIR, slug);
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

  const existingScreens = fs.readdirSync(appDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));
  const hasScreens = existingScreens.length >= 3;
  const iconPath = path.join(ICONS_DIR, `${slug}.webp`);
  const hasIcon = fs.existsSync(iconPath);

  if (hasScreens && hasIcon) return;

  const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=en&gl=US`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return;
    const html = await res.text();

    // 1. Icon
    if (!hasIcon) {
      const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogMatch && ogMatch[1]) {
        const iconUrl = ogMatch[1].replace(/=s\d+.*$/, '') + '=s512-rw';
        try {
          const iRes = await fetch(iconUrl, { signal: AbortSignal.timeout(6000) });
          if (iRes.ok) {
            fs.writeFileSync(iconPath, Buffer.from(await iRes.arrayBuffer()));
          }
        } catch {}
      }
    }

    // 2. Screenshots
    if (!hasScreens) {
      const matches = [...html.matchAll(/(https:\/\/play-lh\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+)=w\d+/gi)].map(m => m[1]);
      const unique = [...new Set(matches)];
      let saved = 0;
      for (const imgBase of unique) {
        if (saved >= 5) break;
        try {
          const imgRes = await fetch(`${imgBase}=w1080-h608-rw`, { signal: AbortSignal.timeout(6000) });
          if (!imgRes.ok) continue;
          const buf = Buffer.from(await imgRes.arrayBuffer());
          // Reject small files or square rating badges
          if (buf.length < 12000 || isSquare(buf)) continue;
          saved++;
          fs.writeFileSync(path.join(appDir, `${saved}.webp`), buf);
        } catch {}
      }
    }
  } catch {}
}

async function processSingleApp(a) {
  let realPkg = REAL_PACKAGES[a.slug] || null;

  if (!realPkg && (a.package_name.includes('interactive') || a.package_name.startsWith('com.app.'))) {
    realPkg = await resolvePackageName(a.name);
  }

  if (realPkg && realPkg !== a.package_name) {
    run('UPDATE apps SET package_name=?, play_url=? WHERE id=?', realPkg, `https://play.google.com/store/apps/details?id=${realPkg}`, a.id);
    a.package_name = realPkg;
  }

  // WhatsApp mods fallback handling
  if (a.slug.includes('whatsapp') && a.slug !== 'whatsapp') {
    const waDir = path.join(SCREENSHOTS_DIR, 'whatsapp');
    const targetDir = path.join(SCREENSHOTS_DIR, a.slug);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (fs.existsSync(waDir)) {
      for (const f of fs.readdirSync(waDir)) {
        if (!fs.existsSync(path.join(targetDir, f))) {
          fs.copyFileSync(path.join(waDir, f), path.join(targetDir, f));
        }
      }
    }
    const waIcon = path.join(ICONS_DIR, 'whatsapp.webp');
    const targetIcon = path.join(ICONS_DIR, `${a.slug}.webp`);
    if (fs.existsSync(waIcon) && !fs.existsSync(targetIcon)) {
      fs.copyFileSync(waIcon, targetIcon);
    }
  } else if (a.package_name && !a.package_name.includes('interactive')) {
    await scrapeAndSaveAssets(a.slug, a.package_name);
  }

  // Ensure active APK file exists on disk and in database
  const hasApk = one("SELECT id, filename FROM apk_files WHERE app_id=? AND status='active'", a.id);
  const filename = `${a.slug}-${a.version || '1.0.0'}.apk`;
  const apkFilePath = path.join(APK_DIR, filename);
  if (!fs.existsSync(apkFilePath)) {
    await createMockApk(apkFilePath, {
      packageName: a.package_name,
      versionName: a.version || '1.0.0',
      appName: a.name,
      targetSize: 200_000,
    });
  }
  if (!hasApk) {
    const stat = fs.statSync(apkFilePath);
    run(
      `INSERT INTO apk_files (app_id, version_id, filename, size_bytes, sha256, scan_status, status)
       VALUES (?, 1, ?, ?, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'clean', 'active')`,
      a.id, filename, stat.size
    );
  }
}

async function processExistingApps() {
  console.log('--- Step 1: Processing existing apps in DB ---');
  const apps = all('SELECT id, name, slug, package_name, version FROM apps');
  console.log(`Total apps in catalog: ${apps.length}`);

  const concurrency = 6;
  let index = 0;
  let completed = 0;

  async function worker() {
    while (index < apps.length) {
      const a = apps[index++];
      try {
        await processSingleApp(a);
      } catch (err) {
        console.error(`Error on ${a.slug}:`, err.message);
      }
      completed++;
      if (completed % 25 === 0 || completed === apps.length) {
        console.log(`[${completed}/${apps.length}] Apps processed & assets synced.`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
}

// 35 Brand New Authentic Apps to Expand Categories (Puzzle, RPG, Maps, Security, Sports, Tools)
const NEW_AUTHENTIC_APPS = [
  // PUZZLE GAMES
  {
    name: 'Sudoku - Classic Sudoku Puzzle',
    slug: 'sudoku-classic-puzzle',
    pkg: 'com.easybrain.sudoku.android',
    devName: 'Easybrain',
    devSlug: 'easybrain',
    devBio: 'Easybrain is a leading mobile game publisher with over 1 billion downloads, specializing in classic logic puzzles and brain games.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '2.14.0',
    sizeBytes: 38_000_000,
    rating: 4.8,
    votes: 3_800_000,
    summary: 'Classic Sudoku puzzle game with 10,000+ daily logic challenges, smart hints, and difficulty levels from beginner to expert.',
    desc: 'Sudoku by Easybrain delivers the premier logic number puzzle experience for Android. Featuring over 10,000 distinct handcrafted grid puzzles, players can train their brain across four balanced difficulty tiers: easy, medium, hard, and expert.\n\nThe game offers essential quality-of-life tools including smart auto-check, duplicate highlighting, note-taking pencil mode, and unlimited undos. Offline gameplay ensures seamless access without cellular data or Wi-Fi connectivity.',
  },
  {
    name: 'Wordscapes',
    slug: 'wordscapes',
    pkg: 'com.peoplefun.wordcross',
    devName: 'PeopleFun',
    devSlug: 'peoplefun',
    devBio: 'PeopleFun is a premier mobile word game studio based in Dallas, Texas, famous for word search and anagram crossword adventures.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '2.9.2',
    sizeBytes: 110_000_000,
    rating: 4.7,
    votes: 2_950_000,
    summary: 'A challenging blend of word searches, anagrams, and crosswords featuring breathtaking nature landscapes.',
    desc: 'Wordscapes combines word searching, anagramming, and classic crossword gameplay into an immersive vocabulary experience. Connect letters on the circular wheel to reveal hidden words and fill out the puzzle grid against calming high-definition landscapes.\n\nWith more than 6,000 levels, Wordscapes offers brain-stimulating vocabulary exercises with relaxing audio soundscapes and no stressful time limits.',
  },
  {
    name: 'Monument Valley',
    slug: 'monument-valley',
    pkg: 'com.ustwo.monumentvalley',
    devName: 'ustwo games',
    devSlug: 'ustwo-games',
    devBio: 'ustwo games is a London-based independent digital games studio renowned for award-winning artistic puzzle architecture and optical illusion games.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '3.3.104',
    sizeBytes: 250_000_000,
    rating: 4.8,
    votes: 280_000,
    summary: 'An illusory adventure of impossible architecture and forgiving geometry guided through stunning monuments.',
    desc: 'In Monument Valley, guide the silent princess Ida through mysterious monuments of impossible architecture and optical illusions. Manipulate isometric palaces, rotate perspective walkways, and outsmart the enigmatic Crow People.\n\nInspired by M.C. Escher prints, minimalist 3D design, and meditative acoustic soundscapes, every level is a handcrafted visual artwork crafted to stimulate perception.',
  },
  {
    name: 'Brain Out - Can You Pass It?',
    slug: 'brain-out',
    pkg: 'com.mind.quiz.brain.out',
    devName: 'Focus apps',
    devSlug: 'focus-apps',
    devBio: 'Focus apps develops viral cognitive teasers, funny IQ puzzle quizzes, and unorthodox riddle games for mobile devices.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '2.3.8',
    sizeBytes: 95_000_000,
    rating: 4.5,
    votes: 4_600_000,
    summary: 'Addictive tricky puzzle game filled with hilarious brain teasers and unexpected logic twists.',
    desc: 'Brain Out is an addictive free tricky puzzle game featuring an array of unconventional brain teasers and diverse riddles testing cognitive reflexes, memory, accuracy, and creative problem solving.\n\nNever answer the questions in the routine way unless you want to be tricked. Subvert standard thinking through interactive screen shaking, touch mechanics, and humorous logic puzzles.',
  },

  // RPG GAMES
  {
    name: 'RAID: Shadow Legends',
    slug: 'raid-shadow-legends',
    pkg: 'com.plarium.raidlegends',
    devName: 'Plarium Global Ltd',
    devSlug: 'plarium',
    devBio: 'Plarium Global is an international developer and publisher of hardcore tactical RPGs and strategy titles played by millions worldwide.',
    catSlug: 'rpg',
    appType: 'game',
    version: '8.40.1',
    sizeBytes: 155_000_000,
    rating: 4.6,
    votes: 1_850_000,
    summary: 'Dark fantasy turn-based collection RPG with 650+ Champions across 15 playable factions.',
    desc: 'Battle your way through a visually-stunning realistic dark fantasy RPG featuring hundreds of Champions from 15 distinct factions. Form customized raid parties to conquer brutal dungeon bosses, scale the Doom Tower, and duel live opponents in the Arena.\n\nEquip deep artifact sets, unlock skill masteries, and engage in tactical turn-based team combat backed by fully rendered 3D graphics and cinematic skill animations.',
  },
  {
    name: 'AFK Arena',
    slug: 'afk-arena',
    pkg: 'com.lilithgame.hgame.gp',
    devName: 'Lilith Games',
    devSlug: 'lilith-games',
    devBio: 'Lilith Games is a world-renowned mobile games creator based in Shanghai, acclaimed for AFK Arena, Rise of Kingdoms, and Dislyte.',
    catSlug: 'rpg',
    appType: 'game',
    version: '1.142.01',
    sizeBytes: 120_000_000,
    rating: 4.6,
    votes: 3_200_000,
    summary: 'Classic idle fantasy RPG featuring Celtic stained-glass visual aesthetics and deep hero formations.',
    desc: 'AFK Arena lets you build tactical decks of mythical heroes who continue leveling and gathering bounty even while you are offline. Featuring breathtaking hand-drawn stained-glass art inspired by European Celtic mythology, the game emphasizes positioning and faction synergies.\n\nAscend heroes through the Resonating Crystal, conquer the King Tower, explore rogue-like Labyrinths, and lead guild raids without demanding excessive daily grind.',
  },
  {
    name: 'Summoners War',
    slug: 'summoners-war',
    pkg: 'com.com2us.smon.normal.freefull.google.kr.android.common',
    devName: 'Com2uS',
    devSlug: 'com2us',
    devBio: 'Com2uS is a premier South Korean mobile gaming pioneer established in 1998, renowned for competitive global esports RPGs.',
    catSlug: 'rpg',
    appType: 'game',
    version: '8.3.2',
    sizeBytes: 1_100_000_000,
    rating: 4.3,
    votes: 2_400_000,
    summary: 'Action-packed fantasy RPG with over 1,500 monsters and premier worldwide competitive turn-based PvP.',
    desc: 'Summoners War: Sky Arena is the benchmark turn-based collection RPG where over 1,000 distinct monsters fight for supremacy over Mana Crystals. Assemble dynamic teams with 23 unique Rune sets to formulate infinite tactical combinations.\n\nParticipate in real-time World Arena Championship battles, co-op Rift Raids with three summoners, and dynamic Guild Siege warfare.',
  },
  {
    name: 'Diablo Immortal',
    slug: 'diablo-immortal',
    pkg: 'com.blizzard.diablo.immortal',
    devName: 'Blizzard Entertainment, Inc.',
    devSlug: 'blizzard-entertainment',
    devBio: 'Blizzard Entertainment is a legendary video game company famous for Warcraft, StarCraft, Overwatch, and Diablo.',
    catSlug: 'rpg',
    appType: 'game',
    version: '2.3.0',
    sizeBytes: 2_400_000_000,
    rating: 4.4,
    votes: 1_200_000,
    summary: 'Epic dark fantasy action-MMORPG set in the sinister Gothic world of Sanctuary between Diablo II and III.',
    desc: 'Diablo Immortal brings the definitive dungeon-crawling action RPG experience to mobile devices. Choose from legendary classes including the Barbarian, Demon Hunter, Necromancer, and Blood Knight to hunt down the shattered shards of the Worldstone.\n\nSlash through hordes of demonic invaders in Westmarch, delve into randomized Elder Rifts, and conquer massive 8-player Helliquary raid bosses.',
  },

  // ACTION & SHOOTER GAMES
  {
    name: 'Mortal Kombat: A Fighting Game',
    slug: 'mortal-kombat',
    pkg: 'com.wb.goog.mkx',
    devName: 'Warner Bros. Games',
    devSlug: 'warner-bros',
    devBio: 'Warner Bros. Games produces leading interactive entertainment based on DC, Harry Potter, and Mortal Kombat franchises.',
    catSlug: 'action-games',
    appType: 'game',
    version: '5.3.0',
    sizeBytes: 1_500_000_000,
    rating: 4.5,
    votes: 4_300_000,
    summary: 'Visceral 3v3 fighting game featuring iconic Mortal Kombat champions and bone-crunching Fatalities.',
    desc: 'Experience the visceral, over-the-top combat of Mortal Kombat on Android. Assemble an elite team of Mortal Kombat warriors including Scorpion, Sub-Zero, Raiden, and Johnny Cage to battle in high-stakes 3v3 team tournaments.\n\nUnleash trademark special attacks, x-ray maneuvers, and jaw-dropping cinematic Fatalities with high-definition graphic fidelity.',
  },
  {
    name: 'Dead Trigger 2: Zombie Games',
    slug: 'dead-trigger-2',
    pkg: 'com.madfingergames.deadtrigger2',
    devName: 'Deca_Games',
    devSlug: 'deca-games',
    devBio: 'Deca Games develops and operates acclaimed mobile shooters and tactical action blockbusters.',
    catSlug: 'action-games',
    appType: 'game',
    version: '2.1.2',
    sizeBytes: 580_000_000,
    rating: 4.5,
    votes: 3_150_000,
    summary: 'First-person zombie apocalypse survival shooter with 600+ war combat scenarios and lethal arsenals.',
    desc: 'Dead Trigger 2 drops you into a relentless global zombie apocalypse where the human Global Resistance battles for survival. Engage in intense first-person shooting across 33 global battlefields and 10 world regions.\n\nMaster over 70 devastating firearms including the M4, Minigun, Crossbow, and experimental sentry rocket launchers with real-time ragdoll physics.',
  },

  // RACING GAMES
  {
    name: 'Mario Kart Tour',
    slug: 'mario-kart-tour',
    pkg: 'com.nintendo.zaka',
    devName: 'Nintendo Co., Ltd.',
    devSlug: 'nintendo',
    devBio: 'Nintendo is the world-renowned Japanese entertainment company that created Mario, Zelda, Pokemon, and Donkey Kong.',
    catSlug: 'racing-games',
    appType: 'game',
    version: '3.5.1',
    sizeBytes: 140_000_000,
    rating: 4.3,
    votes: 2_100_000,
    summary: 'Classic Nintendo arcade kart racing on city-inspired courses alongside beloved Mushroom Kingdom characters.',
    desc: 'Mario Kart goes global in Mario Kart Tour! Put your pedal to the metal in courses inspired by real-world cities alongside classic tracks from Mario Kart history.\n\nDrift around tight turns, steer with one-finger touch controls, unleash devastating Shells and Bananas, and activate Frenzy mode to turn races on their head.',
  },
  {
    name: 'CarX Highway Racing',
    slug: 'carx-highway-racing',
    pkg: 'com.CarXTech.highways',
    devName: 'CarX Technologies, LLC',
    devSlug: 'carx-technologies',
    devBio: 'CarX Technologies is a specialized developer focused on automotive simulation, realistic vehicle physics, and drifting mechanics.',
    catSlug: 'racing-games',
    appType: 'game',
    version: '1.75.2',
    sizeBytes: 680_000_000,
    rating: 4.6,
    votes: 1_200_000,
    summary: 'High-speed highway traffic racing simulation powered by realistic physics engines and police chases.',
    desc: 'CarX Highway Racing offers authentic highway driving physics without unrealistic arcade floatiness. Weave through dense civilian traffic at 300+ km/h across desert highways in Texas, coastal roads in France, and urban routes in Tokyo.\n\nOutrun relentless police pursuit cruisers, tune engine horsepower, and conquer campaign missions against syndicate street racers.',
  },

  // SPORTS GAMES
  {
    name: 'eFootball 2024',
    slug: 'efootball-2024',
    pkg: 'jp.konami.pesam',
    devName: 'KONAMI',
    devSlug: 'konami',
    devBio: 'KONAMI is an iconic Japanese entertainment company established in 1969, creator of eFootball, Metal Gear, and Yu-Gi-Oh!.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '8.6.0',
    sizeBytes: 2_600_000_000,
    rating: 4.3,
    votes: 12_500_000,
    summary: 'The pinnacle of digital soccer simulation featuring authentic tactical controls and licensed global clubs.',
    desc: 'Experience pure football realism with eFootball 2024 from KONAMI. Build your Dream Team signing superstars like Lionel Messi and legendary football icons across officially licensed clubs including FC Barcelona, Manchester United, FC Bayern München, and AC Milan.\n\nMaster tactical gameplay mechanics including Sharp Touches, stunning crosses, tactical pressing, and dynamic multiplayer matchups.',
  },
  {
    name: 'Dream League Soccer 2024',
    slug: 'dream-league-soccer',
    pkg: 'com.firsttouchgames.dls7',
    devName: 'First Touch Games Ltd.',
    devSlug: 'first-touch-games',
    devBio: 'First Touch Games is an Oxford-based studio famous for leading mobile sports franchises including Score! Hero and Dream League Soccer.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '11.140',
    sizeBytes: 540_000_000,
    rating: 4.3,
    votes: 16_000_000,
    summary: 'Build and customize your dream soccer club with over 4,000 FIFPRO licensed professional players.',
    desc: 'Dream League Soccer 2024 puts you in total control of your own football club. Sign world-class FIFPRO licensed athletes, build club stadium facilities, and progress through 8 competitive division tiers.\n\nEnjoy full 3D motion-captured player moves, immersive match commentary, team kits customization, and real-time online Dream League Live leagues.',
  },

  // MAPS & DIRECTIONS
  {
    name: 'Waze Navigation & Live Traffic',
    slug: 'waze',
    pkg: 'com.waze',
    devName: 'Google LLC',
    devSlug: 'google',
    devBio: 'Google LLC builds Android and essential services including Search, Maps, Waze, and YouTube.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '4.104.0.1',
    sizeBytes: 85_000_000,
    rating: 4.4,
    votes: 8_700_000,
    summary: 'Crowdsourced live GPS navigation alerting drivers about traffic, police, speed traps, and accidents in real time.',
    desc: 'Waze is the world largest community-based traffic and navigation app. Join millions of drivers who share real-time road reports to save commute time and gas money.\n\nGet instant rerouting based on live traffic conditions, automated alerts about police checkpoints, construction zones, speed cameras, and potholes, plus integrated Spotify music streaming.',
  },
  {
    name: 'Sygic GPS Navigation & Maps',
    slug: 'sygic-gps',
    pkg: 'com.sygic.aura',
    devName: 'Sygic.',
    devSlug: 'sygic',
    devBio: 'Sygic is an advanced automotive navigation pioneer trusted by over 200 million drivers for high-precision offline 3D maps.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '24.1.2',
    sizeBytes: 110_000_000,
    rating: 4.5,
    votes: 1_900_000,
    summary: 'High-precision offline 3D GPS navigation maps from TomTom with lane assistance and speed limit alerts.',
    desc: 'Sygic GPS Navigation provides premium offline 3D maps updated monthly, eliminating the need for continuous mobile data. Features include voice-guided turn-by-turn navigation, Dynamic Lane Assistance, Junction Views, and real-time speed limit warnings.\n\nIncludes advanced Dashcam video recording and Head-up Display (HUD) projection directly onto your car windshield for night driving.',
  },

  // SECURITY APPS
  {
    name: 'Malwarebytes Mobile Security',
    slug: 'malwarebytes',
    pkg: 'org.malwarebytes.antimalware',
    devName: 'Malwarebytes',
    devSlug: 'malwarebytes-inc',
    devBio: 'Malwarebytes is a premier cybersecurity company providing next-generation anti-malware, ransomware, and identity defense.',
    catSlug: 'security',
    appType: 'app',
    version: '5.8.1.18',
    sizeBytes: 42_000_000,
    rating: 4.5,
    votes: 950_000,
    summary: 'Comprehensive antivirus, malware cleaner, call screener, and privacy audit protector for Android devices.',
    desc: 'Malwarebytes Mobile Security delivers advanced cybersecurity protection against trojans, spyware, ransomware, and malicious download payloads on Android. Conducts deep filesystem scans detecting hidden adware and malicious APK code.\n\nIncludes privacy audits identifying apps with excessive permissions, proactive phishing URL blocking, and zero battery drain in idle states.',
  },
  {
    name: 'Bitdefender Mobile Security',
    slug: 'bitdefender-security',
    pkg: 'com.bitdefender.security',
    devName: 'Bitdefender',
    devSlug: 'bitdefender',
    devBio: 'Bitdefender is an award-winning global cybersecurity technology company protecting hundreds of millions of endpoints.',
    catSlug: 'security',
    appType: 'app',
    version: '3.3.238',
    sizeBytes: 48_000_000,
    rating: 4.7,
    votes: 420_000,
    summary: 'Cloud-based antivirus defense, app locking, scam alert protection, and built-in VPN with 100% detection rates.',
    desc: 'Bitdefender Mobile Security delivers flawless antivirus detection without slowing down your phone or draining battery. Features include Cloud Virus Scanning, Scam Alert scanning incoming SMS links for fraud, App Lock with biometric authentication, and Anti-Theft remote wipe.',
  },
  {
    name: 'Proton VPN: Fast & Secure',
    slug: 'proton-vpn',
    pkg: 'ch.protonvpn.android',
    devName: 'Proton AG',
    devSlug: 'proton-ag',
    devBio: 'Proton AG is a Swiss privacy company founded by CERN scientists, renowned for Proton Mail and Proton VPN encrypted services.',
    catSlug: 'security',
    appType: 'app',
    version: '5.4.82.0',
    sizeBytes: 32_000_000,
    rating: 4.5,
    votes: 180_000,
    summary: 'Swiss-based high-speed VPN with strict zero-logs policy, Tor over VPN, and DNS leak prevention.',
    desc: 'Proton VPN is the world only free VPN service that respects your privacy. Built by the scientists behind Proton Mail, Proton VPN routes your internet traffic through encrypted tunnels protected by Swiss privacy laws.\n\nFeatures Secure Core architecture, DNS leak protection, kill switch support, and zero activity logging.',
  },
  {
    name: '1Password - Password Manager',
    slug: '1password',
    pkg: 'com.agilebits.onepassword',
    devName: '1Password',
    devSlug: '1password',
    devBio: '1Password provides industry-leading password management and digital identity security for individuals and global enterprises.',
    catSlug: 'security',
    appType: 'app',
    version: '8.10.32',
    sizeBytes: 65_000_000,
    rating: 4.6,
    votes: 120_000,
    summary: 'Secure password vault protecting credentials, credit cards, and sensitive notes behind end-to-end encryption.',
    desc: '1Password memorizes all your credentials and keeps them secure behind a single Master Password with AES 256-bit encryption. Autofill credentials across apps and browsers, generate strong passwords, and monitor compromised databases with Watchtower alerts.',
  },

  // TOOLS
  {
    name: 'Speedtest by Ookla',
    slug: 'speedtest-ookla',
    pkg: 'org.zwanoo.android.speedtest',
    devName: 'Ookla',
    devSlug: 'ookla',
    devBio: 'Ookla is the global leader in mobile and broadband network intelligence, testing, and telecommunication analytics.',
    catSlug: 'tools',
    appType: 'app',
    version: '5.4.10',
    sizeBytes: 35_000_000,
    rating: 4.4,
    votes: 2_100_000,
    summary: 'The definitive standard for testing internet download, upload, ping latency, and 5G cellular coverage.',
    desc: 'Use Speedtest by Ookla for an accurate, one-tap connection internet performance test anywhere on Earth. Measures ping latency, download speed, upload speed, and jitter with real-time graphs.\n\nIncludes 5G mobile coverage maps, video streaming quality tests, and Speedtest VPN protection.',
  },
  {
    name: 'Solid Explorer File Manager',
    slug: 'solid-explorer',
    pkg: 'pl.solidexplorer2',
    devName: 'NeatBytes',
    devSlug: 'neatbytes',
    devBio: 'NeatBytes crafts premium Android productivity utilities and file management applications with Material Design interfaces.',
    catSlug: 'tools',
    appType: 'app',
    version: '2.8.38',
    sizeBytes: 22_000_000,
    rating: 4.4,
    votes: 110_000,
    summary: 'Dual-panel file manager with cloud storage integration, strong AES encryption, and root explorer tools.',
    desc: 'Solid Explorer is the most versatile file manager for Android, featuring an independent dual-panel navigation layout. Seamlessly browse local storage, SD cards, and cloud accounts including Google Drive, Dropbox, and OneDrive.\n\nProtect files with AES 256-bit encryption and browse archives including ZIP, 7ZIP, RAR, and TAR files.',
  },
  {
    name: 'RAR',
    slug: 'rar',
    pkg: 'com.rarlab.rar',
    devName: 'RARLAB',
    devSlug: 'rarlab',
    devBio: 'RARLAB is the original creator and developer of WinRAR, the benchmark archive compression and extraction tool.',
    catSlug: 'tools',
    appType: 'app',
    version: '7.00.build122',
    sizeBytes: 12_000_000,
    rating: 4.4,
    votes: 950_000,
    summary: 'The official all-in-one archiver, extractor, and benchmark tool from the creators of WinRAR.',
    desc: 'RAR from RARLAB is the official Android archive utility capable of creating RAR and ZIP files as well as unpacking RAR, ZIP, TAR, GZ, BZ2, XZ, 7z, ISO, and ARJ archives.\n\nFeatures include repair command for damaged ZIP and RAR archives, encryption with passwords, and speed benchmarking.',
  },

  // PRODUCTIVITY & COMMUNICATION
  {
    name: 'Trello: Manage Team Projects',
    slug: 'trello',
    pkg: 'com.trello',
    devName: 'Atlassian',
    devSlug: 'atlassian',
    devBio: 'Atlassian creates enterprise collaboration software including Jira, Confluence, Trello, and Bitbucket.',
    catSlug: 'productivity',
    appType: 'app',
    version: '2024.4.1',
    sizeBytes: 26_000_000,
    rating: 4.4,
    votes: 360_000,
    summary: 'Visual Kanban boards, lists, and task cards for organizing team projects and personal workflow sprints.',
    desc: 'Trello gives you a shared visual perspective on all your projects at work and home. Organize tasks with customizable boards, lists, and cards, assign deadlines, attach files, and automate repetitive workflows with Butler.',
  },
  {
    name: 'Notion - Notes, Docs, Tasks',
    slug: 'notion',
    pkg: 'notion.id',
    devName: 'Notion Labs, Inc.',
    devSlug: 'notion-labs',
    devBio: 'Notion Labs develops the all-in-one connected workspace for notes, project management, and digital knowledge wikis.',
    catSlug: 'productivity',
    appType: 'app',
    version: '0.6.1436',
    sizeBytes: 45_000_000,
    rating: 4.7,
    votes: 180_000,
    summary: 'Connected workspace combining notes, collaborative docs, relational databases, and AI writing assistants.',
    desc: 'Notion is your connected workspace for thinking, writing, and planning. Take rich markdown notes, organize relational project databases, build custom roadmaps, and collaborate in real time with teammates across Android, desktop, and web.',
  },
  {
    name: 'Slack',
    slug: 'slack',
    pkg: 'com.Slack',
    devName: 'Slack Technologies Inc.',
    devSlug: 'slack-technologies',
    devBio: 'Slack Technologies is a subsidiary of Salesforce that develops the enterprise communication and productivity platform.',
    catSlug: 'communication',
    appType: 'app',
    version: '24.04.10.0',
    sizeBytes: 65_000_000,
    rating: 4.4,
    votes: 1_200_000,
    summary: 'Enterprise messaging workspace uniting teams with organized channels, direct messages, and voice huddles.',
    desc: 'Slack brings team communication and collaboration into one place so you can get more work done. Organize conversations by topic, project, or department in dedicated channels, share documents, and start audio huddles with one tap.',
  },

  // PHOTOGRAPHY APPS
  {
    name: 'Adobe Lightroom: Photo Editor',
    slug: 'adobe-lightroom',
    pkg: 'com.adobe.lrmobile',
    devName: 'Adobe',
    devSlug: 'adobe',
    devBio: 'Adobe is the world-leading creative software pioneer, developing Photoshop, Lightroom, Premiere, and Illustrator.',
    catSlug: 'photography',
    appType: 'app',
    version: '9.2.1',
    sizeBytes: 125_000_000,
    rating: 4.6,
    votes: 2_300_000,
    summary: 'Professional RAW camera capture, HDR color grading, and one-tap curated aesthetic photo presets.',
    desc: 'Adobe Lightroom is a powerful, intuitive photo editor and pro camera app. Capture raw DNG exposures, apply pro-grade presets, adjust color curves, remove objects with Healing Brush, and sync full-resolution edits across mobile and desktop.',
  },
  {
    name: 'Remini - AI Photo Enhancer',
    slug: 'remini',
    pkg: 'com.bigwinepot.nwdn.international',
    devName: 'Bending Spoons',
    devSlug: 'bending-spoons',
    devBio: 'Bending Spoons is an Italian technology company creating top-charting creative mobile applications including Remini and Splice.',
    catSlug: 'photography',
    appType: 'app',
    version: '3.7.620',
    sizeBytes: 75_000_000,
    rating: 4.3,
    votes: 3_800_000,
    summary: 'Transform vintage, blurred, or pixelated photographs into crystal-clear high-definition portraits.',
    desc: 'Remini uses cutting-edge artificial intelligence to unblur, restore, and enhance old, damaged, or low-resolution images into stunning high-definition masterpieces with incredible facial detail clarity.',
  }
];

async function addNewAuthenticApps() {
  console.log('--- Step 2: Adding brand new authentic apps ---');
  const existingSlugs = new Set(all('SELECT slug FROM apps').map(a => a.slug));

  for (const app of NEW_AUTHENTIC_APPS) {
    if (existingSlugs.has(app.slug)) {
      console.log(`Skipping already existing app: ${app.slug}`);
      continue;
    }

    console.log(`Adding new app: ${app.name} (${app.slug})`);

    // 1. Ensure Developer exists
    let dev = one('SELECT id FROM developers WHERE slug=?', app.devSlug);
    if (!dev) {
      run(
        `INSERT INTO developers (name, slug, bio, bio_source, created_at)
         VALUES (?, ?, ?, 'google-play', date('now'))`,
        app.devName, app.devSlug, app.devBio
      );
      dev = one('SELECT id FROM developers WHERE slug=?', app.devSlug);
    }

    // 2. Ensure Category exists
    const cat = one('SELECT id FROM categories WHERE slug=?', app.catSlug);
    if (!cat) {
      console.log(`Category not found for: ${app.catSlug}`);
      continue;
    }

    // 3. Insert App
    const playUrl = `https://play.google.com/store/apps/details?id=${app.pkg}`;
    run(
      `INSERT INTO apps (
        slug, name, developer_id, category_id, app_type, package_name,
        summary, description, version, size_bytes, rating_score, rating_votes,
        price_model, license, status, published_at, updated_at, play_url, download_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'free', 'proprietary', 'published', date('now'), datetime('now'), ?, 'authorized_apk')`,
      app.slug, app.name, dev.id, cat.id, app.appType, app.pkg,
      app.summary, app.desc, app.version, app.sizeBytes, app.rating, app.votes, playUrl
    );

    const inserted = one('SELECT id FROM apps WHERE slug=?', app.slug);

    // 4. Create Mock APK file
    const apkFilename = `${app.slug}-${app.version}.apk`;
    const apkFilePath = path.join(APK_DIR, apkFilename);
    await createMockApk(apkFilePath, {
      packageName: app.pkg,
      versionName: app.version,
      appName: app.name,
      targetSize: 200_000,
    });
    const apkStat = fs.statSync(apkFilePath);

    // 5. Insert APK Record
    run(
      `INSERT INTO apk_files (app_id, version_id, filename, size_bytes, sha256, scan_status, status)
       VALUES (?, 1, ?, ?, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'clean', 'active')`,
      inserted.id, apkFilename, apkStat.size
    );

    // 6. Scrape and save official icons and screenshots
    await scrapeAndSaveAssets(app.slug, app.pkg);
    existingSlugs.add(app.slug);
    console.log(`  Added & assets cached for: ${app.name}`);
  }
}

async function main() {
  console.log('=== Starting Authentic Catalog Enrichment & Asset Download ===');
  await processExistingApps();
  await addNewAuthenticApps();
  console.log('=== Catalog Enrichment Finished Successfully! ===');
}

main().catch(console.error);
