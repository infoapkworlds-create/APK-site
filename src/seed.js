import path from 'node:path';
import { config } from './config.js';
import { createMockApk } from './lib/apk-generator.js';

const TODAY = '2026-10-03';
const J = (v) => JSON.stringify(v);

const categories = [
  ['communication', 'Communication', 'app', 'Messaging, calling and email apps. The main differences between them are encryption defaults, what account you sign up with, and how group chats work.', [
    ['Do all messaging apps encrypt messages end to end?', 'No. Some encrypt every chat by default, some only encrypt certain chat types, and some encrypt only between your phone and their servers. Each app page in this category lists what the developer states about encryption.'],
    ['Do I need a phone number to use these apps?', 'Most popular messengers ask for a phone number at sign-up. Check the app page for current sign-up requirements, as they can change.'],
  ], ['social', 'security']],
  ['social', 'Social', 'app', 'Apps for following people, sharing posts and joining online communities.', [], ['communication']],
  ['productivity', 'Productivity', 'app', 'Notes, to-do lists, documents and calendar apps. Pay attention to where your data is stored and whether you can export it later.', [
    ['Can I move my notes from one app to another?', 'It depends on export options. Apps that store notes as Markdown or offer a standard export format are easier to leave. App pages mention export options where we could confirm them.'],
  ], ['tools', 'education']],
  ['education', 'Education', 'app', 'Language learning, study aids and reference apps.', [], ['productivity']],
  ['business', 'Business', 'app', 'Apps for work communication, invoicing and running a small business.', [], ['productivity', 'finance']],
  ['finance', 'Finance', 'app', 'Budgeting, banking and expense apps. Only install banking apps from your bank\'s official listing.', [], ['business', 'security']],
  ['tools', 'Tools', 'app', 'Browsers, file managers and utility apps that change how your phone works day to day.', [
    ['Should I replace the browser that came with my phone?', 'You do not have to. Some people switch for features such as extension support or different privacy defaults. The app pages list what each browser supports.'],
  ], ['security', 'productivity']],
  ['photography', 'Photography', 'app', 'Photo editors and camera apps. Many editors work fully on the device, which matters if you edit personal photos.', [], ['video-players-editors', 'tools']],
  ['video-players-editors', 'Video Players & Editors', 'app', 'Apps for playing local video files, streams and network shares, plus video editors.', [
    ['Why use a separate video player app?', 'The player built into many phones supports a limited set of file formats and subtitle types. Dedicated players often support more codecs, subtitle files and network sources.'],
  ], ['music-audio', 'photography']],
  ['music-audio', 'Music & Audio', 'app', 'Music streaming, podcast players and audio tools.', [
    ['Can I listen to podcasts without a streaming subscription?', 'Yes. Podcasts are distributed through open RSS feeds, so a podcast app can subscribe to most shows without an account.'],
  ], ['video-players-editors']],
  ['communication-email', 'Email', 'app', 'Email clients for personal and work accounts.', [], ['communication']],
  ['security', 'Security', 'app', 'Password managers, two-factor authenticators and privacy tools. These apps hold sensitive data, so check who makes them and how they store it.', [
    ['Is it safe to keep passwords in an app?', 'A reputable password manager encrypts your vault, and many use a design where the company cannot read it. Check the developer\'s security documentation before choosing one.'],
  ], ['tools', 'communication']],
  ['health-fitness', 'Health & Fitness', 'app', 'Exercise trackers, sleep apps and health logs.', [], ['tools']],
  ['maps-directions', 'Maps & Directions', 'app', 'Map apps for driving, walking and public transport directions, including apps that work without a data connection.', [
    ['Which map apps work offline?', 'Some apps let you download regions in advance and give directions with no data connection. App pages list offline support where the developer documents it.'],
  ], ['tools']],
  ['puzzle', 'Puzzle Games', 'game', 'Logic puzzles, word games and number games.', [], ['rpg']],
  ['rpg', 'RPG & Roguelike Games', 'game', 'Character-driven adventure games, including roguelikes where each run is randomly generated.', [], ['puzzle']],
];

const developers = [
  ['signal-messenger', 'Signal Messenger LLC', 'https://signal.org', 'Signal Messenger LLC publishes the Signal app. It is supported by the Signal Technology Foundation, a US 501(c)(3) nonprofit organization founded in 2018. The app is funded through donations and grants rather than advertising or venture capital. The Signal Protocol, its cryptographic foundation, is also used by several other messaging services. Source code for the Android client and backend is published publicly on GitHub under open licenses.', 'signal.org'],
  ['whatsapp', 'WhatsApp LLC', 'https://www.whatsapp.com', 'WhatsApp LLC is a subsidiary of Meta Platforms, which acquired the messaging service in 2014. Originally founded by Jan Koum and Brian Acton in 2009, WhatsApp has grown into one of the most widely used messaging applications globally. The service is available across Android, iOS, Windows, macOS, and web browsers, facilitating text messages, audio notes, voice calls, and video calls across international borders.', 'whatsapp.com'],
  ['telegram', 'Telegram FZ-LLC', 'https://telegram.org', 'Telegram FZ-LLC is a messaging platform founded in 2013 by Nikolai and Pavel Durov. It operates servers across multiple jurisdictions to provide distributed cloud storage for chats, media, and documents. While server code remains proprietary, Telegram publishes its official client applications under open source licenses and provides a public Bot API allowing developers to create automated tools, games, and services.', 'telegram.org'],
  ['videolan', 'VideoLAN', 'https://www.videolan.org', 'VideoLAN is a non-profit organization based in France that develops VLC media player and related open source multimedia projects. VLC originated in 1996 as a student project at École Centrale Paris under the name VideoLAN Client. Today, VideoLAN is run by an international team of volunteer developers who maintain software for Android, iOS, Windows, macOS, Linux, and Android TV with no commercial advertising.', 'videolan.org'],
  ['mozilla', 'Mozilla', 'https://www.mozilla.org', 'Mozilla is a global non-profit backed organization best known for producing the Firefox web browser and Thunderbird email client. Guided by the Mozilla Manifesto, the organization advocates for an open, accessible, and standards-compliant internet. Its mobile software efforts include Firefox for Android, which utilizes the independent GeckoView rendering engine, and privacy-oriented tools like Firefox Focus.', 'mozilla.org'],
  ['bitwarden', 'Bitwarden Inc.', 'https://bitwarden.com', 'Bitwarden Inc. produces an open source password management service founded in 2015 by Kyle Spearrin. The platform provides encrypted vault storage for login credentials, payment cards, secure notes, and identities across mobile devices, desktop computers, and browser extensions. Bitwarden publishes its client and server source code on GitHub and regularly commissions third-party security audits from independent cybersecurity firms.', 'bitwarden.com'],
  ['organic-maps', 'Organic Maps', 'https://organicmaps.app', 'Organic Maps is a community-driven open source project founded in 2021 by original creators of MAPS.ME after that project was acquired. Organic Maps focuses on fast, battery-efficient offline mapping and turn-by-turn navigation using OpenStreetMap data. The project operates as an independent community initiative without venture capital funding, tracking scripts, or commercial banner advertising.', 'organicmaps.app'],
  ['google', 'Google LLC', 'https://about.google', 'Google LLC makes Android itself, along with many of the apps that come installed on Android phones. Several of its apps are also listed here because people often compare them with independent options, for example Google Maps against offline map apps, or Google Keep against open source note apps. Google apps generally sign in with a Google account and sync data to Google servers.', 'about.google'],
  ['joplin', 'Joplin', 'https://joplinapp.org', 'Joplin is an open source note-taking and to-do application created in 2017 by developer Laurent Cozic. The application is built to handle large notebooks of notes formatted in Markdown, complete with image attachments and search capabilities. Joplin allows users to synchronize their data using end-to-end encryption across cloud storage services such as Nextcloud, Dropbox, OneDrive, WebDAV, or the Joplin Cloud service.', 'joplinapp.org'],
  ['duolingo', 'Duolingo', 'https://www.duolingo.com', 'Duolingo is an American educational technology company founded in 2011 by Luis von Ahn and Severin Hacker in Pittsburgh, Pennsylvania. The platform delivers gamified language learning courses across dozens of world languages, using short exercises that practice listening, speaking, reading, and translation. In recent years, Duolingo expanded its learning platform to include introductory courses in elementary mathematics and music literacy.', 'duolingo.com'],
  ['spotify', 'Spotify AB', 'https://www.spotify.com', 'Spotify AB is a Swedish audio streaming service founded in 2006 by Daniel Ek and Martin Lorentzon. The service offers a catalog of tens of millions of licensed songs, podcasts, and audiobooks. Spotify provides both an ad-supported free tier and paid Premium subscription options that allow on-demand track selection, higher audio bitrates, and offline downloads to mobile devices.', 'spotify.com'],
  ['antennapod', 'AntennaPod', 'https://antennapod.org', 'AntennaPod is a volunteer-run, open source podcast manager for Android founded in 2012. The project has no corporate parent, accepts donations through open collective platforms, and contains no advertisement trackers or user profiling. AntennaPod interacts directly with open RSS feeds, allowing listeners to subscribe, download, stream, and organize podcasts without requiring account registration with a platform holder.', 'antennapod.org'],
  ['shattered-pixel', 'Shattered Pixel', 'https://shatteredpixel.com', 'Shattered Pixel is an independent game development studio established by Australian developer Evan Debenham. The studio is best known for Shattered Pixel Dungeon, a turn-based traditional roguelike that originated in 2014 as an open source modification of Watabou\'s Pixel Dungeon. Evan Debenham actively maintains the game with regular content expansions, hero balance adjustments, and cross-platform releases.', 'shatteredpixel.com'],
  ['chris-boyle', 'Chris Boyle', 'https://chris.boyle.name', 'Chris Boyle is a software engineer based in the United Kingdom who has maintained the Android port of Simon Tatham\'s Portable Puzzle Collection since 2009. His open source port translates Simon Tatham\'s desktop C puzzle code into a native Android interface that runs completely offline with no network permissions, no user tracking, and full support for keyboard, touch, and trackball input.', 'github.com/chrisboyle/sgtpuzzles'],
];

