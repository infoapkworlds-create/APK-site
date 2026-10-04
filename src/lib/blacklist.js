// Writing-style checker. Flags wording from the house style blacklist and suggests
// plainer alternatives. It is a style aid, not a detector of who wrote the text.

const WORDS = {
  delve: 'look at', tapestry: 'mix', multifaceted: 'varied', nuanced: 'detailed', landscape: 'market / field (or "horizontal" for screens)',
  comprehensive: 'full', pivotal: 'main', crucial: 'important', leverage: 'use', robust: 'reliable', streamline: 'make faster',
  utilize: 'use', facilitate: 'help', endeavor: 'try', paramount: 'most important', aim: 'goal / want', challenges: 'problems',
  complexities: 'details', complexity: 'detail', compel: 'push', compelling: 'convincing', component: 'part', confront: 'face',
  confrontation: 'conflict', deep: 'detailed', deeper: 'more detailed', deeply: 'very', development: 'building / work',
  diverse: 'varied', draw: 'pull / sketch', dynamics: 'how it works', elegant: 'neat', elevate: 'improve', elucidate: 'explain',
  embark: 'start', embody: 'represent', embrace: 'accept', empower: 'let', emulate: 'copy', enact: 'put in place',
  endurance: 'stamina', endure: 'last', engage: 'use / talk to', enhance: 'improve', enlighten: 'inform', entwine: 'link',
  environment: 'setting / system', era: 'period', espouse: 'support', evoke: 'bring to mind', exacerbate: 'worsen',
  exemplify: 'show', exploration: 'look', exploratory: 'early', explore: 'browse / look at', facet: 'part', foster: 'encourage',
  grapple: 'deal with', groundwork: 'basis', harness: 'use', hidden: 'not shown', highlight: 'point out', illuminate: 'explain',
  imperative: 'necessary', importance: 'value', innovate: 'invent', innovation: 'new idea', insight: 'finding', insightful: 'useful',
  inspiration: 'idea', inspire: 'encourage', integrate: 'connect', interplay: 'interaction', intertwine: 'link', intricacies: 'details',
  intricate: 'detailed', jeopardize: 'risk', journey: 'process', kaleidoscope: 'mix', lens: 'view', manifold: 'many',
  meaningful: 'useful', meticulous: 'careful', moreover: 'also', navigate: 'go to / find', nuance: 'detail', offering: 'product / has',
  poignant: 'moving', possibilities: 'options', potent: 'strong', profound: 'big', quest: 'search', quirky: 'odd', realm: 'area',
  reimagine: 'redo', relentless: 'constant', resonance: 'appeal', resonate: 'appeal to', reveal: 'show', reverberate: 'echo',
  revolution: 'big change', revolutionize: 'change', roadmap: 'plan', role: 'job / part', scheme: 'plan', seamless: 'smooth',
  seek: 'look for', shape: 'form', showcase: 'show', significance: 'meaning', straightforward: 'simple', strive: 'try',
  symphony: 'mix', tailor: 'adjust', testament: 'proof', timeless: 'lasting', tireless: 'constant', toolkit: 'tools',
  transcend: 'go beyond', transformative: 'big', underpin: 'support', underscore: 'show', unleash: 'release', unlock: 'open / get',
  unravel: 'solve', vast: 'large', versatile: 'flexible', vibrant: 'bright', vital: 'needed', vitalize: 'refresh', vivid: 'clear',
  weave: 'combine', whimsy: 'fun', advent: 'arrival', akin: 'like', arduous: 'hard', ecommerce: 'online shopping', entail: 'involve',
  entrenched: 'fixed', essential: 'needed', furthermore: 'also', glean: 'learn', grasp: 'understand', hinder: 'slow down',
  integral: 'part of', linchpin: 'main part', plethora: 'many', preemptively: 'in advance', pronged: 'part', unparalleled: 'unusual',
  efficacy: 'how well it works', effectiveness: 'how well it works', refine: 'improve', success: 'result', encapsulate: 'sum up',
  encompass: 'include', capture: 'take / record', approach: 'method / way', essence: 'main point', exclusivity: 'being exclusive',
  adapt: 'adjust', effortlessly: 'easily', significant: 'large / clear', adopt: 'start using', simplify: 'make easier',
  honed: 'practised', arena: 'area', arsenal: 'set', bombard: 'flood', bloated: 'heavy', boost: 'raise', breeze: 'easy',
  buzz: 'interest', cadence: 'rhythm', catapult: 'push', cornerstone: 'basis', convey: 'say', craft: 'make / write',
  crafting: 'making', despair: 'hopelessness', determining: 'deciding', dive: 'look', diverge: 'differ', drowning: 'overwhelmed',
  employ: 'use', entrusting: 'giving', fantastic: 'very good', formidable: 'strong', gaslight: 'mislead', gold: 'valuable',
  magic: 'trick', marvelous: 'very good', nail: 'get right', nimble: 'quick', nugget: 'fact', nutshell: 'short version',
  punchline: 'point', raves: 'praise', sifting: 'sorting', skyrocket: 'rise fast', stall: 'stop', stellar: 'excellent',
  supercharge: 'speed up', surge: 'rise', tackle: 'deal with', tap: 'press / select', tightrope: 'balance', trailblazer: 'pioneer',
  turbocharge: 'speed up', uncover: 'find', unveil: 'announce', void: 'gap', wedge: 'gap', whip: 'make quickly', buzzword: 'jargon',
  // transitions (flag; use sparingly)
  accordingly: 'so', additionally: 'also', arguably: '(drop it)', certainly: '(drop it)', consequently: 'so', hence: 'so',
  however: 'but', indeed: '(drop it)', nevertheless: 'still', nonetheless: 'still', notwithstanding: 'even with', thus: 'so',
  undoubtedly: '(drop it)', firstly: 'first', therefore: 'so', specifically: '(rephrase)', generally: 'usually', importantly: '(drop it)',
  alternatively: 'or', notably: '(drop it)', despite: 'even with', essentially: '(drop it)', ultimately: 'in the end',
  promptly: 'quickly', subsequently: 'then',
};

