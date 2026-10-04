// Crisp, authentic SVG logos and high-fidelity vector emblems for Android applications.
import fs from 'node:fs';
import path from 'node:path';
import { one } from './db.js';

const ICONS_DIR = path.join(process.cwd(), 'data', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// 1. Handcrafted, pixel-perfect vector logos for top Android apps
const BRAND_ICONS = {
  // Cloudflare & Network
  '1111-cloudflare': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#F6821F"/>
    <path d="M22 66h56a14 14 0 0 0 0-28 20 20 0 0 0-38-6 16 16 0 0 0-18 16 14 14 0 0 0 0 18z" fill="#FFFFFF"/>
    <circle cx="34" cy="52" r="3.5" fill="#F6821F"/>
    <circle cx="45" cy="52" r="3.5" fill="#F6821F"/>
    <circle cx="56" cy="52" r="3.5" fill="#F6821F"/>
    <circle cx="67" cy="52" r="3.5" fill="#F6821F"/>
    <text x="50" y="78" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">WARP</text>
  </svg>`,

  // 2ndLine
  '2ndline': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g2nd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E3A8A"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g2nd)"/>
    <path d="M50 20c-17 0-31 12-31 27 0 6.5 2.8 12.5 7.6 17.2L24 78l15.5-4.2C42.8 75.8 46.3 76 50 76c17 0 31-12 31-27S67 20 50 20z" fill="#FFFFFF" opacity="0.15"/>
    <path d="M38 34c2-4 7-6 12-6 8 0 14 5 14 12 0 6-4 10-9 14l-8 7h18v7H36v-6l14-14c3-3 5-5 5-8 0-4-3-6-7-6-3 0-6 1-7 4l-7-4z" fill="#FFFFFF"/>
    <circle cx="70" cy="30" r="4" fill="#60A5FA"/>
  </svg>`,

  // ACMarket
  'acmarket': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="gac" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#10B981"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#gac)"/>
    <path d="M36 28l-5-9M64 28l5-9" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M25 46a25 25 0 0 1 50 0v24a6 6 0 0 1-6 6H31a6 6 0 0 1-6-6V46z" fill="#FFFFFF"/>
    <circle cx="40" cy="50" r="4.5" fill="#059669"/>
    <circle cx="60" cy="50" r="4.5" fill="#059669"/>
    <path d="M38 64c3.5 4 8.5 6 12 6s8.5-2 12-6" stroke="#059669" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,

  // ActionDirector
  'actiondirector': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="gad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#BE123C"/><stop offset="100%" stop-color="#FB7185"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#gad)"/>
    <rect x="22" y="25" width="56" height="50" rx="6" fill="#1E293B"/>
    <path d="M22 25h56v14H22z" fill="#0F172A"/>
    <path d="M28 25l6 14M42 25l6 14M56 25l6 14M70 25l6 14" stroke="#FFFFFF" stroke-width="3"/>
    <polygon points="44,48 44,66 62,57" fill="#F43F5E"/>
  </svg>`,

  // Badland
  'badland': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="gbad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#EA580C"/><stop offset="50%" stop-color="#9333EA"/><stop offset="100%" stop-color="#1E1B4B"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#gbad)"/>
    <circle cx="50" cy="52" r="26" fill="#0F0F1A"/>
    <ellipse cx="42" cy="48" rx="4.5" ry="6.5" fill="#FFFFFF"/>
    <ellipse cx="58" cy="48" rx="4.5" ry="6.5" fill="#FFFFFF"/>
    <circle cx="43" cy="49" r="2" fill="#0F0F1A"/>
    <circle cx="59" cy="49" r="2" fill="#0F0F1A"/>
    <path d="M26 44c-5-7-3-15 4-13 3 1 3 8 0 13zM74 44c5-7 3-15-4-13-3 1-3 8 0 13z" fill="#0F0F1A"/>
  </svg>`,

  // Google Chrome
  'google-chrome': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="38" fill="#EA4335"/>
    <path d="M50 50l32.9-19A38 38 0 0 1 76.9 77L50 50z" fill="#FBBC05"/>
    <path d="M50 50L23.1 77A38 38 0 0 1 17.1 31L50 50z" fill="#34A853"/>
    <circle cx="50" cy="50" r="17" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="13" fill="#4285F4"/>
  </svg>`,
  'chrome-beta': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#FFFFFF"/><circle cx="50" cy="50" r="38" fill="#EA4335"/><path d="M50 50l32.9-19A38 38 0 0 1 76.9 77L50 50z" fill="#FBBC05"/><path d="M50 50L23.1 77A38 38 0 0 1 17.1 31L50 50z" fill="#34A853"/><circle cx="50" cy="50" r="17" fill="#FFFFFF"/><circle cx="50" cy="50" r="13" fill="#4285F4"/><rect x="52" y="58" width="28" height="16" rx="4" fill="#4285F4"/><text x="66" y="70" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFF" text-anchor="middle">BETA</text></svg>`,
  'chrome-canary': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#FFFBEB"/><circle cx="50" cy="50" r="38" fill="#F59E0B"/><path d="M50 50l32.9-19A38 38 0 0 1 76.9 77L50 50z" fill="#FBBF24"/><path d="M50 50L23.1 77A38 38 0 0 1 17.1 31L50 50z" fill="#D97706"/><circle cx="50" cy="50" r="17" fill="#FFFFFF"/><circle cx="50" cy="50" r="13" fill="#F59E0B"/></svg>`,

  // YouTube
  'youtube': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FF0000"/>
    <path d="M80 34c-.8-3-3.2-5.4-6.2-6.2C68.3 26 50 26 50 26s-18.3 0-23.8 1.8c-3 .8-5.4 3.2-6.2 6.2C18 39.5 18 50 18 50s0 10.5 2 16c.8 3 3.2 5.4 6.2 6.2C31.7 74 50 74 50 74s18.3 0 23.8-1.8c3-.8 5.4-3.2 6.2-6.2C82 60.5 82 50 82 50s0-10.5-2-16z" fill="#CC0000"/>
    <polygon points="44,39 44,61 63,50" fill="#FFFFFF"/>
  </svg>`,
  'youtube-music': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#FF0000"/><circle cx="50" cy="50" r="30" fill="#000"/><circle cx="50" cy="50" r="24" fill="#FF0000"/><polygon points="44,40 44,60 62,50" fill="#FFF"/></svg>`,
  'youtube-vanced': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#181829"/><path d="M78 35c-.8-3-3-5.2-6-6C66.5 27 50 27 50 27s-16.5 0-22 2c-3 .8-5.2 3-6 6C20 40.5 20 50 20 50s0 9.5 2 15c.8 3 3 5.2 6 6 5.5 2 22 2 22 2s16.5 0 22-2c3-.8 5.2-3 6-6 2-5.5 2-15 2-15s0-9.5-2-15z" fill="#0F0F1A"/><polygon points="43,38 43,62 64,50" fill="#7C3AED"/></svg>`,

  // Google Drive
  'google-drive': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
    <path d="M37 25h26l19 33H56z" fill="#FFBA00"/>
    <path d="M18 58l19-33 19 33-19 33z" fill="#0066DA"/>
    <path d="M56 58l19 33H37l-19-33z" fill="#00AC47"/>
  </svg>`,

  // Google Docs
  'google-docs': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#4285F4"/>
    <path d="M32 24h24l16 16v36a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" fill="#FFFFFF"/>
    <path d="M56 24l16 16H56z" fill="#D2E3FC"/>
    <rect x="36" y="44" width="28" height="4" rx="2" fill="#4285F4"/>
    <rect x="36" y="52" width="28" height="4" rx="2" fill="#4285F4"/>
    <rect x="36" y="60" width="18" height="4" rx="2" fill="#4285F4"/>
  </svg>`,

  // Google Sheets
  'google-sheets': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#0F9D58"/>
    <path d="M32 24h24l16 16v36a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" fill="#FFFFFF"/>
    <path d="M56 24l16 16H56z" fill="#CEEAD6"/>
    <rect x="36" y="46" width="28" height="22" rx="2" fill="#0F9D58"/>
    <line x1="36" y1="57" x2="64" y2="57" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="50" y1="46" x2="50" y2="68" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`,

  // Google Slides
  'google-slides': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#F4B400"/>
    <path d="M32 24h24l16 16v36a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" fill="#FFFFFF"/>
    <path d="M56 24l16 16H56z" fill="#FEF7E0"/>
    <rect x="36" y="46" width="28" height="20" rx="2" fill="#F4B400"/>
    <rect x="40" y="50" width="20" height="12" rx="1" fill="#FFFFFF"/>
  </svg>`,

  // Google Maps
  'google-maps': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
    <path d="M50 18c-14.4 0-26 11.6-26 26 0 19.5 26 40 26 40s26-20.5 26-40c0-14.4-11.6-26-26-26z" fill="#EA4335"/>
    <circle cx="50" cy="44" r="10" fill="#FFFFFF"/>
    <circle cx="50" cy="44" r="6" fill="#4285F4"/>
  </svg>`,

  // Google Keep
  'google-keep': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FBBC04"/>
    <path d="M50 24a20 20 0 0 0-20 20c0 7.4 4 13.8 10 17.2V68a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6.8c6-3.4 10-9.8 10-17.2a20 20 0 0 0-20-20zm-8 50h16v2H42zm2 4h12v2H44z" fill="#FFFFFF"/>
  </svg>`,

  // Google Translate
  'google-translate': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
    <rect x="20" y="24" width="38" height="42" rx="6" fill="#4285F4"/>
    <rect x="42" y="34" width="38" height="42" rx="6" fill="#EA4335"/>
    <text x="39" y="52" font-family="sans-serif" font-size="22" font-weight="bold" fill="#FFF" text-anchor="middle">G</text>
    <text x="61" y="62" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFF" text-anchor="middle">文</text>
  </svg>`,

  // Google Pay
  'google-pay': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FFFFFF" stroke="#E5E7EB"/>
    <path d="M42 46v16h-4V38h10c2.5 0 4.5.8 6 2.3 1.5 1.5 2.2 3.4 2.2 5.7s-.7 4.2-2.2 5.7c-1.5 1.5-3.5 2.3-6 2.3H42zm0-4h6c1.3 0 2.3-.4 3-1.1.8-.7 1.2-1.7 1.2-2.9s-.4-2.2-1.2-2.9c-.7-.7-1.7-1.1-3-1.1H42v8z" fill="#5F6368"/>
    <path d="M68 44h4l-7 18h-4l2.6-5.8-5.6-12.2h4.3l3.3 7.8 2.4-7.8z" fill="#4285F4"/>
  </svg>`,

  // Snapseed
  'snapseed': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#FFFFFF" stroke="#E5E7EB"/>
    <path d="M50 20c-18 0-32 14-32 32 0 18 32 34 32 34s32-16 32-34c0-18-14-32-32-32z" fill="#2E7D32"/>
    <path d="M50 20v66s32-16 32-34c0-18-14-32-32-32z" fill="#4CAF50"/>
  </svg>`,

  // Microsoft 365 / Office
  'microsoft-word': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#185ABD"/><rect x="20" y="24" width="42" height="52" rx="4" fill="#2B7CD3"/><rect x="42" y="24" width="38" height="52" rx="4" fill="#104A9E"/><text x="41" y="60" font-family="sans-serif" font-size="34" font-weight="bold" fill="#FFF" text-anchor="middle">W</text></svg>`,
  'microsoft-excel': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#107C41"/><rect x="20" y="24" width="42" height="52" rx="4" fill="#185C37"/><rect x="42" y="24" width="38" height="52" rx="4" fill="#0E4828"/><text x="41" y="60" font-family="sans-serif" font-size="34" font-weight="bold" fill="#FFF" text-anchor="middle">X</text></svg>`,
  'microsoft-powerpoint': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#C43E1C"/><rect x="20" y="24" width="42" height="52" rx="4" fill="#D83B01"/><rect x="42" y="24" width="38" height="52" rx="4" fill="#A4260C"/><text x="41" y="60" font-family="sans-serif" font-size="34" font-weight="bold" fill="#FFF" text-anchor="middle">P</text></svg>`,
  'microsoft-365-copilot': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0F172A"/><path d="M35 32c0-7 6-12 13-12 8 0 14 5 15 12v36c0 7-6 12-13 12-8 0-14-5-15-12z" fill="#0EA5E9"/><path d="M65 68c0 7-6 12-13 12-8 0-14-5-15-12V32c0-7 6-12 13-12 8 0 14 5 15 12z" fill="#6366F1"/></svg>`,
  'onenote': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#7719AA"/><text x="50" y="68" font-family="sans-serif" font-size="52" font-weight="bold" fill="#FFF" text-anchor="middle">N</text></svg>`,
  'skype': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#00AFF0"/><circle cx="36" cy="36" r="18" fill="#00AFF0"/><circle cx="64" cy="64" r="18" fill="#00AFF0"/><path d="M50 20a30 30 0 1 0 30 30A30 30 0 0 0 50 20zm10 40c-3 4-8 6-13 6-7 0-12-3-12-8 0-4 3-7 8-8l9-3c3-1 4-2 4-4s-2-3-5-3c-3 0-6 2-7 4l-6-4c3-4 7-6 13-6s12 3 12 8c0 4-3 7-8 8l-9 3c-3 1-4 2-4 4s2 3 5 3c3 0 7-2 8-5z" fill="#FFF"/></svg>`,
  'skype-lite': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#00AFF0"/><text x="50" y="64" font-family="sans-serif" font-size="44" font-weight="bold" fill="#FFF" text-anchor="middle">S</text></svg>`,
  'linkedin': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0A66C2"/><text x="50" y="70" font-family="sans-serif" font-size="56" font-weight="bold" fill="#FFF" text-anchor="middle">in</text></svg>`,

  // Meta (WhatsApp, Instagram, Facebook)
  'whatsapp': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#25D366"/>
    <path d="M50 20c-16.6 0-30 13.4-30 30 0 5.3 1.4 10.3 3.8 14.6L20 80l15.9-3.7A29.9 29.9 0 0 0 50 80c16.6 0 30-13.4 30-30s-13.4-30-30-30zm15.1 42.5c-.6 1.8-3.1 3.4-5 3.8-1.3.3-2.9.5-8.5-1.8-7.1-3-11.7-10.2-12.1-10.7-.4-.5-2.9-3.8-2.9-7.3 0-3.5 1.8-5.2 2.5-5.9.6-.7 1.4-.9 1.9-.9.5 0 .9 0 1.4.02.4.02 1-.2 1.6 1.2.6 1.4 2 5 2.2 5.4.2.4.3.8.1 1.2-.2.5-.4.8-.7 1.2-.4.4-.7.9-1.1 1.2-.3.4-.7.7-.3 1.4.4.7 1.8 3 3.9 4.9 2.7 2.4 5 3.1 5.7 3.5.7.3 1.1.3 1.5-.2.4-.5 1.8-2.1 2.2-2.8.5-.7.9-.6 1.6-.3.7.2 4.1 2 4.8 2.3.7.4 1.2.5 1.4.8.2.3.2 1.7-.5 3.5z" fill="#FFFFFF"/>
  </svg>`,
  'whatsapp-business': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#075E54"/><path d="M50 20c-16.6 0-30 13.4-30 30 0 5.3 1.4 10.3 3.8 14.6L20 80l15.9-3.7A29.9 29.9 0 0 0 50 80c16.6 0 30-13.4 30-30s-13.4-30-30-30z" fill="#25D366"/><text x="50" y="58" font-family="sans-serif" font-size="28" font-weight="900" fill="#FFF" text-anchor="middle">B</text></svg>`,
  'instagram': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><radialGradient id="gi" cx="20%" cy="100%" r="130%"><stop offset="0%" stop-color="#FFDD55"/><stop offset="25%" stop-color="#FF543E"/><stop offset="50%" stop-color="#C837AB"/><stop offset="100%" stop-color="#3771C8"/></radialGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#gi)"/>
    <rect x="25" y="25" width="50" height="50" rx="14" fill="none" stroke="#FFFFFF" stroke-width="6"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#FFFFFF" stroke-width="6"/>
    <circle cx="63" cy="37" r="3.5" fill="#FFFFFF"/>
  </svg>`,
  'instagram-lite': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="gil" cx="20%" cy="100%" r="130%"><stop offset="0%" stop-color="#FFDD55"/><stop offset="25%" stop-color="#FF543E"/><stop offset="50%" stop-color="#C837AB"/><stop offset="100%" stop-color="#3771C8"/></radialGradient></defs><rect width="100" height="100" rx="22" fill="url(#gil)"/><circle cx="50" cy="50" r="18" fill="none" stroke="#FFF" stroke-width="6"/><circle cx="64" cy="36" r="4" fill="#FFF"/></svg>`,
  'facebook': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#1877F2"/><path d="M57 82V52h9l1.5-11H57v-7c0-3.2.9-5.4 5.5-5.4H68V19a79 79 0 0 0-8.5-.5C51 18.5 45 23.9 45 33.7V41h-9v11h9v30h12z" fill="#FFF"/></svg>`,
  'facebook-lite': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#FFFFFF" stroke="#1877F2" stroke-width="3"/><path d="M57 82V52h9l1.5-11H57v-7c0-3.2.9-5.4 5.5-5.4H68V19a79 79 0 0 0-8.5-.5C51 18.5 45 23.9 45 33.7V41h-9v11h9v30h12z" fill="#1877F2"/></svg>`,
  'messenger': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00B2FE"/><stop offset="50%" stop-color="#006AFF"/><stop offset="100%" stop-color="#A033FF"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#gm)"/><path d="M50 22c-15.5 0-28 11.6-28 26 0 8.2 4 15.6 10.4 20.3V78l9.6-5.3c2.6.7 5.3 1.1 8 1.1 15.5 0 28-11.6 28-26S65.5 22 50 22zm6.2 35l-7.3-7.8-14.2 7.8 15.6-16.5 7.4 7.8 14-7.8-15.5 16.5z" fill="#FFF"/></svg>`,
  'threads': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#101010"/><path d="M50 24c-14.3 0-26 11.7-26 26s11.7 26 26 26c9.4 0 17.6-5.1 22-12.8l-6-3.8c-3.1 5.3-9 8.6-16 8.6-10 0-18-7.2-18-18s8-18 18-18c9 0 16 6 16 16 0 7-3 10-6 10s-5-2-5-7V46h-8v4c-1.3-2.5-4.4-4-8-4-6.6 0-12 5.4-12 12s5.4 12 12 12c4.4 0 8.2-2.4 10-6 1.4 5.3 5.8 8 11 8 7 0 14-5 14-16 0-14-11-22-24-22z" fill="#FFF"/></svg>`,

  // TikTok & ByteDance
  'tiktok': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#010101"/>
    <path d="M56 22h9c1 8 7 14 15 15v9c-6 0-12-2-16-6v26c0 10-8 18-18 18s-18-8-18-18 8-18 18-18c2 0 4 .3 6 1V38c-2-.3-4-.5-6-.5-14 0-25 11-25 25s11 25 25 25 25-11 25-25V33c6 4 13 6 21 6v-9c-7-1-13-5-16-12z" fill="#25F4EE"/>
    <path d="M54 20h9c1 8 7 14 15 15v9c-6 0-12-2-16-6v26c0 10-8 18-18 18s-18-8-18-18 8-18 18-18c2 0 4 .3 6 1V36c-2-.3-4-.5-6-.5-14 0-25 11-25 25s11 25 25 25 25-11 25-25V31c6 4 13 6 21 6v-9c-7-1-13-5-16-12z" fill="#FE2C55"/>
    <path d="M55 21h9c1 8 7 14 15 15v9c-6 0-12-2-16-6v26c0 10-8 18-18 18s-18-8-18-18 8-18 18-18c2 0 4 .3 6 1V37c-2-.3-4-.5-6-.5-14 0-25 11-25 25s11 25 25 25 25-11 25-25V32c6 4 13 6 21 6v-9c-7-1-13-5-16-12z" fill="#FFFFFF"/>
  </svg>`,
  'capcut': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0A0A0A"/><path d="M30 32l40 36H30zm40 0L30 68h40z" fill="#FFFFFF"/></svg>`,

  // Streaming & Media
  'netflix': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#141414"/><path d="M32 20h12v60H32z" fill="#E50914"/><path d="M56 20h12v60H56z" fill="#E50914"/><path d="M32 20h12l24 60H56z" fill="#B81D24"/></svg>`,
  'spotify': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#1ED760"/><path d="M72 45c-15-4-35-3-47 4-2.5 1.5-3 4.5-1.5 7 1.5 2.5 4.5 3 7 1.5 10-5 27-6 40-2.5 3 .8 6-1 6.8-4 .8-3-1-6-4.3-6.8zm-2 11c-13-3.5-30-2.5-41 3.5-2 1.3-2.6 4-1.3 6 1.3 2 4 2.6 6 1.3 9-4.5 23-5.5 34-2.5 2.5.6 5-1 5.6-3.5.7-2.3-1-4.8-3.3-5.3zm-2 11.5c-11-2.5-25-1.5-34 3.5-1.8 1-2.3 3.3-1.3 5 1 1.8 3.3 2.3 5 1.3 7-3.5 19-4.3 28-2 2 .5 4-.8 4.5-2.8.5-2-.8-4-2.8-4.5z" fill="#121212"/></svg>`,
  'vlc': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#FF8800"/><path d="M44 22h12l4 18h-20zM36 46h28l5 14h-38zM24 66h52l4 12H20z" fill="#FFF"/><circle cx="50" cy="18" r="4" fill="#FFF"/></svg>`,
  'mx-player': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0284C7"/><polygon points="40,32 40,68 70,50" fill="#FFF"/></svg>`,

  // Games
  'subway-surfers': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gss" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FACC15"/><stop offset="100%" stop-color="#EA580C"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#gss)"/><text x="50" y="68" font-family="'Arial Black',sans-serif" font-size="52" font-weight="900" fill="#FFF" text-anchor="middle" stroke="#1E293B" stroke-width="4">S</text></svg>`,
  'clash-of-clans': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gcoc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#7F1D1D"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#gcoc)"/><circle cx="50" cy="50" r="26" fill="#FBBF24"/><path d="M30 46h40l-20 28z" fill="#F59E0B"/><circle cx="42" cy="46" r="3.5" fill="#000"/><circle cx="58" cy="46" r="3.5" fill="#000"/><path d="M36 58c7 5 21 5 28 0" stroke="#78350F" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`,
  'clash-royale': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#2563EB"/><path d="M26 38l12 14 12-18 12 18 12-14v28H26z" fill="#F59E0B"/><circle cx="26" cy="36" r="4" fill="#EF4444"/><circle cx="50" cy="32" r="5" fill="#3B82F6"/><circle cx="74" cy="36" r="4" fill="#EF4444"/></svg>`,
  'brawl-stars': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#F59E0B"/><circle cx="50" cy="50" r="28" fill="#1E293B"/><polygon points="50,28 56,42 70,44 60,54 62,68 50,62 38,68 40,54 30,44 44,42" fill="#FBBF24"/></svg>`,
  'temple-run': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#78350F"/><rect x="25" y="25" width="50" height="50" rx="8" fill="#D97706"/><circle cx="40" cy="44" r="5" fill="#78350F"/><circle cx="60" cy="44" r="5" fill="#78350F"/><rect x="36" y="58" width="28" height="8" rx="2" fill="#78350F"/></svg>`,
  'candy-crush-saga': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#EC4899"/><circle cx="50" cy="50" r="28" fill="#EF4444"/><path d="M26 40c12 16 36 16 48 0" stroke="#FFF" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`,
  'pubg-mobile': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#1E293B"/><path d="M30 46a20 20 0 0 1 40 0v16H30z" fill="#475569"/><rect x="26" y="60" width="48" height="6" rx="2" fill="#F59E0B"/><line x1="38" y1="52" x2="62" y2="52" stroke="#000" stroke-width="4"/></svg>`,
  'free-fire': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#EA580C"/><path d="M50 20c8 12 18 20 18 34 0 14-10 24-24 24s-20-10-20-22c0-8 6-16 12-22 0 6 4 10 8 10 3 0 6-4 6-14z" fill="#FEF08A"/></svg>`,
  'gta-san-andreas': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0F172A"/><text x="50" y="64" font-family="'Impact',sans-serif" font-size="34" font-weight="bold" fill="#F59E0B" text-anchor="middle" letter-spacing="2">GTA</text></svg>`,
  'among-us': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#DC2626"/><path d="M36 28c-10 0-14 8-14 24v22h8V64h14v10h8V52c0-16-4-24-16-24z" fill="#991B1B"/><rect x="36" y="38" width="28" height="14" rx="7" fill="#67E8F9" stroke="#000" stroke-width="3"/></svg>`,
  'roblox': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#18181B"/><rect x="28" y="28" width="44" height="44" rx="10" transform="rotate(15 50 50)" fill="#E4E4E7"/><rect x="42" y="42" width="16" height="16" rx="4" transform="rotate(15 50 50)" fill="#18181B"/></svg>`,
  'minecraft': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#78350F"/><rect x="20" y="20" width="60" height="24" fill="#16A34A"/><path d="M20 44l8 6 8-6 8 6 8-6 8 6 8-6 8 6v-6H20z" fill="#16A34A"/></svg>`,

  // Top Games & Apps added
  'antennapod': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g_apod" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0E7490"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g_apod)"/>
    <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
    <path d="M50 30v-8M46 60l-12 24M54 60l12 24" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 35a26 26 0 0 1 40 0M22 25a38 38 0 0 1 56 0" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.9"/>
    <circle cx="50" cy="20" r="4" fill="#38BDF8"/>
  </svg>`,
  'signal': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#2C6BED"/><path d="M50 20c-17.7 0-32 13.9-32 31 0 5.9 1.7 11.4 4.7 16L20 82l16.1-2.6A32 32 0 0 0 50 82c17.7 0 32-13.9 32-31s-14.3-31-32-31z" fill="#FFF"/></svg>`,
  'signal-private-messenger': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#2C6BED"/><path d="M50 20c-17.7 0-32 13.9-32 31 0 5.9 1.7 11.4 4.7 16L20 82l16.1-2.6A32 32 0 0 0 50 82c17.7 0 32-13.9 32-31s-14.3-31-32-31z" fill="#FFF"/></svg>`,
  'grid-autosport': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g_grid" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#991B1B"/><stop offset="100%" stop-color="#EF4444"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g_grid)"/>
    <rect x="20" y="24" width="60" height="52" rx="8" fill="#18181B"/>
    <text x="50" y="52" font-family="'Impact',sans-serif" font-size="21" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">GRID</text>
    <text x="50" y="66" font-family="sans-serif" font-size="7.5" font-weight="900" fill="#EF4444" text-anchor="middle" letter-spacing="2">AUTOSPORT</text>
  </svg>`,
  'bike-race-motorcycle-games': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g_br" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#EA580C"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g_br)"/>
    <circle cx="34" cy="65" r="14" fill="none" stroke="#1E293B" stroke-width="5"/>
    <circle cx="70" cy="65" r="14" fill="none" stroke="#1E293B" stroke-width="5"/>
    <circle cx="34" cy="65" r="5" fill="#F8FAFC"/>
    <circle cx="70" cy="65" r="5" fill="#F8FAFC"/>
    <path d="M34 65l18-18 12 10 6-18h12M52 47l18 18" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="68" cy="28" r="7" fill="#FDE047"/>
  </svg>`,
  'drag-racing-classic': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g_dr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g_dr)"/>
    <path d="M18 64l12-18h40l14 18z" fill="#EF4444"/>
    <rect x="34" y="48" width="22" height="10" rx="2" fill="#93C5FD"/>
    <circle cx="32" cy="66" r="9" fill="#18181B" stroke="#FDE047" stroke-width="3"/>
    <circle cx="72" cy="66" r="9" fill="#18181B" stroke="#FDE047" stroke-width="3"/>
    <path d="M12 58h14M16 52h8" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  'rainbow-six-mobile': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#0F172A"/>
    <path d="M50 18l26 9v24c0 16-11 30-26 33-15-3-26-17-26-33V27l26-9z" fill="#1E293B" stroke="#E2E8F0" stroke-width="2"/>
    <text x="50" y="62" font-family="'Impact',sans-serif" font-size="38" font-weight="900" fill="#F59E0B" text-anchor="middle">6</text>
    <path d="M40 70h20" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  'delta-force-mobile': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g_df" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284C7"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g_df)"/>
    <polygon points="50,22 76,74 24,74" fill="none" stroke="#38BDF8" stroke-width="6" stroke-linejoin="round"/>
    <polygon points="50,38 66,70 34,70" fill="#38BDF8"/>
    <line x1="50" y1="20" x2="50" y2="80" stroke="#FBBF24" stroke-width="3" opacity="0.8"/>
  </svg>`,
  'delta-force-3d': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g_df3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284C7"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#g_df3)"/><polygon points="50,22 76,74 24,74" fill="none" stroke="#38BDF8" stroke-width="6" stroke-linejoin="round"/><polygon points="50,38 66,70 34,70" fill="#38BDF8"/></svg>`,
  'delta-force-hd': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g_dfh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284C7"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#g_dfh)"/><polygon points="50,22 76,74 24,74" fill="none" stroke="#38BDF8" stroke-width="6" stroke-linejoin="round"/><polygon points="50,38 66,70 34,70" fill="#38BDF8"/></svg>`,
  'delta-force-pro': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g_dfp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284C7"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#g_dfp)"/><polygon points="50,22 76,74 24,74" fill="none" stroke="#38BDF8" stroke-width="6" stroke-linejoin="round"/><polygon points="50,38 66,70 34,70" fill="#38BDF8"/></svg>`,
  'valorant-mobile': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill="#0F141C"/>
    <path d="M32 26l18 36-9 12-19-38 10-10z" fill="#FF4655"/>
    <path d="M68 26l-18 36 9 12 19-38-10-10z" fill="#FFFFFF"/>
  </svg>`,
  'arena-breakout': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g_ab" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#78350F"/><stop offset="100%" stop-color="#1E293B"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g_ab)"/>
    <polygon points="50,22 74,38 66,72 50,80 34,72 26,38" fill="#F59E0B" stroke="#FDE68A" stroke-width="3"/>
    <circle cx="50" cy="50" r="14" fill="#1E293B"/>
    <polygon points="50,42 56,58 44,58" fill="#F59E0B"/>
  </svg>`,
  'lost-light': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g_ll" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#7F1D1D"/></linearGradient></defs>
    <rect width="100" height="100" rx="22" fill="url(#g_ll)"/>
    <circle cx="50" cy="50" r="26" fill="none" stroke="#FFFFFF" stroke-width="4.5"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#FBBF24" stroke-width="3"/>
    <line x1="50" y1="18" x2="50" y2="82" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="18" y1="50" x2="82" y2="50" stroke="#FFFFFF" stroke-width="3"/>
    <circle cx="50" cy="50" r="4" fill="#EF4444"/>
  </svg>`
};

// 2. Beautiful themes and category vector icons for ALL remaining/catalog apps
const THEMES = {
  games: {
    bg: ['#6366F1', '#4338CA'],
    svg: `<path d="M30 46h40c4 0 7 3 7 7v10c0 4-3 7-7 7l-6-4H36l-6 4c-4 0-7-3-7-7V53c0-4 3-7 7-7z" fill="#FFF" opacity="0.95"/>
          <path d="M35 53v10M30 58h10" stroke="#4338CA" stroke-width="3" stroke-linecap="round"/>
          <circle cx="63" cy="55" r="2.5" fill="#EF4444"/>
          <circle cx="69" cy="61" r="2.5" fill="#F59E0B"/>`
  },
  action: {
    bg: ['#DC2626', '#991B1B'],
    svg: `<circle cx="50" cy="50" r="24" fill="none" stroke="#FFF" stroke-width="5"/>
          <circle cx="50" cy="50" r="10" fill="none" stroke="#FDE047" stroke-width="3"/>
          <line x1="50" y1="20" x2="50" y2="80" stroke="#FFF" stroke-width="3"/>
          <line x1="20" y1="50" x2="80" y2="50" stroke="#FFF" stroke-width="3"/>`
  },
  racing: {
    bg: ['#EA580C', '#9A3412'],
    svg: `<circle cx="50" cy="52" r="24" fill="none" stroke="#FFF" stroke-width="6"/>
          <path d="M50 34v18l12 12" stroke="#FDE047" stroke-width="4" stroke-linecap="round"/>
          <circle cx="50" cy="52" r="4" fill="#FFF"/>`
  },
  video: {
    bg: ['#E11D48', '#9F1239'],
    svg: `<rect x="26" y="32" width="48" height="36" rx="6" fill="#FFF" opacity="0.95"/>
          <polygon points="45,43 45,57 59,50" fill="#BE123C"/>`
  },
  music: {
    bg: ['#0891B2', '#0E7490'],
    svg: `<path d="M40 32v26a8 8 0 1 1-6-4h6V32h24v22a8 8 0 1 1-6-4V32z" fill="#FFF"/>`
  },
  photography: {
    bg: ['#0284C7', '#0369A1'],
    svg: `<rect x="25" y="32" width="50" height="38" rx="6" fill="#FFF" opacity="0.95"/>
          <circle cx="50" cy="51" r="12" fill="#0284C7"/>
          <circle cx="65" cy="38" r="3" fill="#38BDF8"/>`
  },
  communication: {
    bg: ['#2563EB', '#1D4ED8'],
    svg: `<path d="M26 34h48a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H44l-12 8v-8h-6a6 6 0 0 1-6-6V40a6 6 0 0 1 6-6z" fill="#FFF"/>
          <circle cx="40" cy="51" r="3" fill="#2563EB"/>
          <circle cx="50" cy="51" r="3" fill="#2563EB"/>
          <circle cx="60" cy="51" r="3" fill="#2563EB"/>`
  },
  security: {
    bg: ['#0D9488', '#115E59'],
    svg: `<path d="M50 24L30 32v20c0 14 8.5 25 20 28 11.5-3 20-14 20-28V32L50 24z" fill="#FFF"/>
          <path d="M43 51l5 5 10-10" stroke="#0D9488" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
  },
  tools: {
    bg: ['#475569', '#1E293B'],
    svg: `<circle cx="50" cy="50" r="18" fill="none" stroke="#FFF" stroke-width="6"/>
          <circle cx="50" cy="50" r="7" fill="#FFF"/>
          <path d="M50 22v8M50 70v8M22 50h8M70 50h8" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>`
  },
  productivity: {
    bg: ['#7C3AED', '#5B21B6'],
    svg: `<rect x="30" y="26" width="40" height="50" rx="5" fill="#FFF"/>
          <line x1="38" y1="38" x2="62" y2="38" stroke="#7C3AED" stroke-width="3" stroke-linecap="round"/>
          <line x1="38" y1="48" x2="62" y2="48" stroke="#7C3AED" stroke-width="3" stroke-linecap="round"/>
          <line x1="38" y1="58" x2="52" y2="58" stroke="#7C3AED" stroke-width="3" stroke-linecap="round"/>`
  },
  shopping: {
    bg: ['#F59E0B', '#B45309'],
    svg: `<path d="M32 38h36l-4 32H36z" fill="#FFF"/>
          <path d="M40 38v-8a10 10 0 0 1 20 0v8" stroke="#FFF" stroke-width="4" stroke-linecap="round" fill="none"/>`
  },
  finance: {
    bg: ['#059669', '#064E3B'],
    svg: `<rect x="25" y="32" width="50" height="36" rx="6" fill="#FFF"/>
          <line x1="25" y1="42" x2="75" y2="42" stroke="#059669" stroke-width="5"/>
          <circle cx="36" cy="56" r="4" fill="#FBBF24"/>`
  }
};

