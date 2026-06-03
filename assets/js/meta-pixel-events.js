(function () {
  'use strict';

  const PIXEL_DEBUG = false;
  const firedEvents = new Map();

  function canTrack() {
    return typeof window.fbq === 'function';
  }

  function debug(eventName, payload) {
    if (!PIXEL_DEBUG) return;
    console.log('[Meta Pixel]', eventName, payload || {});
  }

  function track(eventName, payload) {
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

  function once(key, delay) {
    const now = Date.now();
    const last = firedEvents.get(key) || 0;

    if (now - last < (delay || 900)) return false;

    firedEvents.set(key, now);
    return true;
  }

  function getText(element) {
    if (!element) return '';
    return (element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  function getHref(element) {
    return element ? element.getAttribute('href') || '' : '';
  }

  function isWhatsappLink(element) {
    const href = getHref(element).toLowerCase();
    return href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp');
  }

  function isInstagramLink(element) {
    return getHref(element).toLowerCase().includes('instagram.com');
  }

  function isScheduleIntent(text) {
    const value = String(text || '').toLowerCase();

    return (
      value.includes('agendar') ||
      value.includes('orçamento') ||
      value.includes('orcamento') ||
      value.includes('fazer orçamento') ||
      value.includes('fazer orcamento') ||
      value.includes('solicitar orçamento') ||
      value.includes('solicitar orcamento') ||
      value.includes('quero tatuar') ||
      value.includes('falar com')
    );
  }

  function findRingCardFromPoint(event) {
    const cards = Array.from(document.querySelectorAll('.portfolio-ring-card'));

    let selectedCard = null;
    let selectedScore = Infinity;

    cards.forEach(function (card) {
      const rect = card.getBoundingClientRect();

      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInside) return;

      const area = rect.width * rect.height;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(event.clientX - centerX) + Math.abs(event.clientY - centerY);
      const score = distance + Math.abs(area - 90000) * 0.002;

      if (score < selectedScore) {
        selectedScore = score;
        selectedCard = card;
      }
    });

    return selectedCard;
  }

  function getPortfolioItem(event) {
    const directItem = event.target.closest(
      '.portfolio-item, .portfolio-card, .portfolio-ring-card, .portfolio-depth-carousel__card, [data-video-src], [data-video], [data-video-url]'
    );

    return directItem || findRingCardFromPoint(event);
  }

  function getVideoData(portfolioItem) {
    if (!portfolioItem) return null;

    const trigger = portfolioItem.matches('[data-video-src], [data-video], [data-video-url]')
      ? portfolioItem
      : portfolioItem.querySelector('[data-video-src], [data-video], [data-video-url]');

    if (!trigger) return null;

    const videoUrl =
      trigger.dataset.videoSrc ||
      trigger.dataset.video ||
      trigger.dataset.videoUrl ||
      trigger.getAttribute('data-video-src') ||
      trigger.getAttribute('data-video') ||
      trigger.getAttribute('data-video-url') ||
      '';

    if (!videoUrl) return null;

    return {
      videoUrl,
      title: trigger.dataset.videoTitle || trigger.getAttribute('aria-label') || getText(trigger) || 'Vídeo do portfólio'
    };
  }

  function bindClickTracking() {
    document.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      const button = event.target.closest('button, [role="button"]');
      const clickable = link || button;

      if (!clickable) return;

      const label = getText(clickable);
      const href = getHref(link);
      const explicitEvent = clickable.dataset.pixelEvent;
      const explicitLabel = clickable.dataset.pixelLabel || label;

      if (explicitEvent === 'Lead' && once('explicit-lead-' + explicitLabel)) {
        track('Lead', {
          content_name: explicitLabel,
          content_category: 'CTA'
        });

        trackCustom('ScheduleIntent', {
          button_text: explicitLabel
        });
      }

      if (link && isWhatsappLink(link) && once('whatsapp-' + href)) {
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

      if (link && isInstagramLink(link) && once('instagram-' + href)) {
        trackCustom('InstagramClick', {
          button_text: label || 'Instagram',
          destination_url: href
        });

        return;
      }

      if (isScheduleIntent(label) && once('schedule-' + label)) {
        track('Lead', {
          content_name: 'Clique em CTA de agendamento',
          content_category: 'CTA',
          button_text: label
        });

        trackCustom('ScheduleIntent', {
          button_text: label
        });
      }
    }, true);
  }

  function bindPortfolioVideoTracking() {
    document.addEventListener('click', function (event) {
      const portfolioItem = getPortfolioItem(event);
      const videoData = getVideoData(portfolioItem);

      if (!videoData || !once('portfolio-video-' + videoData.videoUrl)) return;

      track('ViewContent', {
        content_name: videoData.title,
        content_category: 'Portfólio',
        content_type: 'video'
      });

      trackCustom('PortfolioVideoOpen', {
        video_url: videoData.videoUrl,
        title: videoData.title
      });
    }, true);
  }

  function bindFormTracking() {
    const forms = document.querySelectorAll('form');

    forms.forEach(function (form) {
      if (form.dataset.pixelFormReady === 'true') return;
      form.dataset.pixelFormReady = 'true';

      form.addEventListener('submit', function () {
        const formName =
          form.getAttribute('name') ||
          form.getAttribute('id') ||
          form.dataset.formName ||
          'Formulário do site';

        if (!once('form-' + formName, 1800)) return;

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
      { selector: '#portfolio, .portfolio-section, .portfolio', event: 'PortfolioSectionView' },
      { selector: '#orcamento, .budget-section, .quote-section, .budget', event: 'BudgetSectionView' },
      { selector: '#localizacao, .location-section, .map-section, .location', event: 'LocationSectionView' },
      { selector: '#avaliacoes, .testimonials-section, .testimonials', event: 'TestimonialsSectionView' }
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

        if (!match || !once('section-' + match.event, 60000)) return;

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
