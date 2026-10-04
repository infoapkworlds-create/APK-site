import { all } from '../src/db.js';

console.log('Apps published_at by month:');
console.table(all(`SELECT substr(published_at, 1, 7) as month, count(*) as count FROM apps GROUP BY month ORDER BY month`));

console.log('Apps updated_at by month:');
console.table(all(`SELECT substr(updated_at, 1, 7) as month, count(*) as count FROM apps GROUP BY month ORDER BY month`));

console.log('Guides published_at by month:');
console.table(all(`SELECT substr(published_at, 1, 7) as month, count(*) as count FROM guides GROUP BY month ORDER BY month`));

console.log('Reviews created_at by month:');
console.table(all(`SELECT substr(created_at, 1, 7) as month, count(*) as count FROM reviews GROUP BY month ORDER BY month`));

console.log('Developers created_at by month:');
console.table(all(`SELECT substr(created_at, 1, 7) as month, count(*) as count FROM developers GROUP BY month ORDER BY month`));

console.log('Versions released_on by month:');
console.table(all(`SELECT substr(released_on, 1, 7) as month, count(*) as count FROM versions GROUP BY month ORDER BY month`));

console.log('Reviews count:', all(`SELECT count(*) as c FROM reviews WHERE status='approved'`)[0].c);
