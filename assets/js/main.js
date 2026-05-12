// Trocar pelo número real do profissional, com DDI e DDD.
// Exemplo: 5511999999999
const WHATSAPP_NUMBER = "5511941330786";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  if (prefersReducedMotion) {
    document.documentElement.classList.add("reduced-motion");
  }

  setCurrentYear();
  setupHeroVideo();
  setupBudgetForm();
  setupMobileMenu();

  initAnimatedNavbar();
  initSmoothAnchors();
  initButtonAnimations();
  initPortfolioVideoModal();
  initFormAnimations();
  initScrollProgress();
  initPortfolioAnimations();
  initTestimonialsCarousel();

  if (!prefersReducedMotion) {
    initHeroAnimations();
    initScrollReveal();
    initHeroParallax();
    initHeroPointerGlow();
  } else {
    revealEverythingImmediately();
  }
});

/* ========================================
   ANO ATUAL
   ======================================== */
function setCurrentYear() {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/* ========================================
   HERO VIDEO
   ======================================== */
function setupHeroVideo() {
  const video = document.querySelector(".hero-video");
  if (!video) return;

  video.muted = true;
  video.playsInline = true;

  const playPromise = video.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      video.load();
    });
  }
}

/* ========================================
   HERO — ENTRADA CINEMATOGRÁFICA
   ======================================== */
function initHeroAnimations() {
  document.body.classList.add("is-page-loading");

  const heroItems = document.querySelectorAll(
    ".site-header, .brand, .main-nav, .hero-eyebrow, .hero h1, .hero p, .hero-actions, .hero-actions .btn"
  );

  heroItems.forEach((item, index) => {
    item.style.setProperty("--hero-delay", `${Math.min(index * 90, 640)}ms`);
    item.classList.add("hero-animate-item");
  });

  requestAnimationFrame(() => {
    document.body.classList.add("is-page-loaded");

    setTimeout(() => {
      heroItems.forEach((item) => item.classList.add("is-visible"));
    }, 120);
  });
}

/* ========================================
   SCROLL REVEAL PREMIUM
   ======================================== */
