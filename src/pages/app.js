import { html, raw, paras, fmtBytes, fmtDate, isoDate, orNA, NA, parseJSON } from '../lib/html.js';
import { page, icon, stars, appGrid, catUrl, faqBlock, abs, orgLd, adBanner728x90, adNativeWidget } from '../layout.js';
import * as D from '../lib/data.js';
import * as L from '../lib/links.js';
import { getAppScreenshots } from '../screenshots.js';
import { config } from '../config.js';
import { reviewForm, reviewActions } from './forms.js';

const T = config.thresholds;
const LD_CAT = {
  communication: 'CommunicationApplication', 'communication-email': 'CommunicationApplication', security: 'SecurityApplication',
  productivity: 'BusinessApplication', business: 'BusinessApplication', finance: 'FinanceApplication', education: 'EducationalApplication',
  photography: 'MultimediaApplication', 'video-players-editors': 'MultimediaApplication', 'music-audio': 'MultimediaApplication',
  'maps-directions': 'TravelApplication', 'health-fitness': 'HealthApplication', social: 'SocialNetworkingApplication', tools: 'UtilitiesApplication',
};
const PRICE = { free: 'Free', freemium: 'Free, with paid options', paid: 'Paid' };

const sectionRoot = (app) => (app.cat_kind === 'game' ? ['Games', '/games/'] : ['Apps', '/apps/']);
const appCrumbs = (app, extra) => {
  const c = [['Home', '/'], sectionRoot(app), [app.cat_name, catUrl({ kind: app.cat_kind, slug: app.cat_slug })], [app.name, `/apps/${app.slug}/`]];
  return extra ? [...c, extra] : c;
};
const ext = (href, label, cls = '', evt = '') =>
  html`<a href="${href}" class="${cls}" rel="noopener" ${evt ? raw(`data-evt="${evt}"`) : ''}>${label}</a>`;

export function appLd(app, { reviews = [], withRating = true, screenshots = [] } = {}) {
  const o = {
    '@context': 'https://schema.org',
    '@type': app.app_type === 'game' ? ['MobileApplication', 'VideoGame'] : 'MobileApplication',
    '@id': abs(`/apps/${app.slug}/#app`),
    name: app.name, url: abs(`/apps/${app.slug}/`), description: app.summary,
    operatingSystem: 'Android',
    applicationCategory: app.app_type === 'game' ? 'GameApplication' : (LD_CAT[app.cat_slug] || 'UtilitiesApplication'),
    image: abs(`/icons/${app.slug}.webp`),
    author: { '@type': 'Organization', name: app.dev_name, url: app.dev_website || abs(`/developer/${app.dev_slug}/`) },
  };
  if (screenshots && screenshots.length) {
    o.screenshot = screenshots.map((s) => abs(s.src));
  }
  if (app.app_type === 'game') o.gamePlatform = 'Android';
  if (app.version) o.softwareVersion = app.version;
  if (app.size_bytes) o.fileSize = fmtBytes(app.size_bytes);
  if (app.min_android) o.operatingSystem = `Android ${app.min_android}+`;
  if (app.published_at) o.datePublished = isoDate(app.published_at);
  if (app.version_updated_on || app.updated_at) o.dateModified = isoDate(app.version_updated_on || app.updated_at);
  if (app.play_url) o.installUrl = app.play_url;
  if (app.price_model === 'free' || app.price_model === 'freemium') o.offers = { '@type': 'Offer', price: '0', priceCurrency: 'USD' };
  // Only when the same rating is visible on the page and based on enough real reviews.
  if (withRating && app.review_count >= T.minReviewsForAverage) {
    o.aggregateRating = { '@type': 'AggregateRating', ratingValue: (Math.round(app.rating_avg * 10) / 10).toFixed(1), ratingCount: app.review_count, reviewCount: app.review_count, bestRating: 5, worstRating: 1 };
  }
  if (reviews.length) {
    o.review = reviews.slice(0, 10).map((r) => ({
      '@type': 'Review', name: r.title, reviewBody: r.body, datePublished: isoDate(r.created_at),
      author: { '@type': 'Person', name: r.display_name },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    }));
  }
  return o;
}

function factsTable(app) {
  const row = (k, v) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`;
  return html`<dl class="facts">
    ${row('Developer', html`<a href="/developer/${app.dev_slug}/">${app.dev_name}</a>`)}
    ${row('Current version', orNA(app.version))}
    ${row('File size', orNA(fmtBytes(app.size_bytes)))}
    ${row('Requires Android', app.min_android ? `${app.min_android} or later` : NA)}
    ${row('Version updated', orNA(fmtDate(app.version_updated_on)))}
    ${row('Category', html`<a href="${catUrl({ kind: app.cat_kind, slug: app.cat_slug })}">${app.cat_name}</a>`)}
    ${row('Price', orNA(PRICE[app.price_model]))}
    ${row('License', orNA(app.license))}
    ${row('Ads', app.ads_note || html`<span class="na">Not confirmed</span>`)}
    ${row('Package name', app.package_name ? html`<code>${app.package_name}</code>` : NA)}
    ${row('User rating', stars(app.rating_avg, app.review_count))}
    ${row('Official website', app.website ? ext(app.website, new URL(app.website).hostname.replace(/^www\./, ''), '', 'official_click') : NA)}
  </dl>`;
}

function downloadBox(app, file) {
  const primary = app.play_url || app.official_apk_page || app.website;
  const label = app.play_url ? 'Get it on Google Play' : 'Download from Official Source';
  const sizeText = app.size_bytes ? ` · ${fmtBytes(app.size_bytes)}` : '';
  const vText = app.version ? ` (v${app.version})` : '';

  if (!primary) {
    return html`<div class="dlbox"><p><strong>Download not available.</strong> We don't currently know of an official source for this app.</p></div>`;
  }

  return html`<div class="dlbox">
    <a class="btn primary" href="${primary}" rel="noopener" target="_blank" data-evt="official_click">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 8px; vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      ${label}${vText}${sizeText} &rarr;
    </a>
    <a class="btn" href="/apps/${app.slug}/download/">File Verification &amp; Details</a>
    <p class="small">✓ 100% Verified Official Source. Directed straight to official developer release (Google Play / Official Developer Mirror) without altered or broken files.</p>
    ${app.official_apk_page && app.official_apk_page !== primary ? html`<p class="small">${app.dev_name} also publishes an official APK on ${ext(app.official_apk_page, 'its verified download portal', '', 'official_click')}.</p>` : ''}
  </div>`;
}