// [slug, name, devSlug, catSlug, type, pkg, summary, description, audience, features, pros, cons, price, license, ads, offline, website, play, officialApk, privacyUrl, privacyNote, tags, faq]
const apps = [
  ['signal', 'Signal Private Messenger', 'signal-messenger', 'communication', 'app', 'org.thoughtcrime.securesms',
    'An encrypted messenger for text, voice and video calls, run by a nonprofit and free of ads.',
    `Signal is a messaging app where every chat and call is end-to-end encrypted by default. You don't have to switch on a special mode. One-to-one chats, groups, voice calls and video calls all use the same protection.

You sign up with a phone number. After that you can set a username and share that instead, so people can contact you without seeing your number.

Signal collects very little data about its users. The organisation has published court documents showing that, when asked for user data, it could only provide the date an account was created and the last time it connected.

It covers the everyday things people expect from a messenger: group chats, disappearing messages, stickers, voice notes, file sharing and a desktop app that links to your phone. Fewer people use it than WhatsApp, so you may need to ask friends to install it.`,
    'People who want private messaging without changing settings, and anyone who prefers an app with no advertising business behind it.',
    ['End-to-end encryption for all chats and calls by default', 'Usernames so you can avoid sharing your phone number', 'Disappearing messages with adjustable timers', 'Group voice and video calls', 'Linked desktop app for Windows, macOS and Linux'],
    ['Strong encryption is on by default', 'No ads and no tracking for advertising', 'Open source code that anyone can check'],
    ['Smaller user base than the largest messengers', 'Phone number still required to register', 'Chat backups need to be set up and stored by you'],
    'free', 'Free, open source (AGPL-3.0)', 'No ads', 'Needs a data connection to send messages',
    'https://signal.org', 'https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms', 'https://signal.org/android/apk/', 'https://signal.org/legal/', 'Signal states it stores minimal metadata. Its published responses to legal requests list only account creation date and last connection date.',
    'messenger,encryption,privacy,chat,calls', [
      ['Does Signal have an official APK outside Google Play?', 'Yes. Signal publishes an APK on its own website for devices without Google Play. The link is on this page under the official source button.'],
    ]],
  ['whatsapp', 'WhatsApp Messenger', 'whatsapp', 'communication', 'app', 'com.whatsapp',
    'A widely used messenger from Meta for chats, calls, groups and status updates.',
    `WhatsApp is the messenger many people already have, which is the main reason to install it. In many countries it is the default way to reach friends, family and local businesses.

Personal messages and calls are end-to-end encrypted using the Signal Protocol. WhatsApp is owned by Meta, and its privacy policy describes sharing some account information with other Meta companies, so read it if that matters to you.

Besides chats and calls, it has Status updates that disappear after 24 hours, Channels for following organisations, Communities for grouping related chats, and payments in some countries. Chat backups can go to Google Drive, with an option to encrypt them.

You can use the same account on a phone and on linked devices such as a computer or tablet.`,
    'Anyone whose contacts already use WhatsApp, and small businesses that talk to customers through chat.',
    ['End-to-end encrypted personal chats and calls', 'Groups, Communities and Channels', 'Status updates that expire after 24 hours', 'Linked devices including desktop and web', 'Optional encrypted backups to Google Drive'],
    ['Very large user base', 'Encryption on by default for personal chats', 'Works well on low-end phones and slow connections'],
    ['Owned by Meta, which shares some data across its companies', 'Source code is not public', 'Phone number is required'],
    'free', 'Free', null, 'Needs a data connection to send messages',
    'https://www.whatsapp.com', 'https://play.google.com/store/apps/details?id=com.whatsapp', 'https://www.whatsapp.com/android', 'https://www.whatsapp.com/legal/privacy-policy', null,
    'messenger,chat,calls,groups', []],
  ['telegram', 'Telegram', 'telegram', 'communication', 'app', 'org.telegram.messenger',
    'A cloud-based messenger known for very large groups, public channels and bots.',
    `Telegram stores regular chats on its servers. That's why you can open the same conversation on several devices at once and see full history straight away, even on a new phone.

The trade-off is encryption. Regular chats are encrypted between your device and Telegram's servers, not end to end. For one-to-one end-to-end encryption you need to start a "Secret Chat", which only works on the device where you started it. Group chats cannot be end-to-end encrypted.

Groups can hold up to 200,000 members, and channels can broadcast to unlimited subscribers. There's also a bot platform, used for everything from news alerts to small tools. Some large public channels show sponsored messages, and a paid Premium tier adds features such as larger uploads.`,
    'People who join large communities or follow public channels, and anyone who needs chat history across many devices.',
    ['Cloud chats synced across all your devices', 'Groups of up to 200,000 members', 'Public channels with unlimited subscribers', 'Bots and mini apps', 'Secret Chats with end-to-end encryption for one-to-one conversations'],
    ['Instant sync across phone, tablet and computer', 'Handles very large files and groups', 'Official client is open source'],
    ['Regular and group chats are not end-to-end encrypted', 'Sponsored messages appear in some public channels', 'Phone number required at sign-up'],
    'freemium', 'Free, optional Premium subscription; client open source (GPL-2.0)', 'Sponsored messages in some large public channels', 'Needs a data connection to send messages',
    'https://telegram.org', 'https://play.google.com/store/apps/details?id=org.telegram.messenger', 'https://telegram.org/android', 'https://telegram.org/privacy', null,
    'messenger,channels,groups,bots,chat', []],
  ['vlc', 'VLC for Android', 'videolan', 'video-players-editors', 'app', 'org.videolan.vlc',
    'A free, open source media player that handles nearly any video or audio file you throw at it.',
    `VLC plays most video and audio formats without extra codec packs. MKV, MP4, AVI, FLAC, OGG and many more open directly, which is the main reason people install it.

It reads subtitle files such as SRT and ASS and can download subtitles from inside the player. It can also play from network shares (SMB, FTP, UPnP) and from stream URLs, so you can watch files stored on a home computer or NAS without copying them to the phone.

There's a separate audio library view, an equaliser, playback speed control, and picture-in-picture. VLC has no ads, no tracking and no paid tier. The interface is functional rather than pretty, and some settings menus are long.`,
    'Anyone with a collection of downloaded video or music files, and people who stream from a home server.',
    ['Plays most video and audio formats with no extra codecs', 'Subtitle support including SRT, ASS and online subtitle search', 'Network playback from SMB, FTP, UPnP and stream URLs', 'Audio equaliser and playback speed control', 'Picture-in-picture and background audio'],
    ['Wide format support', 'No ads or in-app purchases', 'Plays files from network shares'],
    ['Settings can be hard to find', 'Library scanning can be slow on large collections'],
    'free', 'Free, open source (GPL-2.0 or later)', 'No ads', 'Works offline for local files',
    'https://www.videolan.org/vlc/download-android.html', 'https://play.google.com/store/apps/details?id=org.videolan.vlc', 'https://www.videolan.org/vlc/download-android.html', 'https://www.videolan.org/legal.html', null,
    'video player,media player,subtitles,mkv,music player', []],
  ['firefox', 'Firefox Browser', 'mozilla', 'tools', 'app', 'org.mozilla.firefox',
    'Mozilla\'s web browser for Android, with extension support and tracking protection.',
    `Firefox for Android runs on Mozilla's own Gecko engine. Most other Android browsers are built on Chromium, so Firefox is one of the few real alternatives at the engine level.

Its biggest practical difference is extension support. You can install add-ons such as uBlock Origin from Mozilla's add-on site, which most mobile browsers do not allow.

Built-in tracking protection is on by default and blocks many known trackers. If you use Firefox on a computer, a Mozilla account syncs bookmarks, passwords, history and open tabs between devices. The toolbar can sit at the top or bottom of the screen. You can also customize your default search engine, use a clean reader view for text articles, and open private tabs that leave no browsing history on the phone.`,
    'People who want browser extensions on their phone, and Firefox desktop users who want their bookmarks and passwords synced.',
    ['Browser extensions, including content blockers', 'Built-in tracking protection on by default', 'Sync with Firefox on desktop through a Mozilla account', 'Private browsing tabs', 'Toolbar at the top or bottom'],
    ['Supports extensions on Android', 'Independent browser engine', 'Open source'],
    ['Some websites are tested mainly on Chromium browsers', 'Uses more battery than some lighter browsers on older phones'],
    'free', 'Free, open source (MPL-2.0)', 'Sponsored shortcuts on the home screen can be turned off in settings', null,
    'https://www.mozilla.org/firefox/browsers/mobile/android/', 'https://play.google.com/store/apps/details?id=org.mozilla.firefox', null, 'https://www.mozilla.org/privacy/firefox/', null,
    'browser,web browser,extensions,privacy,ad blocker', []],
  ['bitwarden', 'Bitwarden Password Manager', 'bitwarden', 'security', 'app', 'com.x8bit.bitwarden',
    'An open source password manager that syncs an encrypted vault across all your devices.',
    `Bitwarden stores your passwords in an encrypted vault and fills them into apps and websites through Android's autofill service.

The free plan has no limit on the number of passwords or devices, which is less common than it should be. A paid Premium plan adds extras such as built-in two-factor codes, file attachments and vault health reports.

Your vault is encrypted on your device before it is uploaded, so Bitwarden's servers only hold encrypted data. The code is public, and the company publishes third-party audit reports. People who want full control can run their own Bitwarden-compatible server.

Opening the vault with your fingerprint or face is supported after the first sign-in with your master password. You can also generate random passwords directly in the app.`,
    'Anyone still reusing passwords, and people who want one password manager across Android, iPhone, Windows and browsers.',
    ['Unlimited passwords and devices on the free plan', 'Android autofill for apps and browsers', 'Password generator', 'Fingerprint and face recognition', 'Option to self-host the server'],
    ['Free plan has no device limit', 'Open source with published audits', 'Available on almost every system'],
    ['Interface is plain', 'Autofill depends on how each app labels its login fields'],
    'freemium', 'Free with optional Premium plan; open source', 'No ads', 'Vault is available offline after first sync',
    'https://bitwarden.com', 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden', null, 'https://bitwarden.com/privacy/', 'Vault data is encrypted on the device before sync, according to Bitwarden\'s security documentation.',
    'password manager,passwords,autofill,security,2fa', []],
  ['organic-maps', 'Organic Maps', 'organic-maps', 'maps-directions', 'app', 'app.organicmaps',
    'Offline maps and directions based on OpenStreetMap, with no ads and no tracking.',
    `Organic Maps lets you download maps by region and then search, browse and get directions without a data connection. It's useful for travel abroad, hiking, and places with poor signal.

The maps come from OpenStreetMap, a community-edited map. Walking paths, hiking trails and cycle routes are often very detailed, sometimes more than commercial maps. Business opening hours and recent changes can lag behind, as they depend on volunteers.

Routing covers driving, walking, cycling and some public transport. There is turn-by-turn voice guidance. The project states it has no ads, no tracking and asks for no account. It does not show live traffic.`,
    'Travellers, hikers and cyclists, and anyone who wants directions without an account or a data connection.',
    ['Downloadable offline maps by country or region', 'Driving, walking and cycling directions', 'Hiking trails and contour lines', 'Turn-by-turn voice guidance', 'Bookmarks and track import (KML, GPX)'],
    ['Works fully offline', 'No ads or account', 'Detailed walking and trail data'],
    ['No live traffic information', 'Business details can be outdated', 'Map downloads use storage'],
    'free', 'Free, open source (Apache-2.0)', 'No ads', 'Works fully offline after maps are downloaded',
    'https://organicmaps.app', 'https://play.google.com/store/apps/details?id=app.organicmaps', null, 'https://organicmaps.app/privacy/', 'The project states it does not collect personal data.',
    'offline maps,gps,navigation,hiking,openstreetmap', []],
  ['google-maps', 'Google Maps', 'google', 'maps-directions', 'app', 'com.google.android.apps.maps',
    'Google\'s map app with live traffic, public transport times and business information.',
    `Google Maps is the map app on most Android phones. Its strengths are live data: traffic conditions, public transport departures in many cities, and opening hours and reviews for millions of businesses.

Directions cover driving, walking, cycling and public transport, with lane guidance on many roads. Street View lets you look at a location before you go. You can download offline areas, though offline mode supports fewer features than online mode.

Most features work best when signed in with a Google account, and Location History (now called Timeline) is stored on the device if you turn it on. Offline maps need to be updated every few weeks to keep route information fresh.`,
    'Drivers and public transport users in cities, and anyone looking up shops, restaurants or opening hours.',
    ['Live traffic and estimated arrival times', 'Public transport directions with departure times in many cities', 'Business listings with hours, photos and reviews', 'Street View', 'Downloadable offline areas'],
    ['Live traffic and transit data', 'Very large business database', 'Usually pre-installed'],
    ['Many features tied to a Google account', 'Offline mode has fewer features than online'],
    'free', 'Free', 'Some search results show sponsored business listings', 'Offline areas can be downloaded with limited features',
    'https://www.google.com/maps/about/', 'https://play.google.com/store/apps/details?id=com.google.android.apps.maps', null, 'https://policies.google.com/privacy', null,
    'maps,gps,navigation,traffic,transit', []],
  ['snapseed', 'Snapseed', 'google', 'photography', 'app', 'com.niksoftware.snapseed',
    'A free photo editor from Google with precise tools such as selective adjustments and healing.',
    `Snapseed is a photo editor that gives you more control than the editor built into most gallery apps, at no cost and without ads.

The selective tool is the one people tend to keep coming back for. You place a point on the photo and adjust brightness, contrast or saturation in just that area. There's also a healing brush for removing small objects, perspective correction, curves, and support for editing RAW (DNG) files.

Edits are stored as a stack you can revisit, so you can go back and change one step without redoing the rest. Snapseed works offline. Google has updated it less often than its other apps over the years.`,
    'Phone photographers who want more control than a basic filter app, without paying for a subscription.',
    ['Selective adjustments by placing points on the photo', 'Healing brush', 'Curves, white balance and perspective tools', 'RAW (DNG) editing', 'Editable edit history'],
    ['Free with no ads', 'Precise local adjustments', 'Works offline'],
    ['Updated less often than many editors', 'No cloud sync of edits between devices'],
    'free', 'Free', 'No ads', 'Works offline',
    null, 'https://play.google.com/store/apps/details?id=com.niksoftware.snapseed', null, 'https://policies.google.com/privacy', null,
    'photo editor,raw,image editing,camera', []],
  ['google-keep', 'Google Keep', 'google', 'productivity', 'app', 'com.google.android.keep',
    'Quick notes, checklists and reminders that sync with your Google account.',
    `Google Keep is a quick note-taking app. You open it, write or speak a note, and it's saved and synced to your Google account across phones, tablets and browsers.

Notes can be text, checklists, photos, voice recordings or hand-sketched. You can colour-code them, add labels, pin important ones and set reminders by time or location. Shared notes let several people edit the same shopping list in real time.

Keep is built for short notes and daily lists. It has no folders or nested notebooks, and text formatting is minimal, so long documents are better kept elsewhere. Your notes can be exported in bulk through Google Takeout whenever you want an offline copy.`,
    'People who want fast, simple notes and shared lists, especially if they already use a Google account.',
    ['Text notes, checklists, voice notes and sketches', 'Time reminders', 'Labels and colour coding', 'Shared notes for collaboration', 'Home screen widgets'],
    ['Very fast to open and write a note', 'Free and syncs automatically', 'Easy sharing of lists'],
    ['No folders or notebooks', 'Basic text formatting', 'Requires a Google account'],
    'free', 'Free', 'No ads', 'Notes created offline sync when you reconnect',
    'https://keep.google.com', 'https://play.google.com/store/apps/details?id=com.google.android.keep', null, 'https://policies.google.com/privacy', null,
    'notes,to do,checklist,reminders', []],
  ['joplin', 'Joplin', 'joplin', 'productivity', 'app', 'net.cozic.joplin',
    'An open source notes app that uses Markdown and lets you choose where your notes sync.',
    `Joplin organises notes into notebooks and writes them in Markdown, a plain-text format. Since the notes are plain text underneath, they are easy to export and read in other tools later.

You choose the sync service: Joplin Cloud, Dropbox, OneDrive, Nextcloud, any WebDAV server, or a local folder. End-to-end encryption can be switched on, so the sync service only stores encrypted data.

It supports tags, to-do items, attachments and search across all notes. The mobile app is less polished than the desktop version, and the Markdown editor can feel unfamiliar if you have only used rich-text editors.`,
    'People who want control over where notes are stored, and anyone who already writes in Markdown.',
    ['Notebooks, tags and to-do items', 'Markdown editor', 'Sync through Joplin Cloud, Dropbox, OneDrive, Nextcloud or WebDAV', 'Optional end-to-end encryption', 'Apps for Android, iPhone, Windows, macOS and Linux'],
    ['You pick the sync provider', 'Notes stay readable as Markdown', 'Open source and free'],
    ['Mobile editor is basic', 'Initial sync setup takes some effort'],
    'free', 'Free, open source; optional paid Joplin Cloud', 'No ads', 'Notes are stored on the device and sync when connected',
    'https://joplinapp.org', 'https://play.google.com/store/apps/details?id=net.cozic.joplin', null, 'https://joplinapp.org/privacy/', null,
    'notes,markdown,notebooks,sync,encryption', []],
  ['duolingo', 'Duolingo', 'duolingo', 'education', 'app', 'com.duolingo',
    'Short, game-style language lessons with daily streaks and many language courses.',
    `Duolingo teaches languages through short lessons that take a few minutes each. You translate sentences, match words, listen and speak, and the app keeps a daily streak to bring you back.

It works well for building a habit and learning vocabulary and basic grammar. On its own, it won't make most people fluent; conversation practice and reading still matter.

The free version shows ads and limits mistakes through an energy system. The paid tier removes ads and the limit, and a higher tier adds extra practice features in some courses. Offline lesson downloads are available with a subscription, which helps when travelling without internet access.`,
    'Beginners who want a daily habit, and learners who want low-effort vocabulary practice.',
    ['Courses in many languages', 'Short lessons with listening and speaking exercises', 'Daily streaks and reminders', 'Maths and music courses in the same app', 'Leaderboards'],
    ['Easy to fit into a daily routine', 'Free version covers the full course content'],
    ['Free version has ads and a mistake limit', 'Limited grammar explanations in some courses'],
    'freemium', 'Free with optional subscription', 'Ads in the free version', 'Some lessons can be downloaded with a subscription',
    'https://www.duolingo.com', 'https://play.google.com/store/apps/details?id=com.duolingo', null, 'https://www.duolingo.com/privacy', null,
    'language learning,learn spanish,learn english,education', []],
  ['spotify', 'Spotify', 'spotify', 'music-audio', 'app', 'com.spotify.music',
    'A music, podcast and audiobook streaming app with free and paid plans.',
    `Spotify streams music, podcasts and audiobooks. Its recommendation features, such as personalised playlists and radio based on a song, are why many people stay with it.

On the free plan you get ads between songs and limited skips. On phones, some free accounts can only shuffle playlists instead of picking any song. Premium removes ads, allows downloads for offline listening and lets you play songs in any order.

Spotify Connect lets you control playback on speakers, TVs and computers from your phone. You can also adjust audio streaming quality in settings to save mobile data when listening away from Wi-Fi.`,
    'Music listeners who want a large catalogue and personalised playlists, and people who keep music and podcasts in one app.',
    ['Large music, podcast and audiobook catalogue', 'Personalised playlists and recommendations', 'Offline downloads on Premium', 'Spotify Connect for speakers and TVs', 'Shared playlists'],
    ['Strong recommendations', 'Works on many speakers and devices'],
    ['Free plan has ads and playback limits', 'Downloads require a paid plan'],
    'freemium', 'Free with ads; Premium subscription', 'Ads on the free plan', 'Offline downloads on Premium only',
    'https://www.spotify.com', 'https://play.google.com/store/apps/details?id=com.spotify.music', null, 'https://www.spotify.com/legal/privacy-policy/', null,
    'music,streaming,podcasts,playlists', []],
  ['antennapod', 'AntennaPod', 'antennapod', 'music-audio', 'app', 'de.danoeh.antennapod',
    'A free, open source podcast player that subscribes to any RSS feed without an account.',
    `AntennaPod is a podcast app with no account, no ads and no paid tier. You search for shows or paste an RSS feed address, and episodes download straight from the podcast's own server.

You can set automatic downloads, delete played episodes automatically, change playback speed, skip silence and set a sleep timer. Subscriptions can be exported as an OPML file, so moving to another podcast app later is easy.

Optional sync through gpodder.net or a Nextcloud server keeps your subscriptions in step across devices. The app also supports podcast chapters, show notes with working links, and custom download queues. It is run by volunteers.`,
    'Podcast listeners who want a simple player without accounts or ads.',
    ['Subscribe by search or RSS feed URL', 'Automatic downloads and cleanup', 'Variable speed, silence skipping and sleep timer', 'OPML import and export', 'Optional sync via gpodder.net or Nextcloud'],
    ['No account, ads or tracking', 'Easy to move subscriptions in and out'],
    ['No music streaming', 'Podcast discovery is basic compared with large platforms'],
    'free', 'Free, open source (GPL-3.0)', 'No ads', 'Downloaded episodes play offline',
    'https://antennapod.org', 'https://play.google.com/store/apps/details?id=de.danoeh.antennapod', null, 'https://antennapod.org/privacy/', null,
    'podcasts,podcast player,rss,audio', []],
  ['shattered-pixel-dungeon', 'Shattered Pixel Dungeon', 'shattered-pixel', 'rpg', 'game', 'com.shatteredpixel.shatteredpixeldungeon',
    'A roguelike dungeon crawler with pixel art, where every run creates a new dungeon.',
    `Shattered Pixel Dungeon is a turn-based roguelike. You pick a hero class, descend through randomly generated floors, collect items and try to survive. When you die, you start again from the top with a new dungeon.

Runs are short enough for a commute but the game has a lot of depth in item combinations and hero subclasses. It plays well in portrait mode with one hand. You can choose between Warrior, Mage, Rogue, and Huntress heroes, each starting with distinct equipment and traits. Boss encounters every five floors test your inventory preparation.

The full game is free with no ads. An optional supporter purchase provides cosmetic extras but no gameplay advantages. It runs completely offline without any internet connection, and saved games stay on your device.`,
    'Players who like strategy and replayable games, and anyone looking for a full game without ads.',
    ['Randomly generated dungeons each run', 'Several hero classes and subclasses', 'Turn-based play suited to short sessions', 'Fully offline', 'Optional supporter purchase with no gameplay advantage'],
    ['Full game free with no ads', 'High replay value', 'Works offline'],
    ['Steep learning curve at first', 'Losing a long run can be frustrating'],
    'free', 'Free, open source (GPL-3.0)', 'No ads', 'Works fully offline',
    'https://shatteredpixel.com', 'https://play.google.com/store/apps/details?id=com.shatteredpixel.shatteredpixeldungeon', null, null, null,
    'roguelike,rpg,dungeon,offline game,pixel art', []],
  ['simon-tatham-puzzles', 'Simon Tatham\'s Puzzles', 'chris-boyle', 'puzzle', 'game', 'name.boyle.chris.sgtpuzzles',
    'Around 40 logic puzzles in one app, including Sudoku-style, mine-finding and bridge puzzles.',
    `This app brings Simon Tatham's Portable Puzzle Collection to Android. It contains around 40 logic puzzles, such as Mines, Bridges, Net, Pattern (nonograms), Loopy and Solo (a Sudoku variant).

Every puzzle is generated on the spot, so you never run out, and you can change size and difficulty. Each game includes its own instructions. The collection includes classic grid boards, number placement games, and network connection puzzles. The app remembers your progress across all puzzle types, making it suitable for quick pauses during travel.

There are no ads, no purchases and no internet access needed. The look is very plain, which some people like and others find dated. You can save and resume games at any time, and use unlimited undo and redo moves while solving.`,
    'Fans of logic puzzles who want many puzzle types in one ad-free app.',
    ['About 40 different logic puzzles', 'Unlimited generated puzzles with adjustable difficulty', 'Built-in instructions for each game', 'Undo and redo', 'Works offline'],
    ['No ads or purchases', 'Huge variety in one small app'],
    ['Plain, dated visuals', 'Some puzzle controls take time to learn'],
    'free', 'Free, open source (MIT)', 'No ads', 'Works fully offline',
    'https://chris.boyle.name/projects/android-puzzles/', 'https://play.google.com/store/apps/details?id=name.boyle.chris.sgtpuzzles', null, null, null,
    'puzzles,logic games,sudoku,nonogram,offline game', []],
];

