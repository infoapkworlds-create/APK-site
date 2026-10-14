import { html, raw } from '../lib/html.js';
import { page } from '../layout.js';
import { config } from '../config.js';

export function apkInspectorPage(req) {
  const body = html`
<header class="page-head">
  <h1>Online APK Hash &amp; Security Inspector</h1>
  <p class="lead">Verify genuine Android APK packages client-side in your browser. Inspect authentic SHA-256 cryptographic checksums, file sizes, and cross-reference with VirusTotal databases.</p>
</header>

<div class="tools-layout" style="max-width: 860px; margin: 1.5rem auto;">
  <!-- Drag and drop zone -->
  <div class="apk-dropzone card" id="apkDropzone">
    <div class="dropzone-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    </div>
    <h2 class="dropzone-title">Drag &amp; Drop Any .APK File Here</h2>
    <p class="dropzone-sub">or click below to choose a file from your computer or Android device</p>
    <label class="btn primary" for="apkFileInput" style="cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Select APK File
    </label>
    <input type="file" id="apkFileInput" accept=".apk" style="display:none;">
    <p class="dropzone-privacy-badge">🔒 100% Private &amp; Client-Side: File never leaves your browser. Computation is processed locally using Web Crypto API.</p>
  </div>

  <!-- Loading Progress Bar -->
  <div id="inspectorProgress" style="display:none; margin: 1.5rem 0;" class="card">
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-weight:700;">
      <span>Calculating Cryptographic Hash...</span>
      <span id="inspectorProgressText">0%</span>
    </div>
    <div style="height:8px; background:rgba(0,0,0,0.08); border-radius:4px; overflow:hidden;">
      <div id="inspectorProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #10b981, #2563eb); transition:width 0.2s ease;"></div>
    </div>
  </div>

  <!-- Inspection Results Card -->
  <div class="inspector-results-card card" id="inspectorResults" style="display:none; margin-top: 1.5rem;">
    <div class="results-hdr" style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:14px;">
      <h3 style="margin:0; font-size:1.25rem;">Package Security Report</h3>
      <span class="badge ok" style="background:#10b981; color:#fff; font-size:0.8rem; padding:3px 10px; border-radius:9999px; font-weight:700;">✓ Checksum Verified</span>
    </div>

    <div class="result-specs" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:16px;">
      <div class="spec-tile" style="padding:10px 14px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px;">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">File Name</span>
        <div id="resFileName" style="font-weight:700; word-break:break-all; font-size:0.95rem; margin-top:2px;">-</div>
      </div>
      <div class="spec-tile" style="padding:10px 14px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px;">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">File Size</span>
        <div id="resFileSize" style="font-weight:700; font-size:0.95rem; margin-top:2px;">-</div>
      </div>
    </div>

    <div class="hash-field-wrap" style="margin-bottom:14px;">
      <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">SHA-256 Cryptographic Hash</label>
      <div style="display:flex; gap:8px;">
        <input type="text" id="resSha256" readonly style="flex:1; font-family:monospace; font-size:0.88rem; padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:6px;">
        <button type="button" class="btn secondary" id="btnCopyHash" style="padding:8px 14px; font-size:0.85rem;">Copy</button>
      </div>
    </div>

    <div class="hash-field-wrap" style="margin-bottom:18px;">
      <label style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">SHA-1 Hash</label>
      <div style="display:flex; gap:8px;">
        <input type="text" id="resSha1" readonly style="flex:1; font-family:monospace; font-size:0.88rem; padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:6px;">
      </div>
    </div>

    <div class="vt-action-bar" style="padding:14px; background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.25); border-radius:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
      <div>
        <strong style="color:#2563eb; font-size:0.95rem;">Check Against 70+ Antivirus Engines</strong>
        <p style="margin:2px 0 0 0; font-size:0.82rem; color:var(--text-muted);">Lookup this exact hash on VirusTotal to see official multi-engine malware scanner results.</p>
      </div>
      <a id="btnVtLookup" href="https://www.virustotal.com/" target="_blank" rel="noopener nofollow" class="btn primary" style="font-size:0.85rem; padding:8px 16px;">
        Inspect on VirusTotal &rarr;
      </a>
    </div>
  </div>

  <!-- Educational Section -->
  <section class="card" style="margin-top: 2rem;">
    <h2>Why Verify APK Hashes Before Installing?</h2>
    <p>Every genuine Android APK file built by certified developers has a unique cryptographic digital fingerprint (SHA-256). If a third party or malicious actor injects adware, tracking libraries, or modifies internal code, <strong>the SHA-256 hash completely changes</strong>.</p>
    <h3>How to Stay 100% Safe:</h3>
    <ol style="line-height:1.7; padding-left:1.25rem;">
      <li><strong>Check File Size:</strong> Ensure the file size matches the expected size recorded on APKWorlds.</li>
      <li><strong>Compare SHA-256:</strong> Compare the generated hash with the official hash displayed on our download details page.</li>
      <li><strong>Review Permissions:</strong> Review what permissions the app requests when installed.</li>
    </ol>
  </section>
</div>
`;

  return page({
    title: 'Online APK Hash & Security Inspector | Free SHA-256 Analyzer',
    description: 'Inspect Android APK files in your browser. Calculate authentic SHA-256 checksums, verify package integrity, and check VirusTotal signatures client-side.',
    path: '/tools/apk-inspector/',
    crumbs: [['Home', '/'], ['APK Security Inspector', '/tools/apk-inspector/']],
    body,
  });
}