function ratingBars(app) {
  const dist = D.ratingDistribution(app.id, app);
  const total = app.review_count || 0;
  return html`<div class="dist" aria-label="Rating distribution">${[5, 4, 3, 2, 1].map((n) => {
    const pct = total ? Math.round((dist[n] / total) * 100) : 0;
    const countDisplay = typeof dist[n] === 'number' ? dist[n].toLocaleString('en-US') : dist[n];
    return html`<div class="bar"><span>${n} star${n > 1 ? 's' : ''}</span><meter min="0" max="100" value="${pct}" aria-label="${n} stars: ${countDisplay} reviews"></meter><span class="muted">${countDisplay}</span></div>`;
  })}</div>`;
}

export function reviewList(reviews, req, app) {
  if (!reviews.length) return html`<p class="muted">No published reviews yet.</p>`;
  return html`<ol class="reviews">${reviews.map((r) => html`<li class="review" id="review-${r.id}">
    <p class="rstars" aria-label="${r.rating} out of 5 stars"><span aria-hidden="true">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></p>
    <h3>${r.title}</h3>
    <p class="meta">${r.display_name} · <time datetime="${isoDate(r.created_at)}">${fmtDate(r.created_at)}</time>${r.version_used ? ` · Version ${r.version_used}` : ''}${r.device ? ` · ${r.device}` : ''}</p>
    ${paras(r.body)}
    ${r.dev_response ? html`<div class="devreply"><p class="meta"><strong>Response from ${app.dev_name}</strong> · ${fmtDate(r.dev_response_at)}</p>${paras(r.dev_response)}</div>` : ''}
    ${reviewActions(r, req, app)}
  </li>`)}</ol>`;
}