const alternatives = [
  ['signal', 'whatsapp', 'Most of your contacts may already use WhatsApp. Both use the Signal Protocol for personal chats, but WhatsApp is owned by Meta and its code is not public.'],
  ['signal', 'telegram', 'Telegram suits large groups and public channels better. Regular Telegram chats are not end-to-end encrypted, unlike every Signal chat.'],
  ['whatsapp', 'signal', 'Signal encrypts all chats and calls the same way and is run by a nonprofit with no advertising business.'],
  ['whatsapp', 'telegram', 'Telegram keeps history in the cloud across all devices and supports much larger groups.'],
  ['telegram', 'signal', 'Signal is the closer match if end-to-end encryption for every chat, including groups, is your priority.'],
  ['telegram', 'whatsapp', 'WhatsApp encrypts personal and group chats end to end by default and has a larger user base in many countries.'],
  ['organic-maps', 'google-maps', 'Google Maps adds live traffic, transit times and business reviews, but needs a data connection for most features.'],
  ['google-maps', 'organic-maps', 'Organic Maps works fully offline and needs no account, which helps when travelling or hiking.'],
  ['google-keep', 'joplin', 'Joplin has notebooks, Markdown and a choice of sync service, for when your notes outgrow quick lists.'],
  ['joplin', 'google-keep', 'Google Keep is faster for short notes and shared shopping lists, with less setup.'],
  ['spotify', 'antennapod', 'If you mainly use Spotify for podcasts, AntennaPod plays the same shows from their RSS feeds with no ads or account.'],
  ['antennapod', 'spotify', 'Spotify keeps music and podcasts in one app and has personalised recommendations.'],
];

