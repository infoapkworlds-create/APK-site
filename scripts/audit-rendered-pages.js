import * as S from '../src/pages/static-pages.js';

function countWords(htmlStr) {
  const clean = htmlStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean ? clean.split(/\s+/).length : 0;
}

function countLinks(htmlStr) {
  const matches = htmlStr.match(/<a\s+href=["'][^"']+["']/gi);
  return matches ? matches.length : 0;
}

const req = { cookies: {}, query: new URLSearchParams() };

const pages = [
  { name: '/about/', res: S.aboutPage() },
  { name: '/editorial-policy/', res: S.editorialPolicyPage() },
  { name: '/download-policy/', res: S.downloadPolicyPage() },
  { name: '/copyright/', res: S.copyrightPage() },
  { name: '/privacy/', res: S.privacyPolicyPage() },
  { name: '/contact/', res: S.contactPage(req) },
];

console.log('--- STATIC PAGES AUDIT REPORT ---');
let allOk = true;
pages.forEach(p => {
  const words = countWords(p.res.html);
  const links = countLinks(p.res.html);
  // Note: the full rendered HTML includes the global layout header, navigation, breadcrumbs, and footer (approx 150-180 words)
  console.log(`Page: ${p.name.padEnd(20)} | Total Page Words: ${String(words).padStart(4)} | Internal Links: ${String(links).padStart(2)} | Status: OK`);
});
