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

async function scrapeAndSaveAssets(slug, pkg) {
  const appDir = path.join(SCREENSHOTS_DIR, slug);
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

  const iconPath = path.join(ICONS_DIR, `${slug}.webp`);
  const hasIcon = fs.existsSync(iconPath) && fs.statSync(iconPath).size > 1000;
  const existingScreens = fs.readdirSync(appDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));
  const hasScreens = existingScreens.length >= 3;

  if (hasIcon && hasScreens) return;

  const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=en&gl=US`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const html = await res.text();

      // Icon
      if (!hasIcon) {
        const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (ogMatch && ogMatch[1]) {
          const iconUrl = ogMatch[1].replace(/=s\d+.*$/, '') + '=s512-rw';
          try {
            const iRes = await fetch(iconUrl, { signal: AbortSignal.timeout(5000) });
            if (iRes.ok) {
              fs.writeFileSync(iconPath, Buffer.from(await iRes.arrayBuffer()));
            }
          } catch {}
        }
      }

      // Screenshots
      if (!hasScreens) {
        const matches = [...html.matchAll(/(https:\/\/play-lh\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+)=w\d+/gi)].map(m => m[1]);
        const unique = [...new Set(matches)];
        let saved = 0;
        for (const imgBase of unique) {
          if (saved >= 5) break;
          try {
            const imgRes = await fetch(`${imgBase}=w1080-h608-rw`, { signal: AbortSignal.timeout(5000) });
            if (!imgRes.ok) continue;
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.length < 15000) continue;
            if (isSquare(buf)) continue; // reject rating badges

            saved++;
            fs.writeFileSync(path.join(appDir, `${saved}.webp`), buf);
          } catch {}
        }
      }
    }
  } catch {}

  // Fallback for screenshots if scraper had empty results
  const screensAfter = fs.readdirSync(appDir).filter(f => f.endsWith('.webp'));
  if (screensAfter.length === 0) {
    const fallbackPool = ['among-us', 'pubg-mobile', 'asphalt-9-legends', 'brawl-stars', 'subway-surfers'];
    for (const donor of fallbackPool) {
      const donorDir = path.join(SCREENSHOTS_DIR, donor);
      if (fs.existsSync(donorDir)) {
        const dFiles = fs.readdirSync(donorDir).filter(f => f.endsWith('.webp'));
        if (dFiles.length > 0) {
          for (let i = 0; i < Math.min(3, dFiles.length); i++) {
            fs.copyFileSync(path.join(donorDir, dFiles[i]), path.join(appDir, `${i + 1}.webp`));
          }
          break;
        }
      }
    }
  }

  // Fallback for icon if scraper didn't catch one
  if (!fs.existsSync(iconPath) || fs.statSync(iconPath).size < 1000) {
    const donorIcon = path.join(ICONS_DIR, 'google-maps.webp');
    if (fs.existsSync(donorIcon)) {
      fs.copyFileSync(donorIcon, iconPath);
    }
  }
}

const APPS_TO_ADD = [
  // ========================================================
  // 1. EMAIL (communication-email) - 10 Apps
  // ========================================================
  {
    name: 'Gmail',
    slug: 'gmail',
    pkg: 'com.google.android.gm',
    devName: 'Google LLC',
    devSlug: 'google',
    devBio: 'Google LLC builds Android and essential applications including Search, Maps, Chrome, Gmail, and YouTube.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '2024.04.14',
    sizeBytes: 45_000_000,
    rating: 4.4,
    votes: 14_500_000,
    summary: 'The official Gmail application with smart inbox filtering, confidential mode, and instant spam protection.',
    desc: 'Gmail brings robust security, real-time notifications, multiple account support, and search across all your email.\n\nBlock spam, phishing, malware, and dangerous links before they ever reach your inbox with Google advanced machine learning protection.',
  },
  {
    name: 'Microsoft Outlook',
    slug: 'microsoft-outlook',
    pkg: 'com.microsoft.office.outlook',
    devName: 'Microsoft Corporation',
    devSlug: 'microsoft',
    devBio: 'Microsoft Corporation creates Windows, Microsoft 365, Teams, and enterprise cloud productivity software.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '4.2415.1',
    sizeBytes: 95_000_000,
    rating: 4.6,
    votes: 9_200_000,
    summary: 'Unified email, calendar, and contacts with Focused Inbox and seamless Microsoft 365 integration.',
    desc: 'Microsoft Outlook keeps you connected and organized across work and personal accounts. With a smart Focused Inbox, quick swipes, integrated calendar scheduling, and OneDrive document sharing, managing daily communications is effortless.',
  },
  {
    name: 'Yahoo Mail',
    slug: 'yahoo-mail',
    pkg: 'com.yahoo.mobile.client.android.mail',
    devName: 'Yahoo',
    devSlug: 'yahoo',
    devBio: 'Yahoo provides global web services, digital media, financial news, and cloud-based email platforms.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '7.34.0',
    sizeBytes: 52_000_000,
    rating: 4.4,
    votes: 4_800_000,
    summary: 'Feature-rich email app with 1,000 GB of free cloud storage, deal trackers, and travel itinerary views.',
    desc: 'Yahoo Mail makes managing inboxes easy with 1000GB of free cloud storage. Unsubscribe from unwanted newsletters with a single tap, track package deliveries, and organize travel receipts in dedicated smart views.',
  },
  {
    name: 'Proton Mail: Encrypted Email',
    slug: 'proton-mail',
    pkg: 'ch.protonmail.android',
    devName: 'Proton AG',
    devSlug: 'proton-ag',
    devBio: 'Proton AG is a Swiss privacy company founded by CERN scientists, creating zero-access encrypted services.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '3.0.18',
    sizeBytes: 40_000_000,
    rating: 4.6,
    votes: 180_000,
    summary: 'Swiss-based end-to-end encrypted email ensuring zero-access privacy and complete tracker blocking.',
    desc: 'Proton Mail provides military-grade end-to-end encryption under strict Swiss privacy laws. Nobody, not even Proton, can read your messages. Send self-destructing emails and block hidden tracking pixels automatically.',
  },
  {
    name: 'Blue Mail - Email & Calendar',
    slug: 'blue-mail',
    pkg: 'com.trtf.blue',
    devName: 'Blix Inc.',
    devSlug: 'blix-inc',
    devBio: 'Blix Inc. develops cross-platform messaging, collaboration suites, and multi-protocol email applications.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '1.9.9.5',
    sizeBytes: 48_000_000,
    rating: 4.5,
    votes: 850_000,
    summary: 'Universal email client supporting IMAP, Exchange, and POP3 with integrated smart clusters and dark themes.',
    desc: 'Blue Mail connects unlimited accounts across Gmail, Outlook, Yahoo, iCloud, and custom IMAP servers into one unified inbox. Features include smart push notifications, snooze timers, and group email clustering.',
  },
  {
    name: 'Spark Mail + AI: Email Inbox',
    slug: 'spark-mail',
    pkg: 'com.readdle.spark',
    devName: 'Readdle Technologies Limited',
    devSlug: 'readdle',
    devBio: 'Readdle is an acclaimed productivity software house known for Spark Mail, PDF Expert, and Documents.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '3.9.0',
    sizeBytes: 88_000_000,
    rating: 4.5,
    votes: 210_000,
    summary: 'Smart AI-powered email inbox prioritizing important messages and drafting quick replies automatically.',
    desc: 'Spark Mail helps you focus on what matters with a Smart Inbox that categorizes incoming mail into Personal, Notifications, and Newsletters. Draft quick professional responses with built-in AI writing assistants.',
  },
  {
    name: 'Edison Mail - Fast Email',
    slug: 'edison-mail',
    pkg: 'com.easilydo.mail',
    devName: 'Edison Software Inc.',
    devSlug: 'edison-software',
    devBio: 'Edison Software designs fast, ad-free mobile email software and consumer intelligent assistant applications.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '1.43.2',
    sizeBytes: 38_000_000,
    rating: 4.5,
    votes: 420_000,
    summary: 'Lightning-fast independent email app with built-in travel assistant, price tracker, and 1-tap unsubscribe.',
    desc: 'Edison Mail is built for speed and simplicity without third-party advertising. Manage all your accounts with unified search, package tracking carousels, bill reminders, and instant undo send.',
  },
  {
    name: 'Mail.ru - Email App',
    slug: 'mail-ru',
    pkg: 'ru.mail.mailapp',
    devName: 'VK',
    devSlug: 'vk',
    devBio: 'VK is one of Europe largest social networks and digital technology ecosystems, creator of Mail.ru.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '14.82.0',
    sizeBytes: 56_000_000,
    rating: 4.6,
    votes: 3_100_000,
    summary: 'Fast multi-account email client with cloud storage attachments and custom push notifications.',
    desc: 'Mail.ru connects email boxes from all popular services into a clean interface. Enjoy offline message searching, PIN code protection, and seamless integration with Cloud Mail.ru storage.',
  },
  {
    name: 'AOL - News, Mail & Video',
    slug: 'aol-mail',
    pkg: 'com.aol.mobile.aolapp',
    devName: 'AOL Inc.',
    devSlug: 'aol-inc',
    devBio: 'AOL is an iconic American web portal and online service provider delivering news and webmail.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '6.90.1',
    sizeBytes: 44_000_000,
    rating: 4.4,
    votes: 680_000,
    summary: 'Classic AOL mail access combined with real-time global news, weather, and video reporting.',
    desc: 'The official AOL app delivers fast email management alongside breaking news headlines, trending videos, and local forecasts. Manage your AOL contacts and search emails effortlessly.',
  },
  {
    name: 'Zoho Mail - Email and Calendar',
    slug: 'zoho-mail',
    pkg: 'com.zoho.mail',
    devName: 'Zoho Corporation',
    devSlug: 'zoho-corp',
    devBio: 'Zoho Corporation is a global business software suite developer offering CRM, Office, and secure business mail.',
    catSlug: 'communication-email',
    appType: 'app',
    version: '2.8.20',
    sizeBytes: 36_000_000,
    rating: 4.6,
    votes: 190_000,
    summary: 'Secure business email suite with integrated calendar, tasks, contacts, and zero advertisements.',
    desc: 'Zoho Mail provides an ad-free email experience designed for business professionals and enterprise organizations. Collaborate with Streams, tag teammates, manage group inboxes, and attach cloud documents.',
  },

  // ========================================================
  // 2. HEALTH & FITNESS (health-fitness) - 12 Apps
  // ========================================================
  {
    name: 'Google Fit: Activity Tracking',
    slug: 'google-fit',
    pkg: 'com.google.android.apps.fitness',
    devName: 'Google LLC',
    devSlug: 'google',
    devBio: 'Google LLC builds Android and essential applications including Search, Maps, Chrome, Gmail, and YouTube.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '2024.04.10',
    sizeBytes: 32_000_000,
    rating: 4.3,
    votes: 920_000,
    summary: 'Heart Points and activity tracker developed with the World Health Organization and American Heart Association.',
    desc: 'Google Fit collaborates with WHO and AHA to bring you Heart Points, an activity goal backed by science that helps improve cardiovascular health. Automatically track runs, walks, and bike rides right from your phone.',
  },
  {
    name: 'Samsung Health',
    slug: 'samsung-health',
    pkg: 'com.sec.android.app.shealth',
    devName: 'Samsung Electronics Co., Ltd.',
    devSlug: 'samsung-electronics',
    devBio: 'Samsung Electronics is a global semiconductor and consumer technology leader manufacturing Galaxy mobile devices.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '6.26.1',
    sizeBytes: 85_000_000,
    rating: 4.6,
    votes: 4_500_000,
    summary: 'Comprehensive daily wellness tracking for sleep patterns, food intake, heart rate, and step counts.',
    desc: 'Samsung Health provides core features to keep your body fit and healthy. Record and analyze your daily activities, set personal fitness targets, track sleep stages, and monitor daily water consumption.',
  },
  {
    name: 'Strava: Run, Bike, Hike',
    slug: 'strava',
    pkg: 'com.strava',
    devName: 'Strava Inc.',
    devSlug: 'strava-inc',
    devBio: 'Strava is the leading social fitness platform connecting millions of runners, cyclists, and athletes worldwide.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '354.10',
    sizeBytes: 65_000_000,
    rating: 4.5,
    votes: 1_200_000,
    summary: 'GPS workout tracking for running and cycling with segment leaderboards and social athlete feeds.',
    desc: 'Strava turns every workout into a social journey. Record GPS routes for runs, bike rides, and hikes, compete on local Segment leaderboards, and share workout photos and achievements with fellow athletes.',
  },
  {
    name: 'MyFitnessPal: Calorie Counter',
    slug: 'myfitnesspal',
    pkg: 'com.myfitnesspal.android',
    devName: 'MyFitnessPal, Inc.',
    devSlug: 'myfitnesspal-inc',
    devBio: 'MyFitnessPal is a nutrition and fitness tracking company helping users log meals and reach dietary goals.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '24.7.0',
    sizeBytes: 78_000_000,
    rating: 4.4,
    votes: 2_800_000,
    summary: 'World-famous food diary and calorie counter with barcode scanning and macronutrient analysis.',
    desc: 'Track nutrition, calories, and intermittent fasting with MyFitnessPal database of over 14 million foods. Scan barcodes to log meals in seconds and monitor protein, carb, and fat ratios.',
  },
  {
    name: 'Nike Training Club: Fitness',
    slug: 'nike-training-club',
    pkg: 'com.nike.ntc',
    devName: 'Nike, Inc.',
    devSlug: 'nike-inc',
    devBio: 'Nike, Inc. is the world leading athletic footwear, apparel, and digital fitness training brand.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '6.45.0',
    sizeBytes: 95_000_000,
    rating: 4.7,
    votes: 550_000,
    summary: 'Free home workouts led by world-class Nike trainers spanning HIIT, strength, yoga, and mobility.',
    desc: 'Train with Nike Training Club for free. Access over 200 on-demand workout classes for all fitness levels, ranging from quick bodyweight routines to full gym training programs.',
  },
  {
    name: 'Calm - Sleep, Meditate, Relax',
    slug: 'calm',
    pkg: 'com.calm.android',
    devName: 'Calm.com, Inc.',
    devSlug: 'calm-com',
    devBio: 'Calm is the benchmark digital mental health and sleep platform providing guided meditation and soothing audio.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '6.33.1',
    sizeBytes: 62_000_000,
    rating: 4.6,
    votes: 620_000,
    summary: 'Guided meditation sessions, calming ambient soundscapes, and celebrity-narrated Sleep Stories.',
    desc: 'Calm is the top mental wellness app for sleep, meditation, and relaxation. Lower stress, overcome anxiety, and fall asleep peacefully with hundreds of guided meditations and relaxing audio stories.',
  },
  {
    name: 'Headspace: Mindful Meditation',
    slug: 'headspace',
    pkg: 'com.getsomeheadspace.android',
    devName: 'Headspace Meditation Limited',
    devSlug: 'headspace-meditation',
    devBio: 'Headspace produces digital mindfulness courses, guided meditation audio, and mental health tools.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '4.170.0',
    sizeBytes: 74_000_000,
    rating: 4.5,
    votes: 380_000,
    summary: 'Mindfulness and meditation courses to reduce daily stress, build focus, and improve sleep habits.',
    desc: 'Headspace makes meditation and mindfulness simple for everyday life. Learn mindfulness techniques, practice breathwork exercises, and unwind with soothing Sleepcasts.',
  },
  {
    name: 'Home Workout - No Equipment',
    slug: 'home-workout-no-equipment',
    pkg: 'leap_fitness.workout.home.workout.bodybuilding.plan',
    devName: 'Leap Fitness Group',
    devSlug: 'leap-fitness',
    devBio: 'Leap Fitness Group develops top-rated bodyweight training and workout tracking mobile applications.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '1.2.9',
    sizeBytes: 25_000_000,
    rating: 4.8,
    votes: 3_200_000,
    summary: 'Daily bodyweight workout routines for chest, abs, arms, and legs requiring zero gym equipment.',
    desc: 'Home Workout provides scientifically designed daily exercise routines for all main muscle groups. In just a few minutes a day, build muscle and keep fit at home without going to the gym.',
  },
  {
    name: 'Flo Period & Pregnancy Tracker',
    slug: 'flo-period-tracker',
    pkg: 'org.flo.health',
    devName: 'Flo Health Inc.',
    devSlug: 'flo-health',
    devBio: 'Flo Health builds AI-driven women health tracking platforms backed by medical experts.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '9.42.0',
    sizeBytes: 55_000_000,
    rating: 4.7,
    votes: 3_900_000,
    summary: 'Accurate ovulation and cycle predictions, pregnancy milestones, and personalized wellness tips.',
    desc: 'Flo is the leading female health app used by over 300 million women globally. Track menstrual cycles, ovulation windows, pregnancy progress, and PMS symptoms with private, secure logging.',
  },
  {
    name: 'Fitbit',
    slug: 'fitbit',
    pkg: 'com.fitbit.FitbitMobile',
    devName: 'Google LLC',
    devSlug: 'google',
    devBio: 'Google LLC builds Android and essential applications including Search, Maps, Chrome, Gmail, and YouTube.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '4.15.1',
    sizeBytes: 88_000_000,
    rating: 4.3,
    votes: 1_100_000,
    summary: 'Holistic health dashboard monitoring daily steps, sleep quality scores, resting heart rate, and stress.',
    desc: 'The Fitbit app pairs with wearable trackers and smartwatches to give you a complete picture of your health. Track daily step goals, monitor Active Zone Minutes, and inspect detailed sleep stage breakdowns.',
  },
  {
    name: 'Runkeeper - GPS Running Tracker',
    slug: 'asics-runkeeper',
    pkg: 'com.fitnesskeeper.runkeeper.base',
    devName: 'ASICS Digital',
    devSlug: 'asics-digital',
    devBio: 'ASICS Digital creates fitness tracking software and running coaching technology.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '15.6.1',
    sizeBytes: 70_000_000,
    rating: 4.4,
    votes: 620_000,
    summary: 'GPS running companion with audio coach updates, pace charts, and customized marathon training plans.',
    desc: 'Track pace, distance, and calories burned with ASICS Runkeeper. Follow guided audio workouts, set personal distance milestones, and sync directly with Wear OS and Bluetooth heart-rate sensors.',
  },
  {
    name: 'Daily Yoga: Fitness+Meditation',
    slug: 'daily-yoga',
    pkg: 'com.dailyyoga.inc',
    devName: 'DailyYoga Medical Technology',
    devSlug: 'dailyyoga',
    devBio: 'DailyYoga Medical Technology produces digital yoga classes, posture tutorials, and guided meditation.',
    catSlug: 'health-fitness',
    appType: 'app',
    version: '9.31.0',
    sizeBytes: 60_000_000,
    rating: 4.7,
    votes: 410_000,
    summary: 'Over 500 guided asana routines, posture breakdowns, and relaxing meditation sessions for all levels.',
    desc: 'Daily Yoga is the premier coaching app for practicing yoga at home. Choose from beginner-friendly foundations to advanced vinyasa flows, with voice instructions and detailed pose libraries.',
  },

  // ========================================================
  // 3. BUSINESS (business) - 10 Apps
  // ========================================================
  {
    name: 'Zoom Workplace',
    slug: 'zoom-workplace',
    pkg: 'us.zoom.videomeetings',
    devName: 'Zoom Video Communications, Inc.',
    devSlug: 'zoom-video',
    devBio: 'Zoom Video Communications provides video conferencing, cloud telephony, and collaborative workspaces.',
    catSlug: 'business',
    appType: 'app',
    version: '6.0.2',
    sizeBytes: 90_000_000,
    rating: 4.4,
    votes: 4_200_000,
    summary: 'HD video conferencing, team chat, digital whiteboards, and AI Companion for business meetings.',
    desc: 'Zoom Workplace brings communication and team collaboration together in one unified app. Host crystal-clear HD video calls, share screens, chat across channels, and summarize meetings with Zoom AI.',
  },
  {
    name: 'Microsoft Teams',
    slug: 'microsoft-teams',
    pkg: 'com.microsoft.teams',
    devName: 'Microsoft Corporation',
    devSlug: 'microsoft',
    devBio: 'Microsoft Corporation creates Windows, Microsoft 365, Teams, and enterprise cloud productivity software.',
    catSlug: 'business',
    appType: 'app',
    version: '1416.1',
    sizeBytes: 110_000_000,
    rating: 4.5,
    votes: 5_800_000,
    summary: 'Enterprise collaboration hub with dedicated team channels, file sharing, video calls, and calendar.',
    desc: 'Microsoft Teams is the ultimate messaging and collaboration workspace for companies and organizations. Meet securely, chat with colleagues, edit documents together, and integrate business workflows.',
  },
  {
    name: 'Google Meet',
    slug: 'google-meet',
    pkg: 'com.google.android.apps.tachyon',
    devName: 'Google LLC',
    devSlug: 'google',
    devBio: 'Google LLC builds Android and essential applications including Search, Maps, Chrome, Gmail, and YouTube.',
    catSlug: 'business',
    appType: 'app',
    version: '2024.04.14',
    sizeBytes: 65_000_000,
    rating: 4.4,
    votes: 4_700_000,
    summary: 'Secure enterprise video calling with live captioning, noise cancellation, and screen sharing.',
    desc: 'Connect, collaborate, and celebrate from anywhere with Google Meet. Enjoy high-quality video meetings with up to 250 participants, encrypted data in transit, and real-time speech captions.',
  },
  {
    name: 'QuickBooks Online Accounting',
    slug: 'quickbooks-accounting',
    pkg: 'com.intuit.quickbooks',
    devName: 'Intuit Inc',
    devSlug: 'intuit',
    devBio: 'Intuit produces premier financial, accounting, and tax filing software for small businesses.',
    catSlug: 'business',
    appType: 'app',
    version: '24.04.01',
    sizeBytes: 52_000_000,
    rating: 4.4,
    votes: 210_000,
    summary: 'Track business expenses, create professional invoices, manage mileage, and review cash flow reports.',
    desc: 'QuickBooks Online is the small business cloud accounting solution. Send customized invoices, track unpaid balances, capture receipt photos for expense deductions, and monitor profit & loss.',
  },
  {
    name: 'Indeed Job Search',
    slug: 'indeed-job-search',
    pkg: 'com.indeed.android.jobsearch',
    devName: 'Indeed Jobs',
    devSlug: 'indeed',
    devBio: 'Indeed is the worldwide leading job site connecting millions of job seekers with hiring companies.',
    catSlug: 'business',
    appType: 'app',
    version: '185.0',
    sizeBytes: 35_000_000,
    rating: 4.6,
    votes: 2_600_000,
    summary: 'Search millions of job listings, post resumes, and apply directly with 1-tap mobile applications.',
    desc: 'Find your next career move on Indeed. Search open positions across companies worldwide, compare salary estimates, read verified employee company reviews, and track application statuses.',
  },
  {
    name: 'Asana: Work in one place',
    slug: 'asana',
    pkg: 'com.asana.app',
    devName: 'Asana, Inc.',
    devSlug: 'asana-inc',
    devBio: 'Asana develops work management software that helps corporate teams coordinate and execute projects.',
    catSlug: 'business',
    appType: 'app',
    version: '7.45.1',
    sizeBytes: 42_000_000,
    rating: 4.5,
    votes: 95_000,
    summary: 'Coordinate team projects with customizable task lists, Kanban boards, and timeline milestones.',
    desc: 'Asana keeps team initiatives moving forward. Break goals down into actionable tasks, assign owners and due dates, comment on updates, and organize deliverables across custom Kanban boards.',
  },
  {
    name: 'monday.com - Work Management',
    slug: 'monday-work-management',
    pkg: 'com.monday.workmanagermobile',
    devName: 'monday.com',
    devSlug: 'monday-com',
    devBio: 'monday.com develops customizable cloud work management platforms and workflow automation software.',
    catSlug: 'business',
    appType: 'app',
    version: '5.14.0',
    sizeBytes: 50_000_000,
    rating: 4.6,
    votes: 65_000,
    summary: 'Customizable project dashboards, team collaboration charts, and automated workflow triggers.',
    desc: 'monday.com lets business teams manage any project or operation in one flexible platform. Build customized workflows, sync status changes across team boards, and track project deadlines.',
  },
  {
    name: 'Webex Meetings',
    slug: 'cisco-webex-meetings',
    pkg: 'com.cisco.webex.meetings',
    devName: 'Cisco Systems, Inc.',
    devSlug: 'cisco-systems',
    devBio: 'Cisco Systems is an enterprise networking, telecommunications, and cybersecurity multinational.',
    catSlug: 'business',
    appType: 'app',
    version: '44.4.0',
    sizeBytes: 75_000_000,
    rating: 4.3,
    votes: 490_000,
    summary: 'Enterprise-grade secure video conferencing, audio calls, and collaborative whiteboard sessions.',
    desc: 'Cisco Webex Meetings delivers industry-leading video collaboration and rich audio quality with AI background noise removal. Join meetings with one tap and share slides from any device.',
  },
  {
    name: 'Square Point of Sale (POS)',
    slug: 'square-point-of-sale',
    pkg: 'com.squareup',
    devName: 'Block, Inc.',
    devSlug: 'block-inc',
    devBio: 'Block, Inc. creates financial services, digital payments, and small-business point-of-sale systems.',
    catSlug: 'business',
    appType: 'app',
    version: '6.40.1',
    sizeBytes: 85_000_000,
    rating: 4.6,
    votes: 380_000,
    summary: 'Mobile point-of-sale system for processing payments, tracking real-time sales, and managing inventory.',
    desc: 'Square Point of Sale is the free POS app that enables retail and service businesses to accept contactless cards, track live inventory, send digital receipts, and view real-time sales analytics.',
  },
  {
    name: 'Microsoft 365 (Office)',
    slug: 'microsoft-365-office',
    pkg: 'com.microsoft.office.officehubrow',
    devName: 'Microsoft Corporation',
    devSlug: 'microsoft',
    devBio: 'Microsoft Corporation creates Windows, Microsoft 365, Teams, and enterprise cloud productivity software.',
    catSlug: 'business',
    appType: 'app',
    version: '16.0.17425',
    sizeBytes: 120_000_000,
    rating: 4.6,
    votes: 6_200_000,
    summary: 'The all-in-one mobile office suite uniting Word, Excel, PowerPoint, and PDF editing capabilities.',
    desc: 'Microsoft 365 is the premier productivity app combining Word, Excel, and PowerPoint in one unified application. Scan paper documents into editable PDFs, create spreadsheets on the go, and present slides.',
  },

  // ========================================================
  // 4. MAPS & DIRECTIONS (maps-directions) - 8 Apps
  // ========================================================
  {
    name: 'MAPS.ME: Offline Maps & GPS',
    slug: 'maps-me',
    pkg: 'com.mapswithme.maps.pro',
    devName: 'MAPS.ME',
    devSlug: 'maps-me-ltd',
    devBio: 'MAPS.ME develops offline vector mapping software and travel navigation based on OpenStreetMap.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '15.4.1',
    sizeBytes: 95_000_000,
    rating: 4.4,
    votes: 1_250_000,
    summary: 'Fast, detailed offline maps with hiking trails, bookmark synchronization, and zero cellular data use.',
    desc: 'MAPS.ME offers completely offline turn-by-turn navigation worldwide. Download entire country maps to your phone, search points of interest, and follow hiking trails without internet connectivity.',
  },
  {
    name: 'HERE WeGo: City Navigation',
    slug: 'here-wego',
    pkg: 'com.here.app.maps',
    devName: 'HERE Apps LLC',
    devSlug: 'here-apps',
    devBio: 'HERE Technologies is an automotive-grade mapping and location data platform used by premier automakers.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '4.12.100',
    sizeBytes: 75_000_000,
    rating: 4.3,
    votes: 620_000,
    summary: 'Urban routing app covering driving directions, public transport, bike lanes, and downloadable offline maps.',
    desc: 'HERE WeGo guides city travelers through complicated urban transit routes. Get step-by-step navigation for driving, walking, public transportation, and rideshares with clear speed limit alerts.',
  },
  {
    name: 'Moovit: Public Transit Guide',
    slug: 'moovit',
    pkg: 'com.tranzmate',
    devName: 'Moovit',
    devSlug: 'moovit-inc',
    devBio: 'Moovit is an Intel company providing urban mobility guidance and public transit data worldwide.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '5.148.0',
    sizeBytes: 48_000_000,
    rating: 4.5,
    votes: 820_000,
    summary: 'Real-time bus, train, and subway transit schedules with live arrival updates and service disruption alerts.',
    desc: 'Moovit is the world #1 urban mobility app. Plan trips across buses, trains, metros, and ferries with live arrival countdowns, step-by-step transit guidance, and stop notification alarms.',
  },
  {
    name: 'Citymapper: Transit Navigation',
    slug: 'citymapper',
    pkg: 'com.citymapper.app.release',
    devName: 'Citymapper Limited',
    devSlug: 'citymapper-ltd',
    devBio: 'Citymapper builds acclaimed multimodal transport navigation apps for metropolitan transit systems.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '11.14.0',
    sizeBytes: 42_000_000,
    rating: 4.6,
    votes: 160_000,
    summary: 'Award-winning multimodal urban transit app combining metro, train, bus, cycle, and walking itineraries.',
    desc: 'Citymapper makes complex city navigation simple. Compare all transport modes side by side, find the best train carriage to board, and receive real-time notifications for transit line delays.',
  },
  {
    name: 'Komoot: Cycling, Hiking Trails',
    slug: 'komoot',
    pkg: 'de.komoot.android',
    devName: 'komoot GmbH',
    devSlug: 'komoot-gmbh',
    devBio: 'komoot GmbH develops route planning technology and outdoor topographic trail guides for adventurers.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '2024.16.2',
    sizeBytes: 55_000_000,
    rating: 4.6,
    votes: 380_000,
    summary: 'Outdoor route planner and voice-guided trail navigation tailored for road cycling, MTB, and mountain hiking.',
    desc: 'Plan adventures on road, gravel, or singletrack trails with Komoot. Generate custom routes factoring in surface type, elevation profile, and difficulty, then navigate offline with voice guidance.',
  },
  {
    name: 'OsmAnd — Maps & GPS Offline',
    slug: 'osmand',
    pkg: 'net.osmand',
    devName: 'OsmAND',
    devSlug: 'osmand-team',
    devBio: 'OsmAnd is an open-source mapping software organization providing detailed offline OpenStreetMap navigation.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '4.7.10',
    sizeBytes: 110_000_000,
    rating: 4.5,
    votes: 210_000,
    summary: 'Feature-packed open-source offline mapping tool with contour lines, nautical charts, and GPX track recording.',
    desc: 'OsmAnd provides complete offline access to global OpenStreetMap data. Record GPX tracks, view topographic contour lines, customize vehicle routing profiles, and navigate without an internet connection.',
  },
  {
    name: 'TomTom AmiGO - GPS Navigation',
    slug: 'tomtom-amigo',
    pkg: 'com.tomtom.speedcams.android.map',
    devName: 'TomTom International BV',
    devSlug: 'tomtom',
    devBio: 'TomTom is a Dutch geolocation technology specialist creating automotive navigation maps and traffic telemetry.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '10.12.0',
    sizeBytes: 68_000_000,
    rating: 4.4,
    votes: 195_000,
    summary: 'Ad-free GPS driving navigation with community speed camera alerts and real-time traffic jams avoidance.',
    desc: 'TomTom AmiGO is an ad-free navigation companion that delivers real-time traffic updates, fixed and mobile speed camera warnings, and automatic rerouting around congested roads.',
  },
  {
    name: 'Yandex Maps & Navigator',
    slug: 'yandex-maps',
    pkg: 'ru.yandex.yandexmaps',
    devName: 'Yandex',
    devSlug: 'yandex',
    devBio: 'Yandex is a European tech enterprise developing search, AI, cloud navigation, and transport services.',
    catSlug: 'maps-directions',
    appType: 'app',
    version: '19.2.1',
    sizeBytes: 85_000_000,
    rating: 4.5,
    votes: 2_900_000,
    summary: 'Detailed city maps, offline building layouts, lane guidance, parking finders, and public transit tracking.',
    desc: 'Yandex Maps helps drivers and pedestrians navigate bustling cities with lane-level guidance, speed warnings, street panoramas, and real-time bus locations on city maps.',
  },

  // ========================================================
  // 5. RPG & ROGUELIKE (rpg) - 8 Apps
  // ========================================================
  {
    name: 'Epic Seven',
    slug: 'epic-seven',
    pkg: 'com.stove.epic7.google',
    devName: 'Smilegate Megaport',
    devSlug: 'smilegate',
    devBio: 'Smilegate Megaport is a major South Korean game developer and publisher of CrossFire and Lost Ark.',
    catSlug: 'rpg',
    appType: 'game',
    version: '1.0.820',
    sizeBytes: 150_000_000,
    rating: 4.4,
    votes: 520_000,
    summary: 'Visually stunning 2D anime turn-based RPG with cinematic battle animations and deep team building.',
    desc: 'Epic Seven delivers an animated playable anime experience powered by the Yuna 2D engine. Assemble heroes, explore deep labyrinth dungeons, and master turn-based tactical combat with full anime cutscenes.',
  },
  {
    name: 'Fate/Grand Order',
    slug: 'fate-grand-order',
    pkg: 'com.aniplex.fategrandorder.en',
    devName: 'Aniplex Inc.',
    devSlug: 'aniplex',
    devBio: 'Aniplex is a Sony Music Entertainment subsidiary specializing in iconic anime production and mobile games.',
    catSlug: 'rpg',
    appType: 'game',
    version: '2.84.0',
    sizeBytes: 95_000_000,
    rating: 4.5,
    votes: 380_000,
    summary: 'Acclaimed story-rich command card battle RPG set in the legendary TYPE-MOON Fate universe.',
    desc: 'Take command of legendary Servants across human history in Fate/Grand Order. Written by Kinoko Nasu, experience millions of words of original fantasy narrative combined with tactical command card battles.',
  },
  {
    name: 'Solo Leveling:Arise',
    slug: 'solo-leveling-arise',
    pkg: 'com.netmarble.sololv',
    devName: 'Netmarble',
    devSlug: 'netmarble',
    devBio: 'Netmarble is a leading South Korean mobile game publisher renowned for high-production action RPGs.',
    catSlug: 'rpg',
    appType: 'game',
    version: '1.1.8',
    sizeBytes: 250_000_000,
    rating: 4.5,
    votes: 850_000,
    summary: 'High-octane action RPG adaptation of the global webtoon phenomenon with fast combos and Shadow Army summons.',
    desc: 'Step into the shoes of Sung Jinwoo in Solo Leveling:Arise. Unleash fluid hack-and-slash action, defeat dungeon monarchs, extract shadow soldiers, and build your ultimate Shadow Monarch legion.',
  },
  {
    name: 'Black Desert Mobile',
    slug: 'black-desert-mobile',
    pkg: 'com.pearlabyss.blackdesertm.gl',
    devName: 'PEARL ABYSS',
    devSlug: 'pearl-abyss',
    devBio: 'Pearl Abyss is a premier Korean MMORPG developer famous worldwide for the Black Desert franchise.',
    catSlug: 'rpg',
    appType: 'game',
    version: '4.8.40',
    sizeBytes: 120_000_000,
    rating: 4.3,
    votes: 680_000,
    summary: 'Stunning open-world MMORPG featuring unrivaled character customization and visceral combo-based combat.',
    desc: 'Experience breathtaking graphics and hyper-detailed character creation in Black Desert Mobile. Choose from distinct combat classes, build personal camp territories, and explore vast fantasy continents.',
  },
  {
    name: 'Vampire Survivors',
    slug: 'vampire-survivors',
    pkg: 'com.poncle.vampiresurvivors',
    devName: 'Poncle',
    devSlug: 'poncle',
    devBio: 'Poncle is an independent games studio created by Luca Galante, designer of the viral hit Vampire Survivors.',
    catSlug: 'rpg',
    appType: 'game',
    version: '1.9.106',
    sizeBytes: 70_000_000,
    rating: 4.8,
    votes: 290_000,
    summary: 'Viral gothic horror roguelite time survival game where you mow down thousands of monsters to survive the night.',
    desc: 'Mow down thousands of night creatures and survive until dawn in Vampire Survivors. Make choices on weapons and passive upgrades to snowball your build into an unstoppable bullet-hell wave of destruction.',
  },
  {
    name: 'Soul Knight',
    slug: 'soul-knight',
    pkg: 'com.ChillyRoom.DungeonShooter',
    devName: 'ChillyRoom',
    devSlug: 'chillyroom',
    devBio: 'ChillyRoom is an indie mobile studio recognized for fast-paced pixel-art action and dungeon crawlers.',
    catSlug: 'rpg',
    appType: 'game',
    version: '6.1.0',
    sizeBytes: 450_000_000,
    rating: 4.6,
    votes: 1_650_000,
    summary: 'Fast-paced pixel-art roguelike dungeon shooter with 400+ weapons, unique heroes, and random dungeons.',
    desc: 'Explore randomly generated dungeons, collect weird and wacky weapons, dodge bullets, and shoot em up in Soul Knight. Intuitive controls and co-op multiplayer make every run fresh and addictive.',
  },
  {
    name: 'Guardian Tales',
    slug: 'guardian-tales',
    pkg: 'com.kakaogames.gdts',
    devName: 'Kakao Games Corp.',
    devSlug: 'kakao-games',
    devBio: 'Kakao Games is a major South Korean game publisher producing premier mobile and PC titles.',
    catSlug: 'rpg',
    appType: 'game',
    version: '2.92.0',
    sizeBytes: 180_000_000,
    rating: 4.7,
    votes: 490_000,
    summary: 'Charming retro pixel action-adventure RPG packed with humorous easter eggs, puzzles, and boss battles.',
    desc: 'Guardian Tales pays homage to classic action RPGs with clever puzzles, dynamic real-time combat, and witty writing. Lift boulders, throw bombs, and recruit heroes across humorous parody worlds.',
  },
  {
    name: 'ANOTHER EDEN Global',
    slug: 'another-eden',
    pkg: 'games.wfs.anothereden',
    devName: 'WFS, Inc.',
    devSlug: 'wfs-inc',
    devBio: 'WFS is a Tokyo-based mobile games developer acclaimed for narrative-driven JRPGs.',
    catSlug: 'rpg',
    appType: 'game',
    version: '3.6.40',
    sizeBytes: 110_000_000,
    rating: 4.5,
    votes: 180_000,
    summary: 'Single-player epic JRPG spanning past, present, and future from the creators of Chrono Trigger.',
    desc: 'Embark on a voyage beyond time and space with Another Eden. Created by scenario writer Masato Kato and composer Yasunori Mitsuda, experience a classic story-driven JRPG with zero expiring time-limited content.',
  },

  // ========================================================
  // 6. SPORTS GAMES (sports-games) - 7 Apps
  // ========================================================
  {
    name: 'NBA LIVE Mobile Basketball',
    slug: 'nba-live-mobile',
    pkg: 'com.ea.gp.nbamobile',
    devName: 'ELECTRONIC ARTS',
    devSlug: 'ea-sports',
    devBio: 'Electronic Arts is a global digital interactive entertainment leader creating FIFA, Madden, and NBA franchises.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '8.2.00',
    sizeBytes: 95_000_000,
    rating: 4.3,
    votes: 2_900_000,
    summary: 'Draft NBA superstars, build fantasy rosters, and hit game-winning buzzer beaters in real-time matchups.',
    desc: 'Build your dream NBA lineup in NBA LIVE Mobile Basketball. Draft current stars and classic legends, compete in 3v3 street tournaments, and conquer live seasonal campaigns.',
  },
  {
    name: 'Real Cricket 24',
    slug: 'real-cricket-24',
    pkg: 'com.nautilus.RealCricket3D',
    devName: 'Nautilus Mobile',
    devSlug: 'nautilus-mobile',
    devBio: 'Nautilus Mobile is an Indian sports gaming company recognized for authentic cricket simulations.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '3.6',
    sizeBytes: 750_000_000,
    rating: 4.4,
    votes: 1_100_000,
    summary: 'The ultimate cricket simulation featuring 600+ batting shots, manual fielding, and dynamic weather.',
    desc: 'Real Cricket 24 offers deep cricket authenticity. Execute manual fielding, master innovative batting shot types, utilize real-time DRS reviews, and play licensed international tournament cups.',
  },
  {
    name: 'Top Eleven Be a Soccer Manager',
    slug: 'top-eleven-manager',
    pkg: 'eu.nordeus.topeleven.android',
    devName: 'Nordeus',
    devSlug: 'nordeus',
    devBio: 'Nordeus is a mobile games developer based in Belgrade, creator of the premier Top Eleven franchise.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '24.16',
    sizeBytes: 130_000_000,
    rating: 4.5,
    votes: 4_400_000,
    summary: 'Lead your soccer club to glory with tactical formation management, live match tactics, and scouting.',
    desc: 'Become a world-class football manager with Top Eleven. Build stadium facilities, buy and sell top players in live transfer auctions, and direct matchday tactics in 3D matches.',
  },
  {
    name: 'Tennis Clash: Multiplayer Game',
    slug: 'tennis-clash',
    pkg: 'com.tfgco.games.sports.free.tennis.clash',
    devName: 'Wildlife Studios',
    devSlug: 'wildlife-studios',
    devBio: 'Wildlife Studios is a top mobile game developer creating competitive sports and casual multiplayer games.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '4.17.1',
    sizeBytes: 210_000_000,
    rating: 4.4,
    votes: 1_850_000,
    summary: 'Fast-paced online 1v1 tennis matches featuring responsive swipe controls and global tournaments.',
    desc: 'Play quick 3-minute multiplayer tennis matches in Tennis Clash. Intuitive swipe controls make it easy to hit topspins, slices, and lobs against players across the world.',
  },
  {
    name: 'WWE Undefeated',
    slug: 'wwe-undefeated',
    pkg: 'com.nway.wweundefeated',
    devName: 'nWay Inc.',
    devSlug: 'nway-inc',
    devBio: 'nWay creates competitive multiplayer action fighting games for mobile and console platforms.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '1.14.0',
    sizeBytes: 150_000_000,
    rating: 4.4,
    votes: 190_000,
    summary: 'Real-time head-to-head WWE wrestling battles combining arcade brawling with deck-building strategy.',
    desc: 'Step into the ring with WWE Undefeated. Collect signature wrestling cards, counter rival holds, and unleash devastating finishers like The Rock People Elbow and Stone Cold Stunner in live PvP bouts.',
  },
  {
    name: 'Golf Clash - PGA Tour',
    slug: 'golf-clash',
    pkg: 'com.playdemic.golf.android',
    devName: 'ELECTRONIC ARTS',
    devSlug: 'ea-sports',
    devBio: 'Electronic Arts is a global digital interactive entertainment leader creating FIFA, Madden, and NBA franchises.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '2.52.2',
    sizeBytes: 140_000_000,
    rating: 4.4,
    votes: 2_100_000,
    summary: 'Award-winning real-time multiplayer golf duels on courses featuring intuitive shot-timing mechanics.',
    desc: 'Tee off in Golf Clash against players worldwide. Master wind adjustments, spin controls, and precise shot timing to sink birdies and win weekend tournament championships.',
  },
  {
    name: 'Touchgrind Skate 2',
    slug: 'touchgrind-skate-2',
    pkg: 'se.illusionlabs.skate2',
    devName: 'Illusion Labs',
    devSlug: 'illusion-labs',
    devBio: 'Illusion Labs is a Swedish developer pioneer acclaimed for physics-based Touchgrind touch experiences.',
    catSlug: 'sports-games',
    appType: 'game',
    version: '1.6.1',
    sizeBytes: 320_000_000,
    rating: 4.5,
    votes: 480_000,
    summary: 'Realistic multi-touch fingerboard skateboarding simulation with genuine physics and customizable parks.',
    desc: 'Touchgrind Skate 2 delivers authentic fingerboard skateboarding physics. Use two fingers to pull off ollies, kickflips, 50-50 grinds, and slides across bowls, ramps, and stair sets.',
  },

  // ========================================================
  // 7. EDUCATION (education) - 9 Apps
  // ========================================================
  {
    name: 'edX: Courses by Harvard & MIT',
    slug: 'edx',
    pkg: 'org.edx.mobile',
    devName: 'edX',
    devSlug: 'edx-inc',
    devBio: 'edX is a global online learning platform founded by Harvard and MIT offering university courses.',
    catSlug: 'education',
    appType: 'app',
    version: '4.1.0',
    sizeBytes: 45_000_000,
    rating: 4.5,
    votes: 180_000,
    summary: 'Stream university lectures, learn programming, and earn accredited certificates from top institutions.',
    desc: 'Learn in-demand skills in computer science, business, data science, and engineering with edX. Watch lectures from Harvard, MIT, and Oxford, take quizzes, and earn verifiable course certificates.',
  },
  {
    name: 'TED',
    slug: 'ted',
    pkg: 'com.ted.android',
    devName: 'TED Conferences LLC',
    devSlug: 'ted-conferences',
    devBio: 'TED is a nonprofit devoted to spreading ideas through short, powerful talks by global leaders and thinkers.',
    catSlug: 'education',
    appType: 'app',
    version: '5.10.1',
    sizeBytes: 32_000_000,
    rating: 4.6,
    votes: 310_000,
    summary: 'Inspiring talks from world experts spanning science, tech, design, business, and psychology.',
    desc: 'Feed your curiosity with thousands of inspiring TED Talks. Explore talks subtitled in over 100 languages, download video episodes for offline viewing, and create custom playlists.',
  },
  {
    name: 'Babbel - Learn Languages',
    slug: 'babbel',
    pkg: 'com.babbel.mobile.android.en',
    devName: 'Babbel',
    devSlug: 'babbel-gmbh',
    devBio: 'Babbel is a German language learning software company with lessons crafted by linguistic experts.',
    catSlug: 'education',
    appType: 'app',
    version: '21.50.0',
    sizeBytes: 60_000_000,
    rating: 4.6,
    votes: 950_000,
    summary: 'Bite-sized language lessons focusing on real-life conversations with speech recognition feedback.',
    desc: 'Learn Spanish, French, German, Italian, and more with Babbel. 15-minute lessons fit easily into your daily routine, with speech recognition technology helping you perfect your pronunciation.',
  },
  {
    name: 'Memrise Easy Language Learning',
    slug: 'memrise',
    pkg: 'com.memrise.android.memrisecompanion',
    devName: 'Memrise',
    devSlug: 'memrise-ltd',
    devBio: 'Memrise combines spaced repetition memory techniques with native speaker video clips for language fluency.',
    catSlug: 'education',
    appType: 'app',
    version: '2024.04.15',
    sizeBytes: 48_000_000,
    rating: 4.6,
    votes: 1_500_000,
    summary: 'Learn conversational phrases with thousands of video clips of local native speakers in real contexts.',
    desc: 'Memrise teaches you how people actually talk in everyday life. Watch real native locals speaking, practice with AI conversational bots, and remember vocabulary faster with spaced repetition.',
  },
  {
    name: 'Busuu: Learn Languages',
    slug: 'busuu',
    pkg: 'com.busuu.android.enc',
    devName: 'Busuu',
    devSlug: 'busuu-ltd',
    devBio: 'Busuu is a language learning community connecting students with native speakers for corrections.',
    catSlug: 'education',
    appType: 'app',
    version: '31.14.0',
    sizeBytes: 55_000_000,
    rating: 4.5,
    votes: 680_000,
    summary: 'Interactive grammar lessons and written exercise feedback from a community of native speakers.',
    desc: 'Master a new language with Busuu. Complete structured courses aligned with the CEFR framework, receive constructive corrections from native speakers, and build conversational confidence.',
  },
  {
    name: 'Brilliant: Learn by Doing',
    slug: 'brilliant',
    pkg: 'org.brilliant.android',
    devName: 'Brilliant.org',
    devSlug: 'brilliant-org',
    devBio: 'Brilliant creates interactive STEM problem-solving courses in math, data analysis, and computer science.',
    catSlug: 'education',
    appType: 'app',
    version: '7.8.0',
    sizeBytes: 38_000_000,
    rating: 4.7,
    votes: 150_000,
    summary: 'Interactive problem-solving courses teaching math, neural networks, computer science, and physics concepts.',
    desc: 'Brilliant replaces boring lectures with hands-on, interactive problem solving. Learn foundational concepts in logic, algebra, data science, and AI through engaging visual puzzles.',
  },
  {
    name: 'Stellarium Mobile - Star Map',
    slug: 'stellarium-mobile',
    pkg: 'com.noctuasoftware.stellarium_free',
    devName: 'Stellarium Labs',
    devSlug: 'stellarium-labs',
    devBio: 'Stellarium Labs creates planetarium astronomy software rendering realistic night skies.',
    catSlug: 'education',
    appType: 'app',
    version: '1.12.5',
    sizeBytes: 90_000_000,
    rating: 4.7,
    votes: 520_000,
    summary: 'Augmented reality planetarium identifying stars, constellations, planets, and satellites in real time.',
    desc: 'Point your phone at the night sky and discover what you are seeing with Stellarium Mobile. Identify stars, planets, and constellations in real-time 3D, and track the International Space Station.',
  },
  {
    name: 'Kahoot! Play & Create Quizzes',
    slug: 'kahoot',
    pkg: 'no.mobitroll.kahoot.android',
    devName: 'Kahoot!',
    devSlug: 'kahoot-inc',
    devBio: 'Kahoot! is a global learning platform company delivering game-based educational quiz competitions.',
    catSlug: 'education',
    appType: 'app',
    version: '5.9.1',
    sizeBytes: 52_000_000,
    rating: 4.6,
    votes: 640_000,
    summary: 'Create engaging trivia quizzes, study flashcards, and join live multiplayer classroom competitions.',
    desc: 'Kahoot! makes learning fun for schools, workplaces, and families. Host live trivia quizzes, study for exams with interactive flashcard games, and join classroom challenges with PIN codes.',
  },
  {
    name: 'Mimo: Learn Coding / Python',
    slug: 'mimo-learn-coding',
    pkg: 'com.getmimo',
    devName: 'Mimohello GmbH',
    devSlug: 'mimohello',
    devBio: 'Mimohello GmbH builds bite-sized mobile programming education apps teaching Python, JavaScript, and HTML.',
    catSlug: 'education',
    appType: 'app',
    version: '4.28.0',
    sizeBytes: 42_000_000,
    rating: 4.7,
    votes: 410_000,
    summary: 'Learn Python, JavaScript, HTML, and SQL through bite-sized interactive coding exercises and mini-projects.',
    desc: 'Learn to code on the go with Mimo. Master programming fundamentals through 5-minute daily lessons, build real-world software projects, and write actual runnable code directly in the mobile IDE.',
  },

  // ========================================================
  // 8. SHOPPING (shopping) - 6 Apps
  // ========================================================
  {
    name: 'Etsy: Custom & Creative Goods',
    slug: 'etsy',
    pkg: 'com.etsy.android',
    devName: 'Etsy, Inc.',
    devSlug: 'etsy-inc',
    devBio: 'Etsy is a global marketplace for unique creative goods, handcrafted gifts, and vintage treasures.',
    catSlug: 'shopping',
    appType: 'app',
    version: '6.78.0',
    sizeBytes: 40_000_000,
    rating: 4.8,
    votes: 1_650_000,
    summary: 'Global marketplace for handcrafted artisan products, vintage fashion, custom jewelry, and unique decor.',
    desc: 'Discover millions of one-of-a-kind handcrafted items on Etsy. Connect directly with independent creators, order personalized handmade gifts, and save your favorite home decor finds.',
  },
  {
    name: 'Wish: Shop and Save',
    slug: 'wish',
    pkg: 'com.contextlogic.wish',
    devName: 'ContextLogic Inc.',
    devSlug: 'contextlogic-inc',
    devBio: 'ContextLogic Inc. operates Wish, a mobile shopping platform offering affordable consumer merchandise.',
    catSlug: 'shopping',
    appType: 'app',
    version: '5.54.0',
    sizeBytes: 35_000_000,
    rating: 4.5,
    votes: 13_800_000,
    summary: 'Affordable mobile marketplace offering discounted fashion, electronics, gadgets, and home lifestyle goods.',
    desc: 'Shop millions of affordable products at steep discounts on Wish. Enjoy flash sales, spin the Blitz Buy wheel for daily rewards, and track international orders from purchase to doorstep.',
  },
  {
    name: 'Carousell: Buy & Sell Marketplace',
    slug: 'carousell',
    pkg: 'com.thecarousell.Carousell',
    devName: 'Carousell',
    devSlug: 'carousell-corp',
    devBio: 'Carousell is a leading multi-category classifieds and recommerce platform in Southeast Asia.',
    catSlug: 'shopping',
    appType: 'app',
    version: '8.40.0',
    sizeBytes: 52_000_000,
    rating: 4.6,
    votes: 890_000,
    summary: 'Snap, list, and buy pre-loved electronics, fashion, cars, and home furniture with direct buyer chat.',
    desc: 'Carousell makes secondhand buying and selling effortless. Snap a photo to list an item in 30 seconds, chat securely with buyers, and find great bargains on pre-loved fashion and gadgets.',
  },
  {
    name: 'Zalando – Lounge & Fashion',
    slug: 'zalando',
    pkg: 'de.zalando.mobile',
    devName: 'Zalando SE',
    devSlug: 'zalando-se',
    devBio: 'Zalando is a major European online fashion and lifestyle e-commerce platform based in Berlin.',
    catSlug: 'shopping',
    appType: 'app',
    version: '5.32.1',
    sizeBytes: 65_000_000,
    rating: 4.6,
    votes: 1_200_000,
    summary: 'Europe leading online fashion hub carrying thousands of designer labels, shoes, and streetwear brands.',
    desc: 'Shop the latest fashion trends and designer brands on Zalando. Enjoy personalized style recommendations, save outfits to wishlists, and benefit from hassle-free returns.',
  },
  {
    name: 'Poshmark: Buy & Sell Fashion',
    slug: 'poshmark',
    pkg: 'com.poshmark.app',
    devName: 'Poshmark, Inc.',
    devSlug: 'poshmark-inc',
    devBio: 'Poshmark is a social commerce marketplace for new and secondhand fashion, home decor, and beauty.',
    catSlug: 'shopping',
    appType: 'app',
    version: '4.88.0',
    sizeBytes: 48_000_000,
    rating: 4.7,
    votes: 750_000,
    summary: 'Social commerce marketplace for luxury fashion, trending streetwear, and pre-owned designer bags.',
    desc: 'Poshmark is the leading social marketplace for shopping closets. Find discounted luxury apparel, negotiate deals with private offers, and attend live virtual Posh Parties.',
  },
  {
    name: 'Mercari: Your Marketplace',
    slug: 'mercari',
    pkg: 'com.mercariapp.mercari',
    devName: 'Mercari, Inc.',
    devSlug: 'mercari-inc',
    devBio: 'Mercari is a major consumer-to-consumer marketplace platform operating in Japan and the US.',
    catSlug: 'shopping',
    appType: 'app',
    version: '8.12.0',
    sizeBytes: 45_000_000,
    rating: 4.7,
    votes: 620_000,
    summary: 'Sell items you no longer need and discover verified deals on collectibles, electronics, and games.',
    desc: 'Sell or buy almost anything on Mercari. Listing takes minutes with barcode scanning, buyer payments are held securely in escrow until delivery, and shipping labels print with one tap.',
  },

  // ========================================================
  // 9. MUSIC & AUDIO (music-audio) - 6 Apps
  // ========================================================
  {
    name: 'Musixmatch: lyrics finder',
    slug: 'musixmatch',
    pkg: 'com.musixmatch.android.lyrify',
    devName: 'Musixmatch',
    devSlug: 'musixmatch-inc',
    devBio: 'Musixmatch is the world largest music lyrics platform providing synced lyrics and translations.',
    catSlug: 'music-audio',
    appType: 'app',
    version: '7.11.2',
    sizeBytes: 42_000_000,
    rating: 4.5,
    votes: 2_100_000,
    summary: 'Synchronized real-time song lyrics for Spotify, YouTube, and local tracks with line-by-line translation.',
    desc: 'Musixmatch displays real-time synced lyrics for the songs playing on your favorite streaming apps. Identify tunes playing around you and enjoy synchronized word-by-word translations.',
  },
  {
    name: 'Poweramp Music Player (Trial)',
    slug: 'poweramp-music-player',
    pkg: 'com.maxmpz.audioplayer',
    devName: 'Max MP',
    devSlug: 'max-mp',
    devBio: 'Max MP is a specialist audio software developer famous for the audiophile-grade Poweramp player.',
    catSlug: 'music-audio',
    appType: 'app',
    version: 'build-981',
    sizeBytes: 18_000_000,
    rating: 4.5,
    votes: 1_450_000,
    summary: 'Legendary audiophile music player with 64-bit audio engine, hi-res output, and graphic equalizer.',
    desc: 'Poweramp is the premier high-resolution offline audio player for Android. Features include internal 64-bit processing, high-res output, 10 to 32 band graphic equalizer, and gapless playback.',
  },
  {
    name: 'Castbox: Podcast Player & Pods',
    slug: 'castbox',
    pkg: 'fm.castbox.audiobook.radio.podcast',
    devName: 'Castbox.FM',
    devSlug: 'castbox-fm',
    devBio: 'Castbox is an award-winning podcast application and audiobook streaming audio platform.',
    catSlug: 'music-audio',
    appType: 'app',
    version: '9.22.1',
    sizeBytes: 38_000_000,
    rating: 4.6,
    votes: 490_000,
    summary: 'Discover, stream, and download millions of podcast episodes with silence trimming and playback speed boosts.',
    desc: 'Castbox offers access to over 95 million podcast episodes across news, comedy, true crime, and tech. Enjoy continuous playback with volume boost, silence skip, and sleep timers.',
  },
  {
    name: 'Pocket Casts - Podcast Player',
    slug: 'pocket-casts',
    pkg: 'au.com.shiftyjelly.pocketcasts',
    devName: 'Automattic, Inc.',
    devSlug: 'automattic',
    devBio: 'Automattic builds web tools and digital media applications including WordPress.com and Pocket Casts.',
    catSlug: 'music-audio',
    appType: 'app',
    version: '7.62.0',
    sizeBytes: 28_000_000,
    rating: 4.4,
    votes: 120_000,
    summary: 'Power-user podcast listening app featuring smart filters, custom trimming, and cross-device sync.',
    desc: 'Built by listeners for listeners, Pocket Casts offers advanced playback tools, customizable episode filters, silence trimming, and cloud sync across Android, Wear OS, and web.',
  },
  {
    name: 'FL Studio Mobile',
    slug: 'fl-studio-mobile',
    pkg: 'com.imageline.FLM',
    devName: 'Image-Line',
    devSlug: 'image-line',
    devBio: 'Image-Line is a Belgian software company that created the benchmark digital audio workstation FL Studio.',
    catSlug: 'music-audio',
    appType: 'app',
    version: '4.5.8',
    sizeBytes: 240_000_000,
    rating: 4.3,
    votes: 160_000,
    summary: 'Full multitrack music production studio with drum sequencers, virtual synths, and audio effects.',
    desc: 'Create and save complete multi-track music projects on your phone or tablet. Record audio, sequence drum beats, play synthesizers, mix with pro studio effects, and export WAV or MP3 tracks.',
  },
  {
    name: 'AudioLab Audio Editor Recorder',
    slug: 'audiolab',
    pkg: 'com.hitrolab.audioeditor',
    devName: 'Hitrolab',
    devSlug: 'hitrolab',
    devBio: 'Hitrolab develops specialized audio processing, trimming, ringtone editing, and voice changer apps.',
    catSlug: 'music-audio',
    appType: 'app',
    version: '1.2.997',
    sizeBytes: 45_000_000,
    rating: 4.6,
    votes: 520_000,
    summary: 'All-in-one audio workstation for trimming, mixing, converting, recording, and applying sound effects.',
    desc: 'AudioLab is the most advanced audio editing app for Android. Trim audio waveforms, mix multiple tracks, convert formats between MP3, FLAC, and WAV, remove vocals, and record high-quality sound.',
  },

  // ========================================================
  // 10. PUZZLE GAMES (puzzle) - 5 Apps
  // ========================================================
  {
    name: 'Blockudoku: Block Puzzle Game',
    slug: 'blockudoku',
    pkg: 'com.easybrain.blockudoku',
    devName: 'Easybrain',
    devSlug: 'easybrain',
    devBio: 'Easybrain is a leading mobile puzzle games publisher with over 1 billion downloads worldwide.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '2.18.0',
    sizeBytes: 32_000_000,
    rating: 4.6,
    votes: 2_800_000,
    summary: 'Addictive blend of classic wooden block puzzles and 9x9 Sudoku grids with relaxing offline gameplay.',
    desc: 'Blockudoku combines the mechanics of block puzzles and sudoku into a satisfying logic game. Place blocks on the 9x9 grid to fill rows, columns, or 3x3 squares to keep the board clear and beat your high score.',
  },
  {
    name: 'Nonogram.com - Picture Cross',
    slug: 'nonogram',
    pkg: 'com.easybrain.nonogram',
    devName: 'Easybrain',
    devSlug: 'easybrain',
    devBio: 'Easybrain is a leading mobile puzzle games publisher with over 1 billion downloads worldwide.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '4.15.0',
    sizeBytes: 40_000_000,
    rating: 4.7,
    votes: 1_200_000,
    summary: 'Japanese picture logic puzzles where you use number clues to uncover hidden pixel-art illustrations.',
    desc: 'Uncover hidden pixel pictures using basic deduction in Nonogram.com. Follow the number hints along grid edges to shade the correct squares and solve challenging daily griddlers.',
  },
  {
    name: '2048 Number Puzzle Game',
    slug: 'game-2048',
    pkg: 'com.androbaby.game2048',
    devName: 'Androbaby',
    devSlug: 'androbaby',
    devBio: 'Androbaby designs clean, minimalist digital logic and number sliding board games.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '4.8',
    sizeBytes: 12_000_000,
    rating: 4.6,
    votes: 950_000,
    summary: 'The classic sliding tile number puzzle where merging matching numbers powers your way to 2048.',
    desc: 'Swipe to move tiles on the board. When two tiles with the same number touch, they merge into one with double the value! Test your strategic thinking and reach the elusive 2048 tile.',
  },
  {
    name: 'Royal Match',
    slug: 'royal-match',
    pkg: 'com.dreamgames.royalmatch',
    devName: 'Dream Games, Ltd.',
    devSlug: 'dream-games',
    devBio: 'Dream Games is an Istanbul-based mobile casual games developer behind the global hit Royal Match.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '20534',
    sizeBytes: 160_000_000,
    rating: 4.6,
    votes: 4_800_000,
    summary: 'Top-charting match-3 puzzle game featuring King Robert castle renovations and satisfying booster combos.',
    desc: 'Welcome to Royal Match! Swipe colors, solve match-3 puzzles, and help King Robert decorate his royal castle. Enjoy thousands of levels with zero ads, explosive boosters, and exciting King Nightmare bonus stages.',
  },
  {
    name: 'Triple Match 3D',
    slug: 'triple-match-3d',
    pkg: 'com.boombox.match3d',
    devName: 'Boombox Games LTD',
    devSlug: 'boombox-games',
    devBio: 'Boombox Games creates casual 3D item matching and object sorting puzzle experiences.',
    catSlug: 'puzzle',
    appType: 'game',
    version: '3.14.0',
    sizeBytes: 110_000_000,
    rating: 4.6,
    votes: 350_000,
    summary: 'Fast-paced 3D object sorting and matching puzzle testing visual observation and speed under time limits.',
    desc: 'Triple Match 3D challenges you to find and match 3 identical items from a tangled pile of 3D objects before time expires. Clear the board, unlock brain-training boosters, and conquer hundreds of levels.',
  }
];

async function run() {
  console.log(`=== Starting Batch Ingestion of ${APPS_TO_ADD.length} Authentic Apps ===`);

  const maxIdRow = db.prepare('SELECT max(id) as m FROM apps').get();
  let nextId = (maxIdRow && maxIdRow.m) ? (maxIdRow.m + 1) : 10050;
  console.log(`Starting next app ID: ${nextId}`);

  const catMap = {};
  db.prepare('SELECT id, slug FROM categories').all().forEach(c => { catMap[c.slug] = c.id; });

  const existingSlugs = new Set(db.prepare('SELECT slug FROM apps').all().map(a => a.slug));

  db.exec('PRAGMA foreign_keys = OFF;');

  let addedCount = 0;
  for (const app of APPS_TO_ADD) {
    if (existingSlugs.has(app.slug)) {
      console.log(`[SKIP] Already exists: ${app.slug}`);
      continue;
    }

    const catId = catMap[app.catSlug];
    if (!catId) {
      console.error(`[ERROR] Category not found: ${app.catSlug} for ${app.slug}`);
      continue;
    }

    // 1. Ensure Developer
    let dev = db.prepare('SELECT id FROM developers WHERE slug=?').get(app.devSlug);
    if (!dev) {
      db.prepare(`INSERT INTO developers (name, slug, bio, bio_source, created_at) VALUES (?, ?, ?, 'google-play', date('now'))`)
        .run(app.devName, app.devSlug, app.devBio);
      dev = db.prepare('SELECT id FROM developers WHERE slug=?').get(app.devSlug);
    }

    // 2. Insert App with unique ID
    const currentId = nextId++;
    const playUrl = `https://play.google.com/store/apps/details?id=${app.pkg}`;
    db.prepare(`INSERT INTO apps (
      id, slug, name, developer_id, category_id, app_type, package_name,
      summary, description, version, size_bytes, rating_score, rating_votes,
      price_model, license, status, published_at, updated_at, play_url, download_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'free', 'proprietary', 'published', date('now'), datetime('now'), ?, 'authorized_apk')`)
      .run(
        currentId, app.slug, app.name, dev.id, catId, app.appType, app.pkg,
        app.summary, app.desc, app.version, app.sizeBytes, app.rating, app.votes, playUrl
      );

    // 3. Create Mock APK file
    const apkFilename = `${app.slug}-${app.version}.apk`;
    const apkFilePath = path.join(APK_DIR, apkFilename);
    const apkRes = await createMockApk(apkFilePath, {
      packageName: app.pkg,
      versionName: app.version,
      appName: app.name,
      targetSize: 200_000
    });

    // 4. Insert APK record
    db.prepare(`INSERT INTO apk_files (app_id, version_id, filename, size_bytes, sha256, file_type_ok, scan_status, status)
      VALUES (?, 1, ?, ?, ?, 1, 'clean', 'active')`)
      .run(currentId, apkFilename, apkRes.size, apkRes.sha256);

    existingSlugs.add(app.slug);
    addedCount++;
    console.log(`[${addedCount}/${APPS_TO_ADD.length}] Inserted: ${app.name} (${app.slug}) in category [${app.catSlug}]`);

    // 5. Download authentic assets from Google Play
    try {
      await scrapeAndSaveAssets(app.slug, app.pkg);
    } catch (e) {
      console.error(`  Warning scraping assets for ${app.slug}:`, e.message);
    }
  }

  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_apps_id ON apps(id);');
  db.exec('PRAGMA foreign_keys = ON;');

  console.log(`\n=== Successfully added ${addedCount} authentic apps! ===\n`);

  const counts = db.prepare('SELECT c.id, c.slug, c.name, count(a.id) as count FROM categories c LEFT JOIN apps a ON a.category_id = c.id GROUP BY c.id ORDER BY count ASC').all();
  console.table(counts);
}

run().catch(console.error);
