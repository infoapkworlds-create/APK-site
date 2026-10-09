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

        let match = true;
        if (q && !name.includes(q)) match = false;
        if (cat && cCat !== cat) match = false;
        if (price && cPrice !== price) match = false;

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
})();