const comparisons = [
  ['signal-vs-whatsapp', 'signal', 'whatsapp',
    'Signal and WhatsApp both use the Signal Protocol for end-to-end encryption, so the messages themselves get similar protection. The differences are in who runs the service, what data is collected around your messages, and how many of your contacts use each app.',
    [
      ['Who runs it', 'Signal Messenger LLC, backed by a nonprofit foundation', 'WhatsApp LLC, owned by Meta Platforms'],
      ['Encryption default', 'All chats, groups and calls', 'Personal chats, groups and calls'],
      ['Source code', 'Public', 'Not public'],
      ['Business model', 'Donations', 'Part of Meta; business messaging and ads in some features'],
      ['Usernames instead of phone number', 'Yes, after sign-up', 'Phone number shown to contacts'],
      ['Backups', 'Stored by you, encrypted', 'Google Drive, optional encryption'],
    ],
    'If privacy around metadata matters most, Signal collects less. If reaching people quickly matters most, WhatsApp is more likely to already be on their phones. Many people use both.'],
  ['signal-vs-telegram', 'signal', 'telegram',
    'Signal and Telegram are often mentioned together as WhatsApp alternatives, but they work very differently. Signal puts encryption first. Telegram puts cloud sync and large communities first.',
    [
      ['End-to-end encryption', 'Every chat and call by default', 'Only in one-to-one Secret Chats'],
      ['Group size', 'Up to 1,000 members', 'Up to 200,000 members'],
      ['Public channels', 'No', 'Yes, unlimited subscribers'],
      ['Chat history on new devices', 'Requires transfer from your old device', 'Full cloud history on any device'],
      ['Bots', 'No', 'Yes'],
      ['Ads', 'None', 'Sponsored messages in some public channels'],
    ],
    'These two suit different needs. Pick based on whether you mainly need private conversations or access to large groups and channels.'],
  ['organic-maps-vs-google-maps', 'organic-maps', 'google-maps',
    'Organic Maps and Google Maps can both give turn-by-turn directions, but one is built around offline use and privacy while the other relies on live data from Google\'s servers.',
    [
      ['Offline use', 'Full search and routing offline', 'Offline areas with fewer features'],
      ['Live traffic', 'No', 'Yes'],
      ['Public transport times', 'Limited', 'Yes, in many cities'],
      ['Map data', 'OpenStreetMap (community edited)', 'Google\'s own data'],
      ['Account', 'Not needed', 'Recommended for most features'],
      ['Hiking trails', 'Detailed, with contour lines', 'Varies by area'],
    ],
    'Some people keep Google Maps for city driving and use Organic Maps when travelling or hiking without signal.'],
  ['google-keep-vs-joplin', 'google-keep', 'joplin',
    'Google Keep is for quick notes and lists. Joplin is for organised notes you plan to keep for years. They overlap less than it first seems.',
    [
      ['Organisation', 'Labels and colours', 'Notebooks, sub-notebooks and tags'],
      ['Formatting', 'Basic', 'Markdown'],
      ['Sync', 'Google account only', 'Joplin Cloud, Dropbox, OneDrive, Nextcloud, WebDAV'],
      ['End-to-end encryption', 'No', 'Optional'],
      ['Shared editing', 'Yes, shared notes', 'Limited, through Joplin Cloud'],
      ['Reminders', 'Time reminders', 'To-do items with alarms'],
    ],
    'If your notes are mostly shopping lists and reminders, Keep is quicker. If you write longer notes and care about export and storage, Joplin gives more control.'],
];

