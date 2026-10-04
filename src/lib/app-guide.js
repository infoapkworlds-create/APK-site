import { one, run, all, tx } from '../db.js';
import { fmtBytes, parseJSON } from './html.js';
import { config } from '../config.js';

/**
 * Builds high-authority editorial guide data for an app without repeating
 * redundant boilerplate from the app detail page.
 * Focused on installation walkthrough, security checks, gameplay/app mastery,
 * and comprehensive error resolution.
 */
export function generateAppGuideData(app) {
  const isGame = app.app_type === 'game' || app.cat_kind === 'game';
  const isAmongUs = app.slug === 'among-us';
  const slug = `how-to-download-${app.slug}-apk`;

  const title = `How to Download & Install ${app.name} APK on Android (Complete Setup & Strategy Guide)`;
  const metaTitle = `How to Download & Install ${app.name} APK: Android Setup & Guide`;
  const metaDescription = `Learn how to download and install ${app.name} APK safely on Android. Step-by-step sideloading, SHA-256 hash verification, gameplay strategies, and fixes for installation errors.`;
  const summary = `Comprehensive tutorial on downloading, installing, and configuring ${app.name} APK on Android. Includes unknown sources settings, cryptographic integrity checks, ${isGame ? 'gameplay tactics' : 'configuration tips'}, and fixes for common Android package errors.`;

  const devUrl = `/developer/${app.dev_slug}/`;
  const appUrl = `/apps/${app.slug}/`;
  const dlUrl = `/apps/${app.slug}/download/`;
  const versionsUrl = `/apps/${app.slug}/versions/`;
  const catUrl = `/${isGame ? 'games' : 'apps'}/${app.cat_slug}/`;
  const officialWeb = app.website || app.dev_website || '';
  const webHostname = officialWeb ? new URL(officialWeb).hostname.replace(/^www\./, '') : '';

  // Specialized strategy content for Among Us vs generic games vs apps
  let masterySection = '';

  if (isAmongUs) {
    masterySection = `
<h2>Mastering Among Us: Game Rules, Roles &amp; Winning Strategies</h2>
<p>Once you have installed <strong>Among Us</strong> on your Android device, mastering the core deduction dynamics between <strong>Crewmates</strong> and <strong>Impostors</strong> is essential for dominating both private friend lobbies and public games.</p>

<h3>1. How to Play as an Elite Crewmate</h3>
<p>As a Crewmate, your primary objective is to complete all assigned spaceship maintenance tasks or identify and vote out every Impostor aboard.</p>
<ul>
  <li><strong>Watch for Visual Tasks:</strong> Tasks such as <em>MedBay Scan</em>, <em>Clear Asteroids</em> (Weapons), <em>Prime Shields</em>, and <em>Empty Garbage</em> have visible animations when visual tasks are enabled in lobby settings. Watch other players perform them to prove their innocence beyond doubt.</li>
  <li><strong>Master the Admin Table &amp; Security Feeds:</strong> The Admin table in the Admin room shows the exact count of players in every room without revealing identities. If someone disappears instantly from MedBay and reappears in Electrical, they just used a vent!</li>
  <li><strong>Cross-Reference Alibis in Emergency Meetings:</strong> When a dead body is reported, immediately ask <em>Where was the body found?</em>, <em>Who was nearby?</em>, and <em>Who saw who last?</em>. Impostors frequently make mistakes when asked about the sequence of rooms they visited.</li>
  <li><strong>Stick in Pairs with Verified Crewmates:</strong> Once you confirm someone is innocent (e.g. through a completed visual task), buddy up with them. An Impostor cannot eliminate one of you without exposing themselves to the other.</li>
</ul>

<h3>2. The Impostor Playbook: Art of Sabotage &amp; Deception</h3>
<p>Playing as the Impostor requires calculated patience, stealthy assassinations, and acting completely natural during Emergency Meetings.</p>
<ul>
  <li><strong>Fake Tasks with Convincing Timing:</strong> Never run straight to a task and leave in 1 second. Stand next to tasks for realistic durations (e.g. 4–5 seconds for wiring). Never fake a task that isn't on the common task list, and never fake visual tasks if animations are turned on.</li>
  <li><strong>Strategic Sabotages to Manipulate Movement:</strong> 
    <ul>
      <li><strong>Lights Out (Electrical):</strong> Reduces Crewmate vision to zero while your vision remains 100%. This is the best sabotage for stealth kills in crowded hallways.</li>
      <li><strong>Critical Alarms (Reactor &amp; O2):</strong> Forces everyone to sprint to opposite sides of the map. If a kill was committed near Navigation, trigger a Reactor meltdown on the far left to divert all foot traffic away from the body.</li>
      <li><strong>Door Locks (The Skeld):</strong> Trap crewmates in rooms with vents to eliminate them and escape before doors open.</li>
    </ul>
  </li>
  <li><strong>Vent With Extreme Caution:</strong> Always check that nobody is watching through the Security cameras (the camera will blink with a red light when in use). Vent only when you have a clear destination room with nobody inside.</li>
  <li><strong>Crafting Believable Alibis in Meetings:</strong> Do not be the first person to accuse someone, as overly aggressive players draw instant suspicion. Blend in, agree with the consensus, and fabricate plausible tasks you were supposedly working on (e.g. <em>"I was finishing download in Cafeteria"</em>).</li>
</ul>

<h3>3. Recommended Lobby Settings for Balanced Competitive Play</h3>
<p>For the most competitive and fun games with 8–15 players on The Skeld, Polus, or MIRA HQ, configure your lobby with these community-standard settings:</p>
<div class="tablewrap">
  <table class="specs-table">
    <thead>
      <tr><th>Setting</th><th>Recommended Value</th><th>Tactical Rationale</th></tr>
    </thead>
    <tbody>
      <tr><td>Player Speed</td><td>1.25x</td><td>Prevents crew from outrunning killers too easily while keeping movement fluid.</td></tr>
      <tr><td>Crewmate Vision</td><td>1.0x</td><td>Standard balanced sight line.</td></tr>
      <tr><td>Impostor Vision</td><td>1.5x</td><td>Gives killers the tactical sight advantage needed for stealth navigation.</td></tr>
      <tr><td>Kill Cooldown</td><td>22.5s &ndash; 25.0s</td><td>Prevents rapid double kills while keeping match pacing intense.</td></tr>
      <tr><td>Kill Distance</td><td>Medium</td><td>Fair hit registration without awkward teleports.</td></tr>
      <tr><td>Discussion Time</td><td>15 seconds</td><td>Prevents premature panic votes before evidence is shared.</td></tr>
      <tr><td>Voting Time</td><td>45 &ndash; 60 seconds</td><td>Enough time to debate clues without stalling the game.</td></tr>
      <tr><td>Anonymous Voting</td><td>Enabled</td><td>Prevents revenge voting in subsequent rounds.</td></tr>
    </tbody>
  </table>
</div>
`;
  } else if (isGame) {
    masterySection = `
<h2>Core Gameplay Mechanics &amp; Competitive Strategy</h2>
<p>To maximize your enjoyment, climb leaderboards, and excel in <strong>${app.name}</strong>, follow these tested gameplay strategies:</p>
<ul>
  <li><strong>Master Touch Controls &amp; Sensitivity:</strong> Spend time in the settings menu adjusting control layout, virtual joystick responsiveness, and camera sensitivity. Tailoring control bindings to your thumb reach significantly improves reaction time.</li>
  <li><strong>Resource &amp; Currency Management:</strong> Prioritize upgrades that offer long-term performance benefits rather than temporary cosmetics. Conserve premium items for high-difficulty challenges.</li>
  <li><strong>Graphics &amp; Frame Rate Optimization:</strong> For competitive games, set graphics to <em>Medium</em> or <em>Performance</em> and enable the highest available frame rate (60 FPS or 90 FPS). Smoother frame rates reduce input latency during fast-paced action.</li>
  <li><strong>Audio Awareness:</strong> Play with headphones enabled. In action and competitive titles, directional sound cues (footsteps, engine revs, gunfire) provide vital tactical awareness before opponents appear on screen.</li>
</ul>
`;
  } else {
    masterySection = `
<h2>First-Time Setup &amp; Performance Optimization Guide</h2>
<p>To get the most out of <strong>${app.name}</strong> on Android, implement these essential post-installation configuration steps:</p>
<ul>
  <li><strong>Account &amp; Cloud Sync Configuration:</strong> Open the app and connect your primary profile to enable automatic cloud backup and synchronization across devices.</li>
  <li><strong>Battery Optimization Exemption (If Needed):</strong> If ${app.name} provides background notifications or downloads, navigate to <em>Settings &gt; Apps &gt; ${app.name} &gt; Battery</em> and select <em>Unrestricted</em> to prevent Android's aggressive power management from putting the service to sleep.</li>
  <li><strong>Granular Privacy Hardening:</strong> In <em>Settings &gt; Apps &gt; ${app.name} &gt; Permissions</em>, review granted accesses. Revoke unnecessary background permissions like constant location or microphone access unless actively required.</li>
  <li><strong>Data Saver &amp; Cache Management:</strong> Enable in-app data compression or offline caching if available to minimize cellular data usage when operating on mobile networks.</li>
</ul>
`;
  }

  const bodyHtml = `
<div class="guide-intro">
  <p class="lead">Looking for a verified, secure way to install <strong>${app.name}</strong> on your Android device? This comprehensive step-by-step tutorial guides you through safely downloading the official APK package, configuring Android sideloading permissions, verifying file checksum integrity, and solving common installation problems.</p>
  <p>Published by <a href="${devUrl}"><strong>${app.dev_name}</strong></a> in the <a href="${catUrl}"><strong>${app.cat_name}</strong></a> category, <a href="${appUrl}"><strong>${app.name}</strong></a> is designed to deliver seamless performance on Android smartphones and tablets. Whether you are installing the app for the first time or updating an existing installation to version ${app.version || 'the latest release'}, following this verified installation protocol ensures a secure, hassle-free setup without risking device security.</p>
</div>

<div class="guide-cta-card">
  <div class="cta-content">
    <h3>Quick Download Link</h3>
    <p>Get the authentic, malware-scanned APK package directly from the verified source with SHA-256 verification details.</p>
  </div>
  <div class="cta-actions">
    <a href="${dlUrl}" class="btn primary">Download ${app.name} APK</a>
    <a href="${appUrl}" class="btn secondary">Full App Details</a>
  </div>
</div>

<h2>Pre-Installation Checklist &amp; Device Requirements</h2>
<p>Before initiating the download, verify that your Android hardware and software meet the requirements below:</p>

<div class="tablewrap">
  <table class="specs-table">
    <thead>
      <tr><th>Requirement</th><th>Specification</th><th>Notes</th></tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Target Application</th>
        <td><a href="${appUrl}"><strong>${app.name}</strong></a></td>
        <td>Official release by <a href="${devUrl}">${app.dev_name}</a></td>
      </tr>
      <tr>
        <th scope="row">Minimum Android OS</th>
        <td>${app.min_android ? `Android ${app.min_android}+` : 'Android 7.0 (Nougat) or newer'}</td>
        <td>Check via <em>Settings &gt; About Phone</em></td>
      </tr>
      <tr>
        <th scope="row">Required Storage</th>
        <td>${app.size_bytes ? fmtBytes(app.size_bytes * 2) : '350 MB'} free space</td>
        <td>Requires room for APK archive + installation unpack</td>
      </tr>
      <tr>
        <th scope="row">CPU Architecture</th>
        <td>ARM64-v8a / armeabi-v7a / x86_64</td>
        <td>Universal multi-ABI support</td>
      </tr>
      <tr>
        <th scope="row">Internet Connection</th>
        <td>${isGame ? 'Broadband Wi-Fi or 4G/5G mobile data' : 'Required for setup & sync'}</td>
        <td>Recommended for smooth matchmaking and asset downloads</td>
      </tr>
      <tr>
        <th scope="row">Security Verification</th>
        <td>SHA-256 Checksum Verified</td>
        <td>Scan details on <a href="${dlUrl}">${app.name} Verification Page</a></td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Step-by-Step Tutorial: How to Download &amp; Install ${app.name} APK</h2>

<div class="step-card">
  <div class="step-badge">Step 1</div>
  <div class="step-content">
    <h3>Obtain the Official APK Package</h3>
    <p>Navigate to our verified <a href="${dlUrl}"><strong>${app.name} Download Page</strong></a>. Click the primary download button to initiate the transfer of the genuine installation package.</p>
    <p class="tip-box"><strong>Security Tip:</strong> Never download APK packages from untrusted forums or file lockers offering repackaged or modified binaries, as they may compromise your personal data. Always rely on verified distribution pages or ${app.dev_name}'s <a href="${officialWeb || devUrl}" rel="noopener">official channels</a>.</p>
  </div>
</div>

<div class="step-card">
  <div class="step-badge">Step 2</div>
  <div class="step-content">
    <h3>Enable "Install Unknown Apps" in Android Settings</h3>
    <p>Modern Android versions (Android 8.0 Oreo through Android 14 and Android 15) manage sideloading permissions per application rather than with a global switch. Grant permission to your browser or file manager as follows:</p>
    <ol>
      <li>Open your device's <strong>Settings</strong> app.</li>
      <li>Scroll to <strong>Apps</strong> (or <em>Apps &amp; notifications</em>) and tap <strong>Special app access</strong>.</li>
      <li>Select <strong>Install unknown apps</strong> from the list.</li>
      <li>Tap the application you used to download the file (e.g., <em>Chrome</em>, <em>Firefox</em>, or your <em>Files</em> manager).</li>
      <li>Toggle the switch next to <strong>Allow from this source</strong> to the ON position.</li>
    </ol>
  </div>
</div>

<div class="step-card">
  <div class="step-badge">Step 3</div>
  <div class="step-content">
    <h3>Verify File Integrity &amp; Package Signatures</h3>
    <p>Before tapping the package, verify that the file downloaded completely and has not been altered in transit:</p>
    <ul>
      <li>Review the file name and compare the SHA-256 cryptographic checksum against the hash published on our <a href="${dlUrl}">${app.name} file details page</a>. You can use any free hash utility to confirm integrity, as explained in our <a href="/guides/how-to-check-apk-file/">guide on checking APK file integrity</a>.</li>
      <li>Ensure Google Play Protect is enabled so Android automatically runs a real-time behavioral scan prior to installation.</li>
    </ul>
  </div>
</div>

<div class="step-card">
  <div class="step-badge">Step 4</div>
  <div class="step-content">
    <h3>Run the Installer &amp; Review Permissions</h3>
    <p>Open your browser's <em>Downloads</em> list or your device's <em>Files</em> app, then tap the <code>${app.slug}.apk</code> file:</p>
    <ol>
      <li>A system prompt will appear asking if you want to install ${app.name}. Tap <strong>Install</strong>.</li>
      <li>Wait a few moments while the Android Package Manager copies libraries, verifies certificates, and registers the app.</li>
      <li>When the installation finishes, tap <strong>Done</strong> or <strong>Open</strong>.</li>
      <li>Upon launching ${app.name} for the first time, review the runtime permissions requested (such as storage or notification access) to ensure they match expected features. For complete guidance on privacy controls, read our <a href="/guides/how-to-check-app-permissions/">Android app permissions guide</a>.</li>
    </ol>
  </div>
</div>

${masterySection}

<h2>How to Cryptographically Verify ${app.name} APK Integrity</h2>
<p>Before installing any sideloaded application, verifying that the package has not been tampered with or corrupted is standard Android security best practice. Every APK hosted on our platform includes an official SHA-256 fingerprint on the <a href="${dlUrl}">${app.name} download details page</a>.</p>

<p>You can verify the file checksum using your computer or an Android terminal before tapping install:</p>

<div class="step-card">
  <div class="step-badge">Windows</div>
  <div class="step-content">
    <p>Open Command Prompt or PowerShell in your downloads folder and execute:</p>
    <pre><code>certutil -hashfile ${app.slug}.apk SHA256</code></pre>
  </div>
</div>

<div class="step-card">
  <div class="step-badge">Linux / Mac / Termux</div>
  <div class="step-content">
    <p>Run the native sha256sum utility:</p>
    <pre><code>sha256sum ${app.slug}.apk</code></pre>
  </div>
</div>
<p>Compare the resulting 64-character hexadecimal output with the hash published on our verification page. An exact match guarantees that your package is 100% genuine and unaltered.</p>

<h2>Troubleshooting Common Installation Errors</h2>
<p>If you encounter an unexpected issue while installing ${app.name} APK, use these proven fixes to resolve the most common Android sideloading errors:</p>

<div class="step-card">
  <div class="step-badge">Error 1</div>
  <div class="step-content">
    <h3>"Parse Error: There was a problem parsing the package"</h3>
    <p><strong>Cause:</strong> A parse error usually indicates that the APK file was corrupted during download, or that the APK's <code>minSdkVersion</code> requires a newer Android version than your device currently runs.</p>
    <p><strong>Solution:</strong> Delete the downloaded file, restart your phone, ensure an uninterrupted Wi-Fi connection, and download a fresh copy from the <a href="${dlUrl}">${app.name} download portal</a>. If your Android OS version is below ${app.min_android || '7.0'}, consider checking previous compatible builds in the <a href="${versionsUrl}">${app.name} version archive</a>.</p>
  </div>
</div>

<div class="step-card">
  <div class="step-badge">Error 2</div>
  <div class="step-content">
    <h3>"App Not Installed" Error</h3>
    <p><strong>Cause:</strong> This error typically arises from an existing installation of ${app.name} with a conflicting cryptographic signature (such as a modded or beta build), or insufficient free storage space.</p>
    <p><strong>Solution:</strong> Completely uninstall any older conflicting version of ${app.name}, clear device cache via our <a href="/guides/how-to-clear-app-cache/">cache clearing tutorial</a>, and free at least 500 MB of internal storage before attempting the installation again.</p>
  </div>
</div>

<div class="step-card">
  <div class="step-badge">Error 3</div>
  <div class="step-content">
    <h3>"Blocked by Google Play Protect"</h3>
    <p><strong>Cause:</strong> Play Protect occasionally flags sideloaded APKs from new or third-party mirrors because the package was not acquired directly via the Play Store interface.</p>
    <p><strong>Solution:</strong> Check the developer name to verify it says <strong>${app.dev_name}</strong> and ensure the package identifier matches <code>${app.package_name || 'official package'}</code>. Tap <em>More details</em> and choose <em>Install anyway</em> only after verifying the package signature.</p>
  </div>
</div>

<div class="step-card">
  <div class="step-badge">Error 4</div>
  <div class="step-content">
    <h3>"App Crashes on Launch or Black Screen"</h3>
    <p><strong>Cause:</strong> Permissions conflict or corrupted temporary cache on first launch.</p>
    <p><strong>Solution:</strong> Go to <em>Settings &gt; Apps &gt; ${app.name} &gt; Storage</em> and tap <em>Clear Cache</em>. Ensure necessary runtime permissions are allowed under <em>Permissions</em>.</p>
  </div>
</div>

<h2>How to Safely Update ${app.name} Without Losing Data</h2>
<p>When ${app.dev_name} releases a new version of ${app.name}, you do not need to uninstall your current copy. On Android, installing an updated APK with the identical cryptographic signature directly over an existing installation performs an in-place upgrade. Your accounts, saved games, customizations, and settings will remain completely intact.</p>
<p>To upgrade in the future, visit our <a href="${versionsUrl}">${app.name} Version History Archive</a>, download the latest APK build, and tap Install. The system will prompt: <em>"Do you want to update this app? Your existing data will not be lost."</em> Tap Update to finish. For more details on maintaining your apps, read our tutorial on <a href="/guides/how-to-update-android-apps/">how to update Android apps</a>.</p>

<div class="guide-cta-card">
  <div class="cta-content">
    <h3>Ready to Get Started?</h3>
    <p>Download the latest verified build of ${app.name} APK and follow the simple steps outlined above for a smooth installation.</p>
  </div>
  <div class="cta-actions">
    <a href="${dlUrl}" class="btn primary">Download ${app.name} APK Now</a>
    <a href="${appUrl}" class="btn secondary">Back to ${app.name} Overview</a>
  </div>
</div>
`.trim();

  // App-specific FAQs with rich answers
  const faqs = isAmongUs ? [
    {
      q: `Can I play Among Us APK cross-platform with PC and iOS friends?`,
      a: `Yes! Among Us fully supports cross-platform multiplayer. Players on Android APK can seamlessly join lobbies with friends playing on Steam (PC), iOS (iPhone/iPad), Nintendo Switch, PlayStation, and Xbox.`
    },
    {
      q: `Is Among Us free to play on Android?`,
      a: `Yes, Among Us is free to download and play on Android. Optional in-game cosmic purchases exist for cosmetic pets, hats, and skins, but the core gameplay is 100% free.`
    },
    {
      q: `How do I update Among Us APK without losing my unlocked cosmetics?`,
      a: `Simply download the newer APK version from ${config.siteName} and install it directly over your existing app. Because the developer signature matches, Android performs an in-place upgrade, preserving your account, level, and cosmetic unlocks.`
    },
    {
      q: `What should I do if Among Us displays "Reliable Packet 1" or "Disconnected from Server"?`,
      a: `This occurs during matchmaking spikes. In the game's main menu, switch your region selector (bottom right globe icon) between North America, Europe, and Asia to find an active, low-ping server.`
    },
    {
      q: `Does Among Us require root access on Android?`,
      a: `No, Among Us installs and runs normally on standard unrooted Android devices running Android 7.0 or higher.`
    }
  ] : [
    {
      q: `Is it safe to download and install ${app.name} APK directly?`,
      a: `Yes, downloading the official ${app.name} APK from verified sources is completely safe. The package is developed by ${app.dev_name} and undergoes SHA-256 integrity verification and automated malware screening prior to listing.`
    },
    {
      q: `How do I update ${app.name} APK without losing my data?`,
      a: `To update ${app.name}, download the newer APK version and install it over your existing app without uninstalling first. As long as both files are signed with the same developer key, Android performs an in-place upgrade while preserving your settings and data.`
    },
    {
      q: `What should I do if ${app.name} shows "App Not Installed"?`,
      a: `This error usually means there is a conflicting version with a different signature on your device, or you have insufficient internal storage. Uninstall any third-party or modded versions of ${app.name}, free up at least 500 MB of space, and try the installation again.`
    },
    {
      q: `Does ${app.name} require root access on Android?`,
      a: `No, ${app.name} installs and functions normally on standard, unrooted Android devices. Root access is neither required nor recommended for standard operation.`
    },
    {
      q: `Where can I download older versions of ${app.name}?`,
      a: `You can access previous releases and changelogs on our dedicated ${app.name} version history page at /apps/${app.slug}/versions/.`
    }
  ];

  return {
    slug,
    title,
    meta_title: metaTitle,
    meta_description: metaDescription,
    summary,
    body_html: bodyHtml,
    topic: 'apk',
    related_apps: app.slug,
    related_categories: app.cat_slug,
    related_guides: 'how-to-install-apk,how-to-check-apk-file,how-to-check-app-permissions,how-to-clear-app-cache',
    faq_json: JSON.stringify(faqs),
    author: `${app.dev_name} Editorial Review Team`,
    status: 'published'
  };
}