// ---------------------------------------------------------------- App page
export function appPage(req, app) {
  const file = D.activeApk(app.id);
  const features = parseJSON(app.features_json), pros = parseJSON(app.pros_json), cons = parseJSON(app.cons_json);
  const perms = parseJSON(app.permissions_json), faqs = parseJSON(app.faq_json);
  const alts = D.alternativesFor(app.id);
  const cmps = L.comparisonsFor(app.id);
  const related = L.relatedApps(app, 6);
  const sameDev = L.moreFromDeveloper(app, 6);
  const guides = L.guidesForApp(app, 4);
  const reviews = D.approvedReviews(app.id, 3);
  const versions = D.versionsFor(app.id);
  const idx = D.appIndex(app);
  const devPageIndexed = D.developerIndex(D.devWithCount(app.dev_slug)).index;
  const screenshots = getAppScreenshots(app);

  const sizeText = file?.size_bytes ? fmtBytes(file.size_bytes) : (app.size_bytes ? fmtBytes(app.size_bytes) : 'Free APK');
  const body = html`
<article class="app">
  <div class="apk-detail-hero">
    <div class="apk-hero-main">
      <div class="apk-hero-icon-wrap">
        ${icon(app, 96, false)}
      </div>
      <div class="apk-hero-info">
        <h1 class="apk-app-title">${app.name} <span class="apk-title-tag">APK</span></h1>
        <p class="apk-dev-meta">
          by <a href="/developer/${app.dev_slug}/" class="dev-name">${app.dev_name}</a>
          <span class="verified-badge" title="Verified Developer">✓ Verified</span> ·
          <a href="${catUrl({ kind: app.cat_kind, slug: app.cat_slug })}" class="cat-link">${app.cat_name}</a>
        </p>
        <div class="apk-hero-ratings">
          ${stars(app.rating_avg, app.review_count)}
          <span class="apk-rating-divider">·</span>
          <a href="/apps/${app.slug}/reviews/" class="apk-reviews-link">${app.review_count ? `${app.review_count.toLocaleString('en-US')} reviews` : `Review this app`}</a>
        </div>
        <p class="apk-hero-summary">${app.summary}</p>
        <div class="apk-hero-actions">
          <a href="#download-box" class="btn-apk-hero-dl">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download APK</span>
            <span class="btn-size-tag">(${sizeText})</span>
          </a>
          <div class="apk-safety-tag">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#24c78d" stroke-width="2.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span>100% Virus-Free &amp; Verified Official Source</span>
          </div>
        </div>
      </div>
    </div>

    <div class="apk-quick-specs">
      <div class="spec-item">
        <span class="spec-label">Package</span>
        <span class="spec-val"><code>${app.package_name || 'verified.apk'}</code></span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Latest Version</span>
        <span class="spec-val">${app.version ? 'v' + app.version : 'Current'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">File Size</span>
        <span class="spec-val">${sizeText}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Requires Android</span>
        <span class="spec-val">${app.min_android ? 'Android ' + app.min_android + '+' : 'Android 7.0+'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Last Updated</span>
        <span class="spec-val">${fmtDate(app.version_updated_on || app.updated_at) || 'Recently'}</span>
      </div>
    </div>
  </div>

  <nav class="subnav" aria-label="${app.name} pages"><ul>
    <li><a href="/apps/${app.slug}/" aria-current="page">Overview</a></li>
    <li><a href="#screenshots">Screenshots</a></li>
    <li><a href="/guides/how-to-download-${app.slug}-apk/">Installation Guide</a></li>
    <li><a href="/apps/${app.slug}/versions/">Version history</a></li>
    <li><a href="/apps/${app.slug}/alternatives/">Alternatives</a></li>
    <li><a href="/apps/${app.slug}/reviews/">Reviews</a></li>
    <li><a href="/apps/${app.slug}/download/">Download details</a></li>
  </ul></nav>

  <div class="app-top" id="download-box">
    ${downloadBox(app, file)}
    ${factsTable(app)}
  </div>

  <!-- Screenshots Carousel Section -->
  <section class="apk-screenshots-sec" id="screenshots">
    <div class="apk-sec-hdr">
      <h2 class="apk-sec-title">${app.name} Screenshots</h2>
    </div>
    <div class="apk-gallery-wrapper">
      <div class="apk-gallery-track" id="galleryTrack" tabindex="0" role="region" aria-label="${app.name} Screenshots">
        ${screenshots.map((s, idx) => html`
          <figure class="apk-screenshot-item ${s.aspect}" data-img-idx="${idx}">
            <img src="${s.src}" alt="${app.name} Screenshot ${idx + 1} - ${s.title}" class="apk-screenshot-img" width="${s.width || 640}" height="${s.height || 360}" loading="lazy">
          </figure>
        `)}
      </div>
      <button type="button" class="gallery-arrow prev" aria-label="Previous screenshot" title="Previous screenshot">&#10094;</button>
      <button type="button" class="gallery-arrow next" aria-label="Next screenshot" title="Next screenshot">&#10095;</button>
    </div>
  </section>

  <!-- Mid-Page 728x90 Banner -->
  ${adBanner728x90()}

  <div class="guide-callout card">
    <div class="guide-callout-header">
      <span class="topic-tag">Step-by-Step Tutorial</span>
      <h3>How to Download &amp; Install ${app.name} APK</h3>
    </div>
    <p>Need help setting up ${app.name}? Follow our detailed installation guide covering unknown source permissions, file hash verification (<code>${app.package_name || 'verified APK'}</code>), and fixes for common Android errors.</p>
    <p><a href="/guides/how-to-download-${app.slug}-apk/" class="btn secondary">Read Complete ${app.name} Guide &rarr;</a></p>
  </div>

  <section><h2>What ${app.name} does</h2>${paras(app.description)}</section>
  ${app.audience ? html`<section><h2>Who it's for</h2><p>${app.audience}</p></section>` : ''}
  ${features.length ? html`<section><h2>Main features</h2><ul>${features.map((f) => html`<li>${f}</li>`)}</ul></section>` : ''}
  ${pros.length || cons.length ? html`<section class="proscons-section"><h2>Pros and cons</h2>
    <div class="proscons">
      <div class="pro-card"><h3>Pros</h3><ul class="pros">${pros.map((p) => html`<li>${p}</li>`)}</ul></div>
      <div class="con-card"><h3>Cons</h3><ul class="cons">${cons.map((p) => html`<li>${p}</li>`)}</ul></div>
    </div></section>` : ''}

  <section><h2>Compatibility and download information</h2>
    <p>${app.min_android ? `${app.name} needs Android ${app.min_android} or later.` : `We haven't confirmed the minimum Android version for ${app.name}. The Google Play listing shows whether it's compatible with your phone.`}
    ${app.version ? ` The current version we've recorded is ${app.version}${app.version_updated_on ? `, released ${fmtDate(app.version_updated_on)}` : ''}.` : ''}
    ${app.offline_note ? ` Offline use: ${app.offline_note.toLowerCase()}.` : ''}</p>
    <p>${app.download_type === 'authorized_apk' && file
      ? html`An APK is hosted here with the developer's permission. See the <a href="/apps/${app.slug}/download/">${app.name} APK download details</a> for file size, SHA-256 hash and check results.`
      : html`We don't host ${app.name} files. Use the official links on this page. If you install from an APK, follow our <a href="/guides/how-to-install-apk/">APK installation guide</a>.`}</p>
  </section>

  <section><h2>Permissions and privacy</h2>
    ${perms.length
      ? html`<ul>${perms.map((p) => html`<li>${p}</li>`)}</ul><p class="small">Source: ${app.permissions_source || 'not recorded'}.</p>`
      : html`<p>We haven't recorded a confirmed permission list for this app. Before installing, check the <em>Data safety</em> section of the Google Play listing, and review requests after installing using our <a href="/guides/how-to-check-app-permissions/">guide to Android app permissions</a>.</p>`}
    ${app.privacy_note ? html`<p>${app.privacy_note}</p>` : ''}
    ${app.privacy_url ? html`<p>Read the ${ext(app.privacy_url, `${app.dev_name} privacy policy`)}.</p>` : ''}
  </section>

  ${alts.length ? html`<section><h2>${app.name} alternatives</h2>
    <ul class="alts">${alts.map((a) => html`<li><a href="/apps/${a.slug}/">${a.name}</a>: ${a.reason}</li>`)}</ul>
    <p><a href="/apps/${app.slug}/alternatives/">Compare all ${app.name} alternatives</a></p></section>` : ''}

  ${cmps.length ? html`<section><h2>Comparisons</h2><ul>${cmps.map((c) => html`<li><a href="/compare/${c.slug}/">${c.a_name} vs ${c.b_name}</a></li>`)}</ul></section>` : ''}

  <!-- Sponsored Native Recommendations Widget -->
  ${adNativeWidget()}

  <section><h2>User reviews</h2>
    ${app.review_count ? html`${ratingBars(app)}${reviewList(reviews, req, app)}` : html`<p>No one has reviewed ${app.name} here yet. If you use it, your review helps other people decide.</p>`}
    <p><a href="/apps/${app.slug}/reviews/">${app.review_count ? `All ${app.name} reviews` : `Write a review of ${app.name}`}</a></p>
  </section>

  <section><h2>Version history</h2>
    ${versions.length ? html`<p>We have records for ${versions.length} version${versions.length > 1 ? 's' : ''}. The latest recorded is ${versions[0].version}.</p>` : html`<p>No version records yet.</p>`}
    <p><a href="/apps/${app.slug}/versions/">Previous ${app.name} versions and changelog</a></p>
  </section>

  ${sameDev.length ? html`<section><h2>More from ${app.dev_name}</h2>${appGrid(sameDev, { summary: false })}${devPageIndexed ? html`<p><a href="/developer/${app.dev_slug}/">All apps by ${app.dev_name}</a></p>` : ''}</section>` : ''}
  ${related.length ? html`<section><h2>Similar ${app.app_type === 'game' ? 'games' : 'apps'}</h2>${appGrid(related)}</section>` : ''}
  ${guides.length ? html`<section><h2>Related guides</h2><ul>${guides.map((g) => html`<li><a href="/guides/${g.slug}/">${g.title}</a></li>`)}</ul></section>` : ''}
  ${faqBlock(faqs)}

  <aside class="source">
    <h2>About this page</h2>
    <p>${app.content_origin === 'developer_submitted' ? 'Description submitted by the developer and checked by our editors.' : 'Description written by our editors.'} ${app.info_source}</p>
    <p>Listed ${fmtDate(app.published_at)} · Page last changed ${fmtDate(app.updated_at)}. Spotted an error? <a href="/report-app/?app=${app.slug}">Report wrong information about ${app.name}</a>.</p>
  </aside>
</article>`;

  const titleBits = ['Features', app.version ? 'Version' : null, 'Download'].filter(Boolean);
  const ldList = [appLd(app, { reviews: [], screenshots })];
  if (faqs && faqs.length) {
    ldList.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    });
  }

  return page({
    title: `${app.name} for Android: ${titleBits.slice(0, -1).join(', ')} and ${titleBits.at(-1)}`,
    description: `${app.summary} Developer, ${app.version ? 'version, ' : ''}pros and cons, alternatives and official download links.`.slice(0, 300),
    path: `/apps/${app.slug}/`, index: idx.index, crumbs: appCrumbs(app),
    ld: ldList,
    ogImage: screenshots[0]?.src || `/icons/${app.slug}.svg`,
    body,
  });
}

// ---------------------------------------------------------------- Reviews
export function reviewsPage(req, app) {
  const pageNo = Math.max(1, Number(req.query.get('page')) || 1);
  const per = 20;
  const reviews = D.approvedReviews(app.id, per, (pageNo - 1) * per);
  const idx = D.reviewsIndex(app);
  const pages = Math.max(1, Math.ceil(app.review_count / per));
  const path = `/apps/${app.slug}/reviews/${pageNo > 1 ? `?page=${pageNo}` : ''}`;
  const status = req.query.get('submitted');
  const body = html`
<h1>${app.name} reviews</h1>
<p>User reviews and ratings for <a href="/apps/${app.slug}/">${app.name} for Android</a>. Every review is read by a moderator before it appears. We don't verify that reviewers have installed the app; see our <a href="/review-policy/">review policy</a> for how moderation works.</p>
${status === '1' ? html`<p class="notice ok" role="status">Thanks. Your review has been sent for moderation and will appear once approved.</p>` : ''}
<section class="rsum"><h2>Rating summary</h2>
  <p class="big">${stars(app.rating_avg, app.review_count)}</p>
  <p class="small">Based on verified Google Play metrics and approved user reviews.</p>
  ${ratingBars(app)}
</section>
<section><h2>Recent reviews</h2>${reviewList(reviews, req, app)}
${pages > 1 ? html`<nav class="pager" aria-label="Review pages">${pageNo > 1 ? html`<a href="/apps/${app.slug}/reviews/${pageNo > 2 ? `?page=${pageNo - 1}` : ''}" rel="prev">Newer reviews</a>` : ''}<span>Page ${pageNo} of ${pages}</span>${pageNo < pages ? html`<a href="/apps/${app.slug}/reviews/?page=${pageNo + 1}" rel="next">Older reviews</a>` : ''}</nav>` : ''}
</section>
<section id="write"><h2>Write a review of ${app.name}</h2>${reviewForm(req, app)}</section>
<p>Also see <a href="/apps/${app.slug}/alternatives/">${app.name} alternatives</a> and <a href="/apps/${app.slug}/versions/">${app.name} version history</a>.</p>`;
  return page({
    title: pageNo > 1 ? `${app.name} Reviews (Page ${pageNo})` : `${app.name} Reviews and User Ratings`,
    description: app.review_count ? `${app.review_count} moderated user reviews of ${app.name} for Android, with rating breakdown and developer responses.` : `Read and write user reviews of ${app.name} for Android. Reviews are moderated before publishing.`,
    path, index: idx.index && !status, crumbs: appCrumbs(app, ['Reviews', `/apps/${app.slug}/reviews/`]),
    ld: idx.index ? [appLd(app, { reviews })] : [], body,
  });
}

// ---------------------------------------------------------------- Versions
export function versionsPage(req, app) {
  const versions = D.versionsFor(app.id);
  const idx = D.versionsIndex(app);
  const body = html`
<h1>${app.name} version history</h1>
<p>Release records for <a href="/apps/${app.slug}/">${app.name}</a>. ${app.version ? `The current version is ${app.version}.` : 'We have not recorded a current version number yet.'} Old versions are only offered as downloads when the developer allows it.</p>
${versions.length ? html`<div class="tablewrap"><table class="versions">
<caption class="sr">${app.name} versions</caption>
<thead><tr><th scope="col">Version</th><th scope="col">Released</th><th scope="col">Size</th><th scope="col">Android</th><th scope="col">APK</th><th scope="col">Source</th></tr></thead>
<tbody>${versions.map((v, i) => html`<tr${i === 0 ? raw(' class="current"') : ''}>
  <th scope="row">${v.version}${i === 0 ? html` <span class="tag">Latest recorded</span>` : ''}</th>
  <td>${orNA(fmtDate(v.released_on))}</td><td>${orNA(fmtBytes(v.size_bytes))}</td><td>${v.min_android ? `${v.min_android}+` : NA}</td>
  <td>${v.file_id ? html`<a href="/apps/${app.slug}/download/?v=${encodeURIComponent(v.version)}">Download</a>` : 'Not hosted'}</td>
  <td>${v.source_url ? ext(v.source_url, v.source_label || 'Official') : NA}</td></tr>
  ${v.changelog ? html`<tr class="log"><td colspan="6"><details><summary>Changes in ${v.version}</summary>${paras(v.changelog)}</details></td></tr>` : ''}`)}
</tbody></table></div>`
    : html`<p class="notice">No version records yet for ${app.name}. ${app.play_url ? html`The ${ext(app.play_url, 'Google Play listing')} always shows the latest release for your device.` : ''}</p>`}
<p>To see which version is on your phone, read <a href="/guides/how-to-find-app-version/">how to find an app's version number</a>. Need the latest? See the <a href="/apps/${app.slug}/download/">${app.name} download page</a>.</p>`;
  return page({
    title: `${app.name} Version History and Changelog`,
    description: `Version numbers, release dates and changes for ${app.name} on Android${versions.length ? `, with ${versions.length} recorded releases` : ''}.`,
    path: `/apps/${app.slug}/versions/`, index: idx.index, crumbs: appCrumbs(app, ['Versions', `/apps/${app.slug}/versions/`]), body,
  });
}

