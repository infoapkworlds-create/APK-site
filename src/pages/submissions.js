import { html } from '../lib/html.js';
import { page } from '../layout.js';
import { csrfToken, formStamp } from '../lib/security.js';
import { config } from '../config.js';
import * as D from '../lib/data.js';

export function submitAppPage(req) {
  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);
  const stamp = formStamp();
  const submitted = req.query.get('submitted') === '1';
  const categories = D.listCategories();

  const body = html`
<header class="page-head">
  <h1>Submit an App for Editorial Review</h1>
  <p class="lead">Are you an Android app developer or publisher? Submit your application for consideration. We review all submissions manually to verify developer identity, license details, and software safety.</p>
</header>

${submitted ? html`
  <div class="notice ok" role="status">
    <h2>Submission Received</h2>
    <p>Thank you for submitting your application. Our editorial team will review the details against our quality and security guidelines. We do not automatically publish submissions.</p>
  </div>
` : html`
<form class="form submission-form" action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="e057c862-4648-4afe-8195-724c07c1b26d">
  <input type="hidden" name="from_name" value="${config.siteName} App Submission">
  <input type="hidden" name="subject" value="New Android App Submitted for Editorial Review">
  <input type="hidden" name="redirect" value="${config.siteUrl}/submit-app/?submitted=1">

  <div class="field sr-only-hp" aria-hidden="true" style="display:none;">
    <label for="trap_sub">Leave empty</label>
    <input type="text" id="trap_sub" name="botcheck" tabindex="-1" autocomplete="off">
  </div>

  <h2>1. Developer and Contact Details</h2>
  <div class="form-row">
    <div class="field">
      <label for="dev_name">Developer / Organization Name <span class="req">*</span></label>
      <input id="dev_name" name="name" type="text" required placeholder="e.g. Signal Messenger LLC">
    </div>
    <div class="field">
      <label for="dev_email">Developer Official Email <span class="req">*</span></label>
      <input id="dev_email" name="email" type="email" required placeholder="contact@yourdomain.com">
      <p class="field-help">Used for verification and editorial questions.</p>
    </div>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="dev_web">Official Website</label>
      <input id="dev_web" name="website" type="url" placeholder="https://example.com">
    </div>
    <div class="field">
      <label for="dev_contact">Contact / Support Link</label>
      <input id="dev_contact" name="contact" type="text" placeholder="https://example.com/contact or support email">
    </div>
  </div>

  <h2>2. Application Information</h2>
  <div class="form-row">
    <div class="field">
      <label for="app_title">Application Name <span class="req">*</span></label>
      <input id="app_title" name="app_name" type="text" required placeholder="e.g. VLC for Android">
    </div>
    <div class="field">
      <label for="app_cat">Primary Category <span class="req">*</span></label>
      <select id="app_cat" name="category" required>
        <option value="">Select a category</option>
        ${categories.map((c) => html`<option value="${c.name}">${c.name}</option>`)}
      </select>
    </div>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="app_ver">Current Version</label>
      <input id="app_ver" name="version" type="text" placeholder="e.g. 1.0.4">
    </div>
    <div class="field">
      <label for="app_license">License Information</label>
      <input id="app_license" name="license" type="text" placeholder="e.g. Free, Open Source (MIT), Proprietary">
    </div>
  </div>

  <div class="field">
    <label for="app_desc">App Summary and Main Functions <span class="req">*</span></label>
    <textarea id="app_desc" name="description" rows="5" required placeholder="Describe what your app does, who it is for, and key functions. Please use clear, factual language."></textarea>
  </div>

  <h2>3. Distribution and Verification Links</h2>
  <div class="form-row">
    <div class="field">
      <label for="app_play">Google Play URL (if applicable)</label>
      <input id="app_play" name="play_url" type="url" placeholder="https://play.google.com/store/apps/details?id=...">
    </div>
    <div class="field">
      <label for="app_apk">Official Direct Download / APK Page</label>
      <input id="app_apk" name="apk_url" type="url" placeholder="https://example.com/download/app.apk">
    </div>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="app_privacy">Privacy Policy URL <span class="req">*</span></label>
      <input id="app_privacy" name="privacy_url" type="url" required placeholder="https://example.com/privacy">
    </div>
    <div class="field">
      <label for="app_icon">Icon Image URL</label>
      <input id="app_icon" name="icon_url" type="url" placeholder="https://example.com/icon.png">
    </div>
  </div>

  <div class="field">
    <label for="app_screens">Screenshot URLs (optional)</label>
    <textarea id="app_screens" name="screenshots" rows="2" placeholder="One URL per line"></textarea>
  </div>

  <h2>4. Rights Confirmation</h2>
  <div class="field checkbox-field">
    <label>
      <input type="checkbox" name="rights_confirmed" value="1" required>
      <strong>I confirm that I have the right to submit or distribute this app/file.</strong>
    </label>
    <p class="field-help">We do not accept third-party modifications, cracked software, or unauthorized APK uploads.</p>
  </div>

  <button type="submit" class="btn primary">Submit Application for Review</button>
