// Trocar pelo número real do profissional, com DDI e DDD.
// Exemplo: 5511999999999
const WHATSAPP_NUMBER = "5511941330786";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  safeInit("Page loader", initPageLoader);

  if (prefersReducedMotion) {
    document.documentElement.classList.add("reduced-motion");
  }

  safeInit("Ano atual", setCurrentYear);
  safeInit("Vídeo do hero", setupHeroVideo);
  safeInit("Formulário", setupBudgetForm);
  safeInit("Orçamento interativo", initInteractiveBudgetForm);
  safeInit("Copiar endereço", initCopyAddress);
  safeInit("Menu mobile", setupMobileMenu);
  safeInit("Navbar", initNavbarAnimations);
  safeInit("Links suaves", initSmoothAnchors);
  safeInit("Botões", initButtonAnimations);
  safeInit("Cards", initCardAnimations);
  safeInit("Modal de vídeo", initPortfolioVideoModal);
  safeInit("Animações do formulário", initFormAnimations);
  safeInit("Barra de progresso", initScrollProgress);
  safeInit("Portfólio", initPortfolioAnimations);
  safeInit("Avaliações", initTestimonialsCarousel);

  if (!prefersReducedMotion) {
    safeInit("Hero", initHeroAnimations);
    safeInit("Scroll reveal", initScrollReveal);
    safeInit("Parallax", initHeroParallax);
    safeInit("Luz do hero", initHeroPointerGlow);
  } else {
    safeInit("Revelar elementos", revealEverythingImmediately);
  }
});

function safeInit(name, fn) {
  try {
    if (typeof fn === "function") fn();
  } catch (error) {
    console.error(`Erro ao iniciar ${name}:`, error);
  }
}


/* ========================================
   LOADING PREMIUM — CARREGAMENTO DA PÁGINA
   ======================================== */