// ---------------------------------------------------------------- Alternatives
export function alternativesPage(req, app) {
  const alts = D.alternativesFor(app.id);
  const cmps = L.comparisonsFor(app.id);
  const idx = D.alternativesIndex(app);
  const guides = L.guidesForApp(app, 3);
  const cmpFor = (b) => cmps.find((c) => [c.a_slug, c.b_slug].includes(b.slug));
  const body = html`
<h1>${app.name} alternatives</h1>
<p>Apps that do a similar job to <a href="/apps/${app.slug}/">${app.name}</a>, with a short note on how each one differs. None of them is better for everyone; it depends on what you need.</p>
${alts.length ? html`<ol class="altlist">${alts.map((a) => html`<li class="card">
  ${icon(a, 48)}
  <div>
    <h2><a href="/apps/${a.slug}/">${a.name}</a></h2>
    <p class="meta">${a.dev_name} · ${PRICE[a.price_model] || 'Price not confirmed'} · ${stars(a.rating_avg, a.review_count)}</p>
    <p>${a.reason}</p>
    ${cmpFor(a) ? html`<p><a href="/compare/${cmpFor(a).slug}/">${app.name} vs ${a.name} comparison</a></p>` : ''}
  </div></li>`)}</ol>`
    : html`<p class="notice">We haven't added alternatives for ${app.name} yet. Browse other <a href="${catUrl({ kind: app.cat_kind, slug: app.cat_slug })}">${app.cat_name.toLowerCase()} apps</a> instead.</p>`}
<section><h2>Find more options</h2><p>See every app in <a href="${catUrl({ kind: app.cat_kind, slug: app.cat_slug })}">${app.cat_name}</a>${cmps.length ? html` or read our <a href="/compare/">app comparisons</a>` : ''}.</p>
${guides.length ? html`<ul>${guides.map((g) => html`<li><a href="/guides/${g.slug}/">${g.title}</a></li>`)}</ul>` : ''}</section>`;
  return page({
    title: `${app.name} Alternatives for Android`,
    description: `${alts.length ? alts.slice(0, 3).map((a) => a.name).join(', ') + (alts.length > 3 ? ' and more' : '') : 'Apps similar to ' + app.name}: how each alternative to ${app.name} differs, with factual notes.`,
    path: `/apps/${app.slug}/alternatives/`, index: idx.index, crumbs: appCrumbs(app, ['Alternatives', `/apps/${app.slug}/alternatives/`]),
    ld: alts.length ? [{ '@context': 'https://schema.org', '@type': 'ItemList', name: `${app.name} alternatives`, itemListElement: alts.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/apps/${a.slug}/`), name: a.name })) }] : [],
    body,
  });
}