const VIBRANT_PALETTES = [
  ['#2563EB', '#1D4ED8'], ['#059669', '#047857'], ['#7C3AED', '#5B21B6'], ['#DC2626', '#991B1B'],
  ['#EA580C', '#C2410C'], ['#0891B2', '#0E7490'], ['#D97706', '#B45309'], ['#DB2777', '#BE185D'],
  ['#4F46E5', '#3730A3'], ['#10B981', '#059669'], ['#6366F1', '#4338CA'], ['#E11D48', '#BE123C'],
  ['#0284C7', '#0369A1'], ['#8B5CF6', '#6D28D9'], ['#14B8A6', '#0F766E'], ['#F97316', '#EA580C']
];

function classifyTheme(slug, appData) {
  const s = slug.toLowerCase();
  if (appData?.app_type === 'game' || appData?.cat_slug?.includes('game') || appData?.cat_slug?.includes('rpg') || appData?.cat_slug?.includes('action') || appData?.cat_slug?.includes('racing')) {
    if (appData?.cat_slug === 'racing-games' || s.includes('race') || s.includes('drift') || s.includes('speed') || s.includes('drive') || s.includes('car') || s.includes('auto') || s.includes('grid')) return 'racing';
    if (appData?.cat_slug === 'action-games' || s.includes('action') || s.includes('strike') || s.includes('fight') || s.includes('battle') || s.includes('force') || s.includes('six') || s.includes('light') || s.includes('breakout') || s.includes('valorant') || s.includes('sniper')) return 'action';
    return 'games';
  }
  if (appData?.cat_slug === 'music-audio' || s.includes('music') || s.includes('audio') || s.includes('sound') || s.includes('mp3') || s.includes('beat') || s.includes('pod')) return 'music';
  if (appData?.cat_slug === 'photography' || s.includes('photo') || s.includes('cam') || s.includes('pic') || s.includes('image') || s.includes('edit')) return 'photography';
  if (appData?.cat_slug === 'video-players-editors' || s.includes('video') || s.includes('player') || s.includes('tv') || s.includes('movie') || s.includes('stream')) return 'video';
  if (appData?.cat_slug === 'communication' || s.includes('chat') || s.includes('talk') || s.includes('mess') || s.includes('call') || s.includes('social') || s.includes('connect')) return 'communication';
  if (appData?.cat_slug === 'security' || s.includes('vpn') || s.includes('guard') || s.includes('lock') || s.includes('safe') || s.includes('shield') || s.includes('protect')) return 'security';
  if (appData?.cat_slug === 'productivity' || s.includes('note') || s.includes('doc') || s.includes('task') || s.includes('office') || s.includes('work')) return 'productivity';
  if (appData?.cat_slug === 'finance' || s.includes('pay') || s.includes('wallet') || s.includes('cash') || s.includes('coin') || s.includes('bank')) return 'finance';
  if (appData?.cat_slug === 'shopping' || s.includes('shop') || s.includes('store') || s.includes('buy') || s.includes('market')) return 'shopping';

  // Fallback slug detection
  if (s.includes('game') || s.includes('clash') || s.includes('brawl') || s.includes('craft') || s.includes('puzzle') || s.includes('arcade')) return 'games';
  if (s.includes('race') || s.includes('car') || s.includes('drive')) return 'racing';
  if (s.includes('action') || s.includes('strike') || s.includes('battle')) return 'action';
  if (s.includes('video') || s.includes('player')) return 'video';
  if (s.includes('music') || s.includes('audio') || s.includes('pod')) return 'music';
  if (s.includes('photo') || s.includes('cam')) return 'photography';
  if (s.includes('chat') || s.includes('call') || s.includes('message')) return 'communication';
  if (s.includes('vpn') || s.includes('guard') || s.includes('shield')) return 'security';
  return 'tools';
}

