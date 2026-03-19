(() => {
  const btn = document.querySelector('[data-menu-btn]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (btn && panel) {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  const toTop = document.querySelector('[data-to-top]');
  const onScroll = () => {
    if (!toTop) return;
    const show = window.scrollY > 500;
    toTop.setAttribute('aria-hidden', String(!show));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-youtube]').forEach((wrap) => {
    const id = wrap.getAttribute('data-youtube');
    const title = wrap.getAttribute('data-youtube-title') || 'After North - Thesis Project by Sora Funk';
    const playBtn = wrap.querySelector('.yt-play');
    if (!id || !playBtn) return;
    playBtn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
      iframe.title = title;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      wrap.replaceWith(iframe);
    }, { once: true });
  });

  const previewCards = document.querySelectorAll('[data-preview-card]');
  previewCards.forEach((card) => {
    const video = card.querySelector('[data-preview-video]');
    if (!video) return;

    const playPreview = () => {
      card.classList.add('is-preview-playing');
      video.play().catch(() => {});
    };
    const stopPreview = () => {
      card.classList.remove('is-preview-playing');
      video.pause();
      try { video.currentTime = 0; } catch (error) {}
    };

    card.addEventListener('mouseenter', playPreview);
    card.addEventListener('mouseleave', stopPreview);
    card.addEventListener('focusin', playPreview);
    card.addEventListener('focusout', stopPreview);
  });

  const lightboxable = Array.from(document.querySelectorAll('[data-lightboxable]'));
  if (lightboxable.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="lightbox-inner" role="dialog" aria-modal="true" aria-label="Expanded artwork view">
        <button class="lightbox-close" type="button" aria-label="Close expanded image">×</button>
        <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">‹</button>
        <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">›</button>
        <div class="lightbox-image-wrap">
          <img src="" alt="" />
        </div>
        <p class="lightbox-caption"></p>
      </div>`;
    document.body.appendChild(overlay);

    const lightboxImage = overlay.querySelector('img');
    const caption = overlay.querySelector('.lightbox-caption');
    const closeBtn = overlay.querySelector('.lightbox-close');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');
    let lastTrigger = null;
    let currentIndex = 0;

    const renderLightbox = () => {
      const trigger = lightboxable[currentIndex];
      if (!trigger) return;
      lightboxImage.src = trigger.dataset.lightboxSrc || trigger.currentSrc || trigger.src;
      lightboxImage.alt = trigger.alt || '';
      caption.textContent = trigger.dataset.caption || trigger.alt || '';
      prevBtn.hidden = lightboxable.length < 2;
      nextBtn.hidden = lightboxable.length < 2;
    };

    const closeLightbox = () => {
      overlay.hidden = true;
      document.body.classList.remove('lightbox-open');
      if (lastTrigger) lastTrigger.focus();
    };

    const openLightbox = (trigger) => {
      lastTrigger = trigger;
      currentIndex = Math.max(0, lightboxable.indexOf(trigger));
      renderLightbox();
      overlay.hidden = false;
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    };

    const stepLightbox = (direction) => {
      currentIndex = (currentIndex + direction + lightboxable.length) % lightboxable.length;
      renderLightbox();
    };

    lightboxable.forEach((el) => {
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (el.alt || 'Open image') + ' expanded view');
      el.addEventListener('click', () => openLightbox(el));
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(el);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => stepLightbox(-1));
    nextBtn.addEventListener('click', () => stepLightbox(1));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (overlay.hidden) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') stepLightbox(-1);
      if (event.key === 'ArrowRight') stepLightbox(1);
    });
  }
})();