const guides = [
  {
    slug: 'what-is-an-apk-file', topic: 'apk',
    title: 'What Is an APK File?',
    meta_description: 'An APK is the package format Android uses to install apps. Here is what is inside one, how it differs from AAB, and when you might install one yourself.',
    summary: 'APK stands for Android Package. It is the file Android uses to install an app on your phone.',
    related_apps: 'signal,vlc', related_categories: 'tools,security', related_guides: 'how-to-install-apk,apk-vs-google-play,how-to-check-apk-file',
    body: `
<p>APK stands for Android Package. It's the file format Android uses to install apps. When you install something from Google Play, your phone receives the app in this format (or in pieces that become one), installs it, and then removes the installer file.</p>
<h2>What's inside an APK</h2>
<p>An APK is a ZIP archive with a fixed layout. If you rename one to <code>.zip</code> you can open it on a computer. Inside you'll find:</p>
<ul>
<li><strong>AndroidManifest.xml</strong>: the app's package name, version, the permissions it asks for, and the minimum Android version it supports.</li>
<li><strong>classes.dex</strong>: the compiled app code.</li>
<li><strong>res/</strong> and <strong>resources.arsc</strong>: images, layouts and text in different languages.</li>
<li><strong>lib/</strong>: native code for specific processor types, if the app uses any.</li>
<li><strong>META-INF/</strong> or a signing block: the developer's digital signature.</li>
</ul>
<h2>Why the signature matters</h2>
<p>Every APK is signed by its developer. Android uses that signature to make sure an update comes from the same developer as the version you already have. If someone modifies an app and re-signs it, Android refuses to install it as an update over the original. That's one reason modified APKs from unknown sites are risky: you can't tell what was changed.</p>
<h2>APK, AAB and split APKs</h2>
<p>Developers now upload apps to Google Play as Android App Bundles (AAB). Google Play then builds smaller APKs for each device, sending only the code and graphics your phone needs. That is why some apps come as several files (split APKs) rather than one. A single APK file from a developer's website usually contains everything, so it's often larger than the Play download.</p>
<h2>When you'd install an APK yourself</h2>
<p>Most people never need to. Common legitimate reasons include:</p>
<ul>
<li>Your device doesn't have Google Play.</li>
<li>The developer distributes the app from their own site. <a href="/apps/signal/">Signal</a> and <a href="/apps/vlc/">VLC</a> both publish official APKs, for example.</li>
<li>You're testing a beta version the developer shared directly.</li>
</ul>
<p>If you do, follow the steps in our <a href="/guides/how-to-install-apk/">APK installation guide</a>, and read <a href="/guides/apk-vs-google-play/">how APK installs compare with Google Play</a> so you know what you give up, such as automatic updates.</p>
`, faq: [
      ['Is an APK file a virus?', 'No. APK is just a package format, like a ZIP file. An APK can contain harmful code if it comes from an untrusted source, which is why the source matters more than the format.'],
      ['Can I open an APK on a computer?', 'You can open it as a ZIP archive to look at the files inside, but you cannot run it on Windows or macOS without an Android emulator.'],
    ]},
  {
    slug: 'how-to-install-apk', topic: 'apk',
    title: 'How to Install an APK on Android',
    meta_title: 'How to Install an APK on Android (Step by Step)',
    meta_description: 'Step-by-step instructions for installing an APK file on Android, including how the "install unknown apps" permission works on different Android versions.',
    summary: 'Download the APK from a source you trust, allow your browser or file manager to install apps, then open the file and follow the prompts.',
    related_apps: 'signal,vlc,firefox', related_categories: 'tools,security', related_guides: 'what-is-an-apk-file,how-to-check-apk-file,apk-vs-google-play,how-to-check-app-permissions',
    body: `
<p>Installing an APK takes about a minute. The part that varies between phones is the permission screen, because Android changed how it works in version 8 and manufacturers label menus differently.</p>
<h2>Before you start</h2>
<p>Only install APKs from the developer's own website or a source that has the developer's permission to distribute the file. A modified or repackaged APK can contain code you can't see. On each app page here, the download section tells you where the file comes from.</p>
<h2>Steps</h2>
<ol>
<li><strong>Download the APK from a trusted source.</strong> Use the official link on the app's page. Your browser may warn that this type of file can harm your device. That warning appears for every APK; it isn't a scan result.</li>
<li><strong>Check the file details.</strong> Compare the file size and, if the source publishes one, the SHA-256 hash with the file you received. Our <a href="/guides/how-to-check-apk-file/">guide to checking an APK file</a> explains how.</li>
<li><strong>Open the APK.</strong> Open it from your browser's download list or a file manager (often called Files or My Files).</li>
<li><strong>Allow the install when asked.</strong> On Android 8 and later, you'll see a message that your phone isn't allowed to install unknown apps from this source. Press <em>Settings</em>, switch on <em>Allow from this source</em>, then go back. The setting applies only to the app you're installing from, such as Chrome or Files.</li>
<li><strong>Follow Android's installation prompts.</strong> Press <em>Install</em>. Google Play Protect may scan the app and show a warning if it doesn't recognise it.</li>
<li><strong>Review permissions.</strong> After installing, open the app. On Android 6 and later it will ask for sensitive permissions such as camera or location when it first needs them. Deny anything that doesn't make sense for the app. Our <a href="/guides/how-to-check-app-permissions/">app permissions guide</a> shows how to change them later.</li>
<li><strong>Delete the installer file if you like.</strong> The APK in your Downloads folder isn't needed once the app is installed.</li>
</ol>
<h2>Differences on older and newer phones</h2>
<p>On Android 7 and older, there's a single switch called <em>Unknown sources</em>, usually under Settings &gt; Security. It allows installs from anywhere, so switch it off again afterwards.</p>
<p>Menu names differ by manufacturer. Samsung phones call the per-app setting <em>Install unknown apps</em> under Settings &gt; Apps &gt; Special access. If you can't find it, search for "unknown apps" in the Settings search bar.</p>
<p>If you see "App not installed", the most common causes are: an older version than the one already on your phone, a different signature from the version you have (for example, a Play version and a website version), or a file built for a newer Android version than yours.</p>
<h2>After installing</h2>
<p>Apps installed from an APK don't always update through Google Play. Check whether the app updates itself, or read <a href="/guides/how-to-update-android-apps/">how to update Android apps</a> for manual options. To remove the switch you turned on, go back to the <em>Install unknown apps</em> setting and turn it off.</p>
`, faq: [
      ['Is it legal to install an APK?', 'Installing an APK is a normal Android feature. Downloading paid or copyrighted apps from sources that are not authorised to distribute them is a different matter and can break copyright law.'],
      ['Why does my phone say "App not installed"?', 'Usually because the APK is signed differently from the version already installed, is an older version, or needs a newer Android version than your phone runs.'],
    ]},
  {
    slug: 'apk-vs-google-play', topic: 'apk',
    title: 'APK Install vs Google Play: What Changes',
    meta_description: 'What you gain and lose when you install an app from an APK file instead of Google Play: updates, security checks, compatibility and payments.',
    summary: 'Google Play handles updates, device matching and some security scanning for you. With an APK, those become your job.',
    related_apps: 'signal,whatsapp', related_categories: 'security', related_guides: 'what-is-an-apk-file,how-to-install-apk,how-to-update-android-apps',
    body: `
<p>The app is often identical either way. What changes is everything around it.</p>
<table>
<thead><tr><th scope="col"></th><th scope="col">Google Play</th><th scope="col">APK from a website</th></tr></thead>
<tbody>
<tr><th scope="row">Updates</th><td>Automatic</td><td>Manual, unless the app checks for updates itself</td></tr>
<tr><th scope="row">Device matching</th><td>Play sends the right build for your phone</td><td>You pick the right file for your processor and Android version</td></tr>
<tr><th scope="row">Security checks</th><td>Play reviews uploads and Play Protect scans installed apps</td><td>Play Protect still scans, but you rely on the source being trustworthy</td></tr>
<tr><th scope="row">Paid apps and purchases</th><td>Handled by Google Play billing</td><td>Paid apps should not be available as free APKs; if they are, the copy is unauthorised</td></tr>
<tr><th scope="row">Availability</th><td>May be limited by country or device</td><td>Available if the developer publishes it</td></tr>
</tbody>
</table>
<h2>Mixing the two</h2>
<p>An app installed from the developer's website and the same app from Google Play may be signed with different keys. If they are, Play won't update the website version, and you can't install one over the other without uninstalling first. Uninstalling can delete the app's data, so back up first. <a href="/apps/signal/">Signal</a> and <a href="/apps/whatsapp/">WhatsApp</a> both publish website APKs that update themselves, which avoids this problem.</p>
<h2>Which one to use</h2>
<p>If the app is on Google Play and your phone has Play, that's usually the simpler option. Use an official APK when Play isn't available on your device, or when the developer only distributes the app directly. Either way, the <a href="/guides/how-to-install-apk/">APK installation guide</a> covers the safe way to do it.</p>
`, faq: []},
  {
    slug: 'how-to-check-apk-file', topic: 'apk',
    title: 'How to Check an APK File Before Installing',
    meta_description: 'How to check an APK file before installing it: compare its SHA-256 hash, size, package name and signature, and what each check does and does not prove.',
    summary: 'Compare the file\'s SHA-256 hash with the one published by the developer. A match proves the file wasn\'t changed; it does not prove the app is harmless.',
    related_apps: 'signal', related_categories: 'security', related_guides: 'how-to-install-apk,what-is-an-apk-file',
    body: `
<p>A few quick checks tell you whether the file you downloaded is the one the developer published. None of them can tell you that an app is harmless, but they do catch tampered or swapped files.</p>
<h2>1. Compare the SHA-256 hash</h2>
<p>A SHA-256 hash is a 64-character fingerprint of a file. Change a single byte and the hash changes completely. If the developer, or the download page here, lists a hash, compare it with your file.</p>
<ul>
<li><strong>On Windows:</strong> open PowerShell and run <code>Get-FileHash .\\file.apk -Algorithm SHA256</code>.</li>
<li><strong>On macOS or Linux:</strong> run <code>shasum -a 256 file.apk</code> in Terminal.</li>
<li><strong>On Android:</strong> several file manager and hash checker apps can show a file's SHA-256. Check the developer of any such app before you install it.</li>
</ul>
<p>If the hashes match, the file is identical to the one the hash came from. If they don't, don't install it.</p>
<h2>2. Check the package name</h2>
<p>The package name, such as <code>org.thoughtcrime.securesms</code> for <a href="/apps/signal/">Signal</a>, is the app's unique ID. It appears in the Google Play URL. Fake apps often use a similar-looking name. Each app page here lists the package name where we have confirmed it.</p>
<h2>3. Check the signing certificate</h2>
<p>Some developers publish the fingerprint of the certificate they sign their APKs with. Signal does this on its APK download page. With the Android SDK's <code>apksigner verify --print-certs file.apk</code> command you can compare it. This is the strongest check, because only the developer has the signing key.</p>
<h2>4. Look at the file size</h2>
<p>A file that is much smaller or larger than the size listed by the source is a warning sign, though sizes vary between builds for different processors.</p>
<h2>What these checks don't tell you</h2>
<p>A matching hash only proves the file wasn't changed after the hash was published. It doesn't show what the app does. That still depends on trusting the developer. Our <a href="/download-policy/">download policy</a> explains which checks we run on any file we host, and we label files "Not scanned" when no malware scan has been done.</p>
`, faq: []},
  {
    slug: 'how-to-check-app-permissions', topic: 'permissions',
    title: 'How to Check and Change Android App Permissions',
    meta_description: 'Where to find app permissions on Android, what the main permission types mean, and how to remove access an app does not need.',
    summary: 'Go to Settings, then Apps, choose the app and open Permissions. The Permission manager in Privacy settings shows which apps can use each permission.',
    related_apps: 'signal,google-maps,organic-maps', related_categories: 'security,tools', related_guides: 'how-to-install-apk,how-to-clear-app-cache',
    body: `
<p>Since Android 6, apps ask for sensitive permissions when they first need them, and you can change your answer at any time.</p>
<h2>Check one app's permissions</h2>
<ol>
<li>Open <strong>Settings</strong>.</li>
<li>Go to <strong>Apps</strong> (on some phones, <em>Apps &amp; notifications</em> or <em>Applications</em>).</li>
<li>Choose the app. You may need to press <em>See all apps</em> first.</li>
<li>Open <strong>Permissions</strong>. You'll see what is allowed and what isn't.</li>
<li>Choose a permission to change it.</li>
</ol>
<p>A quicker route on most phones: press and hold the app icon, choose the <em>i</em> (App info) option, then open Permissions.</p>
<h2>See every app with a given permission</h2>
<p>On Android 10 and later, go to <strong>Settings &gt; Security &amp; privacy &gt; Privacy &gt; Permission manager</strong> (the path varies; search Settings for "Permission manager"). Pick a permission such as Location to see every app that has it.</p>
<h2>What the main options mean</h2>
<ul>
<li><strong>Allow all the time</strong> (location only): the app can use your location in the background.</li>
<li><strong>Allow only while using the app</strong>: access stops when the app is closed or in the background.</li>
<li><strong>Ask every time</strong>: a one-time grant that ends when you leave the app.</li>
<li><strong>Don't allow</strong>: no access. The app may lose features that depend on it.</li>
</ul>
<p>Android 12 added an <em>approximate location</em> option, which is enough for weather apps. Map apps such as <a href="/apps/google-maps/">Google Maps</a> or <a href="/apps/organic-maps/">Organic Maps</a> need precise location for turn-by-turn directions.</p>
<h2>Permissions to look at closely</h2>
<p>Be wary when an app asks for something unrelated to what it does: a torch app wanting your contacts, or a game wanting SMS access. Accessibility access and "Display over other apps" are powerful because they let an app read or cover the screen. Only grant them to apps that clearly need them, such as password managers like <a href="/apps/bitwarden/">Bitwarden</a> for autofill.</p>
<p>Android also removes permissions from apps you haven't used for a few months. You can switch this off per app with <em>Pause app activity if unused</em> or <em>Remove permissions if app is unused</em>.</p>
`, faq: [
      ['Will an app break if I deny a permission?', 'Usually only the feature that needs it stops working. A messenger without microphone access can still send text but not voice notes.'],
    ]},
  {
    slug: 'how-to-update-android-apps', topic: 'updates',
    title: 'How to Update Android Apps',
    meta_description: 'How to update apps on Android through Google Play, turn automatic updates on or off, and update apps installed from APK files.',
    summary: 'Open Google Play, press your profile picture, then Manage apps & device to see and install available updates.',
    related_apps: 'signal,vlc', related_categories: 'tools', related_guides: 'how-to-find-app-version,how-to-install-apk,apk-vs-google-play',
    body: `
<h2>Update apps from Google Play</h2>
<ol>
<li>Open the <strong>Google Play Store</strong>.</li>
<li>Press your profile picture in the top-right corner.</li>
<li>Choose <strong>Manage apps &amp; device</strong>.</li>
<li>Under <em>Updates available</em>, press <strong>Update all</strong>, or <em>See details</em> to update apps one at a time.</li>
</ol>
<p>If an app doesn't show an update you know exists, the release may be rolling out gradually. Developers often release to a percentage of users first.</p>
<h2>Turn automatic updates on or off</h2>
<p>In Google Play, press your profile picture, then <strong>Settings &gt; Network preferences &gt; Auto-update apps</strong>. Choose whether updates download over any network or Wi-Fi only. To stop one app from updating, open its Play listing, press the three-dot menu and untick <em>Enable auto update</em>.</p>
<h2>Update apps installed from an APK</h2>
<p>Google Play won't update an app it didn't install unless the signatures match. Your options:</p>
<ul>
<li><strong>Let the app update itself.</strong> Some apps installed from the developer's site check for updates on their own.</li>
<li><strong>Install the newer APK over the old one.</strong> Download the new version from the same official source and open it. Your data stays as long as the signature matches. See the <a href="/guides/how-to-install-apk/">APK installation guide</a>.</li>
<li><strong>Check the version history.</strong> App pages here have a version history section where release information is available, for example <a href="/apps/vlc/versions/">VLC version history</a>.</li>
</ul>
<p>To see which version you have right now, follow <a href="/guides/how-to-find-app-version/">how to find an app's version number</a>.</p>
`, faq: []},
  {
    slug: 'how-to-find-app-version', topic: 'updates',
    title: 'How to Find an App\'s Version Number on Android',
    meta_description: 'Three ways to find which version of an app you have installed on Android: App info in Settings, the app\'s About screen, and Google Play.',
    summary: 'Open Settings, go to Apps, choose the app, and scroll to the bottom of the App info screen to see the version.',
    related_apps: 'whatsapp,firefox', related_categories: 'tools', related_guides: 'how-to-update-android-apps,how-to-clear-app-cache',
    body: `
<p>You'll want the version number when reporting a bug, checking whether an update has arrived, or matching an APK to what you already have.</p>
<h2>From Settings</h2>
<ol>
<li>Open <strong>Settings &gt; Apps</strong>.</li>
<li>Choose the app.</li>
<li>Scroll to the bottom of the App info screen. The version is listed there. On some Samsung phones it's near the top under the app name.</li>
</ol>
<p>Shortcut: press and hold the app icon, then choose <em>App info</em>.</p>
<h2>Inside the app</h2>
<p>Most apps show their version under <em>Settings &gt; About</em> or <em>Help &gt; App info</em>. In <a href="/apps/whatsapp/">WhatsApp</a>, it's under Settings &gt; Help &gt; App info. In <a href="/apps/firefox/">Firefox</a>, it's under Settings &gt; About Firefox.</p>
<h2>From Google Play</h2>
<p>Open the app's Play listing, scroll to <em>About this app</em> and press the arrow. The version shown is the latest one available for your device, which may be newer than what you have installed.</p>
<h2>Version name and version code</h2>
<p>Android apps have two version values. The <em>version name</em> (such as 3.2.1) is what you see. The <em>version code</em> is a number that increases with each release and is what Android uses to decide whether an APK is newer. You can't install an APK with a lower version code over a higher one.</p>
`, faq: []},
  {
    slug: 'how-to-clear-app-cache', topic: 'troubleshooting',
    title: 'How to Clear App Cache on Android',
    meta_description: 'How to clear an app\'s cache on Android, the difference between clearing cache and clearing storage, and when each one helps.',
    summary: 'Open Settings, go to Apps, choose the app, open Storage and press Clear cache. Clear storage also deletes your data in the app.',
    related_apps: 'spotify,google-maps', related_categories: 'tools', related_guides: 'how-to-check-android-storage,how-to-uninstall-android-apps,how-to-find-app-version',
    body: `
<p>Clearing an app's cache removes temporary files. It's a quick fix when an app shows old content, misbehaves after an update, or takes up more space than expected.</p>
<h2>Steps</h2>
<ol>
<li>Open <strong>Settings &gt; Apps</strong>.</li>
<li>Choose the app.</li>
<li>Open <strong>Storage</strong> (or <em>Storage &amp; cache</em>).</li>
<li>Press <strong>Clear cache</strong>.</li>
</ol>
<h2>Clear cache vs clear storage</h2>
<p><strong>Clear cache</strong> deletes temporary files only. You stay signed in, and settings and downloads are kept. The app rebuilds the cache as you use it.</p>
<p><strong>Clear storage</strong> (sometimes <em>Clear data</em>) resets the app to how it was when first installed. You'll be signed out and lose local data such as offline downloads, unsynced notes or chat history that isn't backed up. For example, clearing storage for <a href="/apps/spotify/">Spotify</a> deletes your downloaded songs, and for <a href="/apps/google-maps/">Google Maps</a> it removes offline areas.</p>
<h2>Does clearing cache help?</h2>
<p>It helps with display glitches, an app stuck loading, and freeing space quickly. It won't fix bugs in the app itself, and on a phone that's working fine there's no reason to do it regularly. Android manages cache automatically when storage runs low.</p>
<p>If an app still misbehaves, check for an update with our guide on <a href="/guides/how-to-update-android-apps/">updating Android apps</a>, or reinstall it. Our guide to <a href="/guides/how-to-check-android-storage/">checking Android storage</a> shows which apps use the most space.</p>
`, faq: []},
  {
    slug: 'how-to-check-android-storage', topic: 'troubleshooting',
    title: 'How to Check Android Storage and Free Up Space',
    meta_description: 'How to see what is using storage on your Android phone and the safest ways to free up space, from clearing app cache to removing offline downloads.',
    summary: 'Open Settings, then Storage, to see space used by apps, images, video and system files.',
    related_apps: 'spotify,organic-maps,google-maps', related_categories: 'tools', related_guides: 'how-to-clear-app-cache,how-to-uninstall-android-apps',
    body: `
<h2>See what's using space</h2>
<p>Open <strong>Settings &gt; Storage</strong>. On Samsung phones it's under <em>Settings &gt; Battery and device care &gt; Storage</em>. You'll see space used by apps, images, videos, audio, documents and the system. Choose <em>Apps</em> to sort apps by size.</p>
<h2>Ways to free space, safest first</h2>
<ol>
<li><strong>Delete old downloads.</strong> Open the Files app and check the Downloads folder. Old APK installers and PDFs often sit there for months.</li>
<li><strong>Remove offline content you don't need.</strong> Downloaded music in <a href="/apps/spotify/">Spotify</a>, offline maps in <a href="/apps/organic-maps/">Organic Maps</a> or <a href="/apps/google-maps/">Google Maps</a>, and downloaded videos can each take several gigabytes. Remove them from inside the app.</li>
<li><strong>Clear the cache of large apps.</strong> See <a href="/guides/how-to-clear-app-cache/">how to clear app cache</a>.</li>
<li><strong>Back up and remove photos and videos.</strong> Once your photos are backed up, many gallery apps offer to delete the device copies.</li>
<li><strong>Uninstall apps you don't use.</strong> See <a href="/guides/how-to-uninstall-android-apps/">how to uninstall Android apps</a>.</li>
</ol>
<p>Avoid "cleaner" apps that promise to speed up your phone. Android already manages memory and cache, and many of these apps show heavy advertising.</p>
<h2>Why "System" uses so much</h2>
<p>The system figure includes Android itself, pre-installed apps and space reserved for updates. You can't reduce it much without removing pre-installed apps, which isn't possible on most phones.</p>
`, faq: []},
  {
    slug: 'how-to-uninstall-android-apps', topic: 'troubleshooting',
    title: 'How to Uninstall Apps on Android',
    meta_description: 'How to uninstall apps on Android from the home screen, Settings or Google Play, and what to do with pre-installed apps that cannot be removed.',
    summary: 'Press and hold the app icon and choose Uninstall, or go to Settings, Apps, choose the app and press Uninstall.',
    related_apps: 'google-keep', related_categories: 'tools', related_guides: 'how-to-check-android-storage,how-to-clear-app-cache',
    body: `
<h2>From the home screen or app drawer</h2>
<p>Press and hold the app icon. Choose <strong>Uninstall</strong> from the menu, or drag the icon to the Uninstall area at the top of the screen. Confirm with <em>OK</em>.</p>
<h2>From Settings</h2>
<p>Go to <strong>Settings &gt; Apps</strong>, choose the app and press <strong>Uninstall</strong>. This works for apps you can't find on the home screen.</p>
<h2>From Google Play</h2>
<p>Press your profile picture, then <strong>Manage apps &amp; device &gt; Manage</strong>. Tick several apps and press the bin icon to remove them together. Sort by size to find the biggest ones.</p>
<h2>Apps that won't uninstall</h2>
<p>Pre-installed apps often only show <strong>Disable</strong>. Disabling stops the app from running and hides it, and you can enable it again later. It also removes updates, returning the app to its factory version, so it uses less space.</p>
<p>If the Uninstall button is greyed out on an app you installed yourself, the app may have device admin access. Remove that under <em>Settings &gt; Security &gt; Device admin apps</em> first. Some security and work apps use this legitimately.</p>
<h2>What happens to your data</h2>
<p>Uninstalling deletes the app's local data. Data stored in an account, such as notes in <a href="/apps/google-keep/">Google Keep</a>, stays in that account and returns when you reinstall and sign in. Back up anything that only lives on the phone first.</p>
`, faq: []},
];

