import fs from 'node:fs';

// Read the verified HTML bodies from test-policy-words.js
const testContent = fs.readFileSync('./scripts/test-policy-words.js', 'utf8');

// Extract each body string
function extractVar(code, varName) {
  const marker = `const ${varName} = \``;
  const start = code.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${varName}`);
  const contentStart = start + marker.length;
  // find closing `
  let pos = contentStart;
  while (pos < code.length) {
    if (code[pos] === '`' && code[pos - 1] !== '\\') {
      break;
    }
    pos++;
  }
  return code.slice(contentStart, pos);
}

const aboutBody = extractVar(testContent, 'aboutHtml');
const editorialBody = extractVar(testContent, 'editorialHtml');
const downloadBody = extractVar(testContent, 'downloadHtml');
const copyrightBody = extractVar(testContent, 'copyrightHtml');
const privacyBody = extractVar(testContent, 'privacyHtml');
const contactBody = extractVar(testContent, 'contactHtml');

const fullStaticPages = `import { html, raw } from '../lib/html.js';
import { page, catUrl } from '../layout.js';
import { csrfToken, formStamp } from '../lib/security.js';
import { config } from '../config.js';
import * as D from '../lib/data.js';

// ============================================================================
// 1. ABOUT US PAGE (Verified 1,454 Words & Strong Internal Linking)
// ============================================================================
export function aboutPage() {
  const body = html\`${aboutBody}\`;

  return page({
    title: \`About \${config.siteName}: Independent Android App Information & Safety Lab\`,
    description: \`Learn about \${config.siteName}, our mission to provide authentic Android app details, our 5-stage cryptographic testing lab, and our commitment to safe distribution.\`,
    path: '/about/',
    crumbs: [['Home', '/'], ['About', '/about/']],
    body,
  });
}

// ============================================================================
// 2. CONTACT US PAGE (Verified 1,197 Words & Strong Internal Linking)
// ============================================================================
export function contactPage(req) {
  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);
  const stamp = formStamp();
  const sent = req.query.get('sent') === '1';

  const body = html\`${contactBody}\`;

  return page({
    title: \`Contact \${config.siteName}: Editorial, Developer Relations & Technical Support\`,
    description: \`Get in touch with the editorial board, security lab, or developer relations at \${config.siteName} for inquiries, bug reports, and package submissions.\`,
    path: '/contact/',
    crumbs: [['Home', '/'], ['Contact', '/contact/']],
    body,
  });
}

// ============================================================================
// 3. EDITORIAL POLICY PAGE (Verified 1,292 Words & Strong Internal Linking)
// ============================================================================
export function editorialPolicyPage() {
  const body = html\`${editorialBody}\`;

  return page({
    title: 'Editorial Policy: Standards for Writing, Testing & Reviewing Apps',
    description: 'Learn how DroidShelf creates original app overviews, verifies technical information, audits hardware performance, and maintains editorial independence.',
    path: '/editorial-policy/',
    crumbs: [['Home', '/'], ['Editorial Policy', '/editorial-policy/']],
    body,
  });
}

// ============================================================================
// 4. USER REVIEW POLICY PAGE
// ============================================================================
export function reviewPolicyPage() {
  const body = html\`
<header class="page-head">
  <h1>User Review and Rating Policy</h1>
  <p class="lead">Guidelines for community ratings, reviews, moderation standards, anti-spam protections, and developer responses.</p>
  <p class="meta" style="margin-top: 0.75rem; color: var(--muted); font-size: 0.9rem;">Effective Date: November 12, 2025 · Last Reviewed: August 15, 2026 · Community Team</p>
</header>

<section class="static-content">
  <h2>1. Genuine Reviews Only: The Authenticity Standard</h2>
  <p>We believe user feedback is only valuable when it originates from authentic people sharing real-world experiences. In accordance with our <a href="/about/">About Us Charter</a> and our anti-astroturfing commitments, we strictly prohibit:</p>
  <ul>
    <li>Fabricated testimonials, automated bot submissions, or synthetic impressions.</li>
    <li>Paid reviews, incentivized ratings, or commercial kickback arrangements.</li>
    <li>Promotional referral codes, affiliate links, or external marketing campaigns.</li>
    <li>Abusive language, harassment, hate speech, or personal threats against developers or users.</li>
  </ul>

  <h2>2. Pre-Publication Moderation &amp; Spam Protection</h2>
  <p>Every review submitted to \${config.siteName} undergoes human moderation before appearing publicly on pages such as our <a href="/reviews/">Community Reviews Hub</a> or individual app review screens (like <a href="/apps/whatsapp/reviews/">WhatsApp Reviews</a>). Our moderators verify that submissions adhere to conduct standards and do not contain malicious links. We never edit user opinions; reviews are either approved or rejected in full.</p>

  <h2>3. Definition of Verified Community Feedback</h2>
  <p>We do not label user reviews as "Verified" unless we have technically verified the user's installation through an authenticated build session. Unverified community reviews are labeled clearly with the reviewer's display name, date, and optional device notes (e.g. "Google Pixel 8", "Samsung Galaxy S23").</p>

  <h2>4. Rating Aggregation &amp; Transparent Scoring</h2>
  <p>Average star ratings across our <a href="/apps/">Apps Catalog</a> and <a href="/games/">Games Directory</a> are calculated strictly from approved community submissions. When an app has fewer than three approved reviews, we display the exact review count and note that there is insufficient data to display a meaningful average. We do not invent baseline ratings to make newly listed apps look falsely popular.</p>

  <h2>5. Developer Responses &amp; Constructive Dialogue</h2>
  <p>App developers registered in our <a href="/developers/">Developers Directory</a> may submit official responses to user reviews to clarify bug fixes, explain upcoming roadmaps, or offer troubleshooting advice. Developer responses are published underneath the corresponding review with clear attribution to the developer's organization.</p>

  <h2>6. Reporting a Violation</h2>
  <p>Any visitor can report a review that appears to violate our policy by using the "Report" button next to the review text or via our <a href="/report-app/">Report Form</a>. Reported items are re-examined by our moderation team within 24 hours.</p>
</section>\`;

  return page({
    title: 'Review Policy: Moderation, Rating Calculation, and Rules',
    description: 'Our rules for community app reviews: moderation process, rating calculation standards, anti-spam protections, and developer reply guidelines.',
    path: '/review-policy/',
    crumbs: [['Home', '/'], ['Review Policy', '/review-policy/']],
    body,
  });
}

// ============================================================================
// 5. DOWNLOAD POLICY PAGE (Verified 1,267 Words & Strong Internal Linking)
// ============================================================================
export function downloadPolicyPage() {
  const body = html\`${downloadBody}\`;

  return page({
    title: 'Download Policy: Legal Distribution, File Integrity & Safety Rules',
    description: 'Learn how DroidShelf handles APK downloads: official source redirection, authorized mirror hosting, cryptographic SHA-256 verification, and anti-piracy rules.',
    path: '/download-policy/',
    crumbs: [['Home', '/'], ['Download Policy', '/download-policy/']],
    body,
  });
}

// ============================================================================
// 6. PRIVACY POLICY PAGE (Verified 1,286 Words & Strong Internal Linking)
// ============================================================================
export function privacyPolicyPage() {
  const body = html\`${privacyBody}\`;

  return page({
    title: 'Privacy Policy: Transparent Data Practices & Anti-Tracking Pledge',
    description: 'Our privacy policy explains our minimal data collection: no third-party tracking, anonymous event counts, and secure form processing.',
    path: '/privacy/',
    crumbs: [['Home', '/'], ['Privacy Policy', '/privacy/']],
    body,
  });
}

// ============================================================================
// 7. TERMS OF SERVICE PAGE
// ============================================================================
export function termsPage() {
  const body = html\`
<header class="page-head">
  <h1>Terms of Service</h1>
  <p class="lead">Rules and terms governing the use of the \${config.siteName} website.</p>
  <p class="meta" style="margin-top: 0.75rem; color: var(--muted); font-size: 0.9rem;">Effective Date: November 1, 2025 · Last Reviewed: August 18, 2026</p>
</header>

<section class="static-content">
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing or using \${config.siteName}, you agree to comply with these Terms of Service. If you do not agree with any part of these terms, please discontinue use of our site.</p>

  <h2>2. Use of Information</h2>
  <p>All content on \${config.siteName} is provided for general informational purposes. While we endeavor to keep specifications, versions, and links accurate, software changes frequently. Always check official developer notes before making purchasing or security decisions.</p>

  <h2>3. User Submissions</h2>
  <p>By submitting reviews, suggestions, or reports, you grant \${config.siteName} a non-exclusive license to display the content on our platform. You agree not to submit unlawful, defamatory, misleading, or copyrighted material without authorization.</p>

  <h2>4. Disclaimer of Warranties</h2>
  <p>The website and all materials are provided "as is" without warranty of any kind. We do not warrant that files or services will be uninterrupted or error-free.</p>

  <h2>5. Limitation of Liability</h2>
  <p>In no event shall \${config.siteName} or its operators be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the site or downloaded software.</p>
</section>\`;

  return page({
    title: 'Terms of Service',
    description: 'Terms and conditions governing the use of DroidShelf, content usage, community submissions, and disclaimers.',
    path: '/terms/',
    crumbs: [['Home', '/'], ['Terms of Service', '/terms/']],
    body,
  });
}

// ============================================================================
// 8. COOKIE POLICY PAGE
// ============================================================================
export function cookiePolicyPage() {
  const body = html\`
<header class="page-head">
  <h1>Cookie Policy</h1>
  <p class="lead">Information on how and why we use HTTP cookies.</p>
  <p class="meta" style="margin-top: 0.75rem; color: var(--muted); font-size: 0.9rem;">Effective Date: November 1, 2025 · Last Reviewed: August 18, 2026</p>
</header>

<section class="static-content">
  <h2>1. What Are Cookies?</h2>
  <p>Cookies are small text files placed on your browser by websites you visit. They help websites remember essential session data.</p>

  <h2>2. Cookies Used on \${config.siteName}</h2>
  <p>We only use strictly essential, first-party technical cookies:</p>
  <ul>
    <li><strong>csrf:</strong> A cryptographically randomized session token used to prevent Cross-Site Request Forgery attacks when submitting reviews or contact inquiries.</li>
    <li><strong>adm:</strong> An encrypted administrative authentication cookie used exclusively by verified site administrators to access moderation dashboards.</li>
  </ul>

  <h2>3. No Third-Party Advertising Cookies</h2>
  <p>We do not set third-party marketing, analytics, or behavioral advertising cookies on your device.</p>

  <h2>4. Managing Cookies</h2>
  <p>You can configure your browser to block cookies. Note that blocking our essential CSRF cookie will prevent you from submitting reviews or forms on our website.</p>
</section>\`;

  return page({
    title: 'Cookie Policy: Essential Cookies Only',
    description: 'Learn about our cookie usage: strictly essential security tokens and no third-party tracking cookies.',
    path: '/cookies/',
    crumbs: [['Home', '/'], ['Cookie Policy', '/cookies/']],
    body,
  });
}

// ============================================================================
// 9. COPYRIGHT & DMCA POLICY PAGE (Verified 1,264 Words & Strong Internal Linking)
// ============================================================================
export function copyrightPage() {
  const body = html\`${copyrightBody}\`;

  return page({
    title: 'Copyright and DMCA Policy: Removal Requests & Legal Compliance',
    description: 'Information for copyright owners on how to file an infringement notice, required documentation, and counter-notification processes.',
    path: '/copyright/',
    crumbs: [['Home', '/'], ['Copyright & DMCA', '/copyright/']],
    body,
  });
}

// ============================================================================
// 10. DISCLAIMER PAGE
// ============================================================================
export function disclaimerPage() {
  const body = html\`
<header class="page-head">
  <h1>Disclaimer</h1>
  <p class="lead">Important legal notices regarding trademarks, software links, and site affiliation.</p>
  <p class="meta" style="margin-top: 0.75rem; color: var(--muted); font-size: 0.9rem;">Effective Date: November 1, 2025 · Last Reviewed: August 20, 2026</p>
</header>

<section class="static-content">
  <h2>1. Trademark Notice</h2>
  <p>Android, Google Play, and the Google Play logo are trademarks of Google LLC. All other product names, logos, brands, trademarks, and registered trademarks featured or referred to on \${config.siteName} are the property of their respective trademark holders.</p>

  <h2>2. Non-Affiliation</h2>
  <p>\${config.siteName} is an independent publication. Reference to any commercial product, process, service, manufacturer, or developer does not constitute endorsement, sponsorship, or recommendation by \${config.siteName}, nor does it imply affiliation with the publisher.</p>

  <h2>3. Software Safety Notice</h2>
  <p>Users download and install software at their own discretion. While we verify file integrity and link directly to official sources, we recommend that users maintain active device security and review Android permission prompts when installing applications.</p>
</section>\`;

  return page({
    title: 'Disclaimer: Trademark Notices and Affiliation Statements',
    description: 'Legal disclaimer: non-affiliation with Google LLC, trademark attribution, and software installation notices for DroidShelf.',
    path: '/disclaimer/',
    crumbs: [['Home', '/'], ['Disclaimer', '/disclaimer/']],
    body,
  });
}

// ============================================================================
// 11. HTML SITEMAP PAGE
// ============================================================================
export function sitemapHtmlPage() {
  const apps = D.listApps();
  const categories = D.listCategories();
  const guides = D.listGuides();
  const devs = D.listDevelopers();
  const cmps = D.listComparisons();

  const body = html\`
<header class="page-head">
  <h1>HTML Sitemap</h1>
  <p class="lead">A complete overview of key sections, categories, guides, and cataloged applications across \${config.siteName}.</p>
</header>

<div class="sitemap-grid">
  <section class="sitemap-section">
    <h2>Main Sections</h2>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/apps/">Apps Directory</a></li>
      <li><a href="/games/">Games Directory</a></li>
      <li><a href="/categories/">Categories Index</a></li>
      <li><a href="/latest/">Latest Additions</a></li>
      <li><a href="/updated/">Recently Updated</a></li>
      <li><a href="/popular/">Popular Apps</a></li>
      <li><a href="/reviews/">Recent Reviews</a></li>
      <li><a href="/compare/">App Comparisons</a></li>
      <li><a href="/alternatives/">App Alternatives</a></li>
      <li><a href="/versions/">Version History</a></li>
      <li><a href="/developers/">Developers Directory</a></li>
      <li><a href="/guides/">Android Guides</a></li>
      <li><a href="/search/">Search Apps</a></li>
    </ul>
  </section>

  <section class="sitemap-section">
    <h2>Core Categories</h2>
    <ul>
      \${categories.map((c) => html\`<li><a href="\${catUrl(c)}">\${c.name} (\${c.app_count} apps)</a></li>\`)}
    </ul>
  </section>

  <section class="sitemap-section">
    <h2>Android Guides &amp; Tutorials</h2>
    <ul>
      \${guides.slice(0, 30).map((g) => html\`<li><a href="/guides/\${g.slug}/">\${g.title}</a></li>\`)}
    </ul>
  </section>

  <section class="sitemap-section">
    <h2>App Comparisons</h2>
    <ul>
      \${cmps.map((c) => html\`<li><a href="/compare/\${c.slug}/">\${c.a_name} vs \${c.b_name}</a></li>\`)}
    </ul>
  </section>

  <section class="sitemap-section">
    <h2>Verified Developers</h2>
    <ul>
      \${devs.slice(0, 30).map((d) => html\`<li><a href="/developer/\${d.slug}/">\${d.name} (\${d.app_count})</a></li>\`)}
    </ul>
  </section>

  <section class="sitemap-section">
    <h2>Legal &amp; Policy Pages</h2>
    <ul>
      <li><a href="/about/">About Us</a></li>
      <li><a href="/contact/">Contact Us</a></li>
      <li><a href="/editorial-policy/">Editorial Policy</a></li>
      <li><a href="/review-policy/">User Review Policy</a></li>
      <li><a href="/download-policy/">Download Policy</a></li>
      <li><a href="/copyright/">Copyright &amp; DMCA</a></li>
      <li><a href="/privacy/">Privacy Policy</a></li>
      <li><a href="/terms/">Terms of Service</a></li>
      <li><a href="/cookies/">Cookie Policy</a></li>
      <li><a href="/disclaimer/">Disclaimer</a></li>
    </ul>
  </section>
</div>\`;

  return page({
    title: \`HTML Sitemap: Complete Index of \${config.siteName}\`,
    description: \`Browse the complete index of Android applications, games, guides, developer profiles, and categories on \${config.siteName}.\`,
    path: '/sitemap/',
    crumbs: [['Home', '/'], ['Sitemap', '/sitemap/']],
    body,
  });
}
`;

fs.writeFileSync('./src/pages/static-pages.js', fullStaticPages);
console.log('Successfully written src/pages/static-pages.js with all verified policies!');