// In-memory cache for ultra-fast serving
const iconCache = new Map();

export function getRealIconFile(slug) {
  const webpPath = path.join(ICONS_DIR, `${slug}.webp`);
  if (fs.existsSync(webpPath)) return { path: webpPath, type: 'image/webp' };
  const pngPath = path.join(ICONS_DIR, `${slug}.png`);
  if (fs.existsSync(pngPath)) return { path: pngPath, type: 'image/png' };
  return null;
}

export function getAppIcon(slug) {
  if (iconCache.has(slug)) return iconCache.get(slug);

  // 1. Check if real authentic photographic icon exists on disk (from Google Play Store / CDN)
  const realIcon = getRealIconFile(slug);
  if (realIcon) {
    try {
      const b64 = fs.readFileSync(realIcon.path).toString('base64');
      const safeId = slug.replace(/[^a-zA-Z0-9_-]/g, '_');
      const realSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <clipPath id="c_${safeId}">
        <rect width="100" height="100" rx="22"/>
      </clipPath>
    </defs>
    <image width="100" height="100" href="data:${realIcon.type};base64,${b64}" clip-path="url(#c_${safeId})" preserveAspectRatio="xMidYMid slice"/>
  </svg>`;
      iconCache.set(slug, realSvg);
      return realSvg;
    } catch {}
  }

  if (BRAND_ICONS[slug]) {
    iconCache.set(slug, BRAND_ICONS[slug]);
    return BRAND_ICONS[slug];
  }

  // Check prefix matches for brand families
  if (slug.startsWith('google-')) {
    const sub = slug.replace('google-', '');
    if (BRAND_ICONS[sub]) {
      iconCache.set(slug, BRAND_ICONS[sub]);
      return BRAND_ICONS[sub];
    }
  }

  // Database lookup to get real app_type and category
  let appData = null;
  try {
    appData = one(`SELECT a.name, a.app_type, c.slug AS cat_slug FROM apps a JOIN categories c ON c.id=a.category_id WHERE a.slug=?`, slug);
  } catch {}

  const themeKey = classifyTheme(slug, appData);
  const theme = THEMES[themeKey] || THEMES.tools;

  // Select deterministic vibrant gradient from palette
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const palette = VIBRANT_PALETTES[h % VIBRANT_PALETTES.length];

  const letter = ((appData?.name || slug).split(/[\s-_]/)[0] || 'A').slice(0, 1).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g_${slug}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette[0]}"/>
        <stop offset="100%" stop-color="${palette[1]}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#g_${slug})"/>
    <path d="M0 22C0 9.8 9.8 0 22 0h56c12.2 0 22 9.8 22 22v12C70 42 30 38 0 34z" fill="#FFFFFF" opacity="0.15"/>
    ${theme.svg}
    <circle cx="80" cy="80" r="11" fill="#FFFFFF" opacity="0.28"/>
    <text x="80" y="84.5" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle">${letter}</text>
  </svg>`;

  iconCache.set(slug, svg);
  return svg;
}

export function getFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="favCyan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00E5FF"/>
        <stop offset="100%" stop-color="#0088FF"/>
      </linearGradient>
      <linearGradient id="favRed" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF2A4D"/>
        <stop offset="100%" stop-color="#C20A20"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7.5" fill="#0A0E17"/>
    <path d="M 17 8 C 23 9, 27 12, 27 16" fill="none" stroke="#00C8FF" stroke-width="0.8" opacity="0.4" stroke-linecap="round"/>
    <path d="M 18 9 C 23 10, 26 13, 26 16" fill="none" stroke="url(#favRed)" stroke-width="1.2" opacity="0.3" stroke-linecap="round"/>
    <path d="M 6 22.5 L 9.3 10 L 11.7 10 L 15 22.5 L 12.6 22.5 L 12 19.8 L 9 19.8 L 8.4 22.5 Z M 9.5 17.6 L 11.5 17.6 L 10.5 13.2 Z" fill="url(#favCyan)"/>
    <path d="M 14.2 22.5 L 14.2 10 L 18.5 10 C 20.6 10, 22 11.4, 22 13.5 C 22 15.6, 20.6 17, 18.5 17 L 16.5 17 L 16.5 22.5 Z M 16.5 15 L 18.2 15 C 19.3 15, 20 14.4, 20 13.5 C 20 12.6, 19.3 12, 18.2 12 L 16.5 12 Z" fill="url(#favCyan)"/>
    <path d="M 21.2 22.5 L 21.2 10 L 23.5 10 L 23.5 15.3 L 26.6 10 L 29.5 10 L 25.8 15.8 L 29.8 22.5 L 26.9 22.5 L 23.8 17.2 L 23.5 17.8 L 23.5 22.5 Z" fill="url(#favCyan)"/>
    <path d="M 16 7.5 C 10 7.5, 5 10, 5 15 C 5 20.5, 11 26.5, 23 27.5 C 26.5 27.8, 29.5 26.5, 30 25 C 30 24.5, 29.5 24.5, 29 24.8 C 27 25.6, 24 26, 21 25.8 C 10.5 24.8, 6.2 19.2, 6.2 15 C 6.2 11, 10.5 8.5, 16 8.5 Z" fill="#00E5FF"/>
    <path d="M 16.5 8 C 11 8.2, 6.5 11, 6.5 15 C 6.5 19.5, 11.5 25.2, 22 26.3 C 25.5 26.6, 28.5 25.5, 29.5 24.5 C 29 24, 28 24, 26 24.3 C 18 25, 10 21, 8.5 16 C 7.8 13.5, 9 11.5, 11.8 9.5 C 13.2 8.5, 15 8.1, 16.5 8 Z" fill="url(#favRed)"/>
  </svg>`;
}
