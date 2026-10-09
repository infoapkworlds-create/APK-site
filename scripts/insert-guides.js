import { run } from '../src/db.js';

const g1 = {
  slug: 'how-to-fix-app-not-installed-error-android',
  title: 'How to Fix App Not Installed Error on Android: 7 Proven Solutions',
  meta_title: 'How to Fix App Not Installed Error on Android (100% Solved)',
  meta_description: 'Troubleshoot and fix the App Not Installed error on Android 10 to 15. Learn how to resolve package conflicts, signature mismatches, corrupted APKs, and storage limits.',
  summary: 'Encountering App Not Installed when sideloading an APK? Follow our step-by-step diagnostic guide to resolve certificate mismatches, insufficient storage, and conflicting installations.',
  body_html: `<p>The <strong>&quot;App Not Installed&quot;</strong> error is one of the most common issues Android users encounter when sideloading an APK file. Unlike general app crashes, this error occurs at the package manager level before the application can even finish writing its assets to the system.</p>
<h2>1. Check for Conflicting Package Signatures (Existing Version Conflict)</h2>
<p>Android security strictly prevents two apps with the same package name but different digital signing keys from overwriting each other. If you already have an older or modified version installed (e.g. from Google Play or another marketplace), the new APK will fail with <em>INSTALL_FAILED_UPDATE_INCOMPATIBLE</em>.</p>
<p><strong>The Fix:</strong> Backup your app data if needed, completely uninstall the existing version of the app from your device, restart your phone, and then install the new APK.</p>
<h2>2. Insufficient Internal Device Storage</h2>
<p>Even if an APK is only 50 MB, Android requires up to 3 to 4 times that size in free internal storage to decompress the DEX code and unpack native library binaries (lib/arm64-v8a). If your internal storage is under 500 MB to 1 GB, the package installer will silently fail.</p>
<p><strong>The Fix:</strong> Open <strong>Settings &gt; Storage</strong> and clear cached data or remove unused media files to free at least 1.5 GB of internal storage.</p>
<h2>3. Incompatible Android OS Version or CPU Architecture</h2>
<p>Certain modern applications are compiled exclusively for 64-bit processors (ARM64-v8a) or require Android 11+ APIs. Attempting to install a 64-bit-only build on a 32-bit device (armeabi-v7a) will trigger an immediate installation abort.</p>
<p><strong>The Fix:</strong> Check the app specification details on <a href="/apps/">our APK directory</a> to confirm minimum Android OS version and processor architecture compatibility.</p>
<h2>4. Corrupted or Incomplete APK Download</h2>
<p>If your internet connection dropped during the download, the APK archive may be truncated or corrupted. An incomplete ZIP container cannot pass cryptographic verification.</p>
<p><strong>The Fix:</strong> Compare the SHA-256 checksum of your downloaded file against the published hash on the download page, or re-download the package over a stable Wi-Fi connection.</p>
<h2>5. Disable Google Play Protect Temporarily</h2>
<p>Google Play Protect occasionally flags unfamiliar or freshly compiled developer packages as unrecognized software, blocking silent installation.</p>
<p><strong>The Fix:</strong> Open <strong>Google Play Store &gt; Profile Icon &gt; Play Protect &gt; Settings Gear</strong>, toggle off <em>Scan apps with Play Protect</em>, install your verified APK, and re-enable protection afterwards.</p>`,
  topic: 'troubleshooting',
  related_apps: 'whatsapp,capcut,signal,vlc',
  related_categories: 'tools,security',
  related_guides: 'how-to-install-apk,what-is-an-apk-file,how-to-check-apk-file',
  faq_json: JSON.stringify([
    { q: 'Why does Android say App Not Installed as package appears to be invalid?', a: 'This indicates that the APK file was either corrupted during download, was compiled for a different processor architecture (e.g. 64-bit on a 32-bit CPU), or contains a syntax error in its AndroidManifest.xml.' },
    { q: 'Can I fix App Not Installed without uninstalling the old version?', a: 'Only if both APKs share the exact same digital signing key (keystore). If the signatures differ (such as switching from a Play Store build to a direct developer build), a complete uninstall is required by Android OS security policy.' }
  ]),
  author: 'APKworlds Editorial Research Desk'
};

