import { html, raw } from '../lib/html.js';
import { csrfToken, formStamp } from '../lib/security.js';

export function reviewForm(req, app) {
  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);
  const stamp = formStamp();

  return html`
<form class="form review-form" action="/action/review" method="post">
  <input type="hidden" name="_csrf" value="${token}">
  <input type="hidden" name="_stamp" value="${stamp}">
  <input type="hidden" name="app_id" value="${app.id}">
  <input type="hidden" name="app_slug" value="${app.slug}">
  
  <div class="field sr-only-hp" aria-hidden="true" style="display:none;">
    <label for="rev_website">Leave this field blank</label>
    <input type="text" id="rev_website" name="website_trap" tabindex="-1" autocomplete="off">
  </div>

  <div class="field">
    <label for="rev_rating">Your rating <span class="req">*</span></label>
    <select id="rev_rating" name="rating" required>
      <option value="">Select a rating</option>
      <option value="5">5 stars - Excellent</option>
      <option value="4">4 stars - Good</option>
      <option value="3">3 stars - Average</option>
      <option value="2">2 stars - Needs improvement</option>
      <option value="1">1 star - Poor</option>
    </select>
  </div>

  <div class="field">
    <label for="rev_title">Review title <span class="req">*</span></label>
    <input id="rev_title" name="title" type="text" maxlength="120" required placeholder="Main takeaway in a few words">
  </div>

  <div class="field">
    <label for="rev_body">Your review <span class="req">*</span></label>
    <textarea id="rev_body" name="body" rows="5" maxlength="2000" required placeholder="Explain your experience with the app. Mention what works well and what could be better."></textarea>
    <p class="field-help">Keep it honest and factual. Reviews are checked by moderators before appearing.</p>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="rev_name">Display name <span class="req">*</span></label>
      <input id="rev_name" name="display_name" type="text" maxlength="50" required placeholder="e.g. Alex M.">
    </div>

    <div class="field">
      <label for="rev_email">Email address <span class="req">*</span></label>
      <input id="rev_email" name="email" type="email" maxlength="120" required placeholder="Used only for moderation and spam checks">
      <p class="field-help">Your email is never shown publicly.</p>
    </div>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="rev_ver">Version tested (optional)</label>
      <input id="rev_ver" name="version_used" type="text" maxlength="30" placeholder="e.g. 2.4.1">
    </div>

    <div class="field">
      <label for="rev_device">Device model (optional)</label>
      <input id="rev_device" name="device" type="text" maxlength="50" placeholder="e.g. Pixel 8, Galaxy S23">
    </div>
  </div>

  <button type="submit" class="btn primary">Submit Review for Moderation</button>
</form>`;
}

export function reviewActions(r, req, app) {
  const seed = req.cookies.csrf || '';
  const token = csrfToken(seed);

  return html`
<div class="review-actions">
  <form action="/action/review-vote" method="post" class="inline-form">
    <input type="hidden" name="_csrf" value="${token}">
    <input type="hidden" name="review_id" value="${r.id}">
    <input type="hidden" name="app_slug" value="${app.slug}">
    <button type="submit" class="btn-text" aria-label="Mark review as helpful">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
      Helpful (${r.helpful_count})
    </button>
  </form>

  <form action="/action/review-report" method="post" class="inline-form">
    <input type="hidden" name="_csrf" value="${token}">
    <input type="hidden" name="review_id" value="${r.id}">
    <input type="hidden" name="app_slug" value="${app.slug}">
    <button type="submit" class="btn-text danger" aria-label="Report this review">Report</button>
  </form>
</div>`;
}
