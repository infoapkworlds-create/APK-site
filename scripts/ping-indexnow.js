import { config } from '../src/config.js';
import { all } from '../src/db.js';

async function pingIndexNow() {
  const host = 'www.apkworlds.co.uk';
  const key = config.indexNowKey || 'adda586927efa645e1386f736c7fa549';
  const keyLocation = `https://${host}/${key}.txt`;

  const coreUrls = [
    `https://${host}/`,
    `https://${host}/compare/`,
    `https://${host}/collections/`,
    `https://${host}/collections/best-offline-games/`,
    `https://${host}/collections/video-editors-no-watermark/`,
    `https://${host}/collections/fast-free-vpn/`,
    `https://${host}/collections/lite-apps-low-end-phones/`,
    `https://${host}/collections/region-restricted-apps/`,
    `https://${host}/region-restricted/`,
    `https://${host}/tools/apk-error-solver/`,
    `https://${host}/tools/apk-inspector/`,
    `https://${host}/apps/`,
    `https://${host}/games/`,
    `https://${host}/popular/`,
    `https://${host}/latest/`,
    `https://${host}/updated/`
  ];

  // Top 30 most popular apps
  const topApps = all(`SELECT slug FROM apps WHERE status='published' ORDER BY rating_votes DESC LIMIT 30`);
  for (const a of topApps) {
    coreUrls.push(`https://${host}/apps/${a.slug}/`);
    coreUrls.push(`https://${host}/apps/${a.slug}/download/`);
  }

  // Top 20 Battles
  const topBattles = all(`SELECT slug FROM comparisons WHERE status='published' LIMIT 20`);
  for (const b of topBattles) {
    coreUrls.push(`https://${host}/compare/${b.slug}/`);
  }

  const payload = {
    host,
    key,
    keyLocation,
    urlList: coreUrls
  };

  console.log(`Submitting ${coreUrls.length} priority URLs to IndexNow (Bing, Yandex, Seznam)...`);

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.log(`IndexNow Response Status: ${res.status} (${res.statusText})`);
    if (res.status === 200 || res.status === 202) {
      console.log('✓ Successfully notified search engines of priority URLs!');
    } else {
      const text = await res.text();
      console.log('Response body:', text);
    }
  } catch (err) {
    console.error('Failed to ping IndexNow:', err.message);
  }
}

pingIndexNow();