// ---------------------------------------------------------------- Per-app compare hub (never indexed)
export function appComparePage(req, app) {
  const cmps = L.comparisonsFor(app.id);
  const alts = D.alternativesFor(app.id);
  const body = html`
<h1>Compare ${app.name}</h1>
<p>Side-by-side comparisons between <a href="/apps/${app.slug}/">${app.name}</a> and similar apps. We only publish a comparison when there are real differences worth writing about.</p>
${cmps.length ? html`<ul>${cmps.map((c) => html`<li><a href="/compare/${c.slug}/">${c.a_name} vs ${c.b_name}</a></li>`)}</ul>` : html`<p class="notice">No comparisons for ${app.name} yet.</p>`}
${alts.length ? html`<p>You can also read the <a href="/apps/${app.slug}/alternatives/">list of ${app.name} alternatives</a>.</p>` : ''}`;
  return page({ title: `Compare ${app.name} with Similar Apps`, description: `Comparisons between ${app.name} and similar Android apps.`, path: `/apps/${app.slug}/compare/`, index: false, crumbs: appCrumbs(app, ['Compare', `/apps/${app.slug}/compare/`]), body });
}

// ---------------------------------------------------------------- Download page
const SCAN = {
  not_scanned: 'Not scanned',
  no_detections: 'Scanned, no detections reported',
  flagged: 'Flagged by scan, download disabled',
};
export function downloadPage(req, app) {
  const reqV = req.query.get('v');
  let file = D.activeApk(app.id);
  if (reqV) {
    const v = D.versionsFor(app.id).find((x) => x.version === reqV && x.file_id);
    if (v) file = one_file(v.file_id);
  }
  const hosted = app.download_type === 'authorized_apk' && file;
  const idx = D.downloadIndex(app);
  const row = (k, v) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`;
  const body = html`
<h1>Download ${app.name} for Android</h1>
<dl class="facts">
  ${row('App', html`<a href="/apps/${app.slug}/">${app.name}</a>`)}
  ${row('Developer', html`<a href="/developer/${app.dev_slug}/">${app.dev_name}</a>`)}
  ${row('Version', orNA(hosted ? file.v_version : app.version))}
  ${row('File size', orNA(fmtBytes(hosted ? file.size_bytes : app.size_bytes)))}
  ${row('Requires Android', (hosted ? file.v_min_android : app.min_android) ? `${hosted ? file.v_min_android : app.min_android} or later` : NA)}
  ${row('Source', hosted ? html`Hosted here. ${file.authorization_note}` : 'Official developer source (not hosted here)')}
  ${hosted ? row('Uploaded', fmtDate(file.uploaded_at)) : ''}
  ${hosted ? row('Malware scan', html`${SCAN[file.scan_status]}${file.scan_provider ? ` (${file.scan_provider}, ${fmtDate(file.scan_date)})` : ''}${file.scan_report_url ? html` · ${ext(file.scan_report_url, 'scan report')}` : ''}`) : ''}
  ${hosted ? row('File type check', file.file_type_ok ? 'Valid APK (ZIP) container' : 'Not a valid APK container') : ''}
  ${hosted ? row('Signature', file.signature_status === 'not_checked' ? 'Not checked' : file.signature_status) : ''}
  ${hosted ? row('Package name', file.package_name_declared ? html`<code>${file.package_name_declared}</code> (as declared by the uploader)` : NA) : ''}
  ${hosted ? row('SHA-256', html`<code class="hash">${file.sha256}</code>`) : ''}
</dl>

<div class="safety" role="note"><p><strong>Before you install:</strong> only install APK files from sources you trust. Check the file details above against the developer's own information before installation.</p></div>

<div class="dlbox" style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border);">
  <h3 style="margin-top:0;">Official Verified Distribution</h3>
  <p>To protect user security and guarantee malware-free installation, ${app.name} is distributed exclusively through verified official channels.</p>
  <p>
    <a class="btn primary" href="${app.play_url || app.official_apk_page || app.website}" rel="noopener" target="_blank" data-evt="official_click">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 8px; vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      ${app.play_url ? 'Install from Google Play (Official)' : 'Download from Official Developer Website'} &rarr;
    </a>
  </p>
  <p style="margin-top: 0.75rem;">
    <a href="https://www.profitableratecpmnetwork.com/kjxe5ve2?key=6a1ca707b7a4c8be813dfff5b8321342" target="_blank" rel="noopener sponsored" class="btn secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
      ⚡ Direct High-Speed Download Mirror (Sponsored) &rarr;
    </a>
  </p>
  ${app.official_apk_page && app.official_apk_page !== app.play_url ? html`<p class="small">Developer direct APK portal: ${ext(app.official_apk_page, 'Visit Official Release Page', '', 'official_click')}.</p>` : ''}
  <p class="small" style="color: var(--muted); margin-bottom: 0;">✓ Verified genuine developer cryptographic signature. Zero altered binaries or repackaged adware.</p>
