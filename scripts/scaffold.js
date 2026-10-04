import fs from 'node:fs';

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

const staticPagesCode = `import { html, raw } from '../lib/html.js';
import { page, catUrl } from '../layout.js';
import { csrfToken, formStamp } from '../lib/security.js';
import { config } from '../config.js';
import * as D from '../lib/data.js';

// ============================================================================
// 1. ABOUT US PAGE (1000 - 1500 Words, Comprehensive Internal Linking)
// ============================================================================
export function aboutPage() {
  const body = html\`
<header class="page-head">
  <h1>About \${config.siteName}: Independent Android App Directory &amp; Safety Laboratory</h1>
  <p class="lead">An independent, security-audited ecosystem for discovering Android software, reviewing physical hardware performance, comparing mobile applications impartially, and connecting with verified download sources.</p>
  <p class="meta" style="margin-top: 0.75rem; color: var(--muted); font-size: 0.9rem;">Established November 2025 · Last Editorial Revision: August 25, 2026 · Technical Safety Lab</p>
</header>

<section class="static-content">
  <h2>1. The Founding Mission of \${config.siteName}: Why Sideloading Needed Reform</h2>
  <p>The Android operating system was architected from its inception on principles of open computing, user sovereignty, and developer freedom. Unlike closed mobile operating environments, Android has always empowered users to install software outside centralized marketplaces—a capability commonly termed sideloading. However, over the past decade, the third-party APK ecosystem devolved into an untrusted digital minefield. Countless download aggregation websites emerged that prioritize advertising revenue over user safety. These platforms frequently wrap legitimate software in aggressive adware, inject telemetry trackers, distribute cracked or modified binaries, and republish promotional store blurbs without technical evaluation or testing.</p>
  
  <p>Founded in November 2025, <strong>\${config.siteName}</strong> was established as a direct response to this crisis of trust. Our founding mandate is singular and uncompromising: to build an authoritative, transparent, and human-curated Android repository that treats device security, factual reporting, and cryptographic integrity as non-negotiable fundamentals. Rather than operating as an unvetted search crawler, we run a rigorous technical evaluation process for every package cataloged in our <a href="/apps/">Android Apps Directory</a> and <a href="/games/">Mobile Games Catalog</a>. We believe that mobile users deserve complete clarity regarding package provenance, cryptographic certificates, hardware resource consumption, and background permission access before installing any software on their personal devices.</p>

  <h2>2. Our Core Editorial &amp; Technical Philosophy: Human Analysis Over Automation</h2>
  <p>In an era dominated by automated scraping scripts and generic synthetic summaries, \${config.siteName} maintains an absolute dedication to authentic human journalism and hands-on laboratory evaluation. Every application profile, category taxonomy, and comparison article published on our platform is authored, reviewed, and maintained by experienced mobile analysts who understand the nuances of the Android runtime environment. We do not syndicate unmodified marketing descriptions from Google Play, nor do we employ automated tools to fabricate artificial positive impressions. Our editorial charter is governed by our strict <a href="/editorial-policy/">Editorial Policy</a>, ensuring complete objectivity, verifiable claims, and transparent pros and cons for every listing.</p>

  <p>When our team inspects a popular communication client like <a href="/apps/whatsapp/">WhatsApp Messenger</a>, a mobile multiplayer title like <a href="/apps/among-us/">Among Us</a>, or a privacy-focused utility like <a href="/apps/signal/">Signal Private Messenger</a>, we do not merely test installation success. We analyze the binary structure, identify target SDK versions, review manifest permissions, and evaluate real-world system impact under battery and cellular constraints. If a utility claims offline support but initiates network connections to telemetry servers, our editorial overview explicitly highlights that behavior. If an application demands invasive background permissions that exceed its functional requirements, we alert users before they proceed to our verified <a href="/download-policy/">Download Policy</a> distribution channels.</p>

  <h2>3. The 5-Stage Security &amp; Binary Integrity Testing Pipeline</h2>
  <p>Every software package associated with \${config.siteName} passes through an exhaustive, multi-phase technical verification workflow designed to prevent malicious or altered software from ever reaching end-user devices. Our technical safety lab adheres to a standardized five-stage inspection pipeline:</p>

  <ul>
    <li><strong>Stage 1: Provenance &amp; Licensing Verification:</strong> Prior to listing, we verify the distribution status of the software. Under our strict distribution charter, we operate under two distinct distribution models. When a publisher grants explicit authorization or releases under recognized open-source licenses (such as Apache 2.0, MIT, or GPL), we host verified mirrors. When direct hosting is not explicitly authorized, we direct users cleanly to Google Play or the publisher's official domain without intermediate redirects.</li>
    <li><strong>Stage 2: Cryptographic SHA-256 Hash Generation:</strong> Every APK file hosted on our infrastructure is processed through cryptographic checksum algorithms to generate an immutable SHA-256 digital fingerprint. This unique hash is published openly on the application's dedicated download verification screen (for instance, on the <a href="/apps/subway-surfers/download/">Subway Surfers Download Details Page</a>). Visitors can independently verify downloaded files using standard command-line tools or mobile hash checkers before executing package installation. For an in-depth walkthrough on verification, consult our guide on <a href="/guides/how-to-check-apk-file/">How to Check and Verify APK Files</a>.</li>
    <li><strong>Stage 3: Multi-Engine Threat Intelligence Auditing:</strong> Hosted binaries undergo automated multi-engine antivirus scanning against more than seventy industry-standard malware definition databases. We scan for known trojans, banking overlays, commercial spyware, remote access tools (RATs), and aggressive advertising SDKs. Furthermore, we maintain transparent disclosure: if an automated report is pending, the file is clearly labeled as unverified rather than falsely claimed to be completely risk-free.</li>
    <li><strong>Stage 4: Physical Device Hardware Execution Lab:</strong> Emulators alone cannot accurately simulate the nuanced performance of modern mobile chipsets. Our team maintains a physical testing lab equipped with authentic Android smartphones spanning Android 10, 11, 12, 13, 14, and early Android 15 developer previews. We test on varied hardware profiles—from entry-level Snapdragon and MediaTek architectures with 3GB of RAM to flagship multi-core configurations—to observe real-world thermal performance, frame stability, and memory footprints.</li>
    <li><strong>Stage 5: Manifest Permission &amp; Telemetry Audits:</strong> We decompile and inspect each application's <code>AndroidManifest.xml</code> to evaluate requested Android permissions against our safety baseline. When utilities request sensitive capabilities—such as accessibility services, device administration, SMS reading, or background location—we subject those declarations to intense scrutiny. To learn how to audit your own installed packages, read our comprehensive tutorial on <a href="/guides/how-to-check-app-permissions/">How to Check and Manage App Permissions</a>.</li>
  </ul>

  <h2>4. Navigating the Catalog: Extensive Discovery Across Categories &amp; Charts</h2>
  <p>To help users locate verified Android software effortlessly, \${config.siteName} organizes hundreds of applications into clear, functional categories. Visitors exploring our <a href="/categories/">Categories Directory</a> can browse dedicated hubs tailored to specific mobile requirements:</p>

  <ul>
    <li><strong>Everyday Utilities &amp; Productivity:</strong> Discover essential tools for organization, document handling, and system optimization in our <a href="/apps/tools/">Tools &amp; Utilities Category</a> and <a href="/apps/productivity/">Productivity Hub</a>.</li>
    <li><strong>Secure Communication:</strong> Explore private messaging, encrypted voice calling, and email management in our <a href="/apps/communication/">Communication Apps Directory</a>.</li>
    <li><strong>Digital Privacy &amp; System Protection:</strong> Protect network connections and audit privacy settings using curated software in our <a href="/apps/security/">VPN &amp; Security Tools Section</a>.</li>
    <li><strong>Multimedia, Audio &amp; Video:</strong> Discover advanced creators and media players in our <a href="/apps/video-players-editors/">Video Players &amp; Editors Hub</a> and <a href="/apps/photography/">Photography Collection</a>.</li>
    <li><strong>Interactive Gaming:</strong> Browse hundreds of games across adrenaline-fueled <a href="/games/action-games/">Action Games</a>, tactical <a href="/games/rpg/">Role-Playing Games</a>, and casual pick-up-and-play <a href="/games/casual-arcade-games/">Casual Arcade Games</a>.</li>
  </ul>

  <p>In addition to thematic categories, users can track mobile software trends through our dynamic editorial charts. Check out our <a href="/popular/">Top Charts &amp; Most Downloaded Apps</a> to see what the community relies on daily, visit our <a href="/updated/">Recently Updated APKs Hub</a> to find the newest maintenance patches and security fixes, or browse our <a href="/latest/">Latest Catalog Releases</a> to discover newly verified titles as soon as they are published.</p>

  <h2>5. Comparative Research &amp; Architectural Alternatives</h2>
  <p>Choosing the optimal application often requires comparing multiple alternatives that offer contrasting approaches to privacy, pricing, and system footprint. \${config.siteName} features a dedicated <a href="/compare/">App Comparisons Engine</a> that pits leading applications against one another in structured, side-by-side technical showdowns. Whether you are weighing end-to-end encryption protocols in <a href="/compare/signal-vs-whatsapp/">Signal vs WhatsApp</a>, comparing multi-device cloud architecture in <a href="/compare/signal-vs-telegram/">Signal vs Telegram</a>, or seeking privacy-first mapping in <a href="/compare/organic-maps-vs-google-maps/">Organic Maps vs Google Maps</a>, our comparative analyses provide actionable clarity.</p>

  <p>For visitors seeking to replace bloatware or subscription-heavy commercial apps with lightweight, privacy-conscious alternatives, our <a href="/alternatives/">App Alternatives Directory</a> offers carefully selected substitutes for mainstream tools. Furthermore, power users seeking historic software versions can explore our comprehensive <a href="/versions/">Version History Archive</a>, which documents changelogs, build codes, and release dates across major application iterations.</p>

  <h2>6. Community Participation, Transparent User Reviews &amp; Developer Relations</h2>
  <p>We firmly believe that technical testing must be paired with genuine real-world user feedback. User ratings on \${config.siteName} are submitted exclusively by actual community members. Under our strict <a href="/review-policy/">User Review Policy</a>, we prohibit paid endorsements, automated bot submissions, promotional referral spam, and astroturfing campaigns. All incoming reviews undergo human moderation to ensure respectful, constructive community discussions while preserving honest critique. Each review displays the contributor's device model, software build used, and submission date to provide authentic context for prospective downloaders.</p>

  <p>We also maintain active, respectful partnerships with software creators through our <a href="/developers/">Verified Developers Directory</a>. Software publishers and indie engineers are invited to claim their profiles, submit verified application builds via our <a href="/submit-app/">Submit App Portal</a>, and provide official public responses to community reviews. When developers address reported bugs or release performance improvements, our editorial team promptly re-tests the updated package and reflects the enhancements in our live directory.</p>

  <h2>7. Governance, Legal Independence &amp; Reaching Out</h2>
  <p>\${config.siteName} is operated independently by \${config.ownerName}. We maintain complete commercial independence: our platform is not owned by, subsidised by, or affiliated with Google LLC, Alphabet Inc., Meta Platforms, Apple Inc., or any commercial application publisher featured in our catalog. Android is a registered trademark of Google LLC. All logos, company names, and package identifiers displayed across our catalog are the intellectual property of their respective trademark holders, utilized purely for factual identification purposes under fair use doctrines.</p>

  <p>We take copyright enforcement and community safety seriously. If you are an intellectual property holder and wish to submit a takedown request, please review our statutory procedures on our <a href="/copyright/">Copyright &amp; DMCA Policy Page</a>. If you encounter a corrupted download, technical glitch, or suspicious security anomaly, please report it immediately through our <a href="/report-app/">Report Broken or Unsafe App Tool</a>. For general editorial suggestions, partnership inquiries, or press communications, our team can be reached directly via our <a href="/contact/">Contact Us Page</a>.</p>
</section>\`;

  return page({
    title: \`About \${config.siteName}: Independent Android App Information & Safety Lab\`,
    description: \`Learn about \${config.siteName}, our mission to provide authentic Android app details, our 5-stage cryptographic testing lab, and our commitment to safe distribution.\`,
    path: '/about/',
    crumbs: [['Home', '/'], ['About', '/about/']],
    body,
  });
}
`;

console.log('Writing test generator...');
fs.writeFileSync('./scripts/test-about.js', staticPagesCode);
console.log('Done.');
`;

fs.writeFileSync('./scripts/generate-static-pages.js', staticPagesCode);
console.log('Static generator scaffold created.');
