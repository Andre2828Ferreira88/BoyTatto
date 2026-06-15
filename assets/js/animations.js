
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth <= 860;

  function whenReady(fn) {
    const run = () => {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        fn();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }

  whenReady(function () {
    if (prefersReduced) return;

    safeRun('Marquee', initMarquee);
    safeRun('Text Mask Reveal', initTextMaskReveal);
    safeRun('GSAP Scroll Reveal', initGsapScrollReveal);
    safeRun('Image Parallax', initImageParallax);
    safeRun('Scroll Morph', initTattooScrollMorph);
    safeRun('Section Entrance', initSectionEntrance);
  });

  function safeRun(name, fn) {
    try { fn(); } catch (e) { console.warn('[Boy Tattoo Anim] ' + name + ':', e); }
  }

  function initMarquee() {
    const existing = document.querySelector('.bt-marquee');
    if (existing) return;

    const text = 'TRAÇO AUTORAL · BLACKWORK · FINE LINE · REALISMO · ARTE NA PELE · BOY TATTOO ·';
    const repeats = 6;
    let content = '';
    for (let i = 0; i < repeats; i++) content += `<span>${text}&nbsp;&nbsp;</span>`;

    const marquee = document.createElement('div');
    marquee.className = 'bt-marquee';
    marquee.setAttribute('aria-hidden', 'true');
    marquee.innerHTML = `
      <div class="bt-marquee__track">
        <div class="bt-marquee__inner">${content}</div>
        <div class="bt-marquee__inner" aria-hidden="true">${content}</div>
      </div>
    `;

    // Inserir entre portfólio e orçamento
    const portfolioSection = document.getElementById('portfolio');
    const budgetSection = document.getElementById('orcamento');

    if (portfolioSection && budgetSection) {
      portfolioSection.after(marquee);
    } else if (portfolioSection) {
      portfolioSection.after(marquee);
    } else {
      const main = document.querySelector('main');
      if (main) main.prepend(marquee);
    }

    // Animar com GSAP
    gsap.to('.bt-marquee__inner', {
      xPercent: -100,
      repeat: -1,
      duration: 28,
      ease: 'none',
      modifiers: {
        xPercent: gsap.utils.unitize(x => parseFloat(x) % 100)
      }
    });
  }

  /* ============================================================
     2. TEXT MASK REVEAL — Títulos revelados por máscara
     ============================================================ */
  function initTextMaskReveal() {
    const targets = document.querySelectorAll(
      '.section-title, .budget-copy h2, .location-content h2, .section h2'
    );

    targets.forEach(el => {
      if (el.dataset.maskDone) return;
      el.dataset.maskDone = '1';

      // Wrap each line/word in mask
      const original = el.innerHTML;
      el.innerHTML = `<span class="bt-mask-outer"><span class="bt-mask-inner">${original}</span></span>`;

      const inner = el.querySelector('.bt-mask-inner');

      gsap.fromTo(inner,
        { yPercent: 105, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.05,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true
          }
        }
      );
    });
  }

  /* ============================================================
     3. GSAP SCROLL REVEAL — Elementos entram com blur + fade
     ============================================================ */
  function initGsapScrollReveal() {
    const selectors = [
      '.section-header',
      '.hero-eyebrow',
      '.budget-step-card',
      '.budget-copy > p',
      '.location-content > p',
      '.site-footer',
      '.footer-brand',
      '.footer-links',
    ];

    const els = document.querySelectorAll(selectors.join(','));

    els.forEach((el, i) => {
      if (el.dataset.gsapReveal) return;
      el.dataset.gsapReveal = '1';

      gsap.fromTo(el,
        { y: 42, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 87%',
            once: true
          }
        }
      );
    });

    // Stagger nos cards de orçamento
    const stepCards = document.querySelectorAll('.budget-step-card');
    if (stepCards.length) {
      gsap.fromTo(stepCards,
        { y: 32, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.14,
          scrollTrigger: {
            trigger: stepCards[0],
            start: 'top 88%',
            once: true
          }
        }
      );
    }

    // Stagger nos cards de portfólio
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const portfolioItems = document.querySelectorAll('.portfolio-grid:not(.portfolio-ring-carousel):not(.portfolio-curve-carousel):not(.portfolio-carousel-3d) .portfolio-item:not(.portfolio-ring-card):not(.portfolio-carousel-card):not(.portfolio-curve-carousel__card)');

    if (portfolioGrid?.classList.contains('portfolio-ring-carousel') || portfolioGrid?.classList.contains('portfolio-carousel-3d') || portfolioGrid?.classList.contains('portfolio-curve-carousel')) {
      gsap.fromTo(portfolioGrid,
        { y: 34, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: portfolioGrid,
            start: 'top 84%',
            once: true
          }
        }
      );
    } else if (portfolioItems.length) {
      gsap.fromTo(portfolioItems,
        { y: 52, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: portfolioGrid,
            start: 'top 84%',
            once: true
          }
        }
      );
    }

    // Footer links stagger
    const footerLinks = document.querySelectorAll('.footer-links a');
    if (footerLinks.length) {
      gsap.fromTo(footerLinks,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: {
            trigger: document.querySelector('.site-footer'),
            start: 'top 92%',
            once: true
          }
        }
      );
    }
  }

  /* ============================================================
     4. IMAGE PARALLAX — Imagens do portfólio com profundidade
     ============================================================ */
  function initImageParallax() {
    if (isMobile()) return;

    const images = document.querySelectorAll('.portfolio-grid:not(.portfolio-ring-carousel):not(.portfolio-carousel-3d):not(.portfolio-curve-carousel) .portfolio-trigger img');

    images.forEach(img => {
      const parent = img.closest('.portfolio-trigger') || img.parentElement;
      if (!parent) return;

      gsap.fromTo(img,
        { yPercent: -6, scale: 1.1 },
        {
          yPercent: 6,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: parent,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });
  }

  /* ============================================================
     5. SCROLL MORPH — Seção com imagem que revela outra
     ============================================================ */
  function initTattooScrollMorph() {
    const section = document.querySelector('.bt-scroll-morph');
    if (!section) return;

    const revealImg = section.querySelector('.bt-scroll-morph__img--reveal');
    const baseImg = section.querySelector('.bt-scroll-morph__img--base');
    const content = section.querySelector('.bt-scroll-morph__content');

    if (!revealImg || !baseImg) return;

    // Mobile: mostrar ambas estaticamente
    if (isMobile()) {
      gsap.set(revealImg, { clipPath: 'inset(0% 0 0 0)' });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    tl.fromTo(revealImg,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', ease: 'none' },
      0
    );

    tl.fromTo(baseImg,
      { scale: 1.08 },
      { scale: 1.0, ease: 'none' },
      0
    );

    tl.fromTo(revealImg,
      { scale: 1.08 },
      { scale: 1.0, ease: 'none' },
      0
    );

    if (content) {
      tl.fromTo(content,
        { y: 30, opacity: 0.7 },
        { y: -30, opacity: 1, ease: 'none' },
        0
      );
    }
  }

  /* ============================================================
     6. SECTION ENTRANCE — Seções entram com movimento suave
     ============================================================ */
  function initSectionEntrance() {
    if (isMobile()) return;

    const sections = document.querySelectorAll(
      '.testimonials, .location, .budget'
    );

    sections.forEach(section => {
      gsap.fromTo(section,
        { y: 40, opacity: 0.6 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true
          }
        }
      );
    });
  }

})();

/* ============================================================
   CURSOR PREMIUM no portfólio
   ============================================================ */
(function initPremiumCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'bt-cursor';
  cursor.textContent = 'Ver';
  document.body.appendChild(cursor);

  let curX = 0, curY = 0;
  let rafId = null;

  document.addEventListener('mousemove', e => {
    curX = e.clientX;
    curY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        cursor.style.left = curX + 'px';
        cursor.style.top = curY + 'px';
        rafId = null;
      });
    }
  });

  document.querySelectorAll('.portfolio-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-active', 'is-clicking'));
    el.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
    el.addEventListener('mouseup', () => cursor.classList.remove('is-clicking'));
  });
})();
