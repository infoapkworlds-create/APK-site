import fs from 'node:fs';
import { sitemapGuidesXml } from '../src/pages/seo.js';

const xml = sitemapGuidesXml();
fs.writeFileSync('./public/sitemap-guides.xml', xml, 'utf-8');
console.log('✅ Updated public/sitemap-guides.xml with new guides count');
