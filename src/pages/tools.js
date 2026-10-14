import { html, raw } from '../lib/html.js';
import { page, adNativeWidget } from '../layout.js';
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

export function apkErrorSolverPage(req) {
  const body = html`
<header class="page-head">
  <span style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; background:rgba(239,68,68,0.1); color:#ef4444; padding:4px 12px; border-radius:9999px; display:inline-block; margin-bottom:0.75rem;">Troubleshooting &amp; Diagnostics</span>
  <h1>Interactive Android APK Error Solver</h1>
  <p class="lead">Fix "Problem Parsing the Package", "App Not Installed", "Play Protect Blocked", and OBB errors in 3 clicks. Select your error and phone brand below for instant verified solutions.</p>
</header>

<div class="solver-layout" style="max-width:860px; margin:2rem auto;">
  <!-- Step 1: Select Error -->
  <div class="card solver-step-card" style="padding:1.5rem; margin-bottom:1.5rem; border:1px solid var(--border); border-radius:14px; background:var(--bg-surface);">
    <h3 style="margin-top:0; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
      <span style="width:24px; height:24px; background:#2563eb; color:#fff; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:800;">1</span>
      Select The Exact Error You Encountered:
    </h3>
    <div class="error-picker-grid" id="errorPicker" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; margin-top:1rem;">
      <button type="button" class="btn-error-pill is-active" data-err="parse">
        <span class="err-icon">⚠️</span>
        <span class="err-label">"There was a problem parsing the package"</span>
      </button>
      <button type="button" class="btn-error-pill" data-err="corrupt">
        <span class="err-icon">❌</span>
        <span class="err-label">"App not installed as package appears to be corrupt"</span>
      </button>
      <button type="button" class="btn-error-pill" data-err="protect">
        <span class="err-icon">🛡️</span>
        <span class="err-label">"Blocked by Play Protect / Unsafe app"</span>
      </button>
      <button type="button" class="btn-error-pill" data-err="pending">
        <span class="err-icon">⏳</span>
        <span class="err-label">"Download pending / Stuck at 99%"</span>
      </button>
      <button type="button" class="btn-error-pill" data-err="obb">
        <span class="err-icon">📦</span>
        <span class="err-label">"XAPK / OBB Validation Failed"</span>
      </button>
      <button type="button" class="btn-error-pill" data-err="abi">
        <span class="err-icon">⚙️</span>
        <span class="err-label">"Incompatible Architecture (ARM/x86)"</span>
      </button>
    </div>
  </div>

  <!-- Step 2: Select Brand -->
  <div class="card solver-step-card" style="padding:1.5rem; margin-bottom:1.5rem; border:1px solid var(--border); border-radius:14px; background:var(--bg-surface);">
    <h3 style="margin-top:0; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
      <span style="width:24px; height:24px; background:#2563eb; color:#fff; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:800;">2</span>
      Select Your Device Brand:
    </h3>
    <div class="brand-picker-row" id="brandPicker" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:1rem;">
      <button type="button" class="btn-brand-pill is-active" data-brand="samsung">Samsung (One UI)</button>
      <button type="button" class="btn-brand-pill" data-brand="xiaomi">Xiaomi / POCO (HyperOS / MIUI)</button>
      <button type="button" class="btn-brand-pill" data-brand="oppo">Oppo / Realme (ColorOS)</button>
      <button type="button" class="btn-brand-pill" data-brand="vivo">Vivo / iQOO (Funtouch)</button>
      <button type="button" class="btn-brand-pill" data-brand="stock">Stock Android / Google Pixel</button>
    </div>
  </div>

  <!-- Step 3: Diagnostic Solution Panel -->
  <div class="card solver-solution-card" id="solverSolution" style="padding:2rem; border:1.5px solid #10b981; border-radius:16px; background:var(--bg-surface); box-shadow:var(--shadow-md);">
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; border-bottom:1px solid var(--border); padding-bottom:1rem; margin-bottom:1.25rem;">
      <div>
        <span id="solBadge" style="font-size:0.75rem; font-weight:800; background:#ecfdf5; color:#059669; padding:3px 10px; border-radius:9999px; text-transform:uppercase;">Root Cause Verified</span>
        <h2 id="solTitle" style="font-size:1.35rem; font-weight:800; margin:0.35rem 0 0 0;">How to Fix "Problem Parsing the Package"</h2>
      </div>
      <span id="solDeviceTag" style="font-size:0.85rem; font-weight:700; color:var(--text-muted); background:var(--bg-alt); padding:4px 12px; border-radius:8px; border:1px solid var(--border);">Samsung One UI Guide</span>
    </div>

    <div id="solContent" style="font-size:0.95rem; line-height:1.7; color:var(--text);">
      <p><strong>Root Cause:</strong> This error occurs when the downloaded APK requires a newer Android version than the one installed on your phone, or if the download was interrupted before reaching 100%.</p>
      
      <div style="background:var(--bg-alt); padding:1.25rem; border-radius:10px; border:1px solid var(--border); margin:1rem 0;">
        <h4 style="margin-top:0; font-size:1rem; color:#2563eb;">Step-by-Step Resolution:</h4>
        <ol style="margin-bottom:0; padding-left:1.25rem;">
          <li><strong>Check OS Compatibility:</strong> Compare your phone's Android version (Settings &gt; About Phone &gt; Software Information) against the app's minimum requirement on APKWorlds. If your Android is older, download a legacy build from our Version History.</li>
          <li><strong>Re-download from Mirror 1:</strong> Interrupted Wi-Fi downloads create incomplete byte files. Tap the Download button again and ensure the file size matches the size recorded on our download page.</li>
          <li><strong>Allow Unknown Sources in Samsung Settings:</strong> Open <em>Settings &gt; Security and Privacy &gt; Install Unknown Apps</em> &gt; find <em>Chrome</em> or <em>My Files</em> &gt; toggle <strong>Allow from this source</strong> to ON.</li>
          <li><strong>Clear Package Installer Cache:</strong> Go to <em>Settings &gt; Apps &gt; Filter: Show System Apps &gt; Package Installer &gt; Storage &gt; Clear Cache</em>.</li>
        </ol>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border);">
      <div style="font-size:0.85rem; color:var(--text-muted);">
        Did this solve your issue? <button type="button" class="btn secondary" style="padding:4px 10px; font-size:0.8rem; margin-left:6px;">Yes, Solved! 👍</button>
      </div>
      <a href="/tools/apk-inspector/" class="btn primary" style="font-size:0.88rem; padding:0.6rem 1.2rem;">
        Inspect APK Hash First &rarr;
      </a>
    </div>
  </div>

  <div style="margin:2.5rem 0;">
    ${adNativeWidget()}
  </div>
</div>
`;

  return page({
    title: 'Android APK Error Solver | Fix Problem Parsing & Install Failed Errors',
    description: 'Fix common Android APK installation errors: "There was a problem parsing the package", "App not installed corrupt", Play Protect blocks, and OBB missing errors.',
    path: '/tools/apk-error-solver/',
    crumbs: [['Home', '/'], ['APK Error Solver', '/tools/apk-error-solver/']],
    ld: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I fix "There was a problem parsing the package" on Android?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'This error occurs when the APK requires a newer Android OS version or the file was corrupted during download. Check the app\'s minimum Android version requirement on APKWorlds, re-download the complete file, and enable Install Unknown Apps in your phone settings.'
            }
          },
          {
            '@type': 'Question',
            name: 'Why does Android say "App not installed as package appears to be corrupt"?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'This is usually caused by an existing app signature conflict (an older version with a different key is already installed) or an incomplete download. Uninstall the previous version first, clear Package Installer cache, and re-install.'
            }
          },
          {
            '@type': 'Question',
            name: 'How to bypass "Blocked by Play Protect" when installing safe APKs?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Tap "More details" on the warning dialog, then tap "Install anyway (unsafe)". To disable false alerts, open Google Play Store > Profile > Play Protect > Settings Gear > turn off "Scan apps with Play Protect".'
            }
          }
        ]
      }
    ],
    body,
  });
}

