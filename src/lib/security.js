import crypto from 'node:crypto';
import { config } from '../config.js';

export const hmac = (s) => crypto.createHmac('sha256', config.secret).update(String(s)).digest('hex');
// One-way hashes for IP/email so we can rate-limit and de-duplicate without storing them.
export const anonHash = (s) => (s ? hmac('anon:' + String(s).trim().toLowerCase()).slice(0, 32) : null);

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// ---- CSRF: double-submit cookie, token bound to cookie value with HMAC ----
export function csrfCookieValue(req) { return req.cookies.csrf || null; }
export function newCsrfSeed() { return crypto.randomBytes(16).toString('hex'); }
export const csrfToken = (seed) => hmac('csrf:' + seed);
export function checkCsrf(req) {
  const seed = req.cookies.csrf;
  const tok = req.body?._csrf;
  return Boolean(seed && tok && safeEqual(csrfToken(seed), tok));
}

// ---- Form timing token: rejects instant bot posts and stale forms ----
export function formStamp() {
  const t = Date.now().toString();
  return `${t}.${hmac('ts:' + t).slice(0, 16)}`;
}
export function checkFormStamp(v, minMs = 3000, maxMs = 24 * 3600 * 1000) {
  const [t, sig] = String(v || '').split('.');
  if (!t || !sig || !safeEqual(hmac('ts:' + t).slice(0, 16), sig)) return false;
  const age = Date.now() - Number(t);
  return age >= minMs && age <= maxMs;
}

// ---- In-memory sliding window rate limiter ----
const buckets = new Map();
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { buckets.set(key, arr); return false; }
  arr.push(now); buckets.set(key, arr);
  return true;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, arr] of buckets) if (!arr.some((t) => now - t < 3600_000)) buckets.delete(k);
}, 600_000).unref();

// ---- Admin password + sessions ----
const sessions = new Map(); // token -> expiry
export function verifyAdminPassword(pw) {
  if (!config.adminPassword) return false;
  const a = crypto.scryptSync(String(pw), config.secret, 32);
  const b = crypto.scryptSync(config.adminPassword, config.secret, 32);
  return crypto.timingSafeEqual(a, b);
}
export function createSession() {
  const t = crypto.randomBytes(32).toString('hex');
  sessions.set(t, Date.now() + 8 * 3600_000);
  return t;
}
export function isAdmin(req) {
  const t = req.cookies.adm;
  const exp = t && sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}
export function destroySession(req) { if (req.cookies.adm) sessions.delete(req.cookies.adm); }

// ---- Input validation ----
export function clean(v, max = 2000) {
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}
export const isEmail = (s) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(s);
export function isHttpUrl(s) {
  try { const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; }
}
export const countLinks = (s) => (String(s).match(/https?:\/\/|www\./gi) || []).length;

// Small, deliberately conservative list. Reviews matching it go to manual moderation, not auto-reject.
const ABUSE = ['fuck', 'shit', 'cunt', 'nigger', 'faggot', 'retard'];
export const looksAbusive = (s) => ABUSE.some((w) => new RegExp(`\\b${w}`, 'i').test(s));
const PROMO = /(buy now|discount code|promo code|telegram me|whatsapp me|contact me at|cheap followers|earn \$|crypto signal)/i;
export const looksPromotional = (s) => PROMO.test(s);