const PHRASES = [
  "it's worth noting", 'it is worth noting', "it's important to note", 'it is important to note', 'it is important to understand',
  "in today's digital", "in today's world", "in today's rapidly", 'in the realm of', 'in the world of', 'in the era of',
  "in today's era", "in today's modern age", 'it goes without saying', 'at the end of the day', 'one might argue',
  'when it comes to', 'on the other hand', 'on the contrary', 'in conclusion', 'in summary', 'to summarize', 'to put it simply',
  'as previously mentioned', 'as mentioned earlier', 'remember that', 'given that', 'even though', 'as a professional',
  "it's essential to", 'it is essential to', 'there are a few considerations', 'all that you need to know',
  'everything you need to know', 'everything that you need to know', 'what you need to know', 'at its core', 'simply put',
  'in a world where', 'welcome to the world', 'deep dive', 'dive into', 'delve into', 'unlock the secrets', 'unveil the secrets',
  'game changer', 'game-changer', 'cutting-edge', 'cutting edge', 'ground-breaking', 'groundbreaking', 'record-breaking',
  'ever-changing', 'ever-evolving', 'designed to', 'sheer size', 'in a sea of', 'valuable insights', 'significant impact',
  'significant role', 'play a crucial role', 'highlights the importance', 'a testament to', 'stands as', 'in the context of',
  'about the potential', 'foster innovation', 'drive engagement', 'harness the power', 'navigate the complexities',
  'unlock the potential', 'elevate your', 'empower individuals', 'resonate with', 'shed light on', 'continuous improvement',
  'solution development', 'strategic alignment', 'operational excellence', 'organizational efficiency', 'digital age',
  'digital world', 'fast-paced', 'powerful tool', 'break the bank', 'brain dump', 'elephant in the room', 'ever wondered',
  'grab attention', 'hard truth', 'mind blowing', 'mind-blowing', 'miss the mark', 'moves the needle', 'perfect storm',
  'quiet acceptance', 'real deal', 'sneak peek', 'stay tuned', 'scream into the void', 'chaos into clarity', 'fine-tune',
  'fine tune', 'ai-powered', 'ai-driven', 'ai technology', 'ai-first', '100% safe', 'virus free', 'virus-free', 'guaranteed safe',
  'click here', 'read more', 'learn more',
];

const SUFFIX = '(?:s|es|ed|d|ing|ly|er|ers|est|ment|ments)?';
const wordRes = Object.entries(WORDS).map(([w, s]) => [w, s, new RegExp(`\\b${w.replace(/-/g, '[- ]?')}${SUFFIX}\\b`, 'gi')]);
const phraseRes = PHRASES.map((p) => [p, new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]").replace(/ /g, '\\s+'), 'gi')]);
// "Not only ... but also" pattern
const notOnly = /\bnot only\b[^.]{0,80}\bbut also\b/gi;

const DEFAULT_PROTECTED = ['app drawer', 'Enhanced Tracking Protection', 'fingerprint unlock', 'face unlock', 'screen unlock'];

/**
 * @param {string} text plain text
 * @param {string[]} protectedTerms proper names that must not be flagged (app, developer, brand names)
 */
export function checkText(text, protectedTerms = []) {
  let t = String(text || '');
  const allProtected = [...DEFAULT_PROTECTED, ...protectedTerms.filter(Boolean)];
  // Blank out protected names so their letters can't match.
  for (const p of allProtected.sort((a, b) => b.length - a.length)) {
    t = t.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), (m) => ' '.repeat(m.length));
  }
  const hits = [];
  const ctx = (i, len) => text.slice(Math.max(0, i - 40), i + len + 40).replace(/\s+/g, ' ').trim();
  for (const [w, s, re] of wordRes) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(t))) hits.push({ term: m[0], base: w, suggestion: s, context: ctx(m.index, m[0].length) });
  }
  for (const [p, re] of phraseRes) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(t))) hits.push({ term: m[0], base: p, suggestion: 'rephrase in plain words', context: ctx(m.index, m[0].length) });
  }
  notOnly.lastIndex = 0; let m;
  while ((m = notOnly.exec(t))) hits.push({ term: 'not only … but also', base: 'not only … but also', suggestion: 'split into two plain statements', context: ctx(m.index, m[0].length) });
  return hits;
}

export function htmlToText(h) {
  return String(h || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(code|pre)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
}