const g2 = {
  slug: 'how-to-backup-and-extract-apk-files',
  title: 'How to Extract and Backup Installed APK Files on Android (Without Root)',
  meta_title: 'How to Backup & Extract APK Files on Android (No Root Required)',
  meta_description: 'Complete guide to extracting installed APK files from your Android phone. Learn how to backup apps for offline storage, transfer across devices, and archive older versions.',
  summary: 'Preserve your favorite Android apps and older versions by extracting clean APK files directly from your phone. No root access needed.',
  body_html: `<p>Backing up your installed Android applications into standalone APK files ensures you never lose access to a working version if an update introduces bugs or an app is removed from digital storefronts.</p>
<h2>Why Extract and Archive APK Files?</h2>
<ul>
<li><strong>Version Rollback Safety:</strong> If an automated update degrades performance or alters core UI, you can easily restore your saved APK archive.</li>
<li><strong>Offline Reinstallation:</strong> Install large tools or utilities across multiple household devices without consuming cellular mobile bandwidth.</li>
<li><strong>Preserving Discontinued Apps:</strong> Keep working builds of niche open-source utilities or independent developer packages.</li>
</ul>
<h2>Method 1: Using Dedicated APK Extractor (Recommended)</h2>
<p>The cleanest and most reliable way to extract an APK without root is using a verified extraction utility:</p>
<ol>
<li>Download and open a verified APK extractor (such as ML Manager or Solid Explorer).</li>
<li>Locate the target application in your installed app list.</li>
<li>Tap <strong>Extract</strong>. The utility will copy the base package from <code>/data/app/</code> directly into your device's <code>Downloads/</code> or <code>ExtractedApks/</code> directory.</li>
<li>Verify the extracted APK using our <a href="/guides/how-to-check-apk-file/">guide on APK verification</a>.</li>
</ol>
<h2>Method 2: Using ADB (Android Debug Bridge) via PC</h2>
<p>Power users can extract exact base packages directly through a USB cable without installing any third-party extraction apps on the phone:</p>
<pre><code>adb shell pm path com.example.app\nadb pull /data/app/.../base.apk C:\\Backups\\app.apk</code></pre>`,
  topic: 'tutorials',
  related_apps: 'solid-explorer,mixplorer',
  related_categories: 'tools,productivity',
  related_guides: 'what-is-an-apk-file,how-to-install-apk,how-to-update-android-apps',
  faq_json: JSON.stringify([
    { q: 'Does extracting an APK backup my login info and app data?', a: 'No. Extracting an APK copies the application code and assets (the installer file). User personal data and logins remain encrypted in protected private storage.' },
    { q: 'Is it legal to extract APK files from my own Android phone?', a: 'Yes. Extracting APK files of apps you legitimately installed for personal backup and archiving purposes is standard practice under fair use.' }
  ]),
  author: 'APKworlds Editorial Research Desk'
};

const g3 = {
  slug: 'how-to-install-apk-on-pc-windows',
  title: 'How to Install and Run APK Files on Windows PC (Step-by-Step Guide)',
  meta_title: 'How to Run APK Files on Windows 10 & 11 PC (Best Emulators & WSA)',
  meta_description: 'Run Android APK files on your Windows 10 or 11 PC. Step-by-step tutorial comparing Windows Subsystem for Android, LDPlayer, BlueStacks, and lightweight emulators.',
  summary: 'Discover how to install and execute Android APK applications on your Windows laptop or desktop PC with zero lag and high resolution.',
  body_html: `<p>Running Android applications on a Windows desktop or laptop gives you larger screen real estate, precise mouse and keyboard navigation, and seamless multitasking. Whether you want to edit video using <a href="/apps/capcut/">CapCut</a> or play mobile games, this guide details the best methods.</p>
<h2>Option 1: Windows Subsystem for Android (WSA) on Windows 11</h2>
<p>Windows 11 features native virtualization that can execute Android packages directly alongside standard desktop Windows programs without running a bulky emulator UI.</p>
<ol>
<li>Enable <strong>Virtual Machine Platform</strong> in Windows Features.</li>
<li>Install a WSA package with sideloading support (WSA Pacman).</li>
<li>Double-click any downloaded APK file on your PC to trigger native installation into your Windows Start Menu!</li>
</ol>
<h2>Option 2: High-Performance Emulators (LDPlayer &amp; MuMu Player)</h2>
<p>If you are on Windows 10 or prioritize 60/120 FPS high refresh gaming, dedicated virtualization software offers custom keymapping and multi-instance management.</p>
<p>For detailed safety practices before testing files on your desktop, consult our <a href="/guides/what-is-an-apk-file/">what is an APK file overview</a>.</p>`,
  topic: 'pc-emulators',
  related_apps: 'capcut,remini,brawl-stars,pubg-mobile',
  related_categories: 'games,tools',
  related_guides: 'what-is-an-apk-file,how-to-install-apk',
  faq_json: JSON.stringify([
    { q: 'Can I open an APK file natively on Windows without any software?', a: 'No. APK files are compiled for Android OS and ARM or x86 Android runtimes. You require either Windows Subsystem for Android or an Android emulator.' },
    { q: 'Which Android emulator uses the least RAM on low-end laptops?', a: 'LDPlayer and MuMu Player 6 are recognized for low memory footprints, typically requiring only 2 GB of allocated RAM compared to 4 GB+ on heavier suites.' }
  ]),
  author: 'APKworlds Editorial Research Desk'
};

for (const g of [g1, g2, g3]) {
  run(`
    INSERT OR REPLACE INTO guides
    (slug, title, meta_title, meta_description, summary, body_html, topic, related_apps, related_categories, related_guides, faq_json, author, status, published_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'), datetime('now'))
  `, g.slug, g.title, g.meta_title, g.meta_description, g.summary, g.body_html, g.topic, g.related_apps, g.related_categories, g.related_guides, g.faq_json, g.author);
  console.log('Successfully inserted guide:', g.slug);
}
