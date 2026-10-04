async function verify() {
  const slugs = ['1111-cloudflare', '2ndline', 'acmarket', 'actiondirector', 'active-connect-express'];
  console.log('Testing live server HTTP endpoints for icons & Play Store ratings:\n');

  for (const s of slugs) {
    const iconRes = await fetch('http://localhost:3000/icons/' + s + '.svg');
    const iconText = await iconRes.text();
    const appRes = await fetch('http://localhost:3000/apps/' + s + '/');
    const appHtml = await appRes.text();

    const hasNoRatings = appHtml.includes('No ratings yet');
    const hasStars = appHtml.includes('class="stars"');
    const hasLdRating = appHtml.includes('"aggregateRating"');
    const isRichIcon = iconText.includes('WARP') || iconText.includes('linearGradient');

    // Extract exact rating string from HTML
    const ratingMatch = appHtml.match(/<span class="rating"[^>]*>([\s\S]*?)<\/span>/);
    const ratingClean = ratingMatch ? ratingMatch[0].replace(/\s+/g, ' ') : 'N/A';

    console.log(`[${s}]`);
    console.log(`  Icon: status=${iconRes.status}, richVector=${isRichIcon}, size=${iconText.length} bytes`);
    console.log(`  Page: status=${appRes.status}, hasStars=${hasStars}, noRatingsNotice=${hasNoRatings}`);
    console.log(`  Display: ${ratingClean}`);
    console.log(`  Google Schema: aggregateRating=${hasLdRating}\n`);
  }

  // Also check Homepage & Apps catalog listing
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  const homeNoRatings = homeHtml.includes('No ratings yet');
  console.log('[Homepage /]');
  console.log(`  status=${homeRes.status}, contains "No ratings yet": ${homeNoRatings}`);

  const appsRes = await fetch('http://localhost:3000/apps/');
  const appsHtml = await appsRes.text();
  const appsNoRatings = appsHtml.includes('No ratings yet');
  console.log('[Apps Catalog /apps/]');
  console.log(`  status=${appsRes.status}, contains "No ratings yet": ${appsNoRatings}\n`);
}

verify().catch(console.error);
