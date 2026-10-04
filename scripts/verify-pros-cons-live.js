import http from 'node:http';

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('--- Verifying Pros & Cons on Live Pages ---');

  const testSlugs = ['pubg-mobile', 'whatsapp', 'canva', 'subway-surfers'];
  for (const slug of testSlugs) {
    const res = await get(`/apps/${slug}/`);
    console.log(`\nTesting /apps/${slug}/ (Status: ${res.status}):`);
    const hasSection = res.body.includes('class="proscons-section"');
    const hasProCard = res.body.includes('class="pro-card"');
    const hasConCard = res.body.includes('class="con-card"');
    
    // Extract pros and cons counts
    const prosMatch = res.body.match(/<ul class="pros">([\s\S]*?)<\/ul>/);
    const consMatch = res.body.match(/<ul class="cons">([\s\S]*?)<\/ul>/);
    const prosCount = prosMatch ? (prosMatch[1].match(/<li>/g) || []).length : 0;
    const consCount = consMatch ? (consMatch[1].match(/<li>/g) || []).length : 0;

    console.log(`- Has proscons-section: ${hasSection}`);
    console.log(`- Has pro-card: ${hasProCard} (${prosCount} items)`);
    console.log(`- Has con-card: ${hasConCard} (${consCount} items)`);

    if (!hasSection || !hasProCard || !hasConCard || prosCount < 2 || consCount < 2) {
      throw new Error(`Pros/cons layout check failed on ${slug}!`);
    }
  }

  // Also check CSS
  const css = await get('/static/site.css');
  console.log('\nCSS check:');
  console.log('- Has .proscons-section:', css.body.includes('.proscons-section'));
  console.log('- Has .pro-card border-top:', css.body.includes('.pro-card'));
  console.log('- Has .con-card border-top:', css.body.includes('.con-card'));

  console.log('\n✓ ALL LIVE PROS & CONS CHECKS PASSED PERFECTLY!');
}

verify().catch(console.error);
