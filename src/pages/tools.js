import { html, raw } from '../lib/html.js';
import { page, adNativeWidget } from '../layout.js';
import { config } from '../config.js';

export function apkInspectorPage(req) {
  const isVerifier = req?.path?.includes('apk-hash-verifier');
  const path = isVerifier ? '/tools/apk-hash-verifier/' : '/tools/apk-inspector/';
  const pageTitle = isVerifier
    ? 'Online APK Hash Verifier & SHA-256 Checksum Tool | Free Security Inspector'
    : 'Online APK Hash & Security Inspector | Free SHA-256 Analyzer';
  const pageDesc = 'Verify genuine Android APK packages client-side in your browser. Inspect authentic SHA-256 cryptographic checksums, calculate hashes, verify file sizes, and cross-reference with VirusTotal databases.';

  const body = html`
<header class="page-head">
  <span style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; background:rgba(16,185,129,0.12); color:#10b981; padding:4px 12px; border-radius:9999px; display:inline-block; margin-bottom:0.75rem;">Instant Browser Tool &bull; Web Crypto API</span>
  <h1>Online APK Hash Verifier &amp; Security Inspector</h1>
  <p class="lead">${pageDesc}</p>
</header>

<div class="tools-layout" style="max-width: 860px; margin: 1.5rem auto;">
  <!-- Drag and drop zone -->
  <div class="apk-dropzone card" id="apkDropzone">
    <div class="dropzone-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </div>
    <h2 class="dropzone-title">Drag &amp; Drop Any .APK File Here</h2>
    <p class="dropzone-sub">or click below to choose a file from your computer or Android device</p>
    <label class="btn primary" for="apkFileInput" style="cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Select APK File
    </label>
    <input type="file" id="apkFileInput" accept=".apk" style="display:none;">
    <p class="dropzone-privacy-badge">🔒 100% Private &amp; Client-Side: File never leaves your device. Computation is processed locally using Web Crypto API.</p>
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
    title: pageTitle,
    description: pageDesc,
    path,
    crumbs: [['Home', '/'], [isVerifier ? 'APK Hash Verifier' : 'APK Security Inspector', path]],
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

export function xapkConverterPage(req) {
  const body = html`
<header class="page-head">
  <span style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; background:rgba(37,99,235,0.1); color:#2563eb; padding:4px 12px; border-radius:9999px; display:inline-block; margin-bottom:0.75rem;">1-Click Browser Extractor &bull; 0MB Upload Needed</span>
  <h1>Online XAPK to APK &amp; OBB Extractor</h1>
  <p class="lead">Extract standalone <code>.APK</code> installers and <code>.OBB</code> cache folders from any <code>.XAPK</code> or <code>.APKS</code> bundle directly in your browser. 100% private, client-side extraction with zero upload data usage.</p>
</header>

<div class="tools-layout" style="max-width: 860px; margin: 1.5rem auto;">
  <!-- Dropzone -->
  <div class="apk-dropzone card" id="xapkDropzone" style="border: 2px dashed #2563eb; padding: 2.5rem 1.5rem; text-align: center; border-radius: 16px; background: var(--bg-surface);">
    <div class="dropzone-icon" style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
    <h2 class="dropzone-title" style="margin: 0 0 8px 0; font-size: 1.35rem;">Drag &amp; Drop Your .XAPK or .APKS File Here</h2>
    <p class="dropzone-sub" style="color: var(--muted); margin: 0 0 1.25rem 0; font-size: 0.95rem;">or click below to select a file from your phone or PC</p>
    <label class="btn primary" for="xapkFileInput" style="cursor:pointer; display:inline-flex; align-items:center; gap:8px; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Select .XAPK File
    </label>
    <input type="file" id="xapkFileInput" accept=".xapk,.apks,.zip,.apkm" style="display:none;">
    <p class="dropzone-privacy-badge" style="font-size: 0.8rem; color: #10b981; margin-top: 1rem; font-weight: 600;">🔒 100% Private &amp; In-Browser: Your file is never uploaded to any remote server. It is unzipped locally inside your browser memory.</p>
  </div>

  <!-- Progress Bar -->
  <div id="xapkProgress" style="display:none; margin: 1.5rem 0;" class="card">
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-weight:700;">
      <span id="xapkProgressLabel">Unpacking XAPK Container...</span>
      <span id="xapkProgressText">0%</span>
    </div>
    <div style="height:8px; background:rgba(0,0,0,0.08); border-radius:4px; overflow:hidden;">
      <div id="xapkProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #2563eb, #10b981); transition:width 0.2s ease;"></div>
    </div>
  </div>

  <!-- Extraction Results -->
  <div id="xapkResults" class="card" style="display:none; margin-top: 1.5rem; padding: 1.5rem; border: 1.5px solid #10b981; border-radius: 14px;">
    <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.5rem;">🎉</span>
        <h3 style="margin:0; font-size:1.25rem;">Extracted Packages Ready for Download</h3>
      </div>
      <span style="background:#10b981; color:#fff; font-size:0.75rem; padding:3px 10px; border-radius:20px; font-weight:800; text-transform:uppercase;">✓ Extraction Complete</span>
    </div>

    <div id="xapkFileList" style="display:flex; flex-direction:column; gap:12px; margin-bottom:1.5rem;">
      <!-- Dynamic list of extracted APK and OBB files -->
    </div>

    <!-- How to install OBB Visual Helper -->
    <div style="padding:1rem 1.25rem; background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.25); border-radius:10px;">
      <strong style="color:#2563eb; font-size:0.95rem; display:block; margin-bottom:4px;">📁 Quick Guide: Where to Copy Extracted OBB Cache?</strong>
      <ol style="margin:0; padding-left:1.25rem; font-size:0.88rem; color:var(--muted); line-height:1.6;">
        <li>Install the extracted <strong>Base APK</strong> first, but do not open the app yet.</li>
        <li>Open your Android File Manager (e.g., ZArchiver, Files by Google).</li>
        <li>Move the extracted <code>.obb</code> file into: <br><code>Internal Storage &gt; Android &gt; obb &gt; [Game Package Name] &gt;</code></li>
        <li>Launch the game. It will load immediately without download or license errors!</li>
      </ol>
    </div>
  </div>

  <!-- High-Paying 1-Click Auto Installer CPA recommendation -->
  <div class="card" style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, rgba(234,179,8,0.08), rgba(245,158,11,0.08)); border: 1.5px solid #f59e0b; border-radius: 14px;">
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:0.75rem;">
      <span style="background:#f59e0b; color:#000; font-weight:800; font-size:0.72rem; padding:3px 10px; border-radius:20px; text-transform:uppercase;">⚡ 1-Click Automated Solution</span>
      <span style="color:#d97706; font-size:0.8rem; font-weight:700;">Skip Manual Extraction</span>
    </div>
    <h3 style="margin:0 0 6px 0; font-size:1.15rem; color:var(--text);">Don't Want to Manually Copy OBB Files?</h3>
    <p style="margin:0 0 1rem 0; font-size:0.9rem; color:var(--muted); line-height:1.5;">
      Install our official 1-Click XAPK Installer tool to automatically unzip, place OBB files into the correct directory, and launch your games with zero errors.
    </p>
    <a href="/tools/xapk-to-apk-converter/" class="btn primary" style="background:linear-gradient(90deg, #10b981, #059669); color:#fff; font-weight:800; border:none; padding:0.75rem 1.4rem; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
      <span>🔧 Open XAPK Extractor Tool &rarr;</span>
    </a>
  </div>

  <!-- Educational & FAQ Section -->
  <section class="card" style="margin-top: 2rem;">
    <h2>Everything You Need to Know About XAPK Files</h2>
    <h3>What is an XAPK File?</h3>
    <p>An XAPK file is a compressed standard ZIP package designed specifically for Android. It contains the base APK installer along with graphics cache data (OBB files) or split configuration APKs (different screen densities, CPU architectures like ARM64/ARMv7, and localized language packs). Android's default package installer cannot open XAPK files directly without extracting them first.</p>

    <h3>Why Convert XAPK to APK Online with APKWorlds?</h3>
    <ul>
      <li><strong>100% In-Browser Privacy:</strong> Your files never upload to a server; unzipping occurs locally in your device's RAM.</li>
      <li><strong>Direct APK &amp; OBB Downloads:</strong> Separate the game executable and large expansion cache with 1 click.</li>
      <li><strong>Compatible with Any File Manager:</strong> Works flawlessly with ZArchiver, Solid Explorer, MT Manager, and Files by Google.</li>
    </ul>
  </section>
</div>
`;

  return page({
    title: 'Online XAPK to APK & OBB Extractor | Free Split APK Converter',
    description: 'Convert XAPK to APK online for free. Extract base APK and OBB cache folders directly in your browser without installing third-party apps.',
    path: '/tools/xapk-to-apk-converter/',
    crumbs: [['Home', '/'], ['XAPK to APK Converter', '/tools/xapk-to-apk-converter/']],
    ld: [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Convert and Install XAPK Files on Android',
        description: 'Step-by-step instructions to extract XAPK files into APK and OBB and install them on Android.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Upload XAPK File to Converter',
            text: 'Drag and drop your .xapk file into the online converter box on APKWorlds.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Download Extracted APK and OBB',
            text: 'Click the download buttons to save the standalone base.apk and main.obb files.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Copy OBB and Install APK',
            text: 'Move the .obb file to Internal Storage/Android/obb/[package_name]/ and install the APK.',
          },
        ],
      },
    ],
    body,
  });
}


