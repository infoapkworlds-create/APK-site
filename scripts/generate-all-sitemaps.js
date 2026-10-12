import fs from 'node:fs';
import path from 'node:path';
import {
  sitemapIndexXml,
  sitemapMainXml,
  sitemapAppsXml,
  sitemapAppsPartXml,
  sitemapGamesXml,
  sitemapGamesPartXml,
  sitemapGuidesXml,
  sitemapGuidesPartXml,
} from '../src/pages/seo.js';

const pubDir = path.resolve('public');

const files = [
  ['sitemap.xml', sitemapIndexXml()],
  ['sitemap-main.xml', sitemapMainXml()],
  ['sitemap-apps.xml', sitemapAppsXml()],
  ['sitemap-apps-1.xml', sitemapAppsPartXml(1)],
  ['sitemap-apps-2.xml', sitemapAppsPartXml(2)],
  ['sitemap-apps-3.xml', sitemapAppsPartXml(3)],
  ['sitemap-apps-4.xml', sitemapAppsPartXml(4)],
  ['sitemap-apps-5.xml', sitemapAppsPartXml(5)],
  ['sitemap-apps-6.xml', sitemapAppsPartXml(6)],
  ['sitemap-games.xml', sitemapGamesXml()],
  ['sitemap-games-1.xml', sitemapGamesPartXml(1)],
  ['sitemap-games-2.xml', sitemapGamesPartXml(2)],
  ['sitemap-games-3.xml', sitemapGamesPartXml(3)],
  ['sitemap-guides.xml', sitemapGuidesXml()],
  ['sitemap-guides-1.xml', sitemapGuidesPartXml(1)],
  ['sitemap-guides-2.xml', sitemapGuidesPartXml(2)],
];

for (const [name, content] of files) {
  const fullPath = path.join(pubDir, name);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Generated ${name} (${(Buffer.byteLength(content) / 1024).toFixed(1)} KB)`);
}
