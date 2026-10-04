import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/site.db');

const catMap = {};
db.prepare('SELECT id, slug FROM categories').all().forEach(c => { catMap[c.slug] = c.id; });

const RECLASSIFICATIONS = [
  // 1. Misplaced in action-games
  { slug: 'firefox', to: 'tools' },
  { slug: 'firefox-nightly', to: 'tools' },
  { slug: 'firefox-focus', to: 'security' },

  // 2. Misplaced in racing-games
  { slug: 'speedtest-by-ookla', to: 'tools' },
  { slug: 'fast-speed-test', to: 'tools' },

  // 3. Misplaced in shopping
  { slug: 'dead-target', to: 'action-games' },

  // 4. Misplaced in sports-games
  { slug: 'mario-kart-tour', to: 'racing-games' },

  // 5. Misplaced in entertainment -> should be music-audio or video-players-editors
  { slug: 'youtube-music', to: 'music-audio' },
  { slug: 'kmplayer', to: 'video-players-editors' },
  { slug: 'nova-video-player', to: 'video-players-editors' },

  // 6. Misplaced in casual or strategy -> should be puzzle
  { slug: 'candy-crush-saga', to: 'puzzle' },
  { slug: 'candy-crush-soda-saga', to: 'puzzle' },
  { slug: 'candy-crush-jelly', to: 'puzzle' },
  { slug: 'gardenscapes', to: 'puzzle' },
  { slug: 'homescapes', to: 'puzzle' },
  { slug: 'fishdom', to: 'puzzle' },
  { slug: 'angry-birds-2', to: 'puzzle' },
  { slug: 'angry-birds-classic', to: 'puzzle' },

  // 7. Misplaced in tools -> Security (Category 12)
  { slug: 'nordvpn', to: 'security' },
  { slug: 'expressvpn', to: 'security' },
  { slug: 'surfshark', to: 'security' },
  { slug: 'cyberghost', to: 'security' },
  { slug: 'supervpn', to: 'security' },
  { slug: 'psiphon-pro', to: 'security' },
  { slug: 'thunder-vpn', to: 'security' },
  { slug: '1111-cloudflare', to: 'security' },
  { slug: 'turbo-vpn', to: 'security' },
  { slug: 'turbo-vpn-lite', to: 'security' },
  { slug: 'tor-browser', to: 'security' },
  { slug: 'duckduckgo', to: 'security' },
  { slug: 'adguard', to: 'security' },
  { slug: 'blokada', to: 'security' },
  { slug: 'netguard', to: 'security' },
  { slug: 'dns-changer', to: 'security' },

  // 8. Misplaced in tools -> Games
  { slug: 'ea-sports-fc-mobile', to: 'sports-games' },
  { slug: 'carx-street', to: 'racing-games' },
  { slug: 'bgmi', to: 'action-games' },
  { slug: 'apex-legends-mobile', to: 'action-games' },
  { slug: 'fortnite', to: 'action-games' },
  { slug: 'into-the-dead-2', to: 'action-games' },
  { slug: 'mini-militia', to: 'action-games' },
  { slug: 'special-forces-group-2', to: 'action-games' },
  { slug: 'critical-ops', to: 'action-games' },
  { slug: 'modern-ops', to: 'action-games' },
  { slug: 'world-war-heroes', to: 'action-games' },
  { slug: 't3-arena', to: 'action-games' },
  { slug: 'brite-fight', to: 'action-games' },
  { slug: 'forward-assault', to: 'action-games' },
  { slug: 'dan-the-man', to: 'casual-arcade-games' },
  { slug: 'jetpack-joyride', to: 'casual-arcade-games' },
  { slug: 'bad-piggies', to: 'casual-arcade-games' },
  { slug: 'my-talking-angela', to: 'casual-arcade-games' },
  { slug: 'dbz-dokkan-battle', to: 'rpg' },
  { slug: 'one-piece-bounty-rush', to: 'rpg' },
  { slug: 'yu-gi-oh-duel-links', to: 'strategy-rpg-games' },

  // 9. Misplaced in tools -> Photography
  { slug: 'facetune', to: 'photography' },
  { slug: 'youcam-perfect', to: 'photography' },
  { slug: 'prisma', to: 'photography' },
  { slug: 'hypic', to: 'photography' },
  { slug: 'epik', to: 'photography' },
  { slug: 'meitu', to: 'photography' },
  { slug: 'lmc-84-gcam', to: 'photography' },
  { slug: 'glitchcam', to: 'photography' },

  // 10. Misplaced in tools -> Communication
  { slug: 'messenger', to: 'communication' },
  { slug: 'messenger-lite', to: 'communication' },
  { slug: 'plus-messenger', to: 'communication' },
  { slug: 'nekogram', to: 'communication' },

  // 11. Misplaced in tools -> Productivity
  { slug: 'microsoft-365-copilot', to: 'productivity' },
  { slug: 'onenote', to: 'productivity' },
  { slug: 'colornote', to: 'productivity' },

  // 12. Misplaced in tools -> Finance
  { slug: 'phonepe', to: 'finance' },

  // 13. Misplaced in tools -> Video streaming
  { slug: 'cinema-hd', to: 'video-players-editors' },
  { slug: 'cyberflix-tv', to: 'video-players-editors' },
  { slug: 'syncler', to: 'video-players-editors' },
  { slug: 'filmplus', to: 'video-players-editors' },
  { slug: 'smarttube-next', to: 'video-players-editors' },
  { slug: 'snaptube', to: 'video-players-editors' },
  { slug: 'vidmate', to: 'video-players-editors' },
  { slug: 'tubemate', to: 'video-players-editors' },

  // 14. Move Business apps to Business (Category 5)
  { slug: 'linkedin', to: 'business' },
  { slug: 'camscanner', to: 'business' },
  { slug: 'adobe-acrobat-reader', to: 'business' },
  { slug: 'slack', to: 'business' }
];

let updatedCount = 0;
for (const item of RECLASSIFICATIONS) {
  const targetCatId = catMap[item.to];
  if (!targetCatId) {
    console.error(`Unknown target category: ${item.to}`);
    continue;
  }
  const res = db.prepare('UPDATE apps SET category_id = ? WHERE slug = ?').run(targetCatId, item.slug);
  if (res.changes > 0) {
    updatedCount += res.changes;
  }
}

console.log(`Successfully reclassified ${updatedCount} apps.`);

const counts = db.prepare('SELECT c.id, c.slug, c.name, count(a.id) as count FROM categories c LEFT JOIN apps a ON a.category_id = c.id GROUP BY c.id ORDER BY count ASC').all();
console.table(counts);