</form>
`}
`;

  return page({
    title: 'Submit an Android App: Developer Portal',
    description: `Submit your Android application for editorial review on ${config.siteName}. We support legitimate developers and official distribution sources.`,
    path: '/submit-app/',
    crumbs: [['Home', '/'], ['Submit App', '/submit-app/']],
    body,
  });
}

export function requestAppPage(req) {
  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);
  const stamp = formStamp();
  const submitted = req.query.get('submitted') === '1';

  const body = html`
<header class="page-head">
  <h1>Request an App to be Cataloged</h1>
  <p class="lead">Looking for an Android app that isn't yet listed on ${config.siteName}? Let us know. Our editorial team prioritizes requests with verified developers and legitimate sources.</p>
</header>

${submitted ? html`
  <div class="notice ok" role="status">
    <h2>Request Received</h2>
    <p>Thank you for your suggestion. We regularly review community requests and add apps that meet our editorial criteria.</p>
  </div>
` : html`
<form class="form" action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="e057c862-4648-4afe-8195-724c07c1b26d">
  <input type="hidden" name="from_name" value="${config.siteName} App Request">
  <input type="hidden" name="subject" value="New App Catalog Request Received">
  <input type="hidden" name="redirect" value="${config.siteUrl}/request-app/?submitted=1">

  <div class="field sr-only-hp" aria-hidden="true" style="display:none;">
    <label for="trap_req">Leave empty</label>
    <input type="text" id="trap_req" name="botcheck" tabindex="-1" autocomplete="off">
  </div>

  <div class="field">
    <label for="req_name">Application Name <span class="req">*</span></label>
    <input id="req_name" name="app_name" type="text" required placeholder="e.g. LibreOffice Viewer">
  </div>

  <div class="form-row">
    <div class="field">
      <label for="req_dev">Developer or Publisher Name</label>
      <input id="req_dev" name="developer" type="text" placeholder="e.g. The Document Foundation">
    </div>
    <div class="field">
      <label for="req_url">Official Website or Google Play Link</label>
      <input id="req_url" name="official_url" type="url" placeholder="https://...">
    </div>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="req_plat">Requested Android Version or Form Factor</label>
      <input id="req_plat" name="platform" type="text" placeholder="e.g. Android Phone, Tablet, Android TV">
    </div>
    <div class="field">
      <label for="req_email">Your Email (optional)</label>
      <input id="req_email" name="email" type="email" placeholder="Only if you wish to be notified when listed">
    </div>
  </div>

  <div class="field">
    <label for="req_reason">Why should this app be cataloged? <span class="req">*</span></label>
    <textarea id="req_reason" name="reason" rows="4" required placeholder="Explain why this app is useful or what unique features it offers."></textarea>
  </div>

  <button type="submit" class="btn primary">Send Request</button>