function initScrollReveal() {
  const elements = Array.from(document.querySelectorAll(
    "[data-reveal], section, .section-header, .budget-copy, .budget-notes li, .portfolio-item, .budget-form, .budget-form .form-row, .location-content, .map-wrapper, .site-footer, .footer-brand, .footer-links a"
  ));

  if (!elements.length) return;

  const uniqueElements = [...new Set(elements)];

  uniqueElements.forEach((element, index) => {
    const currentReveal = element.getAttribute("data-reveal");
    element.setAttribute("data-reveal", currentReveal || "up");
    element.style.setProperty("--reveal-delay", `${Math.min((index % 8) * 45, 260)}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    revealEverythingImmediately();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed", "is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -5% 0px"
  });

  uniqueElements.forEach((element) => observer.observe(element));
}

function revealEverythingImmediately() {
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    element.classList.add("is-revealed", "is-visible");
  });
}

/* ========================================
   BOTÕES — MICROINTERAÇÕES + RIPPLE
   ======================================== */
function initButtonAnimations() {
  const buttons = document.querySelectorAll(".btn, button, .button, a[class*='btn']");

  buttons.forEach((button) => {
    if (button.classList.contains("js-animated-button")) return;

    button.classList.add("js-animated-button");

    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      button.style.setProperty("--btn-x", `${x}%`);
      button.style.setProperty("--btn-y", `${y}%`);
    });

    button.addEventListener("pointerdown", () => {
      button.classList.add("is-pressing");
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
      button.addEventListener(eventName, () => {
        button.classList.remove("is-pressing");
      });
    });

    button.addEventListener("click", (event) => {
      createButtonRipple(event, button);
    });
  });
}

function createButtonRipple(event, button) {
  if (prefersReducedMotion) return;

  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.className = "button-ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

/* ========================================
   NAVBAR — SCROLL DINÂMICO
   ======================================== */
function initAnimatedNavbar() {
  const header = document.querySelector(".site-header, .header, .navbar");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;

    header.classList.toggle("is-scrolled", currentScrollY > 20);

    if (currentScrollY > lastScrollY && currentScrollY > 180 && !document.body.classList.contains("is-modal-open")) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }

    lastScrollY = Math.max(currentScrollY, 0);
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();
}

/* ========================================
   MOBILE MENU
   ======================================== */
function setupMobileMenu() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  const overlay = document.getElementById("mobile-overlay");

  if (!toggle || !nav) return;

  const open = () => {
    toggle.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    nav.classList.add("is-open");
    if (overlay) {
      overlay.classList.add("is-active");
      overlay.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("is-menu-open");
  };

  const close = () => {
    toggle.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    if (overlay) {
      overlay.classList.remove("is-active");
      overlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("is-menu-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? close() : open();
  });

  overlay?.addEventListener("click", close);

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) close();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) close();
  });
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */
function initSmoothAnchors() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
}

/* ========================================
   FORMULÁRIO → WHATSAPP
   ======================================== */
function setupBudgetForm() {
  const form = document.getElementById("budget-form");
  const feedback = document.getElementById("form-feedback");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit'], .btn-submit, .form-submit");
    submitButton?.classList.add("is-loading");

    const formData = new FormData(form);
    const data = {
      name: cleanValue(formData.get("name")),
      phone: cleanValue(formData.get("phone")),
      email: cleanValue(formData.get("email")),
      bodyArea: cleanValue(formData.get("bodyArea")),
      size: cleanValue(formData.get("size")),
      style: cleanValue(formData.get("style")),
      idea: cleanValue(formData.get("idea")),
      reference: cleanValue(formData.get("reference")),
    };

    const requiredFields = [
      [data.name, "nome"],
      [data.phone, "WhatsApp"],
      [data.bodyArea, "região do corpo"],
      [data.size, "tamanho aproximado"],
      [data.style, "estilo desejado"],
      [data.idea, "descrição da ideia"],
    ];

    const missingField = requiredFields.find(([value]) => !value);

    if (missingField) {
      submitButton?.classList.remove("is-loading");
      showFeedback(feedback, `Preencha o campo ${missingField[1]} antes de enviar.`, true);
      return;
    }

    const message = buildWhatsAppMessage(data);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    showFeedback(feedback, "Abrindo WhatsApp com sua mensagem de orçamento...", false);

    setTimeout(() => {
      submitButton?.classList.remove("is-loading");
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }, 550);
  });
}

function cleanValue(value) {
  return String(value || "").trim();
}

function buildWhatsAppMessage(data) {
  return [
    "Olá, gostaria de solicitar um orçamento de tatuagem.",
    "",
    `Nome: ${data.name}`,
    `WhatsApp: ${data.phone}`,
    data.email ? `E-mail: ${data.email}` : "E-mail: não informado",
    `Região do corpo: ${data.bodyArea}`,
    `Tamanho aproximado: ${data.size}`,
    `Estilo: ${data.style}`,
    `Ideia: ${data.idea}`,
    data.reference ? `Referência: ${data.reference}` : "Referência: não informada",
  ].join("\n");
}

function showFeedback(element, message, isError) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", Boolean(isError));
  element.classList.add("is-visible");
}

/* ========================================
   FORMULÁRIO — FOCO E CAMPOS VIVOS
   ======================================== */
function initFormAnimations() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    const fields = form.querySelectorAll("input, textarea, select");

    fields.forEach((field, index) => {
      const wrapper = field.closest(".form-row, .form-group, .input-group") || field.parentElement;
      wrapper?.style.setProperty("--reveal-delay", `${Math.min(index * 55, 300)}ms`);

      const syncValue = () => {
        wrapper?.classList.toggle("has-value", Boolean(field.value.trim()));
      };

      field.addEventListener("focus", () => wrapper?.classList.add("is-focused"));
      field.addEventListener("blur", () => {
        wrapper?.classList.remove("is-focused");
        syncValue();
      });
      field.addEventListener("input", syncValue);
      syncValue();
    });
  });
}

/* ========================================
   PORTFÓLIO — CARDS + MODAL CINEMATOGRÁFICO
   ======================================== */
function initPortfolioAnimations() {
  const cards = document.querySelectorAll(".portfolio-item, .portfolio-card");

  cards.forEach((card, index) => {
    card.style.setProperty("--card-delay", `${Math.min(index * 70, 420)}ms`);
    if (!card.getAttribute("data-reveal")) {
      card.setAttribute("data-reveal", "scale");
    }
  });
}

function initPortfolioVideoModal() {
  const modal = document.getElementById("portfolioVideoModal");
  const video = document.getElementById("portfolioVideoPlayer");
  const modalMessage = document.querySelector("[data-video-modal-message]");
  const triggers = document.querySelectorAll("[data-video-src]");
  const closeButtons = document.querySelectorAll("[data-close-video-modal]");

  if (!modal || !video || !triggers.length) return;

  let closeTimer = null;

  const setMessage = (message) => {
    if (modalMessage) modalMessage.textContent = message;
  };

  const openModal = (src, trigger) => {
    clearTimeout(closeTimer);

    trigger?.classList.add("is-opening");
    setTimeout(() => trigger?.classList.remove("is-opening"), 520);

    setMessage("Uma visão mais próxima do trabalho, do traço e do acabamento.");

    video.pause();
    video.removeAttribute("src");
    video.load();

    modal.classList.add("is-open");
    document.body.classList.add("is-modal-open");

    requestAnimationFrame(() => {
      modal.classList.add("is-active");
      modal.setAttribute("aria-hidden", "false");
    });

    if (!src) {
      setMessage("Processo em breve. O card já está preparado para receber o vídeo deste trabalho.");
      return;
    }

    video.src = src;
    video.play().catch(() => {
      setMessage("Vídeo em breve. Substitua o arquivo em assets/videos pelo vídeo deste trabalho.");
    });
  };

  const closeModal = () => {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");

    closeTimer = setTimeout(() => {
      modal.classList.remove("is-open");
      document.body.classList.remove("is-modal-open");

      video.pause();
      video.removeAttribute("src");
      video.load();
      setMessage("Uma visão mais próxima do trabalho, do traço e do acabamento.");
    }, prefersReducedMotion ? 0 : 380);
  };

  video.addEventListener("error", () => {
    setMessage("Vídeo em breve. Substitua o arquivo correspondente em assets/videos para ativar este processo.");
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger.getAttribute("data-video-src"), trigger);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}



/* ========================================
   AVALIAÇÕES — CARROSSEL EM LOOP
   ======================================== */
function initTestimonialsCarousel() {
  const carousel = document.querySelector("[data-testimonials-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector(".testimonials-track");
  if (!track) return;

  const originalCards = Array.from(track.children);
  if (!originalCards.length) return;

  if (track.dataset.duplicated !== "true") {
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    track.dataset.duplicated = "true";
  }

  const pause = () => {
    track.style.animationPlayState = "paused";
    carousel.classList.add("is-paused");
  };

  const play = () => {
    track.style.animationPlayState = "running";
    carousel.classList.remove("is-paused");
  };

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", play);
  carousel.addEventListener("focusin", pause);
  carousel.addEventListener("focusout", play);

  document.addEventListener("visibilitychange", () => {
    document.hidden ? pause() : play();
  });

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  carousel.addEventListener("pointerdown", (event) => {
    if (window.innerWidth > 768) return;

    isDown = true;
    startX = event.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    pause();
    carousel.classList.add("is-dragging");
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!isDown || window.innerWidth > 768) return;

    const x = event.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.4;
    carousel.scrollLeft = scrollLeft - walk;
  });

  const endDrag = () => {
    if (!isDown) return;

    isDown = false;
    carousel.classList.remove("is-dragging");
    setTimeout(play, 700);
  };

  carousel.addEventListener("pointerup", endDrag);
  carousel.addEventListener("pointercancel", endDrag);
  carousel.addEventListener("pointerleave", endDrag);
}

/* ========================================
   HERO — PARALLAX E LUZ NO CURSOR
   ======================================== */
function initHeroParallax() {
  const hero = document.querySelector(".hero");
  const media = document.querySelector(".hero-video, .hero-bg, .hero img");

  if (!hero || !media || window.innerWidth <= 768) return;

  let ticking = false;

  const update = () => {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);

    media.style.setProperty("--hero-parallax-scale", String(1.04 + progress * 0.04));
    media.style.setProperty("--hero-parallax-y", `${progress * 18}px`);

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

function initHeroPointerGlow() {
  const hero = document.querySelector(".hero");
  if (!hero || window.innerWidth <= 768) return;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    hero.style.setProperty("--hero-x", `${x}%`);
    hero.style.setProperty("--hero-y", `${y}%`);
  });
}

/* ========================================
   SCROLL PROGRESS
   ======================================== */
function initScrollProgress() {
  let bar = document.querySelector(".scroll-progress");

  if (!bar) {
    bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
  }

  let ticking = false;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    bar.style.width = `${progress}%`;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}
