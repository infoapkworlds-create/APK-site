import http from 'node:http';

async function testUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

let serverAlreadyRunning = false;
try {
  const ping = await testUrl('http://localhost:3000/');
  if (ping.status) serverAlreadyRunning = true;
} catch {}

if (!serverAlreadyRunning) {
  await import('./src/server.js');
}

setTimeout(async () => {
  try {
    console.log('Testing endpoints...');
    const home = await testUrl('http://localhost:3000/');
    console.log(`- GET / : ${home.status} (length: ${home.body.length})`);

    const app = await testUrl('http://localhost:3000/apps/signal/');
    console.log(`- GET /apps/signal/ : ${app.status} (length: ${app.body.length})`);

    const sitemap = await testUrl('http://localhost:3000/sitemap.xml');
    console.log(`- GET /sitemap.xml : ${sitemap.status} (length: ${sitemap.body.length})`);

    const robots = await testUrl('http://localhost:3000/robots.txt');
    console.log(`- GET /robots.txt : ${robots.status} (content-type: ${robots.headers['content-type']})`);

    const search = await testUrl('http://localhost:3000/search/?q=signal');
    console.log(`- GET /search/?q=signal : ${search.status} (has noindex: ${search.body.includes('noindex')})`);

    const suggest = await testUrl('http://localhost:3000/api/suggest?q=sig');
    console.log(`- GET /api/suggest?q=sig : ${suggest.status} (json: ${suggest.body})`);

    const css = await testUrl('http://localhost:3000/static/site.css');
    console.log(`- GET /static/site.css : ${css.status} (length: ${css.body.length})`);

    const icon = await testUrl('http://localhost:3000/icons/signal.svg');
    console.log(`- GET /icons/signal.svg : ${icon.status} (is svg: ${icon.headers['content-type'].includes('svg')})`);

    const verifier = await testUrl('http://localhost:3000/tools/apk-hash-verifier/');
    console.log(`- GET /tools/apk-hash-verifier/ : ${verifier.status} (has dropzone: ${verifier.body.includes('apkDropzone')})`);

    const storeApp = await testUrl('http://localhost:3000/api/download-apkworlds-app');
    console.log(`- GET /api/download-apkworlds-app : ${storeApp.status} (type: ${storeApp.headers['content-type']}, size: ${storeApp.body.length})`);

    const dlPage = await testUrl('http://localhost:3000/apps/signal/download/');
    console.log(`- GET /apps/signal/download/ : ${dlPage.status} (has device badge: ${dlPage.body.includes('userDeviceCompatBadge')})`);

    const payback = await testUrl('http://localhost:3000/apps/payback-2/');
    console.log(`- GET /apps/payback-2/ : ${payback.status} (has cloud gaming: ${payback.body.includes('cloud-phone-cpa-box')})`);

    const xapkPage = await testUrl('http://localhost:3000/tools/xapk-to-apk-converter/');
    console.log(`- GET /tools/xapk-to-apk-converter/ : ${xapkPage.status} (has xapkDropzone: ${xapkPage.body.includes('xapkDropzone')})`);

    const verPage = await testUrl('http://localhost:3000/apps/signal/versions/');
    console.log(`- GET /apps/signal/versions/ : ${verPage.status} (has ver-filter-bar: ${verPage.body.includes('ver-filter-bar')})`);

    const floCheck = await testUrl('http://localhost:3000/apps/flo-period-tracker/');
    console.log(`- GET /apps/flo-period-tracker/ : ${floCheck.status} (is 410: ${floCheck.status === 410})`);
    if (floCheck.status !== 410) throw new Error('Expected 410 Gone for flo-period-tracker');

    if (!verifier.body.includes('apkDropzone')) throw new Error('Verifier missing apkDropzone');
    if (!app.body.includes('vip-mod-matrix')) throw new Error('App page missing vip-mod-matrix');
    if (!app.body.includes('regionUnlocker')) throw new Error('App page missing regionUnlocker');
    if (!app.body.includes('privacy-score-card')) throw new Error('App page missing privacy-score-card');
    if (!app.body.includes('app-benchmark-card')) throw new Error('App page missing app-benchmark-card');
    if (!app.body.includes('qrCodeModal')) throw new Error('App page missing qrCodeModal');
    if (!dlPage.body.includes('userDeviceCompatBadge')) throw new Error('Download page missing userDeviceCompatBadge');
    if (!dlPage.body.includes('regionUnlocker')) throw new Error('Download page missing regionUnlocker');
    if (!dlPage.body.includes('antivirusCertModal')) throw new Error('Download page missing antivirusCertModal');
    if (!dlPage.body.includes('communityPulseCard')) throw new Error('Download page missing communityPulseCard');
    if (!dlPage.body.includes('adb-installer-card')) throw new Error('Download page missing adb-installer-card');
    if (!payback.body.includes('cloud-phone-cpa-box')) throw new Error('Payback 2 missing cloud-phone-cpa-box');
    if (!xapkPage.body.includes('xapkDropzone')) throw new Error('XAPK converter missing xapkDropzone');
    if (!verPage.body.includes('ver-filter-bar')) throw new Error('Versions page missing ver-filter-bar');
    if (!verPage.body.includes('versionDiffCard')) throw new Error('Versions page missing versionDiffCard');

    console.log('All endpoints responding correctly!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}, 500);