</form>
`}
`;

  return page({
    title: 'Request an Android App to be Listed',
    description: 'Suggest an Android application for inclusion in our directory. We research developer authenticity and write original overviews.',
    path: '/request-app/',
    crumbs: [['Home', '/'], ['Request an App', '/request-app/']],
    body,
  });
}

export function reportAppPage(req) {
  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);
  const stamp = formStamp();
  const submitted = req.query.get('submitted') === '1';
  const preApp = req.query.get('app') || '';

  const body = html`
<header class="page-head">
  <h1>Report an App or Content Issue</h1>
  <p class="lead">Help us maintain catalog integrity. Use this form to report copyright concerns, broken links, outdated details, or security issues.</p>
</header>

${submitted ? html`
  <div class="notice ok" role="status">
    <h2>Report Received</h2>
    <p>Thank you for your report. Our team investigates every submission and takes corrective action where required.</p>
  </div>
` : html`
<form class="form" action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="e057c862-4648-4afe-8195-724c07c1b26d">
  <input type="hidden" name="from_name" value="${config.siteName} App Report Desk">
  <input type="hidden" name="subject" value="URGENT: Broken App / DMCA / Content Report">
  <input type="hidden" name="redirect" value="${config.siteUrl}/report-app/?submitted=1">

  <div class="field sr-only-hp" aria-hidden="true" style="display:none;">
    <label for="trap_rep">Leave empty</label>
    <input type="text" id="trap_rep" name="botcheck" tabindex="-1" autocomplete="off">
  </div>

  <div class="field">
    <label for="rep_reason">Reason for Report <span class="req">*</span></label>
    <select id="rep_reason" name="reason" required>
      <option value="">Select a reason</option>
      <option value="copyright">Copyright Issue / DMCA Complaint</option>
      <option value="malware">Malware / Security Concern</option>
      <option value="broken_download">Broken Download or Source Link</option>
      <option value="wrong_info">Incorrect Technical Information</option>
      <option value="fake_app">Fake or Deceptive App</option>
      <option value="incorrect_dev">Incorrect Developer Attribution</option>
      <option value="outdated">Outdated Version / Information</option>
      <option value="trademark">Trademark Infringement</option>
      <option value="privacy">Privacy or Data Concern</option>
      <option value="other">Other Concern</option>
    </select>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="rep_app">App Slug or Name</label>
      <input id="rep_app" name="app_slug" type="text" value="${preApp}" placeholder="e.g. signal">
    </div>
    <div class="field">
      <label for="rep_page">Specific Page URL</label>
      <input id="rep_page" name="page_url" type="url" placeholder="https://www.apkworlds.co.uk/apps/...">
    </div>
  </div>

  <div class="field">
    <label for="rep_details">Report Details <span class="req">*</span></label>
    <textarea id="rep_details" name="details" rows="5" required placeholder="Please provide specific facts, links, or evidence supporting your report."></textarea>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="rep_email">Your Email Address</label>
      <input id="rep_email" name="email" type="email" placeholder="Required if you are requesting copyright action or an update">
    </div>
    <div class="field checkbox-field" style="align-self: center;">
      <label>
        <input type="checkbox" name="is_rights_holder" value="1">
        I am the copyright or trademark rights holder (or authorized agent).
      </label>
    </div>
  </div>

  <p class="small muted">For detailed copyright instructions, please also review our <a href="/copyright/">Copyright and DMCA Policy</a>.</p>

  <button type="submit" class="btn primary danger">Submit Report</button>
</form>
`}
`;

  return page({
    title: 'Report an App or Content Issue',
    description: `Report copyright violations, broken downloads, security issues, or factual errors on ${config.siteName}. We act promptly on verified reports.`,
    path: '/report-app/',
    crumbs: [['Home', '/'], ['Report an App', '/report-app/']],
    body,
  });
}
