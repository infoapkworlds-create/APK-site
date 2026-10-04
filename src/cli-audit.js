import { runAuditChecks } from './pages/admin.js';
import { getIndexableUrls } from './pages/seo.js';
import * as D from './lib/data.js';

console.log('====================================================');
console.log('APKworlds Technical SEO and Content Quality Audit');
console.log('====================================================\n');

const audit = runAuditChecks();
const indexable = getIndexableUrls();

console.log(`- Cataloged Apps: ${audit.appsCount}`);
console.log(`- Published Guides: ${audit.guidesCount}`);
console.log(`- Total Indexable URLs in Sitemap: ${indexable.length}`);
console.log(`- Total Audit Findings: ${audit.issues.length}\n`);

if (audit.issues.length > 0) {
  console.log('Findings:');
  for (const it of audit.issues) {
    console.log(`[${it.severity.toUpperCase()}] ${it.page}: ${it.msg}`);
  }
} else {
  console.log('✓ All quality and technical SEO checks passed with zero errors or warnings.');
}

console.log('\nAudit complete.');