function initPageLoader() {
  const loader = document.getElementById("pageLoader");
  const bar = document.getElementById("pageLoaderBar");
  const percent = document.getElementById("pageLoaderPercent");

  if (!loader) {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
    return;
  }

  document.body.classList.add("is-loading");

  let progress = 0;
  let isDone = false;

  const setProgress = (value) => {
    progress = Math.max(progress, Math.min(value, 100));

    if (bar) {
      bar.style.width = `${progress}%`;
    }

    if (percent) {
      percent.textContent = `${Math.round(progress)}%`;
    }
  };

  const fakeProgress = window.setInterval(() => {
    if (isDone) return;

    if (progress < 82) {
      setProgress(progress + Math.random() * 9 + 3);
    } else if (progress < 94) {
      setProgress(progress + Math.random() * 2);
    }
  }, 180);

  const waitForImages = () => {
    const images = Array.from(document.images || []);

    if (!images.length) return Promise.resolve();

    return Promise.allSettled(
      images.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );
  };

  const waitForHeroVideo = () => {
    const video = document.querySelector(".hero-video");

    if (!video) return Promise.resolve();
    if (video.readyState >= 2) return Promise.resolve();

    return new Promise((resolve) => {
      const done = () => resolve();

      video.addEventListener("loadeddata", done, { once: true });
      video.addEventListener("canplay", done, { once: true });
      video.addEventListener("error", done, { once: true });

      window.setTimeout(resolve, 2500);
    });
  };

  const revealVisibleElementsAfterLoad = () => {
    document.body.classList.add("is-page-loaded");

    document.querySelectorAll("[data-reveal], .hero-animate-item").forEach((element) => {
      element.classList.add("is-revealed", "is-visible");
    });
  };

  const finishLoading = () => {
    if (isDone) return;

    isDone = true;
    window.clearInterval(fakeProgress);
    setProgress(100);
    revealVisibleElementsAfterLoad();

    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-loaded");
    }, 420);

    window.setTimeout(() => {
      loader.remove();
    }, 1300);
  };

  const minimumTime = new Promise((resolve) => window.setTimeout(resolve, 900));
  const maximumTime = new Promise((resolve) => window.setTimeout(resolve, 4200));

  Promise.race([
    Promise.all([waitForImages(), waitForHeroVideo(), minimumTime]),
    maximumTime
  ]).then(finishLoading).catch(finishLoading);

  window.addEventListener("pageshow", () => {
    if (document.body.classList.contains("is-loaded")) {
      loader.remove();
    }
  });
}

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

  let retryTimer = null;

  const forceVideoAttributes = () => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.removeAttribute("controls");
    video.controls = false;
  };

  const tryPlay = () => {
    forceVideoAttributes();

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        window.clearTimeout(retryTimer);
        retryTimer = window.setTimeout(() => {
          forceVideoAttributes();
          video.play().catch(() => {
            // Alguns navegadores mobile podem bloquear autoplay em modo economia de energia.
            // O próximo toque/scroll do usuário tenta iniciar novamente sem mostrar controles.
          });
        }, 650);
      });
    }
  };

  const keepLooping = () => {
    if (!video.paused && !video.ended) return;
    tryPlay();
  };

  forceVideoAttributes();
  tryPlay();

  ["loadedmetadata", "loadeddata", "canplay", "canplaythrough"].forEach((eventName) => {
    video.addEventListener(eventName, tryPlay, { passive: true });
  });

  video.addEventListener("pause", () => {
    window.setTimeout(keepLooping, 120);
  });

  video.addEventListener("ended", () => {
    video.currentTime = 0;
    tryPlay();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlay();
  });

  window.addEventListener("pageshow", tryPlay);

  ["touchstart", "pointerdown", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, tryPlay, { passive: true });
  });
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
  const buttons = document.querySelectorAll(
    ".btn, button, .button, .nav-cta, .btn-nav-cta, .mobile-menu a, .hero-actions a, .nav-instagram"
  );

  if (!buttons.length) return;

  buttons.forEach((button) => {
    const shouldSkipAnimation =
      button.classList.contains("portfolio-video-modal__close") ||
      button.hasAttribute("data-close-video-modal") ||
      button.classList.contains("menu-toggle") ||
      button.classList.contains("whatsapp-float");

    if (shouldSkipAnimation) {
      button.classList.remove("js-animated-button", "is-pressing");
      return;
    }

    if (button.dataset.animatedButton === "true") return;

    button.dataset.animatedButton = "true";
    button.classList.add("js-animated-button");

    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      button.style.setProperty("--btn-x", `${x}%`);
      button.style.setProperty("--btn-y", `${y}%`);
    });

    button.addEventListener("pointerdown", () => {
      button.classList.add("is-pressing");
    });

    ["pointerup", "pointercancel", "pointerleave", "blur"].forEach((eventName) => {
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
function initNavbarAnimations() {
  const header =
    document.querySelector("[data-navbar]") ||
    document.querySelector(".site-header") ||
    document.querySelector(".navbar") ||
    document.querySelector("header");

  if (!header) {
    console.warn("Navbar não encontrada.");
    return;
  }

  let lastScrollY = window.scrollY;
  let ticking = false;

  header.classList.add("navbar-ready");

  requestAnimationFrame(() => {
    header.classList.add("navbar-visible");
  });

  const updateNavbar = () => {
    const currentScrollY = window.scrollY;
    const menuIsOpen = document.body.classList.contains("is-menu-open");
    const modalIsOpen = document.body.classList.contains("is-modal-open");

    header.classList.toggle("is-scrolled", currentScrollY > 20);

    if (currentScrollY > lastScrollY && currentScrollY > 180 && !menuIsOpen && !modalIsOpen) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }

    lastScrollY = Math.max(currentScrollY, 0);
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateNavbar, { passive: true });
  updateNavbar();
}

// Compatibilidade com versões anteriores do inicializador.
function initAnimatedNavbar() {
  initNavbarAnimations();
}

/* ========================================
   MOBILE MENU
   ======================================== */
function setupMobileMenu() {
  const toggle = document.getElementById("nav-toggle") || document.querySelector("[data-menu-toggle], .menu-toggle, .hamburger, .mobile-menu-button");
  const nav = document.getElementById("main-nav") || document.querySelector("[data-mobile-menu], .mobile-menu, .nav-mobile, .menu-panel");
  const overlay = document.getElementById("mobile-overlay") || document.querySelector("[data-menu-overlay], .mobile-overlay");

  if (!toggle || !nav) return;

  const links = nav.querySelectorAll("a");

  const close = () => {
    toggle.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    nav.setAttribute("aria-hidden", "true");

    if (overlay) {
      overlay.classList.remove("is-active");
      overlay.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove("is-menu-open");
  };

  const open = () => {
    toggle.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    nav.classList.add("is-open");
    nav.setAttribute("aria-hidden", "false");

    if (overlay) {
      overlay.classList.add("is-active");
      overlay.setAttribute("aria-hidden", "false");
    }

    document.body.classList.add("is-menu-open");
  };

  const toggleMenu = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    nav.classList.contains("is-open") ? close() : open();
  };

  close();

  toggle.addEventListener("click", toggleMenu);
  overlay?.addEventListener("click", close);

  links.forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("is-menu-open")) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) close();
  }, { passive: true });
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
    "Olá! Vim pelo site e gostaria de solicitar um orçamento.",
    "",
    `Nome: ${data.name}`,
    `WhatsApp: ${data.phone}`,
    `Região do corpo: ${data.bodyArea || "Não informado"}`,
    `Tamanho aproximado: ${data.size || "Não informado"}`,
    `Estilo: ${data.style || "Não informado"}`,
    `Ideia: ${data.idea || "Não informado"}`,
    data.reference ? `Referência: ${data.reference}` : "Referência: não informada",
  ].join("\n");
}

function showFeedback(element, message, isError) {
  if (!element) return;
  element.textContent = message;
  element.dataset.type = isError ? "error" : "success";
  element.classList.toggle("error", Boolean(isError));
  element.classList.add("is-visible");

  window.clearTimeout(element._feedbackTimer);
  element._feedbackTimer = window.setTimeout(() => {
    element.classList.remove("is-visible");
  }, isError ? 3600 : 2600);
}

