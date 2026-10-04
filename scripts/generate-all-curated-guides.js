import { all, one } from '../src/db.js';
import { bulkGenerateGuides } from '../src/lib/app-guide.js';

console.log('=== Pre-generating Comprehensive SEO Guides for Curated Apps ===');

const apps = all(`
  SELECT a.*, d.name AS dev_name, d.slug AS dev_slug, d.website AS dev_website,
         c.name AS cat_name, c.slug AS cat_slug, c.kind AS cat_kind
  FROM apps a
  JOIN developers d ON d.id = a.developer_id
  JOIN categories c ON c.id = a.category_id
  WHERE a.package_name NOT LIKE 'com.droid.%' AND a.status = 'published'
  ORDER BY a.name COLLATE NOCASE
`);

console.log(`Found ${apps.length} curated apps.`);
const created = bulkGenerateGuides(apps);
console.log(`Successfully generated and stored ${created} dedicated app installation guides!`);

const totalGuides = one(`SELECT COUNT(*) AS c FROM guides`).c;
console.log(`Total guides now in database: ${totalGuides}`);

// Verification check on key apps
for (const slug of ['badland', 'whatsapp', 'google-chrome', 'clash-of-clans', 'gta-san-andreas', 'signal', 'subway-surfers']) {
  const g = one(`SELECT slug, title, length(body_html) AS len FROM guides WHERE slug=?`, `how-to-download-${slug}-apk`);
  console.log(`• Guide for ${slug}: ${g ? `${g.title} (${g.len} chars)` : 'NOT FOUND'}`);
}