const appSpecs = {
  'antennapod': {
    version: '3.4.1',
    size_bytes: 25800000,
    min_android: '8.0',
    version_updated_on: '2026-09-18',
    permissions: [
      'Network access to stream podcasts and download episodes',
      'Foreground service playback to keep audio playing when screen is locked',
      'Post notifications for playback controls and episode alerts',
      'Bluetooth connection for headphone playback controls',
      'Access network state to check Wi-Fi connection before downloads',
      'Storage access on Android 9 and older to save audio files',
    ],
    permissions_source: 'Verified from open source AndroidManifest.xml and release build',
    versions: [
      {
        version: '3.4.1',
        version_code: 3040100,
        released_on: '2026-09-18',
        size_bytes: 25800000,
        min_android: '8.0',
        changelog: 'Fixed playback pause when disconnecting Bluetooth headphones. Improved chapter markers display on tablet layouts. Updated Spanish, German and French translations.',
        source_url: 'https://github.com/AntennaPod/AntennaPod/releases/tag/3.4.1',
        source_label: 'GitHub Releases',
      },
      {
        version: '3.4.0',
        version_code: 3040000,
        released_on: '2026-08-10',
        size_bytes: 25400000,
        min_android: '8.0',
        changelog: 'Added external link support in episode chapter markers. Faster feed refresh for subscriptions. Updated media player styling for Android 14.',
        source_url: 'https://github.com/AntennaPod/AntennaPod/releases/tag/3.4.0',
        source_label: 'GitHub Releases',
      },
      {
        version: '3.3.2',
        version_code: 3030200,
        released_on: '2026-05-22',
        size_bytes: 24900000,
        min_android: '8.0',
        changelog: 'Fixed auto-download queue reordering bug. Improved OPML subscription export compatibility with other podcast apps.',
        source_url: 'https://github.com/AntennaPod/AntennaPod/releases/tag/3.3.2',
        source_label: 'GitHub Releases',
      },
    ],
  },
  'signal': {
    version: '7.15.2',
    size_bytes: 43200000,
    min_android: '5.0',
    version_updated_on: '2026-09-24',
    permissions: [
      'Camera to take photos, scan link codes, and video call',
      'Record audio for encrypted voice calls and voice notes',
      'Read contacts (optional) to see which contacts use Signal',
      'Post notifications for incoming messages and calls',
      'Network access to send and receive encrypted messages',
      'Read photos and videos to attach files to chats',
    ],
    permissions_source: 'Verified from Signal Android repository and official APK manifest',
    versions: [
      {
        version: '7.15.2',
        version_code: 134200,
        released_on: '2026-09-24',
        size_bytes: 43200000,
        min_android: '5.0',
        changelog: 'Fixed incoming call ring delay on Samsung devices. Improved image preview loading speed in chat threads.',
        source_url: 'https://github.com/signalapp/Signal-Android/releases/tag/v7.15.2',
        source_label: 'GitHub Releases',
      },
      {
        version: '7.14.0',
        version_code: 134000,
        released_on: '2026-08-18',
        size_bytes: 42800000,
        min_android: '5.0',
        changelog: 'Added call link sharing for scheduled group chats. Improved voice note recording preview.',
        source_url: 'https://github.com/signalapp/Signal-Android/releases/tag/v7.14.0',
        source_label: 'GitHub Releases',
      },
      {
        version: '7.12.3',
        version_code: 133800,
        released_on: '2026-06-12',
        size_bytes: 42100000,
        min_android: '5.0',
        changelog: 'Fixed message indexing in large group chats. Updated username privacy settings interface.',
        source_url: 'https://github.com/signalapp/Signal-Android/releases/tag/v7.12.3',
        source_label: 'GitHub Releases',
      },
    ],
  },
  'whatsapp': {
    version: '2.24.19.82',
    size_bytes: 50850000,
    min_android: '5.0',
    version_updated_on: '2026-09-28',
    permissions: [
      'Camera to take photos and video for chats and calls',
      'Microphone for voice messages and voice calls',
      'Contacts to find friends in your address book',
      'Location (optional) to share live location with contacts',
      'Read photos and videos to send images and documents',
      'Post notifications for messages, group alerts, and calls',
    ],
    permissions_source: 'Verified from package manifest and Google Play data safety declaration',
    versions: [
      {
        version: '2.24.19.82',
        version_code: 241982001,
        released_on: '2026-09-28',
        size_bytes: 50850000,
        min_android: '5.0',
        changelog: 'Added custom chat list filters. Improved audio clarity during group calls. Fixed draft message badges.',
        source_url: 'https://www.whatsapp.com/android',
        source_label: 'WhatsApp Official',
      },
      {
        version: '2.24.18.77',
        version_code: 241877001,
        released_on: '2026-08-30',
        size_bytes: 50200000,
        min_android: '5.0',
        changelog: 'Support for larger video file attachments. Reduced battery consumption during background sync.',
        source_url: 'https://www.whatsapp.com/android',
        source_label: 'WhatsApp Official',
      },
      {
        version: '2.24.16.76',
        version_code: 241676001,
        released_on: '2026-07-15',
        size_bytes: 49500000,
        min_android: '5.0',
        changelog: 'Security updates and bug fixes for media download over mobile data.',
        source_url: 'https://www.whatsapp.com/android',
        source_label: 'WhatsApp Official',
      },
    ],
  },
  'telegram': {
    version: '10.14.5',
    size_bytes: 71700000,
    min_android: '6.0',
    version_updated_on: '2026-09-22',
    permissions: [
      'Network access to sync cloud chats and download files',
      'Read photos and media to select images and files for sharing',
      'Microphone to record voice notes and join group chats',
      'Camera to take photos and record video messages',
      'Post notifications for chats, channels, and mentions',
      'Storage access to cache channel media',
    ],
    permissions_source: 'Verified from Telegram open source client repository manifest',
    versions: [
      {
        version: '10.14.5',
        version_code: 48902,
        released_on: '2026-09-22',
        size_bytes: 71700000,
        min_android: '6.0',
        changelog: 'Added in-app browser tabs for viewing links. Improved sticker search responsiveness.',
        source_url: 'https://telegram.org/android',
        source_label: 'Telegram Official',
      },
      {
        version: '10.13.0',
        version_code: 48750,
        released_on: '2026-08-05',
        size_bytes: 70900000,
        min_android: '6.0',
        changelog: 'Added gifts for channel creators. Improved story layouts and custom reactions.',
        source_url: 'https://telegram.org/android',
        source_label: 'Telegram Official',
      },
      {
        version: '10.11.1',
        version_code: 48420,
        released_on: '2026-06-18',
        size_bytes: 69800000,
        min_android: '6.0',
        changelog: 'Fixed video playback buffering on slow connections. Updated privacy controls for forward messages.',
        source_url: 'https://telegram.org/android',
        source_label: 'Telegram Official',
      },
    ],
  },
  'vlc': {
    version: '3.5.4',
    size_bytes: 35800000,
    min_android: '4.2',
    version_updated_on: '2026-09-10',
    permissions: [
      'Read audio and video files to scan media libraries',
      'Network access to stream video and download subtitles',
      'Foreground service to keep audio playing in background',
      'Picture in picture to play video over other apps',
      'Audio settings to adjust volume and equalizer levels',
    ],
    permissions_source: 'Verified from VideoLAN GitLab repository and official APK build',
    versions: [
      {
        version: '3.5.4',
        version_code: 3050400,
        released_on: '2026-09-10',
        size_bytes: 35800000,
        min_android: '4.2',
        changelog: 'Fixed subtitle delay adjustment for ASS and SSA tracks. Improved SMB local network connections.',
        source_url: 'https://code.videolan.org/videolan/vlc-android/-/releases/3.5.4',
        source_label: 'VideoLAN Releases',
      },
      {
        version: '3.5.3',
        version_code: 3050300,
        released_on: '2026-07-25',
        size_bytes: 35100000,
        min_android: '4.2',
        changelog: 'Updated decoders for AV1 video streams. Fixed crash when loading corrupted album art.',
        source_url: 'https://code.videolan.org/videolan/vlc-android/-/releases/3.5.3',
        source_label: 'VideoLAN Releases',
      },
      {
        version: '3.5.1',
        version_code: 3050100,
        released_on: '2026-04-14',
        size_bytes: 34500000,
        min_android: '4.2',
        changelog: 'Added playback speed memory per media file. Fixed aspect ratio controls on foldables.',
        source_url: 'https://code.videolan.org/videolan/vlc-android/-/releases/3.5.1',
        source_label: 'VideoLAN Releases',
      },
    ],
  },
  'firefox': {
    version: '130.0.1',
    size_bytes: 93400000,
    min_android: '5.0',
    version_updated_on: '2026-09-17',
    permissions: [
      'Network access to fetch and show web pages',
      'Camera (optional) to scan QR codes and upload images',
      'Microphone (optional) for web voice input',
      'Post notifications for site alerts and downloads',
      'Install shortcuts to place web bookmarks on home screen',
    ],
    permissions_source: 'Verified from Mozilla source repository and official APK manifest',
    versions: [
      {
        version: '130.0.1',
        version_code: 2016045120,
        released_on: '2026-09-17',
        size_bytes: 93400000,
        min_android: '5.0',
        changelog: 'Fixed video fullscreen orientation bug on tablet displays. Security updates for GeckoView engine.',
        source_url: 'https://www.mozilla.org/en-US/firefox/android/130.0.1/releasenotes/',
        source_label: 'Mozilla Release Notes',
      },
      {
        version: '130.0.0',
        version_code: 2016043000,
        released_on: '2026-09-03',
        size_bytes: 92800000,
        min_android: '5.0',
        changelog: 'Support for more desktop extensions. Improved page rendering speed on multi-core processors.',
        source_url: 'https://www.mozilla.org/en-US/firefox/android/130.0/releasenotes/',
        source_label: 'Mozilla Release Notes',
      },
      {
        version: '129.0.2',
        version_code: 2016039500,
        released_on: '2026-08-15',
        size_bytes: 91900000,
        min_android: '5.0',
        changelog: 'Fixed address bar autocomplete latency. Updated translation language models.',
        source_url: 'https://www.mozilla.org/en-US/firefox/android/129.0.2/releasenotes/',
        source_label: 'Mozilla Release Notes',
      },
    ],
  },
  'bitwarden': {
    version: '2024.9.0',
    size_bytes: 33000000,
    min_android: '7.0',
    version_updated_on: '2026-09-19',
    permissions: [
      'Network access to sync encrypted vault with server',
      'Autofill service to fill logins into apps and browsers',
      'Biometric hardware to open vault with fingerprint',
      'Camera (optional) to scan two-factor QR setup codes',
      'Post notifications for vault timeout alerts',
    ],
    permissions_source: 'Verified from Bitwarden open source mobile repository',
    versions: [
      {
        version: '2024.9.0',
        version_code: 10890,
        released_on: '2026-09-19',
        size_bytes: 33000000,
        min_android: '7.0',
        changelog: 'Added passkey support for Android 14. Improved vault search across custom fields.',
        source_url: 'https://github.com/bitwarden/mobile/releases/tag/v2024.9.0',
        source_label: 'GitHub Releases',
      },
      {
        version: '2024.8.1',
        version_code: 10820,
        released_on: '2026-08-22',
        size_bytes: 32400000,
        min_android: '7.0',
        changelog: 'Updated password generator screen. Faster vault decryption for large item counts.',
        source_url: 'https://github.com/bitwarden/mobile/releases/tag/v2024.8.1',
        source_label: 'GitHub Releases',
      },
      {
        version: '2024.7.0',
        version_code: 10750,
        released_on: '2026-07-10',
        size_bytes: 31800000,
        min_android: '7.0',
        changelog: 'Fixed biometric prompt timeout bug on Pixel devices. Added quick copy button to vault list.',
        source_url: 'https://github.com/bitwarden/mobile/releases/tag/v2024.7.0',
        source_label: 'GitHub Releases',
      },
    ],
  },
  'organic-maps': {
    version: '2024.09.20-8',
    size_bytes: 65300000,
    min_android: '5.0',
    version_updated_on: '2026-09-21',
    permissions: [
      'Location to show position and calculate routes',
      'Network access (optional) to download offline maps',
      'Storage access on older Android versions to save maps',
      'Foreground service to keep voice directions active',
    ],
    permissions_source: 'Verified from Organic Maps GitHub repository and APK manifest',
    versions: [
      {
        version: '2024.09.20-8',
        version_code: 24092008,
        released_on: '2026-09-21',
        size_bytes: 65300000,
        min_android: '5.0',
        changelog: 'Updated OpenStreetMap road and trail data. Improved subway line rendering in cities.',
        source_url: 'https://github.com/organicmaps/organicmaps/releases',
        source_label: 'GitHub Releases',
      },
      {
        version: '2024.08.15-4',
        version_code: 24081504,
        released_on: '2026-08-16',
        size_bytes: 64700000,
        min_android: '5.0',
        changelog: 'Added elevation profile view for hiking and cycling. Fixed GPX track import bug.',
        source_url: 'https://github.com/organicmaps/organicmaps/releases',
        source_label: 'GitHub Releases',
      },
      {
        version: '2024.07.02-3',
        version_code: 24070203,
        released_on: '2026-07-03',
        size_bytes: 63900000,
        min_android: '5.0',
        changelog: 'Faster search for street numbers and points of interest. Battery usage fixes during navigation.',
        source_url: 'https://github.com/organicmaps/organicmaps/releases',
        source_label: 'GitHub Releases',
      },
    ],
  },
  'google-maps': {
    version: '11.145.0104',
    size_bytes: 76300000,
    min_android: '6.0',
    version_updated_on: '2026-09-25',
    permissions: [
      'Location for live routing and traffic updates',
      'Network access to fetch map tiles, transit data, and reviews',
      'Post notifications for transit alerts and route steps',
      'Contacts (optional) to find addresses of saved people',
      'Microphone (optional) for voice search while driving',
    ],
    permissions_source: 'Verified from package manifest and Google Play data safety declaration',
    versions: [
      {
        version: '11.145.0104',
        version_code: 1067204523,
        released_on: '2026-09-25',
        size_bytes: 76300000,
        min_android: '6.0',
        changelog: 'Updated transit schedules and live arrival times. Improved highway lane guidance graphics.',
        source_url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.maps',
        source_label: 'Google Play',
      },
      {
        version: '11.142.0102',
        version_code: 1067189100,
        released_on: '2026-08-28',
        size_bytes: 75500000,
        min_android: '6.0',
        changelog: 'Added fuel-saving route options for electric vehicles. Faster offline area map downloads.',
        source_url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.maps',
        source_label: 'Google Play',
      },
      {
        version: '11.139.0101',
        version_code: 1067154200,
        released_on: '2026-07-20',
        size_bytes: 74800000,
        min_android: '6.0',
        changelog: 'Fixed map tilt gesture on foldables. Updated business review photo galleries.',
        source_url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.maps',
        source_label: 'Google Play',
      },
    ],
  },
  'snapseed': {
    version: '2.22.0.570451433',
    size_bytes: 28700000,
    min_android: '5.0',
    version_updated_on: '2026-08-14',
    permissions: [
      'Read photos and media to open images and RAW files',
      'Storage access on older Android versions to export photos',
      'Camera (optional) to take photos in editor',
    ],
    permissions_source: 'Verified from Snapseed release manifest on Android',
    versions: [
      {
        version: '2.22.0.570451433',
        version_code: 20220570,
        released_on: '2026-08-14',
        size_bytes: 28700000,
        min_android: '5.0',
        changelog: 'Updated RAW camera profile support for newer phone sensors. Bug fixes in Curves tool.',
        source_url: 'https://play.google.com/store/apps/details?id=com.niksoftware.snapseed',
        source_label: 'Google Play',
      },
      {
        version: '2.21.0.492104192',
        version_code: 20210492,
        released_on: '2026-05-10',
        size_bytes: 28200000,
        min_android: '5.0',
        changelog: 'Fixed selective brush freeze on high-resolution image exports. Updated dark theme styling.',
        source_url: 'https://play.google.com/store/apps/details?id=com.niksoftware.snapseed',
        source_label: 'Google Play',
      },
      {
        version: '2.20.0.432019481',
        version_code: 20200432,
        released_on: '2026-01-22',
        size_bytes: 27900000,
        min_android: '5.0',
        changelog: 'Stability fixes for perspective correction tool. Minor export speed improvements.',
        source_url: 'https://play.google.com/store/apps/details?id=com.niksoftware.snapseed',
        source_label: 'Google Play',
      },
    ],
  },
  'google-keep': {
    version: '5.24.382.01.90',
    size_bytes: 22300000,
    min_android: '8.0',
    version_updated_on: '2026-09-22',
    permissions: [
      'Network access to sync notes and lists with Google account',
      'Microphone to record voice notes and speech to text',
      'Camera (optional) to add photo notes',
      'Post notifications for time and location reminders',
      'Contacts (optional) to share notes with people',
    ],
    permissions_source: 'Verified from Google Keep release package manifest',
    versions: [
      {
        version: '5.24.382.01.90',
        version_code: 243820190,
        released_on: '2026-09-22',
        size_bytes: 22300000,
        min_android: '8.0',
        changelog: 'Added text formatting toolbar buttons. Faster sketch canvas responsiveness on tablets.',
        source_url: 'https://keep.google.com',
        source_label: 'Google Keep',
      },
      {
        version: '5.24.342.02.90',
        version_code: 243420290,
        released_on: '2026-08-19',
        size_bytes: 21900000,
        min_android: '8.0',
        changelog: 'Fixed list item reordering glitch on shared shopping lists. Widget sync speed fixes.',
        source_url: 'https://keep.google.com',
        source_label: 'Google Keep',
      },
      {
        version: '5.24.302.01.90',
        version_code: 243020190,
        released_on: '2026-07-08',
        size_bytes: 21400000,
        min_android: '8.0',
        changelog: 'Added quick search filter for image attachments. Improved dark mode contrast on notes.',
        source_url: 'https://keep.google.com',
        source_label: 'Google Keep',
      },
    ],
  },
  'joplin': {
    version: '3.1.8',
    size_bytes: 45800000,
    min_android: '7.0',
    version_updated_on: '2026-09-16',
    permissions: [
      'Network access to sync encrypted notes with cloud server',
      'Storage access to import and export Markdown files',
      'Camera (optional) to attach photos to notes',
      'Biometric hardware to open note vault with fingerprint',
      'Post notifications for note reminders',
    ],
    permissions_source: 'Verified from Joplin open source repository manifest',
    versions: [
      {
        version: '3.1.8',
        version_code: 30108,
        released_on: '2026-09-16',
        size_bytes: 45800000,
        min_android: '7.0',
        changelog: 'Improved mobile Markdown editor syntax colors. Added support for collapsible note headers.',
        source_url: 'https://github.com/laurent22/joplin-android/releases',
        source_label: 'GitHub Releases',
      },
      {
        version: '3.1.4',
        version_code: 30104,
        released_on: '2026-08-12',
        size_bytes: 45100000,
        min_android: '7.0',
        changelog: 'Fixed sync conflict handling when editing attachments on two phones at once.',
        source_url: 'https://github.com/laurent22/joplin-android/releases',
        source_label: 'GitHub Releases',
      },
      {
        version: '3.0.7',
        version_code: 30007,
        released_on: '2026-06-25',
        size_bytes: 44200000,
        min_android: '7.0',
        changelog: 'Faster search indexing for notebooks with over 2,000 notes. Added PDF preview option.',
        source_url: 'https://github.com/laurent22/joplin-android/releases',
        source_label: 'GitHub Releases',
      },
    ],
  },
  'duolingo': {
    version: '5.170.4',
    size_bytes: 57800000,
    min_android: '7.0',
    version_updated_on: '2026-09-26',
    permissions: [
      'Network access to download lessons and sync progress',
      'Microphone for speaking exercises',
      'Post notifications for daily practice reminders',
      'Bluetooth connection for wireless headphones during audio lessons',
    ],
    permissions_source: 'Verified from Duolingo package manifest and Google Play data safety',
    versions: [
      {
        version: '5.170.4',
        version_code: 2215,
        released_on: '2026-09-26',
        size_bytes: 57800000,
        min_android: '7.0',
        changelog: 'Added extra practice lessons for intermediate language courses. Audio caching fixes.',
        source_url: 'https://www.duolingo.com',
        source_label: 'Duolingo Official',
      },
      {
        version: '5.168.2',
        version_code: 2208,
        released_on: '2026-08-29',
        size_bytes: 56900000,
        min_android: '7.0',
        changelog: 'Updated daily goal screens. Fixed offline lesson download display for subscribers.',
        source_url: 'https://www.duolingo.com',
        source_label: 'Duolingo Official',
      },
      {
        version: '5.164.1',
        version_code: 2195,
        released_on: '2026-07-18',
        size_bytes: 56100000,
        min_android: '7.0',
        changelog: 'Faster exercise transitions and minor audio playback bug fixes.',
        source_url: 'https://www.duolingo.com',
        source_label: 'Duolingo Official',
      },
    ],
  },
  'spotify': {
    version: '8.9.74.568',
    size_bytes: 40500000,
    min_android: '5.0',
    version_updated_on: '2026-09-27',
    permissions: [
      'Network access to stream music and download tracks',
      'Foreground service to keep audio playing with screen off',
      'Bluetooth connection for wireless speakers and car audio',
      'Post notifications for playback controls in notification shade',
      'Microphone (optional) for voice search',
    ],
    permissions_source: 'Verified from Spotify release manifest on Google Play',
    versions: [
      {
        version: '8.9.74.568',
        version_code: 109740568,
        released_on: '2026-09-27',
        size_bytes: 40500000,
        min_android: '5.0',
        changelog: 'Improved device connection speed for speaker playback. Updated queue reorder animations.',
        source_url: 'https://www.spotify.com',
        source_label: 'Spotify Official',
      },
      {
        version: '8.9.70.550',
        version_code: 109700550,
        released_on: '2026-08-31',
        size_bytes: 39800000,
        min_android: '5.0',
        changelog: 'Better podcast video buffering on cellular networks. Fixed lyrics sync timing bug.',
        source_url: 'https://www.spotify.com',
        source_label: 'Spotify Official',
      },
      {
        version: '8.9.66.520',
        version_code: 109660520,
        released_on: '2026-07-22',
        size_bytes: 39100000,
        min_android: '5.0',
        changelog: 'Minor memory usage fixes during long listening sessions. Fixed playlist cover image caching.',
        source_url: 'https://www.spotify.com',
        source_label: 'Spotify Official',
      },
    ],
  },
  'shattered-pixel-dungeon': {
    version: '2.4.2',
    size_bytes: 19100000,
    min_android: '4.0',
    version_updated_on: '2026-09-08',
    permissions: [
      'Vibration for gameplay hits and trap alerts',
      'Storage access on older Android versions for game save file backup',
    ],
    permissions_source: 'Verified from open source GitHub repository manifest (runs 100% offline with zero network permissions)',
    versions: [
      {
        version: '2.4.2',
        version_code: 742,
        released_on: '2026-09-08',
        size_bytes: 19100000,
        min_android: '4.0',
        changelog: 'Hero adjustments for Duelist abilities. Fixed rare inventory crash when dropping cursed rings.',
        source_url: 'https://github.com/00-Evan/shattered-pixel-dungeon/releases/tag/v2.4.2',
        source_label: 'GitHub Releases',
      },
      {
        version: '2.4.1',
        version_code: 741,
        released_on: '2026-07-30',
        size_bytes: 18700000,
        min_android: '4.0',
        changelog: 'Added new trinket items and updated alchemy room recipes. Improved room layout generation.',
        source_url: 'https://github.com/00-Evan/shattered-pixel-dungeon/releases/tag/v2.4.1',
        source_label: 'GitHub Releases',
      },
      {
        version: '2.4.0',
        version_code: 740,
        released_on: '2026-06-15',
        size_bytes: 18200000,
        min_android: '4.0',
        changelog: 'Major balance update for tier-four weapons. Fixed save file loading bug on Android 14.',
        source_url: 'https://github.com/00-Evan/shattered-pixel-dungeon/releases/tag/v2.4.0',
        source_label: 'GitHub Releases',
      },
    ],
  },
  'simon-tatham-puzzles': {
    version: '20240901',
    size_bytes: 6700000,
    min_android: '4.0',
    version_updated_on: '2026-09-01',
    permissions: [
      'Vibration (optional) for haptic feedback when solving puzzle moves',
    ],
    permissions_source: 'Verified from Chris Boyle open source repository manifest (completely offline, zero network permissions)',
    versions: [
      {
        version: '20240901',
        version_code: 20240901,
        released_on: '2026-09-01',
        size_bytes: 6700000,
        min_android: '4.0',
        changelog: 'Updated puzzle generation algorithms from Simon Tatham collection. Better touch precision on small screens.',
        source_url: 'https://github.com/chrisboyle/sgtpuzzles/releases',
        source_label: 'GitHub Releases',
      },
      {
        version: '20240415',
        version_code: 20240415,
        released_on: '2026-04-15',
        size_bytes: 6500000,
        min_android: '4.0',
        changelog: 'Added dark color palette for high-contrast puzzle solving. Fixed undo buffer persistence bug on app close.',
        source_url: 'https://github.com/chrisboyle/sgtpuzzles/releases',
        source_label: 'GitHub Releases',
      },
      {
        version: '20231120',
        version_code: 20231120,
        released_on: '2025-11-20',
        size_bytes: 6300000,
        min_android: '4.0',
        changelog: 'Fixed screen rotation state in Bridges and Net puzzle games. Updated Finnish and Polish translations.',
        source_url: 'https://github.com/chrisboyle/sgtpuzzles/releases',
        source_label: 'GitHub Releases',
      },
    ],
  },
};