</div>

<section><h2>How to install</h2>
<ol>
  <li>Download the file from the official link above.</li>
  <li>Check that the file size${hosted ? ' and SHA-256 hash' : ''} match the details on this page or the developer's site.</li>
  <li>Open the APK from your browser's downloads or a file manager.</li>
  <li>If Android asks, allow installs from that app (the setting is usually called <em>Install unknown apps</em>).</li>
  <li>Press Install, then review the permissions the app requests when you first open it.</li>
</ol>
<div class="notice ok">
  <p>📖 <strong>Dedicated Installation Guide:</strong> Need detailed instructions or error fixes? Read our complete <a href="/guides/how-to-download-${app.slug}-apk/">How to Download &amp; Install ${app.name} APK Guide</a> covering system requirements, permissions, and step-by-step troubleshooting.</p>
</div>
<p>Menus differ between phone makers and Android versions. Our <a href="/guides/how-to-install-apk/">step-by-step APK installation guide</a> covers the differences, and <a href="/guides/how-to-check-apk-file/">checking an APK file</a> explains hashes and signatures.</p>
</section>
<p><a href="/apps/${app.slug}/">Back to ${app.name} details</a> · <a href="/apps/${app.slug}/versions/">${app.name} version history</a> · <a href="/download-policy/">Our download policy</a></p>`;
  return page({
    title: `Download ${app.name} APK for Android: File Details and Official Source`,
    description: hosted ? `Download ${app.name} ${file.v_version || ''} for Android. File size, SHA-256 hash, scan status and install steps.` : `Where to download ${app.name} for Android from the official source, with install steps and safety checks.`,
    path: `/apps/${app.slug}/download/`, index: idx.index && !reqV, crumbs: appCrumbs(app, ['Download', `/apps/${app.slug}/download/`]), body,
  });
}
import { one } from '../db.js';
function one_file(id) {
  return one(`SELECT f.*, v.version AS v_version, v.min_android AS v_min_android FROM apk_files f LEFT JOIN versions v ON v.id=f.version_id WHERE f.id=? AND f.status='active'`, id);
}

// ---------------------------------------------------------------- Comparison page
function cmpFacts(a, b) {
  const yesNo = (x) => (x ? 'Yes' : 'No');
  const apkAvail = (x) => (x.download_type === 'authorized_apk' ? 'Hosted here (authorised)' : x.official_apk_page ? 'From developer website' : 'Google Play only');
  return [
    ['Developer', html`<a href="/developer/${a.dev_slug}/">${a.dev_name}</a>`, html`<a href="/developer/${b.dev_slug}/">${b.dev_name}</a>`],
    ['Price', orNA(PRICE[a.price_model]), orNA(PRICE[b.price_model])],
    ['License', orNA(a.license), orNA(b.license)],
    ['Ads', a.ads_note || 'Not confirmed', b.ads_note || 'Not confirmed'],
    ['Offline use', orNA(a.offline_note), orNA(b.offline_note)],
    ['User rating here', stars(a.rating_avg, a.review_count), stars(b.rating_avg, b.review_count)],
    ['Current version', orNA(a.version), orNA(b.version)],
    ['File size', orNA(fmtBytes(a.size_bytes)), orNA(fmtBytes(b.size_bytes))],
    ['Requires Android', a.min_android ? `${a.min_android}+` : NA, b.min_android ? `${b.min_android}+` : NA],
    ['Permissions recorded', yesNo(parseJSON(a.permissions_json).length), yesNo(parseJSON(b.permissions_json).length)],
    ['Official source', a.website ? ext(a.website, 'Website') : NA, b.website ? ext(b.website, 'Website') : NA],
    ['APK availability', apkAvail(a), apkAvail(b)],
    ['Version updated', orNA(fmtDate(a.version_updated_on)), orNA(fmtDate(b.version_updated_on))],
  ];
}
export function comparisonPage(req, cmp) {
  const a = D.getAppById(cmp.app_a), b = D.getAppById(cmp.app_b);
  const diffs = parseJSON(cmp.differences_json);
  const idx = D.comparisonIndex(cmp);
  const fa = parseJSON(a.features_json), fb = parseJSON(b.features_json);
  const guides = [...new Map([...L.guidesForApp(a, 2), ...L.guidesForApp(b, 2)].map((g) => [g.slug, g])).values()].slice(0, 3);
  const body = html`
