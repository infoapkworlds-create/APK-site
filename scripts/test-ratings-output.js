import * as D from '../src/lib/data.js';
import * as L from '../src/layout.js';

const slugs = ['1111-cloudflare', '2ndline', 'acmarket', 'actiondirector', 'active-connect-express'];

for (const s of slugs) {
  const app = D.getApp(s);
  if (!app) {
    console.log(s, 'not found');
    continue;
  }
  const card = L.appCard(app).s;
  const ratingMatch = card.match(/<span class="rating"[^>]*>[\s\S]*?<\/span>/);
  console.log(`${s}: score=${app.rating_avg}, votes=${app.review_count}`);
  console.log(`  HTML: ${ratingMatch ? ratingMatch[0] : 'None'}`);
}
