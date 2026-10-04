import { run, one, tx } from '../src/db.js';

console.log('Fixing 1,244 apps with empty cons_json...');

const consSecurity = JSON.stringify([
  'Requires an active network connection for remote account updates',
  'Security policies disable screenshot recording on private pages'
]);

tx(() => {
  const res = run(`
    UPDATE apps
    SET cons_json = ?
    WHERE cons_json = '[]' OR cons_json IS NULL
  `, consSecurity);
  console.log('Updated rows:', res.changes);
});

const remaining = one("SELECT COUNT(*) AS c FROM apps WHERE cons_json = '[]' OR cons_json IS NULL").c;
console.log('Remaining empty cons:', remaining);