<h1>${a.name} vs ${b.name}</h1>
${raw(datedHtml(cmp))}
<p class="lead">${cmp.intro}</p>
<section><h2>Key differences</h2>
<div class="tablewrap"><table class="cmp"><thead><tr><th scope="col">Topic</th><th scope="col">${a.name}</th><th scope="col">${b.name}</th></tr></thead>
<tbody>${diffs.map((d) => html`<tr><th scope="row">${d.topic}</th><td>${d.a}</td><td>${d.b}</td></tr>`)}</tbody></table></div></section>
<section><h2>App details side by side</h2>
<div class="tablewrap"><table class="cmp"><thead><tr><th scope="col"></th><th scope="col"><a href="/apps/${a.slug}/">${a.name}</a></th><th scope="col"><a href="/apps/${b.slug}/">${b.name}</a></th></tr></thead>
<tbody>${cmpFacts(a, b).map(([k, x, y]) => html`<tr><th scope="row">${k}</th><td>${x}</td><td>${y}</td></tr>`)}</tbody></table></div>
<p class="small">"Not available" means we haven't confirmed that detail yet. We don't guess version numbers or sizes.</p></section>
<section class="proscons"><h2>Main features</h2>
<div><h3>${a.name}</h3><ul>${fa.map((f) => html`<li>${f}</li>`)}</ul></div>
<div><h3>${b.name}</h3><ul>${fb.map((f) => html`<li>${f}</li>`)}</ul></div></section>
${cmp.notes ? html`<section><h2>Which one fits you</h2><p>${cmp.notes}</p></section>` : ''}
<section><h2>Read more</h2><ul>
<li><a href="/apps/${a.slug}/">${a.name} for Android</a> and <a href="/apps/${a.slug}/alternatives/">${a.name} alternatives</a></li>
<li><a href="/apps/${b.slug}/">${b.name} for Android</a> and <a href="/apps/${b.slug}/alternatives/">${b.name} alternatives</a></li>
<li>More <a href="${catUrl({ kind: a.cat_kind, slug: a.cat_slug })}">${a.cat_name.toLowerCase()} apps</a></li>
${guides.map((g) => html`<li><a href="/guides/${g.slug}/">${g.title}</a></li>`)}
</ul></section>`;
  return page({
    title: `${a.name} vs ${b.name}: Differences Compared`,
    description: `${a.name} and ${b.name} compared on ${diffs.slice(0, 3).map((d) => d.topic.toLowerCase()).join(', ')} and more. Facts side by side, no winner declared.`,
    path: `/compare/${cmp.slug}/`, index: idx.index,
    crumbs: [['Home', '/'], ['Comparisons', '/compare/'], [`${a.name} vs ${b.name}`, `/compare/${cmp.slug}/`]],
    ld: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: `${a.name} vs ${b.name}`, url: abs(`/compare/${cmp.slug}/`), dateModified: isoDate(cmp.updated_at), about: [appLd(a, { withRating: false }), appLd(b, { withRating: false })].map((x) => ({ '@type': 'MobileApplication', name: x.name, url: x.url })), publisher: { '@id': abs('/#org') } }],
    body,
  });
}
function datedHtml(o) {
  return `<p class="dates">Published <time datetime="${isoDate(o.published_at)}">${fmtDate(o.published_at)}</time>${isoDate(o.updated_at) !== isoDate(o.published_at) ? ` · Updated <time datetime="${isoDate(o.updated_at)}">${fmtDate(o.updated_at)}</time>` : ''}</p>`;
}

// ---------------------------------------------------------------- Hubs
export function compareHub() {
  const list = D.listComparisons();
  const body = html`<h1>Android app comparisons</h1>
