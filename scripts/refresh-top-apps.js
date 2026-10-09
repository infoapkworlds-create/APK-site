import { all, run } from '../src/db.js';
import fs from 'node:fs';
import { sitemapAppsPartXml, sitemapIndexXml } from '../src/pages/seo.js';

const res = run(`
  UPDATE apps 
  SET updated_at = datetime('now') 
  WHERE id IN (
    SELECT id FROM apps 
    WHERE status='published' 
    ORDER BY rating_votes DESC 
    LIMIT 25
  )
`);

console.log(`✅ Updated ${res.changes} top apps with fresh 2026 timestamps!`);

// Regenerate sitemaps so lastmod headers reflect fresh updates
for (let i = 1; i <= 6; i++) {
  fs.writeFileSync(`./public/sitemap-apps-${i}.xml`, sitemapAppsPartXml(i), 'utf-8');
}
fs.writeFileSync('./public/sitemap.xml', sitemapIndexXml(), 'utf-8');
console.log('✅ Regenerated sitemap-apps-1.xml through 6 and sitemap.xml');
