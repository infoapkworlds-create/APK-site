async function test() {
  const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
  console.log('Sitemap status:', sitemapRes.status, 'Content-Type:', sitemapRes.headers.get('content-type'));
  const sitemapTxt = await sitemapRes.text();
  console.log('Sitemap length:', sitemapTxt.length, 'Contains lastmod:', sitemapTxt.includes('<lastmod>'), 'Contains 2025:', sitemapTxt.includes('2025'));

  const rssRes = await fetch('http://localhost:3000/rss.xml');
  console.log('RSS status:', rssRes.status, 'Content-Type:', rssRes.headers.get('content-type'));
  const rssTxt = await rssRes.text();
  console.log('RSS length:', rssTxt.length, 'Contains items:', rssTxt.includes('<item>'));

  const robotsRes = await fetch('http://localhost:3000/robots.txt');
  console.log('Robots status:', robotsRes.status);
  const robotsTxt = await robotsRes.text();
  console.log(robotsTxt);

  const appRes = await fetch('http://localhost:3000/apps/among-us/');
  console.log('Among Us page status:', appRes.status);
  const appHtml = await appRes.text();
  const ldMatches = appHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/g);
  if (ldMatches) {
    ldMatches.forEach((m, idx) => {
      const json = m.replace(/<\/?script[^>]*>/g, '');
      const parsed = JSON.parse(json);
      if (parsed['@type'] && (parsed['@type'] === 'MobileApplication' || Array.isArray(parsed['@type']))) {
        console.log('MobileApplication Schema JSON-LD:');
        console.log('name:', parsed.name);
        console.log('datePublished:', parsed.datePublished);
        console.log('dateModified:', parsed.dateModified);
        console.log('image:', parsed.image);
        console.log('aggregateRating:', parsed.aggregateRating);
      }
    });
  }

  const guideRes = await fetch('http://localhost:3000/guides/how-to-install-apk/');
  console.log('Guide page status:', guideRes.status);
  const guideHtml = await guideRes.text();
  const guideLdMatches = guideHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/g);
  if (guideLdMatches) {
    guideLdMatches.forEach((m) => {
      const json = m.replace(/<\/?script[^>]*>/g, '');
      const parsed = JSON.parse(json);
      if (parsed['@type'] === 'Article') {
        console.log('Article Schema JSON-LD:');
        console.log('headline:', parsed.headline);
        console.log('datePublished:', parsed.datePublished);
        console.log('dateModified:', parsed.dateModified);
      }
    });
  }

  const { config } = await import('../src/config.js');
  console.log('IndexNow Key:', config.indexNowKey);
  const inKeyRes = await fetch(`http://localhost:3000/${config.indexNowKey}.txt`);
  console.log('IndexNow Key file status:', inKeyRes.status);
  const inKeyTxt = await inKeyRes.text();
  console.log('IndexNow Key verified:', inKeyTxt.trim() === config.indexNowKey);
}
test().catch(console.error);
