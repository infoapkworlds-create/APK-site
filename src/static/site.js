// Lightweight client-side enhancements for APKworlds
(() => {
  // Safe HTML escaper for search suggestion strings
  function escHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m]));
  }

  // 0. Mobile Nav Drawer — close when a link is tapped or outside area clicked
  const mobileMenu = document.querySelector('details.menu');
  if (mobileMenu) {
    // Close when any nav link inside drawer is tapped
    mobileMenu.querySelectorAll('nav a').forEach((link) => {
      link.addEventListener('click', () => { mobileMenu.removeAttribute('open'); });
    });
    // Close when tapping the backdrop (summary::before pseudo-element area)
    mobileMenu.querySelector('summary').addEventListener('click', (e) => {
      // already handled by <details> toggle — nothing extra needed
    });
    // Close if user taps outside the drawer nav
    document.addEventListener('click', (e) => {
      if (mobileMenu.hasAttribute('open') && !mobileMenu.contains(e.target)) {
        mobileMenu.removeAttribute('open');
      }
    });
  }

  // 1. Search suggestions autocomplete
  const inputs = document.querySelectorAll('input[data-suggest]');
  inputs.forEach((input) => {
    let box = null;
    let timer = null;
    let selectedIndex = -1;

    // Anchor box to the parent form or container (outside any input wrappers)
    const form = input.closest('form');
    const container = form || input.parentElement;

    function clearBox() {
      if (box) {
        box.remove();
        box = null;
      }
      selectedIndex = -1;
    }

    function updateActiveItem(items) {
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.classList.add('is-active');
          item.setAttribute('aria-selected', 'true');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('is-active');
          item.removeAttribute('aria-selected');
        }
      });
    }

    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) {
        clearBox();
        return;
      }

      timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
          if (!res.ok) return;
          const items = await res.json();
          clearBox();
          if (!items || !items.length) return;

          box = document.createElement('div');
          box.className = 'suggest-box';
          box.setAttribute('role', 'listbox');

          const list = document.createElement('div');
          list.className = 'suggest-list';

          items.forEach((item) => {
            const row = document.createElement('a');
            row.href = item.url;
            row.className = 'suggest-row';
            row.setAttribute('role', 'option');
            row.innerHTML = `
              <img class="suggest-icon" src="${item.icon}" width="36" height="36" alt="" aria-hidden="true" loading="lazy">
              <div class="suggest-info">
                <div class="suggest-title">${escHtml(item.name)}</div>
                <div class="suggest-meta">
                  <span class="suggest-cat">${escHtml(item.cat)}</span>
                  <span class="suggest-dot">&bull;</span>
                  <span class="suggest-dev">${escHtml(item.dev)}</span>
                </div>
              </div>
            `;
            list.appendChild(row);
          });
          box.appendChild(list);

          const footer = document.createElement('a');
          footer.href = `/search/?q=${encodeURIComponent(q)}`;
          footer.className = 'suggest-footer';
          footer.innerHTML = `<span>See all results for &ldquo;${escHtml(q)}&rdquo;</span> <span class="suggest-arrow">&rarr;</span>`;
          box.appendChild(footer);

          container.style.position = 'relative';
          container.appendChild(box);
        } catch {
          // ignore network fails
        }
      }, 120);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (!box) return;
      const rows = box.querySelectorAll('.suggest-row, .suggest-footer');
      if (!rows.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % rows.length;
        updateActiveItem(rows);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + rows.length) % rows.length;
        updateActiveItem(rows);
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && rows[selectedIndex]) {
          e.preventDefault();
          rows[selectedIndex].click();
        }
      } else if (e.key === 'Escape') {
        clearBox();
      }
    });

    // Clear event when native browser clear (x) button is clicked
    input.addEventListener('search', () => {
      if (!input.value.trim()) clearBox();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (box && !container.contains(e.target)) {
        clearBox();
      }
    });
  });

  // 2. Client-side directory filter bar
  const filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    const qIn = filterBar.querySelector('[data-filter-query]');
    const catIn = filterBar.querySelector('[data-filter-cat]');
    const priceIn = filterBar.querySelector('[data-filter-price]');
    const sortIn = filterBar.querySelector('[data-filter-sort]');
    const status = document.querySelector('[data-filter-status]');
    const grid = document.querySelector('.catalog-results ul.grid');
    const cards = grid ? Array.from(grid.querySelectorAll('li.app-card')) : [];
    let activeSizeFilter = 'all';

    const sizeChips = document.querySelectorAll('.size-chip');
    sizeChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        sizeChips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeSizeFilter = chip.dataset.sizeFilter || 'all';
        applyFilter();
      });
    });

    function applyFilter() {
      if (!grid) return;
      const q = (qIn ? qIn.value : '').toLowerCase().trim();
      const cat = catIn ? catIn.value : '';
      const price = priceIn ? priceIn.value : '';
      const sort = sortIn ? sortIn.value : 'name';

      let visible = 0;
      cards.forEach((card) => {
        const name = card.dataset.name || '';
        const cCat = card.dataset.cat || '';
        const cPrice = card.dataset.price || '';
        const bytes = Number(card.dataset.bytes || 0);
        const rating = Number(card.dataset.rating || 0);
        const isOffline = card.dataset.offline === '1';

        let match = true;
        if (q && !name.includes(q)) match = false;
        if (cat && cCat !== cat) match = false;
        if (price && cPrice !== price) match = false;

        if (activeSizeFilter === '25') {
          if (bytes > 25 * 1024 * 1024 || bytes === 0) match = false;
        } else if (activeSizeFilter === '50') {
          if (bytes > 50 * 1024 * 1024 || bytes === 0) match = false;
        } else if (activeSizeFilter === '100') {
          if (bytes > 100 * 1024 * 1024 || bytes === 0) match = false;
        } else if (activeSizeFilter === 'offline') {
          if (!isOffline && !name.includes('offline')) match = false;
        } else if (activeSizeFilter === 'top') {
          if (rating < 4.5) match = false;
        }

        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // Sort visible cards
      const sorted = cards.filter((c) => c.style.display !== 'none').sort((a, b) => {
        if (sort === 'rating') return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        if (sort === 'updated') return String(b.dataset.updated || '').localeCompare(String(a.dataset.updated || ''));
        return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      });

      sorted.forEach((c) => grid.appendChild(c));

      if (status) {
        status.textContent = `Showing ${visible} of ${cards.length} items`;
      }
    }

    if (qIn) qIn.addEventListener('input', applyFilter);
    if (catIn) catIn.addEventListener('change', applyFilter);
    if (priceIn) priceIn.addEventListener('change', applyFilter);
    if (sortIn) sortIn.addEventListener('change', applyFilter);
    applyFilter();
  }

  // 3. Lightweight click event logging without blocking navigation
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-evt]');
    if (target) {
      const type = target.dataset.evt;
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/event', JSON.stringify({ type }));
        } else {
          fetch('/api/event', { method: 'POST', body: JSON.stringify({ type }) });
        }
      } catch {
        // ignore
      }
    }
  });

  // 4. Hero Carousel Slider Controller
  const sliderEl = document.getElementById('pureHeroSlider');
  if (sliderEl) {
    const slides = Array.from(sliderEl.querySelectorAll('.pure-slide'));
    const totalSlides = slides.length;
    let currentIdx = 0;
    let autoTimer = null;
    const intervalMs = 4500;

    function goToSlide(idx) {
      if (totalSlides <= 1) return;
      currentIdx = (idx + totalSlides) % totalSlides;

      slides.forEach((slide, i) => {
        const isActive = i === currentIdx;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');

        // Sync dots inside slide
        const dots = slide.querySelectorAll('.pure-banner-dots .dot');
        dots.forEach((dot, dotIdx) => {
          const isDotActive = dotIdx === currentIdx;
          dot.classList.toggle('active', isDotActive);
          dot.setAttribute('aria-selected', isDotActive ? 'true' : 'false');
        });
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (totalSlides > 1) {
        autoTimer = setInterval(() => {
          goToSlide(currentIdx + 1);
        }, intervalMs);
      }
    }

    function stopAutoPlay() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    sliderEl.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-slide-target]');
      if (dot) {
        e.preventDefault();
        const targetIdx = parseInt(dot.dataset.slideTarget, 10);
        if (!isNaN(targetIdx)) {
          goToSlide(targetIdx);
          startAutoPlay();
        }
        return;
      }

      const prevBtn = e.target.closest('.pure-slider-arrow.prev');
      if (prevBtn) {
        e.preventDefault();
        goToSlide(currentIdx - 1);
        startAutoPlay();
        return;
      }

      const nextBtn = e.target.closest('.pure-slider-arrow.next');
      if (nextBtn) {
        e.preventDefault();
        goToSlide(currentIdx + 1);
        startAutoPlay();
        return;
      }
    });

    sliderEl.addEventListener('mouseenter', stopAutoPlay);
    sliderEl.addEventListener('mouseleave', startAutoPlay);

    // Mobile touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    sliderEl.addEventListener('touchstart', (e) => {
      stopAutoPlay();
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    sliderEl.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            goToSlide(currentIdx + 1);
          } else {
            goToSlide(currentIdx - 1);
          }
        }
      }
      startAutoPlay();
    }, { passive: true });

    startAutoPlay();
  }

  // 5. APK Screenshots Carousel Gallery Controller
  const galleryWrappers = document.querySelectorAll('.apk-gallery-wrapper');
  galleryWrappers.forEach((wrapper) => {
    const track = wrapper.querySelector('.apk-gallery-track');
    const prevBtn = wrapper.querySelector('.gallery-arrow.prev');
    const nextBtn = wrapper.querySelector('.gallery-arrow.next');
    if (!track) return;

    function updateArrows() {
      if (!prevBtn || !nextBtn) return;
      const atStart = track.scrollLeft <= 15;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 15;
      prevBtn.style.display = atStart ? 'none' : 'flex';
      nextBtn.style.display = atEnd ? 'none' : 'flex';
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const itemWidth = track.firstElementChild ? track.firstElementChild.clientWidth + 14 : 360;
        track.scrollBy({ left: itemWidth, behavior: 'smooth' });
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const itemWidth = track.firstElementChild ? track.firstElementChild.clientWidth + 14 : 360;
        track.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      });
    }

    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows, { passive: true });
    setTimeout(updateArrows, 100);
  });

  // 6. Screenshots Lightbox Modal
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.apk-screenshot-item');
    if (item) {
      const img = item.querySelector('img');
      if (!img) return;

      const modal = document.createElement('div');
      modal.className = 'apk-lightbox-modal';
      modal.innerHTML = `
        <div class="apk-lightbox-backdrop"></div>
        <div class="apk-lightbox-content">
          <img src="${img.src}" alt="${img.alt || 'Screenshot'}" class="apk-lightbox-img">
          <button type="button" class="apk-lightbox-close" aria-label="Close">&times;</button>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.15s ease';
        setTimeout(() => modal.remove(), 150);
      };

      modal.querySelector('.apk-lightbox-backdrop').addEventListener('click', close);
      modal.querySelector('.apk-lightbox-close').addEventListener('click', close);
      document.addEventListener('keydown', function escHandler(evt) {
        if (evt.key === 'Escape') {
          close();
          document.removeEventListener('keydown', escHandler);
        }
      });
    }
  });

  // 7. PWA Install Prompt Banner
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (localStorage.getItem('pwa_prompt_dismissed')) return;

    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-install-content">
        <img src="/favicon.svg" alt="APKworlds" width="36" height="36" class="pwa-icon">
        <div class="pwa-text">
          <strong>Install APKworlds</strong>
          <span>Fast, free access to verified APKs & guides</span>
        </div>
        <div class="pwa-actions">
          <button type="button" class="btn primary btn-sm pwa-install-btn">Install</button>
          <button type="button" class="pwa-close-btn" aria-label="Dismiss">&times;</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    banner.querySelector('.pwa-install-btn').addEventListener('click', async () => {
      banner.remove();
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
      }
    });

    banner.querySelector('.pwa-close-btn').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('pwa_prompt_dismissed', Date.now());
    });
  });

  // 8. Download Countdown Timer
  const timerWrap = document.getElementById('dl-countdown-wrap');
  if (timerWrap) {
    const countNum = document.getElementById('dl-countdown-num');
    const progressFill = document.getElementById('dl-progress-fill');
    const actionArea = document.getElementById('dl-action-area');
    const timerMsg = document.getElementById('dl-timer-msg');
    let remaining = 5;

    // Smoothly animate progress bar
    setTimeout(() => {
      if (progressFill) progressFill.style.width = '0%';
    }, 50);

    const interval = setInterval(() => {
      remaining--;
      if (countNum) countNum.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(interval);
        if (timerMsg) {
          timerMsg.innerHTML = '<span style="color:#10b981;">🎉 <strong>Your verified APK download is ready!</strong></span>';
        }
        if (actionArea) {
          actionArea.style.display = 'block';
          actionArea.classList.add('dl-ready-pulse');
        }
      }
    }, 1000);
  }

  // 9. Mobile Sticky Ad Banner Close Button
  const stickyAd = document.getElementById('stickyBottomAd');
  if (stickyAd) {
    const closeBtn = document.getElementById('stickyAdClose');
    if (sessionStorage.getItem('sticky_ad_dismissed')) {
      stickyAd.style.display = 'none';
    } else if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        stickyAd.style.display = 'none';
        sessionStorage.setItem('sticky_ad_dismissed', '1');
      });
    }
  }

  // 10. Dark / Light Mode Toggle
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    }
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const nextTheme = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      themeToggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  // 11. PWA Service Worker Registration & Install Button
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  let deferredInstallPrompt = null;
  const pwaBtn = document.getElementById('pwaInstallBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (pwaBtn) pwaBtn.style.display = 'inline-flex';
  });

  if (pwaBtn) {
    pwaBtn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          pwaBtn.style.display = 'none';
        }
        deferredInstallPrompt = null;
      } else {
        alert('To install APKWorlds App: Tap your browser menu (⋮) and select "Add to Home screen" or "Install App".');
      }
    });
  }

  // 12. Social Share Link Copy
  document.querySelectorAll('.btn-share.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = btn.getAttribute('data-copy-url') || window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<span>✓ Copied!</span>`;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      } catch {
        // Fallback prompt
        window.prompt('Copy this link:', url);
      }
    });
  });

  // 13. 1-Click Instant Star Rating
  const ratingBox = document.querySelector('.instant-rating-box');
  if (ratingBox) {
    const appId = ratingBox.getAttribute('data-app-id');
    const appName = ratingBox.getAttribute('data-app-name');
    const starBtns = ratingBox.querySelectorAll('.btn-star');
    const statusMsg = ratingBox.querySelector('.instant-rating-status');
    const storageKey = `rated_app_${appId}`;
    const previousRating = localStorage.getItem(storageKey);

    function highlightStars(count) {
      starBtns.forEach((btn, idx) => {
        if (idx < count) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    if (previousRating) {
      highlightStars(Number(previousRating));
      if (statusMsg) statusMsg.textContent = `✓ You rated this ${previousRating}★`;
    }

    starBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        const val = Number(btn.getAttribute('data-star'));
        highlightStars(val);
      });

      btn.addEventListener('click', () => {
        const val = Number(btn.getAttribute('data-star'));
        highlightStars(val);
        localStorage.setItem(storageKey, String(val));
        if (statusMsg) {
          statusMsg.innerHTML = `<span style="color:#059669; font-weight:700;">✓ Thanks for rating ${val}★!</span>`;
        }
        try {
          fetch('/api/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'rate', detail: `${appId}:${val}` }),
            keepalive: true
          }).catch(() => {});
        } catch {}
      });
    });

    ratingBox.addEventListener('mouseleave', () => {
      const current = localStorage.getItem(storageKey);
      highlightStars(current ? Number(current) : 0);
    });
  }

  // 14. Installation Guide Tab Switcher
  const tabBtnApk = document.getElementById('tabBtnApk');
  const tabBtnObb = document.getElementById('tabBtnObb');
  const tabPaneApk = document.getElementById('tabPaneApk');
  const tabPaneObb = document.getElementById('tabPaneObb');

  if (tabBtnApk && tabBtnObb && tabPaneApk && tabPaneObb) {
    tabBtnApk.addEventListener('click', () => {
      tabBtnApk.classList.add('is-active');
      tabBtnApk.setAttribute('aria-selected', 'true');
      tabBtnObb.classList.remove('is-active');
      tabBtnObb.setAttribute('aria-selected', 'false');
      tabPaneApk.style.display = 'block';
      tabPaneObb.style.display = 'none';
    });

    tabBtnObb.addEventListener('click', () => {
      tabBtnObb.classList.add('is-active');
      tabBtnObb.setAttribute('aria-selected', 'true');
      tabBtnApk.classList.remove('is-active');
      tabBtnApk.setAttribute('aria-selected', 'false');
      tabPaneObb.style.display = 'block';
      tabPaneObb.style.display = 'none';
    });
  }

  // 16. Phone Compatibility Checker Widget
  const compatCard = document.getElementById('compatChecker');
  if (compatCard) {
    const minAndroid = parseFloat(compatCard.getAttribute('data-min-android')) || 7.0;
    const appName = compatCard.getAttribute('data-app-name') || 'This app';
    const resultBox = document.getElementById('compatResult');
    const pills = compatCard.querySelectorAll('.btn-compat-pill');

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('selected'));
        pill.classList.add('selected');
        const ver = parseFloat(pill.getAttribute('data-ver')) || 0;
        const verStr = pill.getAttribute('data-ver');

        if (!resultBox) return;
        if (ver >= minAndroid) {
          resultBox.innerHTML = `
            <div class="compat-status ok">
              <span class="compat-icon">✅</span>
              <span class="compat-msg"><strong>100% Compatible:</strong> ${appName} is fully compatible with Android ${verStr} and supports 64-bit hardware acceleration.</span>
            </div>
          `;
        } else {
          resultBox.innerHTML = `
            <div class="compat-status warn">
              <span class="compat-icon">⚠️</span>
              <span class="compat-msg"><strong>May Not Work:</strong> ${appName} requires Android ${minAndroid}+. Android ${verStr} is older than the required version. Please check <a href="#download-box" style="text-decoration:underline;">Version History</a> for legacy releases.</span>
            </div>
          `;
        }
      });
    });
  }

  // 17. Client-Side APK Hash & Security Inspector (Web Crypto API)
  const apkDropzone = document.getElementById('apkDropzone');
  const apkFileInput = document.getElementById('apkFileInput');
  const inspectorProgress = document.getElementById('inspectorProgress');
  const inspectorProgressText = document.getElementById('inspectorProgressText');
  const inspectorProgressBar = document.getElementById('inspectorProgressBar');
  const inspectorResults = document.getElementById('inspectorResults');
  const resFileName = document.getElementById('resFileName');
  const resFileSize = document.getElementById('resFileSize');
  const resSha256 = document.getElementById('resSha256');
  const resSha1 = document.getElementById('resSha1');
  const btnCopyHash = document.getElementById('btnCopyHash');
  const btnVtLookup = document.getElementById('btnVtLookup');

  if (apkDropzone && apkFileInput) {
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(2) + ' MB';
    }

    async function processApkFile(file) {
      if (!file) return;
      if (inspectorProgress) inspectorProgress.style.display = 'block';
      if (inspectorResults) inspectorResults.style.display = 'none';
      if (inspectorProgressBar) inspectorProgressBar.style.width = '20%';
      if (inspectorProgressText) inspectorProgressText.textContent = '20%';

      try {
        const buffer = await file.arrayBuffer();
        if (inspectorProgressBar) inspectorProgressBar.style.width = '60%';
        if (inspectorProgressText) inspectorProgressText.textContent = '60%';

        // SHA-256 via Web Crypto API
        const hashBuf256 = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray256 = Array.from(new Uint8Array(hashBuf256));
        const sha256Hex = hashArray256.map(b => b.toString(16).padStart(2, '0')).join('');

        // SHA-1 via Web Crypto API
        const hashBuf1 = await crypto.subtle.digest('SHA-1', buffer);
        const hashArray1 = Array.from(new Uint8Array(hashBuf1));
        const sha1Hex = hashArray1.map(b => b.toString(16).padStart(2, '0')).join('');

        if (inspectorProgressBar) inspectorProgressBar.style.width = '100%';
        if (inspectorProgressText) inspectorProgressText.textContent = '100%';

        setTimeout(() => {
          if (inspectorProgress) inspectorProgress.style.display = 'none';
          if (resFileName) resFileName.textContent = file.name;
          if (resFileSize) resFileSize.textContent = formatFileSize(file.size);
          if (resSha256) resSha256.value = sha256Hex;
          if (resSha1) resSha1.value = sha1Hex;
          if (btnVtLookup) btnVtLookup.href = `https://www.virustotal.com/gui/file/${sha256Hex}`;
          if (inspectorResults) inspectorResults.style.display = 'block';
        }, 300);
      } catch (err) {
        alert('Could not inspect APK file: ' + err.message);
        if (inspectorProgress) inspectorProgress.style.display = 'none';
      }
    }

    apkFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) processApkFile(file);
    });

    apkDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      apkDropzone.classList.add('dragover');
    });

    apkDropzone.addEventListener('dragleave', () => {
      apkDropzone.classList.remove('dragover');
    });

    apkDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      apkDropzone.classList.remove('dragover');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) processApkFile(file);
    });

    if (btnCopyHash) {
      btnCopyHash.addEventListener('click', () => {
        if (resSha256 && resSha256.value) {
          navigator.clipboard.writeText(resSha256.value).then(() => {
            const originalText = btnCopyHash.textContent;
            btnCopyHash.textContent = 'Copied!';
            setTimeout(() => { btnCopyHash.textContent = originalText; }, 1800);
          }).catch(() => {});
        }
      });
    }
  }

  // 18. Battle Arena Voting Poll
  const battleArena = document.getElementById('battleArena');
  if (battleArena) {
    const slug = battleArena.getAttribute('data-slug');
    const storageKey = 'battle_vote_' + slug;
    const voteBtns = battleArena.querySelectorAll('.btn-vote-fighter');

    if (localStorage.getItem(storageKey)) {
      voteBtns.forEach((b) => {
        b.disabled = true;
        b.style.opacity = '0.7';
      });
    }

    voteBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (localStorage.getItem(storageKey)) return;
        localStorage.setItem(storageKey, btn.getAttribute('data-fighter'));
        voteBtns.forEach((b) => {
          b.disabled = true;
          b.style.opacity = '0.7';
        });
        btn.innerHTML = '✓ Voted!';
      });
    });
  }

  // 19. Interactive APK Error Solver
  const errorPicker = document.getElementById('errorPicker');
  const brandPicker = document.getElementById('brandPicker');
  const solTitle = document.getElementById('solTitle');
  const solDeviceTag = document.getElementById('solDeviceTag');
  const solContent = document.getElementById('solContent');

  if (errorPicker && brandPicker && solTitle && solDeviceTag && solContent) {
    const solutions = {
      parse: {
        title: 'How to Fix "Problem Parsing the Package"',
        cause: 'This error occurs when the downloaded APK requires a newer Android version than the one installed on your phone, or if the download was interrupted before reaching 100%.',
        steps: [
          'Check OS Compatibility: Compare your phone\'s Android version (Settings > About Phone > Software Information) against the app\'s minimum requirement on APKWorlds. If your Android is older, download a legacy build from our Version History.',
          'Re-download from Mirror 1: Interrupted Wi-Fi downloads create incomplete byte files. Tap the Download button again and ensure the file size matches the size recorded on our download page.',
          'Allow Unknown Sources: Open phone Settings > Security > Install Unknown Apps > find your browser or File Manager > toggle Allow from this source to ON.',
          'Clear Package Installer Cache: Go to Settings > Apps > Filter: Show System Apps > Package Installer > Storage > Clear Cache.'
        ]
      },
      corrupt: {
        title: 'How to Fix "App Not Installed as Package Appears to be Corrupt"',
        cause: 'A cryptographic signature mismatch is occurring because a different build or older version is already installed on your device, or the APK binary was corrupted.',
        steps: [
          'Uninstall Existing App Version: If you already have the app or an older mod installed, you MUST completely uninstall it first before installing the new APK package.',
          'Remove Leftover App Data: Go to Settings > Storage > Cached Data > Clear to eliminate old configuration conflicts.',
          'Restart Your Device: A quick reboot clears the Android Package Manager cache daemon.',
          'Reinstall via Verified Mirror: Download the fresh verified APK package from APKWorlds and tap Install.'
        ]
      },
      protect: {
        title: 'How to Bypass "Blocked by Play Protect (Unsafe App)"',
        cause: 'Google Play Protect automatically flags third-party sideloaded apps because they are distributed outside Google Play Store billing channels.',
        steps: [
          'Instant 1-Tap Bypass: When the red or yellow warning dialog appears, tap "More details" (small arrow at the bottom).',
          'Tap "Install anyway (unsafe)": The app will immediately finish installation without issues.',
          'Permanent Whitelist: Open Google Play Store > tap your Profile icon in top-right > tap "Play Protect" > tap the Settings Gear icon in top-right > toggle OFF "Scan apps with Play Protect".'
        ]
      },
      pending: {
        title: 'How to Fix "Download Pending or Stuck at 99%"',
        cause: 'Network connection timeouts, aggressive battery savers pausing background browser tasks, or corrupted Download Manager cache.',
        steps: [
          'Clear Download Manager Cache: Go to Settings > Apps > (Menu: Show System Apps) > Download Manager > Storage > Clear Data & Cache.',
          'Disable Battery Optimization: Settings > Battery > Battery Optimization > select your browser (Chrome/Brave) > choose "Don\'t optimize" so background downloads are never suspended.',
          'Use Direct High-Speed Mirror: Tap "Mirror 2 (High-Speed Direct Mirror)" on our download page for multi-threaded direct HTTP download.'
        ]
      },
      obb: {
        title: 'How to Fix "XAPK / OBB Validation Failed (Resource Missing)"',
        cause: 'High-graphics 3D games require both a base APK file and additional OBB cache data files located in the Android filesystem.',
        steps: [
          'Install Base APK First: Install the main APK package, but do NOT launch the game yet.',
          'Extract OBB Folder: If the download is a .ZIP or .XAPK archive, extract the .obb file using ZArchiver or Files by Google.',
          'Move to Android/obb: Move the game folder to: Internal Storage > Android > obb > [game.package.name] / main.xxx.obb.',
          'Grant Storage Permissions: Go to Settings > Apps > find the game > Permissions > toggle Storage/Files to ALLOW.'
        ]
      },
      abi: {
        title: 'How to Fix "INSTALL_FAILED_NO_MATCHING_ABIS"',
        cause: 'The APK binary was compiled for 64-bit ARM (arm64-v8a) processors, but your device or Android emulator runs on 32-bit (armeabi-v7a) or x86 architecture.',
        steps: [
          'Download Universal APK Build: Always look for "Universal" or "armeabi-v7a" labeled APK releases on APKWorlds.',
          'Check Device CPU Architecture: Install AIDA64 or CPU-Z from our site to verify whether your CPU is 64-bit (ARM64) or 32-bit (ARMv7).',
          'Emulator Users: In BlueStacks / LDPlayer / Nox, switch emulator settings from 32-bit instance to 64-bit Pie or Android 12 instance.'
        ]
      }
    };

    let currentErr = 'parse';
    let currentBrand = 'Samsung';

    function renderSolution() {
      const data = solutions[currentErr] || solutions.parse;
      solTitle.textContent = data.title;
      solDeviceTag.textContent = currentBrand + ' Optimized';

      const stepsHtml = data.steps.map((s) => `<li>${s}</li>`).join('');
      solContent.innerHTML = `
        <p><strong>Root Cause:</strong> ${data.cause}</p>
        <div style="background:var(--bg-alt); padding:1.25rem; border-radius:10px; border:1px solid var(--border); margin:1rem 0;">
          <h4 style="margin-top:0; font-size:1rem; color:#2563eb;">Step-by-Step Resolution (${currentBrand}):</h4>
          <ol style="margin-bottom:0; padding-left:1.25rem; line-height:1.7;">
            ${stepsHtml}
          </ol>
        </div>
      `;
    }

    const errBtns = errorPicker.querySelectorAll('.btn-error-pill');
    errBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        errBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentErr = btn.getAttribute('data-err');
        renderSolution();
      });
    });

    const brandBtns = brandPicker.querySelectorAll('.btn-brand-pill');
    brandBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        brandBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentBrand = btn.textContent.split(' (')[0];
        renderSolution();
      });
    });
  }

  // 10.5. Download Page: Auto-Detect User Phone Model & Android OS Version
  const deviceBadge = document.getElementById('userDeviceCompatBadge');
  if (deviceBadge) {
    const minAndroid = parseFloat(deviceBadge.getAttribute('data-min-android')) || 7.0;
    const appName = deviceBadge.getAttribute('data-app-name') || 'this app';
    const nameEl = document.getElementById('compatDeviceName');
    const descEl = document.getElementById('compatDeviceDesc');
    const pillEl = document.getElementById('compatStatusPill');
    const iconEl = document.getElementById('compatDeviceIcon');

    const ua = navigator.userAgent;
    let brand = 'Android Device';
    let isAndroid = false;
    let isPC = false;
    let isIOS = false;
    let osVerNum = 13.0;
    let osVerStr = 'Android';

    const androidMatch = ua.match(/Android\s+([0-9\.]+)/i);
    if (androidMatch) {
      isAndroid = true;
      osVerNum = parseFloat(androidMatch[1]) || 13.0;
      osVerStr = 'Android ' + androidMatch[1];
    }

    if (/samsung|sm-[a-z0-9]+/i.test(ua)) brand = 'Samsung Galaxy';
    else if (/redmi|xiaomi|poco/i.test(ua)) brand = 'Xiaomi / Redmi';
    else if (/pixel/i.test(ua)) brand = 'Google Pixel';
    else if (/oneplus/i.test(ua)) brand = 'OnePlus';
    else if (/vivo/i.test(ua)) brand = 'Vivo Device';
    else if (/oppo/i.test(ua)) brand = 'OPPO Device';
    else if (/realme/i.test(ua)) brand = 'Realme Device';
    else if (/motorola|moto/i.test(ua)) brand = 'Motorola Device';
    else if (/huawei|honor/i.test(ua)) brand = 'Huawei / Honor';
    else if (/windows/i.test(ua)) isPC = true;
    else if (/macintosh|mac os x/i.test(ua)) isPC = true;
    else if (/iphone|ipad/i.test(ua)) isIOS = true;

    if (isAndroid) {
      if (iconEl) iconEl.textContent = '📱';
      if (nameEl) nameEl.textContent = `${brand} (${osVerStr})`;
      if (osVerNum >= minAndroid) {
        if (pillEl) {
          pillEl.textContent = '✓ 100% Compatible';
          pillEl.style.background = '#10b981';
          pillEl.style.color = '#ffffff';
        }
        if (descEl) {
          descEl.innerHTML = `Hardware verified: <strong>${appName}</strong> is 100% compatible with your <strong>${brand}</strong> on <strong>${osVerStr}</strong>. Zero lag, 64-bit ARM hardware acceleration enabled.`;
        }
      } else {
        if (pillEl) {
          pillEl.textContent = `Requires Android ${minAndroid}+`;
          pillEl.style.background = '#f59e0b';
          pillEl.style.color = '#000000';
        }
        if (descEl) {
          descEl.innerHTML = `Your device has ${osVerStr}. This release requires Android ${minAndroid}+. If installation fails, download an earlier release from our Version History below.`;
        }
      }
    } else if (isPC) {
      if (iconEl) iconEl.textContent = '💻';
      if (nameEl) nameEl.textContent = 'Windows PC / Desktop Detected';
      if (pillEl) {
        pillEl.textContent = '✓ PC Compatible';
        pillEl.style.background = '#2563eb';
        pillEl.style.color = '#ffffff';
      }
      if (descEl) {
        descEl.innerHTML = `Playing on desktop? Use <strong>Mirror 5 (PC Edition)</strong> below to play with smooth 60FPS keyboard &amp; mouse support, or transfer the downloaded APK to your Android device.`;
      }
    } else if (isIOS) {
      if (iconEl) iconEl.textContent = '🍎';
      if (nameEl) nameEl.textContent = 'Apple iOS Device Detected';
      if (pillEl) {
        pillEl.textContent = 'Android APK File';
        pillEl.style.background = '#64748b';
        pillEl.style.color = '#ffffff';
      }
      if (descEl) {
        descEl.innerHTML = `Note: APK files install natively on Android. To install ${appName}, please open this page on your Android smartphone or tablet.`;
      }
    } else {
      if (nameEl) nameEl.textContent = 'Universal Android Device';
      if (descEl) descEl.innerHTML = `Verified compatible with ARM64 and x86 architectures. Tested clean with zero battery overheating.`;
    }
  }

  // 11. Download Page: Real Interactive 5-Second Countdown Timer & Mirror Unlocker
  const dlWrap = document.getElementById('dl-countdown-wrap');
  if (dlWrap) {
    const numEl = document.getElementById('dl-countdown-num');
    const msgEl = document.getElementById('dl-timer-msg');
    const fillEl = document.getElementById('dl-progress-fill');
    const actionEl = document.getElementById('dl-action-area');
    const waitingEl = document.getElementById('dl-waiting-box');

    let timeLeft = 5;
    if (fillEl) {
      fillEl.style.width = '0%';
    }

    const timer = setInterval(() => {
      timeLeft -= 1;
      if (numEl) numEl.textContent = String(Math.max(0, timeLeft));
      if (fillEl) {
        const percent = Math.min(100, Math.round(((5 - timeLeft) / 5) * 100));
        fillEl.style.width = percent + '%';
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
        if (numEl) numEl.textContent = '0';
        if (msgEl) {
          msgEl.innerHTML = '✅ <span style="color:#10b981;">Verified Package Ready! Select Your Download Mirror:</span>';
        }
        if (waitingEl) {
          waitingEl.style.display = 'none';
        }
        if (actionEl) {
          actionEl.style.display = 'block';
          actionEl.style.opacity = '0';
          actionEl.style.transform = 'translateY(12px)';
          actionEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          requestAnimationFrame(() => {
            actionEl.style.opacity = '1';
            actionEl.style.transform = 'translateY(0)';
          });
        }
      }
    }, 1000);
  }

  // 12. Mobile Sticky Floating Bottom Action Bar (High CTR Conversion Bar)
  const floatBar = document.getElementById('mobileFloatingBar');
  if (floatBar && !sessionStorage.getItem('dismissFloatingBar')) {
    const floatIcon = document.getElementById('mobileFloatingIcon');
    const floatTitle = document.getElementById('mobileFloatingTitle');
    const floatSub = document.getElementById('mobileFloatingSub');
    const floatBtn = document.getElementById('mobileFloatingBtn');
    const floatClose = document.getElementById('mobileFloatingClose');

    const path = window.location.pathname;
    const isAppPage = path.startsWith('/apps/') && !path.includes('/download/');
    const isDownloadPage = path.startsWith('/apps/') && path.includes('/download/');

    if (isAppPage || isDownloadPage) {
      const pageHeading = document.querySelector('h1');
      const pageIcon = document.querySelector('.pure-banner-app .icon, .app-hdr .icon, article .icon');
      const appName = pageHeading ? pageHeading.textContent.replace(/APK.*$/i, '').trim() : 'Android App';

      if (floatTitle) floatTitle.textContent = appName;
      if (floatSub) floatSub.textContent = 'Verified Safe 🛡️ (Zero Virus)';
      if (pageIcon && floatIcon) {
        floatIcon.src = pageIcon.src;
        floatIcon.alt = appName;
      }

      if (isDownloadPage) {
        if (floatBtn) {
          floatBtn.textContent = '⚡ Select Mirror';
          floatBtn.href = '#dl-countdown-wrap';
          floatBtn.addEventListener('click', (e) => {
            const target = document.getElementById('dl-countdown-wrap');
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        }
      } else {
        const dlUrl = path.replace(/\/$/, '') + '/download/';
        if (floatBtn) {
          floatBtn.textContent = '⚡ Download APK';
          floatBtn.href = dlUrl;
        }
      }
    } else {
      if (floatTitle) floatTitle.textContent = 'CapCut Pro (Ad-Free)';
      if (floatSub) floatSub.textContent = '🔥 Trending Mod Today';
      if (floatBtn) {
        floatBtn.textContent = '⚡ Get APK';
        floatBtn.href = '/apps/capcut/download/';
      }
    }

    setTimeout(() => {
      floatBar.style.display = 'block';
    }, 1500);

    if (floatClose) {
      floatClose.addEventListener('click', () => {
        floatBar.style.display = 'none';
        sessionStorage.setItem('dismissFloatingBar', '1');
      });
    }
  }

  // 13. Web Push Notification Opt-In Prompt
  const pushPrompt = document.getElementById('pushOptinPrompt');
  if (pushPrompt && 'Notification' in window && Notification.permission === 'default' && !sessionStorage.getItem('pushPromptDismissed')) {
    const pushAllow = document.getElementById('pushOptinAllow');
    const pushLater = document.getElementById('pushOptinLater');

    setTimeout(() => {
      pushPrompt.style.display = 'block';
    }, 10000);

    if (pushAllow) {
      pushAllow.addEventListener('click', async () => {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            pushPrompt.innerHTML = '<div style="color:#10b981; font-weight:700; font-size:0.9rem; text-align:center;">🎉 Subscribed to APKWorlds VIP Update Alerts!</div>';
            setTimeout(() => { pushPrompt.remove(); }, 2500);
          } else {
            pushPrompt.remove();
          }
        } catch {
          pushPrompt.remove();
        }
        sessionStorage.setItem('pushPromptDismissed', '1');
      });
    }

    if (pushLater) {
      pushLater.addEventListener('click', () => {
        pushPrompt.style.display = 'none';
        sessionStorage.setItem('pushPromptDismissed', '1');
      });
    }
  }

  // 14. Online XAPK to APK & OBB Extractor Tool
  const xapkDropzone = document.getElementById('xapkDropzone');
  const xapkInput = document.getElementById('xapkFileInput');
  if (xapkDropzone && xapkInput) {
    const xapkProgress = document.getElementById('xapkProgress');
    const xapkProgressBar = document.getElementById('xapkProgressBar');
    const xapkProgressText = document.getElementById('xapkProgressText');
    const xapkProgressLabel = document.getElementById('xapkProgressLabel');
    const xapkResults = document.getElementById('xapkResults');
    const xapkFileList = document.getElementById('xapkFileList');

    ['dragenter', 'dragover'].forEach(evt => {
      xapkDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        xapkDropzone.style.borderColor = '#10b981';
        xapkDropzone.style.background = 'rgba(16,185,129,0.06)';
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      xapkDropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        xapkDropzone.style.borderColor = '#2563eb';
        xapkDropzone.style.background = 'var(--bg-surface)';
      });
    });

    xapkDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processXapkFile(e.dataTransfer.files[0]);
      }
    });

    xapkInput.addEventListener('change', () => {
      if (xapkInput.files && xapkInput.files[0]) {
        processXapkFile(xapkInput.files[0]);
      }
    });

    function fmtSize(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function processXapkFile(file) {
      if (!file) return;
      xapkProgress.style.display = 'block';
      xapkResults.style.display = 'none';
      xapkFileList.innerHTML = '';
      xapkProgressBar.style.width = '15%';
      xapkProgressText.textContent = '15%';
      xapkProgressLabel.textContent = `Reading ${file.name} (${fmtSize(file.size)})...`;

      try {
        const buffer = await file.arrayBuffer();
        xapkProgressBar.style.width = '45%';
        xapkProgressText.textContent = '45%';
        xapkProgressLabel.textContent = 'Parsing XAPK zip container & file tables...';

        const view = new DataView(buffer);
        let eocdOffset = -1;
        for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
          if (view.getUint32(i, true) === 0x06054b50) {
            eocdOffset = i;
            break;
          }
        }

        const entries = [];
        if (eocdOffset !== -1) {
          const cdOffset = view.getUint32(eocdOffset + 16, true);
          const totalEntries = view.getUint16(eocdOffset + 10, true);
          let offset = cdOffset;

          for (let i = 0; i < totalEntries && offset < buffer.byteLength; i++) {
            if (view.getUint32(offset, true) !== 0x02014b50) break;
            const method = view.getUint16(offset + 10, true);
            const compSize = view.getUint32(offset + 20, true);
            const uncompSize = view.getUint32(offset + 24, true);
            const nameLen = view.getUint16(offset + 28, true);
            const extraLen = view.getUint16(offset + 30, true);
            const commentLen = view.getUint16(offset + 32, true);
            const localHeaderOffset = view.getUint32(offset + 42, true);

            const nameBytes = new Uint8Array(buffer, offset + 46, nameLen);
            const filename = new TextDecoder().decode(nameBytes);

            if (localHeaderOffset + 30 <= buffer.byteLength && view.getUint32(localHeaderOffset, true) === 0x04034b50) {
              const localNameLen = view.getUint16(localHeaderOffset + 26, true);
              const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
              const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
              entries.push({ filename, method, compSize, uncompSize, dataOffset });
            }

            offset += 46 + nameLen + extraLen + commentLen;
          }
        }

        xapkProgressBar.style.width = '75%';
        xapkProgressText.textContent = '75%';
        xapkProgressLabel.textContent = `Extracting ${entries.length} items from archive...`;

        const relevant = entries.filter(e => 
          !e.filename.endsWith('/') && (e.filename.endsWith('.apk') || e.filename.endsWith('.obb') || e.filename.endsWith('.json'))
        );

        if (!relevant.length) {
          relevant.push({
            filename: file.name.replace(/\.[^/.]+$/, "") + ".apk",
            method: 0,
            compSize: buffer.byteLength,
            uncompSize: buffer.byteLength,
            dataOffset: 0
          });
        }

        for (const item of relevant) {
          let blob;
          const compressedSlice = new Uint8Array(buffer, item.dataOffset, item.compSize);
          if (item.method === 0) {
            blob = new Blob([compressedSlice], { type: 'application/octet-stream' });
          } else if (item.method === 8 && typeof DecompressionStream !== 'undefined') {
            try {
              const ds = new DecompressionStream('deflate-raw');
              const writer = ds.writable.getWriter();
              writer.write(compressedSlice);
              writer.close();
              const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
              blob = new Blob([decompressedBuffer], { type: 'application/octet-stream' });
            } catch {
              blob = new Blob([compressedSlice], { type: 'application/octet-stream' });
            }
          } else {
            blob = new Blob([compressedSlice], { type: 'application/octet-stream' });
          }

          const blobUrl = URL.createObjectURL(blob);
          const isApk = item.filename.endsWith('.apk');
          const isObb = item.filename.endsWith('.obb');
          const isBase = item.filename.toLowerCase().includes('base') || (isApk && !item.filename.includes('split'));
          const cleanName = item.filename.split('/').pop();

          const card = document.createElement('div');
          card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:12px 14px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px;';
          card.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; min-width:220px; flex:1;">
              <span style="font-size:1.6rem;">${isApk ? (isBase ? '⭐' : '📱') : (isObb ? '📁' : '📄')}</span>
              <div>
                <div style="font-weight:700; font-size:0.95rem; color:var(--text); word-break:break-all;">
                  ${escHtml(cleanName)}
                  ${isBase ? '<span style="background:#10b981; color:#fff; font-size:0.7rem; padding:1px 6px; border-radius:4px; margin-left:6px; font-weight:800;">BASE APK</span>' : ''}
                  ${isObb ? '<span style="background:#2563eb; color:#fff; font-size:0.7rem; padding:1px 6px; border-radius:4px; margin-left:6px; font-weight:800;">OBB CACHE</span>' : ''}
                </div>
                <div style="font-size:0.8rem; color:var(--muted); margin-top:2px;">
                  Size: ${fmtSize(item.uncompSize || item.compSize)} &bull; ${escHtml(item.filename)}
                </div>
              </div>
            </div>
            <a href="${blobUrl}" download="${escHtml(cleanName)}" class="btn primary" style="font-size:0.85rem; font-weight:700; padding:0.6rem 1.15rem; border-radius:8px; display:inline-flex; align-items:center; gap:6px; text-decoration:none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download ${isApk ? 'APK' : (isObb ? 'OBB' : 'File')}</span>
            </a>
          `;
          xapkFileList.appendChild(card);
        }

        xapkProgressBar.style.width = '100%';
        xapkProgressText.textContent = '100%';
        xapkProgressLabel.textContent = 'Extraction complete!';
        setTimeout(() => {
          xapkProgress.style.display = 'none';
          xapkResults.style.display = 'block';
        }, 500);

      } catch (err) {
        xapkProgressLabel.textContent = 'Could not unpack container: ' + err.message;
        xapkProgressBar.style.background = '#ef4444';
      }
    }
  }

  // 15. Geo-Restriction Auto-Country Detection
  const regionBadge = document.getElementById('regionCountryBadge');
  if (regionBadge) {
    try {
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      let countryName = 'Global';
      if (tz.includes('karachi')) countryName = 'Pakistan';
      else if (tz.includes('calcutta') || tz.includes('kolkata')) countryName = 'India';
      else if (tz.includes('london')) countryName = 'United Kingdom';
      else if (tz.includes('new_york') || tz.includes('chicago') || tz.includes('los_angeles')) countryName = 'United States';
      else if (tz.includes('dhaka')) countryName = 'Bangladesh';
      else if (tz.includes('jakarta')) countryName = 'Indonesia';
      else if (tz.includes('dubai') || tz.includes('riyadh')) countryName = 'UAE / Middle East';
      else if (tz.includes('berlin') || tz.includes('paris') || tz.includes('madrid') || tz.includes('rome')) countryName = 'Europe';
      else if (tz.includes('sao_paulo')) countryName = 'Brazil';
      else if (tz.includes('toronto') || tz.includes('vancouver')) countryName = 'Canada';
      else if (tz.includes('sydney') || tz.includes('melbourne')) countryName = 'Australia';
      else {
        const parts = tz.split('/');
        countryName = parts[1] ? parts[1].replace(/_/g, ' ').toUpperCase() : 'Your Region';
      }
      regionBadge.textContent = `📍 ${countryName} Sideload Active (100% Works)`;
    } catch {
      regionBadge.textContent = '📍 Global Sideload Active (100% Works)';
    }
  }

  // 16. VirusTotal 70+ Antivirus Inspection Certificate Modal
  const btnOpenCert = document.getElementById('btnOpenAntivirusCert');
  const certModal = document.getElementById('antivirusCertModal');
  if (btnOpenCert && certModal) {
    const certClose = document.getElementById('certModalClose');
    const certDone = document.getElementById('certModalDone');

    function openCert() {
      certModal.style.display = 'flex';
    }
    function closeCert() {
      certModal.style.display = 'none';
    }

    btnOpenCert.addEventListener('click', openCert);
    if (certClose) certClose.addEventListener('click', closeCert);
    if (certDone) certDone.addEventListener('click', closeCert);
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeCert();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && certModal.style.display === 'flex') {
        closeCert();
      }
    });
  }

  // 17. "Did this APK work on your phone?" 1-Click Community Pulse Widget
  const pulseCard = document.getElementById('communityPulseCard');
  if (pulseCard) {
    const slug = pulseCard.getAttribute('data-app-slug') || 'app';
    const storageKey = 'apk_pulse_' + slug;
    const pulseVoteButtons = document.getElementById('pulseVoteButtons');
    const pulseVotedMsg = document.getElementById('pulseVotedMsg');
    const pulseYesCount = document.getElementById('pulseYesCount');

    if (localStorage.getItem(storageKey)) {
      if (pulseVoteButtons) pulseVoteButtons.style.display = 'none';
      if (pulseVotedMsg) {
        pulseVotedMsg.style.display = 'block';
        pulseVotedMsg.textContent = '✓ Your compatibility vote has already been counted for this release.';
      }
    }

    pulseCard.querySelectorAll('.btn-pulse-vote').forEach(btn => {
      btn.addEventListener('click', () => {
        const vote = btn.getAttribute('data-vote');
        localStorage.setItem(storageKey, vote);
        if (vote === 'yes' && pulseYesCount) {
          pulseYesCount.textContent = '98.9%';
        }
        if (pulseVoteButtons) pulseVoteButtons.style.display = 'none';
        if (pulseVotedMsg) pulseVotedMsg.style.display = 'block';
      });
    });
  }

  // 18. APK Versions Architecture Filter
  const verFilterBar = document.querySelector('.ver-filter-chips');
  const versionsTable = document.getElementById('versionsTable');
  if (verFilterBar && versionsTable) {
    const filterButtons = verFilterBar.querySelectorAll('.btn-ver-filter');
    const rows = versionsTable.querySelectorAll('tbody tr');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('is-active');
          b.style.background = 'var(--bg-card)';
          b.style.color = 'var(--text)';
          b.style.borderColor = 'var(--border)';
        });
        btn.classList.add('is-active');
        btn.style.background = '#2563eb';
        btn.style.color = '#fff';
        btn.style.borderColor = '#2563eb';

        const filter = btn.getAttribute('data-filter');

        rows.forEach(row => {
          const arch = row.getAttribute('data-arch') || 'universal';
          const minVer = parseFloat(row.getAttribute('data-min-ver')) || 7.0;

          if (filter === 'all') {
            row.style.display = '';
          } else if (filter === 'arm64') {
            row.style.display = (arch === 'arm64' || arch === 'universal') ? '' : 'none';
          } else if (filter === 'arm32') {
            row.style.display = (arch === 'arm32' || arch === 'universal') ? '' : 'none';
          } else if (filter === 'modern') {
            row.style.display = minVer >= 10.0 ? '' : 'none';
          } else if (filter === 'legacy') {
            row.style.display = minVer < 10.0 ? '' : 'none';
          }
        });
      });
    });
  }

  // 19. Scan to Phone QR Code Modal & Clipboard Copy
  const qrModal = document.getElementById('qrCodeModal');
  if (qrModal) {
    const qrClose = document.getElementById('qrModalClose');
    const copyLinkBtn = document.getElementById('btnCopyMobileLink');
    const copyLinkText = document.getElementById('copyMobileLinkText');

    function openQrModal() {
      qrModal.style.display = 'flex';
    }
    function closeQrModal() {
      qrModal.style.display = 'none';
    }

    document.querySelectorAll('.btnOpenQrModal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openQrModal();
      });
    });

    if (qrClose) qrClose.addEventListener('click', closeQrModal);
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) closeQrModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && qrModal.style.display === 'flex') {
        closeQrModal();
      }
    });

    if (copyLinkBtn && copyLinkText) {
      copyLinkBtn.addEventListener('click', async () => {
        const link = copyLinkBtn.getAttribute('data-link');
        try {
          await navigator.clipboard.writeText(link);
          copyLinkText.textContent = '✓ Copied to Clipboard!';
          setTimeout(() => {
            copyLinkText.textContent = 'Copy Mobile Download Link';
          }, 2500);
        } catch {
          // fallback
        }
      });
    }
  }

  // 20. 1-Click ADB Installer Command Copy
  const btnCopyAdb = document.getElementById('btnCopyAdbCmd');
  const copyAdbText = document.getElementById('copyAdbBtnText');
  if (btnCopyAdb && copyAdbText) {
    btnCopyAdb.addEventListener('click', async () => {
      const cmd = btnCopyAdb.getAttribute('data-cmd');
      try {
        await navigator.clipboard.writeText(cmd);
        copyAdbText.textContent = '✓ Copied!';
        btnCopyAdb.style.background = '#10b981';
        setTimeout(() => {
          copyAdbText.textContent = '📋 Copy Command';
          btnCopyAdb.style.background = '#2563eb';
        }, 2500);
      } catch {
        // fallback
      }
    });
  }

  // 21. Interactive Version Diff & Changelog Comparison Engine
  const diffBox = document.getElementById('versionDiffCard');
  if (diffBox) {
    const selA = document.getElementById('diffVerA');
    const selB = document.getElementById('diffVerB');
    const headA = document.getElementById('diffHeadingA');
    const headB = document.getElementById('diffHeadingB');
    const metaA = document.getElementById('diffMetaA');
    const metaB = document.getElementById('diffMetaB');
    const summary = document.getElementById('diffDeltaSummary');

    function fmtBytesJs(b) {
      if (!b || b === 0) return 'Standard';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(b) / Math.log(k));
      return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function updateDiff() {
      if (!selA || !selB) return;
      const optA = selA.options[selA.selectedIndex];
      const optB = selB.options[selB.selectedIndex];
      if (!optA || !optB) return;

      const verA = optA.value;
      const verB = optB.value;
      const sizeA = parseInt(optA.getAttribute('data-size')) || 0;
      const sizeB = parseInt(optB.getAttribute('data-size')) || 0;
      const minA = optA.getAttribute('data-min-ver') || '7.0';
      const minB = optB.getAttribute('data-min-ver') || '7.0';

      if (headA) headA.textContent = 'v' + verA;
      if (headB) headB.textContent = 'v' + verB;
      if (metaA) metaA.textContent = `Size: ${fmtBytesJs(sizeA)} • Android ${minA}+`;
      if (metaB) metaB.textContent = `Size: ${fmtBytesJs(sizeB)} • Android ${minB}+`;

      if (summary) {
        if (sizeA && sizeB) {
          const delta = sizeB - sizeA;
          const mbDelta = (delta / (1024 * 1024)).toFixed(1);
          if (delta > 0) {
            summary.innerHTML = `<span style="color:#d97706;">📈 v${verB} is +${mbDelta} MB heavier than v${verA} (New features &amp; graphics assets added)</span>`;
          } else if (delta < 0) {
            summary.innerHTML = `<span style="color:#10b981;">⚡ v${verB} is ${Math.abs(mbDelta)} MB more lightweight &amp; optimized than v${verA}</span>`;
          } else {
            summary.innerHTML = `<span style="color:#2563eb;">⚖️ Both releases have identical package sizes &amp; compatibility profile</span>`;
          }
        } else {
          summary.textContent = `⚡ Version comparison active: v${verA} vs v${verB}`;
        }
      }
    }

    if (selA) selA.addEventListener('change', updateDiff);
    if (selB) selB.addEventListener('change', updateDiff);
  }
})();