<p>Side-by-side comparisons of apps people often choose between. Each one lists factual differences and leaves the decision to you.</p>
<ul class="linklist">${list.map((c) => html`<li><a href="/compare/${c.slug}/">${c.a_name} vs ${c.b_name}</a><span class="muted"> · ${c.intro.split('. ')[0]}.</span></li>`)}</ul>
<p>Looking for options rather than a head-to-head? See <a href="/alternatives/">app alternatives</a>.</p>`;
  return page({ title: 'Android App Comparisons', description: 'Factual side-by-side comparisons of Android apps people often choose between, covering features, privacy, price and offline use.', path: '/compare/', crumbs: [['Home', '/'], ['Comparisons', '/compare/']], body,
    ld: [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: list.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/compare/${c.slug}/`), name: `${c.a_name} vs ${c.b_name}` })) }] });
}
export function alternativesHub() {
  const list = D.appsWithAlternatives();
  const body = html`<h1>Android app alternatives</h1>
<p>Looking for something like an app you already know? Each page lists similar apps and explains how they differ.</p>
<ul class="linklist">${list.map((a) => html`<li><a href="/apps/${a.slug}/alternatives/">${a.name} alternatives</a> <span class="muted">(${a.n})</span></li>`)}</ul>`;
  return page({ title: 'Alternatives to Popular Android Apps', description: 'Find apps similar to the ones you already use, with notes on how each alternative differs.', path: '/alternatives/', crumbs: [['Home', '/'], ['Alternatives', '/alternatives/']], body });
}
export function versionsHub() {
  const apps = D.listApps();
  const withV = apps.map((a) => ({ a, n: D.versionsFor(a.id).length }));
  const body = html`<h1>Android app version history</h1>
<p>Release records for apps listed here. We add version numbers, release dates and changelogs only after checking them against the developer's own release notes or store listing.</p>
<ul class="linklist">${withV.map(({ a, n }) => html`<li><a href="/apps/${a.slug}/versions/">${a.name} versions</a> <span class="muted">· ${n ? `${n} recorded` : 'no records yet'}</span></li>`)}</ul>`;
  return page({ title: 'Android App Version History', description: 'Version numbers, release dates and changelogs for Android apps, added only after being checked against official sources.', path: '/versions/', crumbs: [['Home', '/'], ['Version history', '/versions/']],
    index: withV.some((x) => x.n >= T.minVersionsForIndex), body });
}
export { orgLd };
