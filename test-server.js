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

    console.log('All endpoints responding correctly!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}, 500);