function initInteractiveBudgetForm() {
  const groups = document.querySelectorAll("[data-choice-group]");
  if (!groups.length) return;

  groups.forEach((group) => {
    const input = group.querySelector("input[type='hidden']");
    const chips = group.querySelectorAll(".choice-chip");

    chips.forEach((chip) => {
      chip.setAttribute("aria-pressed", "false");

      chip.addEventListener("click", () => {
        chips.forEach((item) => {
          item.classList.remove("is-active");
          item.setAttribute("aria-pressed", "false");
        });

        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");

        if (input) {
          input.value = chip.dataset.choiceValue || chip.textContent.trim();
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  });
}

function initCopyAddress() {
  const buttons = document.querySelectorAll("[data-copy-address]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const address = button.dataset.copyAddress || "São Paulo, SP";
      const originalText = button.textContent;

      const setCopiedState = () => {
        button.textContent = "Endereço copiado";
        button.classList.add("is-copied");

        window.setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("is-copied");
        }, 1800);
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(address);
        } else {
          const tempInput = document.createElement("textarea");
          tempInput.value = address;
          tempInput.setAttribute("readonly", "");
          tempInput.style.position = "fixed";
          tempInput.style.left = "-9999px";
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          tempInput.remove();
        }

        setCopiedState();
      } catch (error) {
        console.warn("Não foi possível copiar o endereço:", error);
        button.textContent = "Copie: São Paulo, SP";
        window.setTimeout(() => {
          button.textContent = originalText;
        }, 2200);
      }
    });
  });
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
function initCardAnimations() {
  const cards = document.querySelectorAll(".portfolio-item, .portfolio-trigger, .testimonial-card");

  cards.forEach((card) => {
    card.classList.add("js-animated-card");
  });
}

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
  const carousel =
    document.querySelector("[data-testimonials-carousel]") ||
    document.querySelector(".testimonials-carousel");

  if (!carousel) {
    console.warn("Carrossel de avaliações não encontrado.");
    return;
  }

  const track = carousel.querySelector(".testimonials-track");
  if (!track) {
    console.warn("Track de avaliações não encontrada.");
    return;
  }

  const cards = Array.from(track.querySelectorAll(".testimonial-card:not([aria-hidden='true'])"));
  if (!cards.length) {
    console.warn("Cards de avaliação não encontrados.");
    return;
  }

  if (track.dataset.duplicated !== "true") {
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    track.dataset.duplicated = "true";
  }

  const startLoop = () => {
    carousel.classList.remove("is-paused", "is-dragging");
    track.style.animation = "none";
    void track.offsetWidth;
    track.style.animation = "testimonialsMarquee 36s linear infinite";
    track.style.animationPlayState = "running";
  };

  const play = () => {
    carousel.classList.remove("is-paused", "is-dragging");
    track.style.animationPlayState = "running";
  };

  const pause = () => {
    carousel.classList.add("is-paused");
    track.style.animationPlayState = "paused";
  };

  startLoop();

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover) {
    carousel.addEventListener("mouseenter", pause);
    carousel.addEventListener("mouseleave", play);
    carousel.addEventListener("focusin", pause);
    carousel.addEventListener("focusout", play);
  }

  carousel.addEventListener("touchstart", () => {
    track.style.animationPlayState = "paused";
  }, { passive: true });

  carousel.addEventListener("touchend", () => {
    window.setTimeout(play, 450);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    document.hidden ? pause() : play();
  });

  window.addEventListener("pageshow", startLoop);
  window.addEventListener("resize", () => {
    window.setTimeout(startLoop, 120);
  }, { passive: true });
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

/* ========================================
   FALLBACK MOBILE — EVITA TELA VAZIA SE REVEAL FALHAR
   ======================================== */
(function initMobileVisibilityFallback() {
  const revealVisibleElements = () => {
    const isMobile = window.matchMedia && window.matchMedia("(max-width: 920px)").matches;
    if (!isMobile) return;

    document.body.classList.add("is-page-loaded");

    const selectors = [
      "[data-reveal]",
      ".hero-animate-item",
      ".hero-content",
      ".hero-eyebrow",
      ".hero h1",
      ".hero p",
      ".hero-actions",
      ".section",
      ".section-header",
      ".portfolio-item",
      ".budget-copy",
      ".budget-form",
      ".location-content",
      ".map-wrapper",
      ".testimonials-carousel",
      ".site-footer"
    ];

    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      element.classList.add("is-revealed", "is-visible");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      revealVisibleElements();
      window.setTimeout(revealVisibleElements, 450);
      window.setTimeout(revealVisibleElements, 1200);
    });
  } else {
    revealVisibleElements();
    window.setTimeout(revealVisibleElements, 450);
    window.setTimeout(revealVisibleElements, 1200);
  }

  window.addEventListener("load", () => {
    revealVisibleElements();
    window.setTimeout(revealVisibleElements, 600);
  });
})();
