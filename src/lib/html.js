// Auto-escaping HTML templates. Every interpolated value is escaped unless wrapped in raw().
export class Raw { constructor(s) { this.s = String(s); } toString() { return this.s; } }
export const raw = (s) => new Raw(s ?? '');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

function fmt(v) {
  if (v == null || v === false) return '';
  if (Array.isArray(v)) return v.map(fmt).join('');
  if (v instanceof Raw) return v.s;
  return esc(v);
}

export function html(strings, ...vals) {
  let out = '';
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < vals.length) out += fmt(vals[i]);
  }
  return new Raw(out);
}

// Plain paragraphs from blank-line separated text.
export const paras = (text) => raw((text || '').split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())}</p>`).join('\n'));

export function fmtBytes(n) {
  if (!n) return null;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function fmtDate(d) {
  if (!d) return null;
  const [y, m, day] = String(d).slice(0, 10).split('-').map(Number);
  if (!y || !m || !day) return null;
  return `${day} ${MONTHS[m - 1]} ${y}`;
}
export const isoDate = (d) => (d ? String(d).slice(0, 10) : null);

export const NA = raw('<span class="na">Not available</span>');
export const orNA = (v) => (v == null || v === '' ? NA : v);

export function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export const parseJSON = (s, d = []) => { try { return JSON.parse(s ?? ''); } catch { return d; } };
