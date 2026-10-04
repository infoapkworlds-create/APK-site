import fs from 'node:fs';

const csvPath = 'C:/Users/NDCOM/.gemini/antigravity/brain/6efd12e0-024d-422a-92f5-e429a281d1a5/.system_generated/steps/277/content.md';
const lines = fs.readFileSync(csvPath, 'utf8').split('\n').slice(9).filter(l => l.trim().length > 0);

const apps = new Map();
lines.forEach(r => {
  const parts = r.split(',');
  const name = parts[1] ? parts[1].trim() : '';
  const kw = parts[2] ? parts[2].trim() : '';
  const slug = parts[5] ? parts[5].trim() : '';
  if (!name) return;
  if (!apps.has(name)) {
    apps.set(name, {
      name,
      slug: slug.replace(/-apk-download$/, '').replace(/-apk$/, ''),
      keywords: new Set(),
    });
  }
  const entry = apps.get(name);
  if (kw) entry.keywords.add(kw);
});

console.log('Total unique apps in sheet:', apps.size);

function categorize(name) {
  const n = name.toLowerCase();
  if (n.includes('pubg') || n.includes('fire') || n.includes('duty') || n.includes('warzone') || n.includes('strike') || n.includes('sniper') || n.includes('combat') || n.includes('shadow fight') || n.includes('dead trigger') || n.includes('gta') || n.includes('payback') || n.includes('gangstar') || n.includes('standoff') || n.includes('pixel gun') || n.includes('hitman') || n.includes('farlight') || n.includes('left to survive') || n.includes('arena breakout') || n.includes('delta force') || n.includes('rainbow six')) return 'action-games';
  if (n.includes('racing') || n.includes('asphalt') || n.includes('speed') || n.includes('drift') || n.includes('traffic') || n.includes('driving') || n.includes('csr') || n.includes('grid')) return 'racing-games';
  if (n.includes('subway') || n.includes('temple run') || n.includes('candy crush') || n.includes('ludo') || n.includes('angry birds') || n.includes('fruit ninja') || n.includes('hill climb') || n.includes('geometry dash') || n.includes('vector') || n.includes('8 ball pool') || n.includes('carrom') || n.includes('monopoly') || n.includes('plants vs zombies') || n.includes('stickman') || n.includes('badland') || n.includes('crossy') || n.includes('pac man') || n.includes('helix') || n.includes('stack ball') || n.includes('talking tom') || n.includes('doodle jump') || n.includes('pou') || n.includes('cut the rope') || n.includes('sonic')) return 'casual-arcade-games';
  if (n.includes('clash') || n.includes('brawl') || n.includes('roblox') || n.includes('minecraft') || n.includes('pokemon') || n.includes('genshin') || n.includes('honkai') || n.includes('mobile legends') || n.includes('league of legends') || n.includes('arena of valor') || n.includes('simcity') || n.includes('township') || n.includes('gardenscapes') || n.includes('homescapes') || n.includes('fishdom') || n.includes('mortal kombat') || n.includes('injustice') || n.includes('marvel') || n.includes('dragon ball') || n.includes('rush royale') || n.includes('rise of kingdoms') || n.includes('state of survival') || n.includes('evony') || n.includes('lords mobile') || n.includes('mafia city') || n.includes('whiteout') || n.includes('monster hunter') || n.includes('warcraft') || n.includes('dead by daylight') || n.includes('identity v') || n.includes('lifeafter') || n.includes('hay day') || n.includes('boom beach')) return 'strategy-rpg-games';
  if (n.includes('fifa') || n.includes('efootball') || n.includes('dream league') || n.includes('score hero') || n.includes('mario kart')) return 'sports-games';
  if (n.includes('photo') || n.includes('camera') || n.includes('vsco') || n.includes('remini') || n.includes('snapseed') || n.includes('picsart') || n.includes('canva') || n.includes('lightroom') || n.includes('beauty') || n.includes('b612') || n.includes('retrica') || n.includes('airbrush') || n.includes('pixelcut') || n.includes('paint') || n.includes('pixellab') || n.includes('sketchbook') || n.includes('faceapp') || n.includes('toonme')) return 'photography';
  if (n.includes('capcut') || n.includes('kinemaster') || n.includes('alight motion') || n.includes('inshot') || n.includes('powerdirector') || n.includes('vivacut') || n.includes('filmora') || n.includes('actiondirector') || n.includes('vn video') || n.includes('youtube') || n.includes('netflix') || n.includes('disney') || n.includes('prime video') || n.includes('hulu') || n.includes('hbo') || n.includes('crunchyroll') || n.includes('hotstar') || n.includes('zee5') || n.includes('jiocinema') || n.includes('sonyliv') || n.includes('mx player') || n.includes('vlc') || n.includes('kmplayer') || n.includes('stremio') || n.includes('beetv') || n.includes('kodi') || n.includes('teatv') || n.includes('nova video') || n.includes('just player')) return 'video-players-editors';
  if (n.includes('spotify') || n.includes('music') || n.includes('soundcloud') || n.includes('shazam') || n.includes('deezer') || n.includes('tidal') || n.includes('audiomack') || n.includes('resso') || n.includes('gaana') || n.includes('jiosaavn') || n.includes('wynk') || n.includes('antennapod')) return 'music-audio';
  if (n.includes('whatsapp') || n.includes('telegram') || n.includes('signal') || n.includes('viber') || n.includes('wechat') || n.includes('skype') || n.includes('imo') || n.includes('truecaller') || n.includes('line') || n.includes('zalo') || n.includes('botim') || n.includes('kik') || n.includes('textnow') || n.includes('2ndline') || n.includes('talkatone') || n.includes('hushed') || n.includes('dingtone') || n.includes('tango') || n.includes('michat')) return 'communication';
  if (n.includes('instagram') || n.includes('facebook') || n.includes('threads') || n.includes('snapchat') || n.includes('tiktok') || n.includes('twitter') || n.includes('discord') || n.includes('pinterest') || n.includes('reddit') || n.includes('linkedin') || n.includes('tumblr') || n.includes('vk') || n.includes('badoo') || n.includes('tinder') || n.includes('bumble') || n.includes('hinge') || n.includes('bigo') || n.includes('litmatch') || n.includes('omegle') || n.includes('mico') || n.includes('azar') || n.includes('livu')) return 'social';
  if (n.includes('drive') || n.includes('docs') || n.includes('sheets') || n.includes('slides') || n.includes('notion') || n.includes('evernote') || n.includes('obsidian') || n.includes('office') || n.includes('word') || n.includes('excel') || n.includes('powerpoint') || n.includes('camscanner') || n.includes('acrobat') || n.includes('keep') || n.includes('joplin') || n.includes('ticktick') || n.includes('todoist') || n.includes('any do') || n.includes('notes') || n.includes('goodnotes') || n.includes('forest')) return 'productivity';
  if (n.includes('duolingo') || n.includes('photomath') || n.includes('brainly') || n.includes('quizlet') || n.includes('classroom') || n.includes('grammarly') || n.includes('deepl') || n.includes('translate') || n.includes('khan academy') || n.includes('coursera') || n.includes('udemy') || n.includes('ankidroid')) return 'education';
  if (n.includes('paypal') || n.includes('cash app') || n.includes('binance') || n.includes('trust wallet') || n.includes('metamask') || n.includes('pay') || n.includes('coinbase') || n.includes('kraken') || n.includes('okx') || n.includes('bybit') || n.includes('kucoin') || n.includes('easypaisa') || n.includes('jazzcash') || n.includes('sadapay') || n.includes('nayapay') || n.includes('revolut') || n.includes('wise') || n.includes('venmo') || n.includes('chime') || n.includes('crypto') || n.includes('exodus') || n.includes('bitget')) return 'finance';
  if (n.includes('amazon') || n.includes('aliexpress') || n.includes('shein') || n.includes('temu') || n.includes('shopee') || n.includes('lazada') || n.includes('ebay') || n.includes('flipkart') || n.includes('daraz') || n.includes('walmart') || n.includes('target') || n.includes('alibaba') || n.includes('taobao') || n.includes('olx')) return 'shopping';
  return 'tools';
}

const breakdown = {};
for (const [name, app] of apps) {
  const cat = categorize(name);
  breakdown[cat] = (breakdown[cat] || 0) + 1;
}

console.log('Category breakdown:\n', breakdown);