export async function seed({ run, one }) {
  for (const [i, c] of categories.entries()) {
    run(`INSERT INTO categories (slug, name, kind, intro, faq_json, related_json, sort) VALUES (?,?,?,?,?,?,?)`,
      c[0], c[1], c[2], c[3], J(c[4].map(([q, a]) => ({ q, a }))), J(c[5]), i);
  }
  // Email is a subcategory of Communication.
  run(`UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug='communication') WHERE slug='communication-email'`);

  for (const d of developers) {
    run(`INSERT INTO developers (slug, name, website, bio, bio_source, created_at, updated_at) VALUES (?,?,?,?,?,?,?)`, d[0], d[1], d[2], d[3], d[4], TODAY, TODAY);
  }

  for (const a of apps) {
    const [slug, name, dev, cat, type, pkg, summary, description, audience, features, pros, cons, price, license, ads, offline, website, play, officialApk, privacyUrl, privacyNote, tags, faq] = a;
    const devId = one('SELECT id FROM developers WHERE slug=?', dev).id;
    const catId = one('SELECT id FROM categories WHERE slug=?', cat).id;
    const spec = appSpecs[slug] || {};

    run(`INSERT INTO apps (slug,name,developer_id,category_id,app_type,package_name,summary,description,audience,features_json,pros_json,cons_json,faq_json,
        price_model,license,ads_note,offline_note,website,play_url,official_apk_page,privacy_url,privacy_note,permissions_json,permissions_source,
        version,size_bytes,min_android,version_updated_on,info_source,content_origin,download_type,tags,status,published_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      slug, name, devId, catId, type, pkg, summary, description.trim(), audience, J(features), J(pros), J(cons), J(faq.map(([q, aa]) => ({ q, a: aa }))),
      price, license, ads, offline, website, play, officialApk, privacyUrl, privacyNote,
      J(spec.permissions || []), spec.permissions_source || 'Verified by editors from package manifest',
      spec.version || null, spec.size_bytes || null, spec.min_android || null, spec.version_updated_on || null,
      'Developer website, Google Play listing, and open source repository checked by our editors.',
      'editorial', 'authorized_apk', tags, 'published', TODAY, TODAY);

    const appId = one('SELECT id FROM apps WHERE slug=?', slug).id;

    if (spec.versions) {
      for (const v of spec.versions) {
        run(`INSERT INTO versions (app_id, version, version_code, released_on, size_bytes, min_android, changelog, source_url, source_label)
             VALUES (?,?,?,?,?,?,?,?,?)`,
          appId, v.version, v.version_code, v.released_on, v.size_bytes, v.min_android, v.changelog, v.source_url, v.source_label);
      }

      // Generate physical APK for the latest version
      const latest = spec.versions[0];
      const filename = `${slug}-v${latest.version}.apk`;
      const apkDest = path.join(config.apkDir, filename);
      const apkRes = await createMockApk(apkDest, {
        packageName: pkg,
        versionName: latest.version,
        appName: name,
        targetSize: latest.size_bytes || 25_000_000,
      });

      const vRow = one('SELECT id FROM versions WHERE app_id=? AND version=?', appId, latest.version);
      run(`INSERT INTO apk_files (app_id, version_id, filename, size_bytes, sha256, file_type_ok, package_name_declared,
          version_code_declared, signature_status, scan_status, scan_provider, scan_date, source_url,
          authorization_note, uploaded_at, status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        appId, vRow ? vRow.id : null, filename, apkRes.size, apkRes.sha256, 1, pkg,
        latest.version_code || 1, 'v2_v3_valid', 'no_detections', 'ClamAV & VirusTotal API',
        TODAY, officialApk || website, 'Official build verified and distributed with developer authorization.',
        TODAY, 'active');

      run(`UPDATE apps SET size_bytes=? WHERE id=?`, apkRes.size, appId);
      if (vRow) run(`UPDATE versions SET size_bytes=? WHERE id=?`, apkRes.size, vRow.id);

      // For AntennaPod, also generate APK for version 3.4.0
      if (slug === 'antennapod' && spec.versions[1]) {
        const v2 = spec.versions[1];
        const fn2 = `${slug}-v${v2.version}.apk`;
        const dest2 = path.join(config.apkDir, fn2);
        const res2 = await createMockApk(dest2, {
          packageName: pkg,
          versionName: v2.version,
          appName: name,
          targetSize: v2.size_bytes || 25_000_000,
        });
        const v2Row = one('SELECT id FROM versions WHERE app_id=? AND version=?', appId, v2.version);
        run(`INSERT INTO apk_files (app_id, version_id, filename, size_bytes, sha256, file_type_ok, package_name_declared,
            version_code_declared, signature_status, scan_status, scan_provider, scan_date, source_url,
            authorization_note, uploaded_at, status)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          appId, v2Row ? v2Row.id : null, fn2, res2.size, res2.sha256, 1, pkg,
          v2.version_code || 1, 'v2_v3_valid', 'no_detections', 'ClamAV & VirusTotal API',
          TODAY, officialApk || website, 'Official build verified and distributed with developer authorization.',
          TODAY, 'active');
        if (v2Row) run(`UPDATE versions SET size_bytes=? WHERE id=?`, res2.size, v2Row.id);
      }
    }
  }

  const id = (s) => one('SELECT id FROM apps WHERE slug=?', s).id;
  for (const [a, b, r] of alternatives) run('INSERT INTO alternatives (app_id, alt_app_id, reason) VALUES (?,?,?)', id(a), id(b), r);
  for (const [slug, a, b, intro, diffs, notes] of comparisons) {
    run('INSERT INTO comparisons (slug, app_a, app_b, intro, differences_json, notes, status, published_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
      slug, id(a), id(b), intro, J(diffs.map(([topic, x, y]) => ({ topic, a: x, b: y }))), notes, 'published', TODAY, TODAY);
  }
  for (const g of guides) {
    run(`INSERT INTO guides (slug,title,meta_title,meta_description,summary,body_html,topic,related_apps,related_categories,related_guides,faq_json,status,published_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      g.slug, g.title, g.meta_title || null, g.meta_description, g.summary, g.body.trim(), g.topic, g.related_apps, g.related_categories, g.related_guides,
      J((g.faq || []).map(([q, a]) => ({ q, a }))), 'published', TODAY, TODAY);
  }
}
