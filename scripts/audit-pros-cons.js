import { one, all } from '../src/db.js';

console.log('--- Checking Pros/Cons item counts across all 10,000 apps ---');

const apps = all('SELECT id, slug, name, pros_json, cons_json FROM apps');
let shortPros = 0;
let shortCons = 0;

for (const a of apps) {
  let pros = [];
  let cons = [];
  try { pros = JSON.parse(a.pros_json || '[]'); } catch {}
  try { cons = JSON.parse(a.cons_json || '[]'); } catch {}

  if (pros.length < 2) shortPros++;
  if (cons.length < 2) shortCons++;
}

console.log(`Apps with < 2 pros: ${shortPros}`);
console.log(`Apps with < 2 cons: ${shortCons}`);
