(function () {
  'use strict';

  const PIXEL_DEBUG = false;
  const sentEvents = new Map();

  function canTrack() {
    return typeof window.fbq === 'function';
  }

  function debug(eventName, payload) {
    if (!PIXEL_DEBUG) return;
    console.log('[Meta Pixel]', eventName, payload || {});
  }

  function shouldSend(key, delay) {
    const now = Date.now();
    const lastSent = sentEvents.get(key) || 0;

    if (now - lastSent < delay) return false;

    sentEvents.set(key, now);
    return true;
  }

  function track(eventName, payload) {
    if (!shouldSend(eventName + JSON.stringify(payload || {}), 900)) return;

    if (!canTrack()) {
      debug('fbq indisponível', { eventName, payload });
      return;
    }

    try {
      window.fbq('track', eventName, payload || {});
      debug(eventName, payload);
    } catch (error) {
      console.warn('[Meta Pixel] erro ao enviar evento:', eventName, error);
    }
  }

  function trackCustom(eventName, payload) {
    if (!shouldSend(eventName + JSON.stringify(payload || {}), 900)) return;

    if (!canTrack()) {
      debug('fbq indisponível', { eventName, payload });
      return;
    }

    try {
      window.fbq('trackCustom', eventName, payload || {});
      debug(eventName, payload);
    } catch (error) {
      console.warn('[Meta Pixel] erro ao enviar evento customizado:', eventName, error);
    }
  }

  function getText(element) {
    if (!element) return '';
    return (element.textContent || element.getAttribute('aria-label') || element.dataset.pixelLabel || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  function getHref(element) {
    return element ? element.getAttribute('href') || '' : '';
  }

  function isWhatsappLink(element) {
    const href = getHref(element).toLowerCase();
    return href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp');
  }

  function isInstagramLink(element) {
    const href = getHref(element).toLowerCase();
    return href.includes('instagram.com');
  }

  function isScheduleText(text) {
    const value = String(text || '').toLowerCase();
    return value.includes('agendar') ||
      value.includes('orçamento') ||
      value.includes('orcamento') ||
      value.includes('fazer orçamento') ||
      value.includes('fazer orcamento') ||
      value.includes('quero tatuar') ||
      value.includes('falar com') ||
      value.includes('solicitar');
  }

  function bindClickTracking() {
    document.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      const button = event.target.closest('button, [role="button"]');
      const clickable = link || button;

      if (!clickable) return;

      const label = getText(clickable);
      const href = link ? getHref(link) : '';
      const explicitEvent = clickable.dataset.pixelEvent;
      const explicitLabel = clickable.dataset.pixelLabel;

      if (explicitEvent === 'Lead') {
        track('Lead', {
          content_name: explicitLabel || label || 'CTA',
          content_category: 'CTA'
        });

        trackCustom('ScheduleIntent', {
          button_text: explicitLabel || label || 'CTA'
        });

        return;
      }

      if (link && isWhatsappLink(link)) {
        track('Contact', {
          content_name: 'Clique WhatsApp',
          content_category: 'Contato',
          button_text: label || 'WhatsApp'
        });

        trackCustom('WhatsAppClick', {
          button_text: label || 'WhatsApp',
          destination_url: href
        });

        return;
      }

      if (link && isInstagramLink(link)) {
        trackCustom('InstagramClick', {
          button_text: label || 'Instagram',
          destination_url: href
        });

        return;
      }

      if (isScheduleText(label)) {
        track('Lead', {
          content_name: 'Clique em CTA de agendamento',
          content_category: 'CTA',
          button_text: label || 'CTA'
        });

        trackCustom('ScheduleIntent', {
          button_text: label || 'CTA'
        });
      }
    }, true);
  }

  function trackPortfolioVideo(videoSrc, title) {
    if (!videoSrc) return;

    track('ViewContent', {
      content_name: title || 'Vídeo do portfólio',
      content_category: 'Portfólio',
      content_type: 'video'
    });

    trackCustom('PortfolioVideoOpen', {
      video_url: videoSrc,
      title: title || 'Vídeo do portfólio'
    });
  }

  function getPortfolioVideoSource(element) {
    if (!element) return '';

    const direct =
      element.dataset.videoSrc ||
      element.dataset.video ||
      element.dataset.videoUrl ||
      element.getAttribute('data-video-src') ||
      element.getAttribute('data-video') ||
      element.getAttribute('data-video-url');

    if (direct) return direct;

    const nested = element.querySelector('[data-video-src], [data-video], [data-video-url]');
    if (!nested) return '';

    return nested.dataset.videoSrc ||
      nested.dataset.video ||
      nested.dataset.videoUrl ||
      nested.getAttribute('data-video-src') ||
      nested.getAttribute('data-video') ||
      nested.getAttribute('data-video-url') ||
      '';
  }

  function bindPortfolioVideoTracking() {
    document.addEventListener('click', function (event) {
      const portfolioItem = event.target.closest('.portfolio-item, .portfolio-card, .portfolio-ring-card, .portfolio-depth-carousel__card, [data-video-src], [data-video], [data-video-url]');

      if (!portfolioItem) return;

      const videoSrc = getPortfolioVideoSource(portfolioItem);

      if (!videoSrc) return;

      trackPortfolioVideo(videoSrc, portfolioItem.dataset.videoTitle || portfolioItem.getAttribute('aria-label'));
    }, true);

    const wrapModalFunction = function () {
      if (typeof window.openPortfolioModalFromRing !== 'function' || window.openPortfolioModalFromRing.datasetPixelWrapped === true) return;

      const originalOpen = window.openPortfolioModalFromRing;

      window.openPortfolioModalFromRing = function (videoSrc) {
        trackPortfolioVideo(videoSrc, 'Vídeo do portfólio');
        return originalOpen.apply(this, arguments);
      };

      window.openPortfolioModalFromRing.datasetPixelWrapped = true;
    };

    wrapModalFunction();
    window.setTimeout(wrapModalFunction, 600);
    window.setTimeout(wrapModalFunction, 1400);
  }

  function bindFormTracking() {
    const forms = document.querySelectorAll('form');

    forms.forEach(function (form) {
      if (form.dataset.pixelFormReady === 'true') return;
      form.dataset.pixelFormReady = 'true';

      form.addEventListener('submit', function () {
        const formName = form.getAttribute('name') || form.getAttribute('id') || form.dataset.formName || 'Formulário do site';

        track('Lead', {
          content_name: formName,
          content_category: 'Formulário'
        });

        trackCustom('FormSubmitIntent', {
          form_name: formName
        });
      });
    });
  }

  function bindSectionViewTracking() {
    const sections = [
      { selector: '#portfolio, .portfolio-section', event: 'PortfolioSectionView' },
      { selector: '#orcamento, .budget-section, .quote-section', event: 'BudgetSectionView' },
      { selector: '#localizacao, .location-section, .map-section', event: 'LocationSectionView' },
      { selector: '#avaliacoes, .testimonials-section', event: 'TestimonialsSectionView' }
    ];

    const availableSections = sections
      .map(function (item) {
        return {
          event: item.event,
          element: document.querySelector(item.selector)
        };
      })
      .filter(function (item) {
        return item.element;
      });

    if (!availableSections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const match = availableSections.find(function (item) {
          return item.element === entry.target;
        });

        if (!match) return;

        trackCustom(match.event, {
          section: match.event
        });

        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.45
    });

    availableSections.forEach(function (item) {
      observer.observe(item.element);
    });
  }

  function initMetaPixelEvents() {
    bindClickTracking();
    bindPortfolioVideoTracking();
    bindFormTracking();
    bindSectionViewTracking();
    debug('eventos inicializados');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMetaPixelEvents);
  } else {
    initMetaPixelEvents();
  }
})();
