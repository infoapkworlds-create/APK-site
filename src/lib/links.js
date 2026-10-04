// Internal linking engine. Picks related pages by real relationships
// (category, developer, tags, editorial relations) and caps link counts.
import { listApps, listGuides, getGuide, listComparisons, alternativesFor, comparisonsFor } from './data.js';

const tagSet = (a) => new Set((a.tags || '').split(',').map((t) => t.trim()).filter(Boolean));

export function relatedApps(app, limit = 6) {
  const mine = tagSet(app);
  const altIds = new Set(alternativesFor(app.id).map((x) => x.id));
  return listApps({ where: 'a.id != ? AND a.app_type = ?', params: [app.id, app.app_type] })
    .map((o) => {
      let score = 0;
      if (o.category_id === app.category_id) score += 5;
      for (const t of tagSet(o)) if (mine.has(t)) score += 2;
      if (altIds.has(o.id)) score -= 10; // already linked in the alternatives block
      return { o, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.o.name.localeCompare(y.o.name))
    .slice(0, limit)
    .map((x) => x.o);
}

export const moreFromDeveloper = (app, limit = 6) =>
  listApps({ where: 'a.developer_id=? AND a.id != ?', params: [app.developer_id, app.id], limit });

const csv = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

export function guidesForApp(app, limit = 4) {
  const dedicatedGuide = getGuide(`how-to-download-${app.slug}-apk`);
  const scored = listGuides().map((g) => {
    let s = 0;
    if (g.slug === `how-to-download-${app.slug}-apk`) s += 100;
    else if (csv(g.related_apps).includes(app.slug)) s += 5;
    if (csv(g.related_categories).includes(app.cat_slug)) s += 3;
    if (g.topic === 'apk' && app.download_type !== 'unavailable') s += 1; // download context
    if (g.topic === 'permissions') s += 1;
    return { g, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);

  const picked = scored.map((x) => x.g);
  if (dedicatedGuide && !picked.find((g) => g.slug === dedicatedGuide.slug)) {
    picked.unshift(dedicatedGuide);
  }
  return picked.slice(0, limit);
}

export function guidesForCategory(cat, limit = 4) {
  return listGuides().filter((g) => csv(g.related_categories).includes(cat.slug)).slice(0, limit);
}

export function comparisonsForCategory(catId, limit = 4) {
  const ids = new Set(listApps({ where: 'a.category_id=? OR c.parent_id=?', params: [catId, catId] }).map((a) => a.id));
  return listComparisons().filter((c) => ids.has(c.app_a) || ids.has(c.app_b)).slice(0, limit);
}

export function appsForGuide(guide) {
  const slugs = csv(guide.related_apps);
  if (!slugs.length) return [];
  const apps = listApps({ where: `a.slug IN (${slugs.map(() => '?').join(',')})`, params: slugs });
  return slugs.map((s) => apps.find((a) => a.slug === s)).filter(Boolean);
}

export function relatedGuides(guide, limit = 4) {
  const want = csv(guide.related_guides);
  const all = listGuides();
  const picked = want.map((s) => all.find((g) => g.slug === s)).filter(Boolean);
  for (const g of all) if (picked.length < limit && g.slug !== guide.slug && g.topic === guide.topic && !picked.includes(g)) picked.push(g);
  return picked.slice(0, limit);
}

export { comparisonsFor };