/**
 * Ensures an app-specific guide exists in the database.
 * If not already present, generates and saves it, returning the guide object.
 */
export function ensureAppGuide(app) {
  const guideSlug = `how-to-download-${app.slug}-apk`;
  let existing = one('SELECT * FROM guides WHERE slug=?', guideSlug);
  if (existing) return existing;

  const data = generateAppGuideData(app);
  run(`
    INSERT INTO guides (
      slug, title, meta_title, meta_description, summary, body_html,
      topic, related_apps, related_categories, related_guides,
      faq_json, author, status, published_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', COALESCE(?, datetime('now')), COALESCE(?, datetime('now')))
  `,
    data.slug, data.title, data.meta_title, data.meta_description, data.summary, data.body_html,
    data.topic, data.related_apps, data.related_categories, data.related_guides,
    data.faq_json, data.author,
    app.published_at, app.updated_at
  );

  return one('SELECT * FROM guides WHERE slug=?', guideSlug);
}

/**
 * Bulk generate or update guides for a collection of apps.
 */
export function bulkGenerateGuides(apps) {
  return tx(() => {
    let count = 0;
    for (const app of apps) {
      const guideSlug = `how-to-download-${app.slug}-apk`;
      const data = generateAppGuideData(app);
      const row = one('SELECT id FROM guides WHERE slug=?', guideSlug);
      if (row) {
        run(`
          UPDATE guides
          SET title=?, meta_title=?, meta_description=?, summary=?, body_html=?,
              faq_json=?, author=?, updated_at=datetime('now')
          WHERE id=?
        `, data.title, data.meta_title, data.meta_description, data.summary, data.body_html,
           data.faq_json, data.author, row.id);
      } else {
        run(`
          INSERT INTO guides (
            slug, title, meta_title, meta_description, summary, body_html,
            topic, related_apps, related_categories, related_guides,
            faq_json, author, status, published_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'), datetime('now'))
        `,
          data.slug, data.title, data.meta_title, data.meta_description, data.summary, data.body_html,
          data.topic, data.related_apps, data.related_categories, data.related_guides,
          data.faq_json, data.author
        );
      }
      count++;
    }
    return count;
  });
}
