/* ==========================================================================
   MAISON AURA — global.js
   GSAP/ScrollTrigger, modale +18, header
   (Lenis retiré : contrainte "aucune dépendance hors GSAP + ScrollTrigger")
   ========================================================================== */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* 0. Base des chemins d'assets — les pages FR sont à la racine, les    */
  /*    pages EN sont dans /en/. Les chemins écrits en dur dans le HTML   */
  /*    (../images/...) sont corrects par construction, mais tout chemin  */
  /*    construit dynamiquement en JS (catalogue produits, séquence du    */
  /*    portail…) doit passer par cette base pour rester correct quelle   */
  /*    que soit la profondeur de la page.                                */
  /* ------------------------------------------------------------------ */
  window.AURA_ASSET_BASE = window.location.pathname.includes('/en/') ? '../' : '';
  const ASSET_BASE = window.AURA_ASSET_BASE;

  /* ------------------------------------------------------------------ */
  /* 1. Modale +18 — vérification d'âge réelle (Loi Évin)                */
  /* ------------------------------------------------------------------ */
  const AGE_GATE_KEY = 'aura_age_verified';
  const MIN_AGE = 18;

  function initAgeGate() {
    const gate = document.getElementById('age-gate');
    if (!gate) return;

    const alreadyVerified = localStorage.getItem(AGE_GATE_KEY) === 'true';

    const form = gate.querySelector('.age-gate__form-wrap');
    const dayInput = gate.querySelector('#age-day');
    const monthInput = gate.querySelector('#age-month');
    const yearInput = gate.querySelector('#age-year');
    const errorEl = gate.querySelector('.age-gate__error');
    const declineBtn = gate.querySelector('.age-gate__decline');

    function lockScroll(lock) {
      document.documentElement.style.overflow = lock ? 'hidden' : '';
    }

    function openGate() {
      gate.hidden = false;
      lockScroll(true);
    }

    function closeGate() {
      gsap.to(gate, {
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => {
          gate.hidden = true;
          lockScroll(false);
          // Le contenu (notamment la section cinématique) vient d'être révélé :
          // ScrollTrigger doit recalculer ses positions.
          ScrollTrigger.refresh();
        },
      });
      localStorage.setItem(AGE_GATE_KEY, 'true');
    }

    function computeAge(day, month, year) {
      const birth = new Date(year, month - 1, day);
      if (
        birth.getDate() !== day ||
        birth.getMonth() !== month - 1 ||
        birth.getFullYear() !== year
      ) {
        return null; // date invalide (ex: 31 février)
      }
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const hasHadBirthdayThisYear =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
      if (!hasHadBirthdayThisYear) age--;
      return age;
    }

    if (alreadyVerified) {
      gate.hidden = true;
    } else {
      openGate();
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const day = parseInt(dayInput.value, 10);
        const month = parseInt(monthInput.value, 10);
        const year = parseInt(yearInput.value, 10);

        if (!day || !month || !year || year < 1900) {
          errorEl.textContent = 'Merci de renseigner une date de naissance complète.';
          return;
        }

        const age = computeAge(day, month, year);

        if (age === null) {
          errorEl.textContent = "Cette date n'existe pas.";
          return;
        }

        if (age < MIN_AGE) {
          errorEl.textContent = "L'accès à ce site est réservé aux personnes majeures.";
          return;
        }

        errorEl.textContent = '';
        closeGate();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        window.location.href = 'https://www.alcoolinfoservice.fr/';
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Header — compaction au scroll                                    */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { targets: header, className: 'is-condensed' },
    });

    const burger = header.querySelector('.site-header__burger');
    const nav = header.querySelector('.site-header__nav');
    if (burger && nav) {
      const setOpen = (isOpen) => {
        nav.classList.toggle('is-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        document.documentElement.style.overflow = isOpen ? 'hidden' : '';
      };

      burger.addEventListener('click', () => {
        setOpen(!nav.classList.contains('is-open'));
      });

      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2b. Bannière cookies — consentement simple, persistant                */
  /* ------------------------------------------------------------------ */
  const COOKIE_KEY = 'aura_cookies_consent';

  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const alreadyAnswered = localStorage.getItem(COOKIE_KEY);
    if (alreadyAnswered) return; // 'accepted' ou 'declined' — déjà répondu

    const acceptBtn = banner.querySelector('.cookie-banner__btn--accept');
    const declineBtn = banner.querySelector('.cookie-banner__btn--decline');

    function show() {
      // N'apparaît pas par-dessus la modale +18 tant qu'elle est ouverte.
      const gate = document.getElementById('age-gate');
      if (gate && !gate.hidden) return;
      requestAnimationFrame(() => banner.classList.add('is-visible'));
    }

    function hide(choice) {
      localStorage.setItem(COOKIE_KEY, choice);
      banner.classList.remove('is-visible');
    }

    if (acceptBtn) acceptBtn.addEventListener('click', () => hide('accepted'));
    if (declineBtn) declineBtn.addEventListener('click', () => hide('declined'));

    show();

    // Si la modale +18 était ouverte au chargement, on affiche la bannière
    // juste après sa fermeture plutôt que de superposer les deux.
    const gate = document.getElementById('age-gate');
    if (gate) {
      const observer = new MutationObserver(() => {
        if (gate.hidden) {
          show();
          observer.disconnect();
        }
      });
      observer.observe(gate, { attributes: true, attributeFilter: ['hidden'] });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. Reveal générique au scroll pour les sections d'accroche          */
  /* ------------------------------------------------------------------ */
  function initReveals() {
    const items = document.querySelectorAll('[data-reveal]');
    items.forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 48 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
          });
        },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Panier — catalogue + logique partagée (localStorage), utilisée   */
  /*    par boutique.html, cart.html et checkout.html                    */
  /* ------------------------------------------------------------------ */
  const CART_KEY = 'aura_cart';

  const PRODUCTS = [
    { id: 'plaisir-rose', gamme: 'Cuvée Plaisir', cuvee: 'Brise Marine', color: 'Rosé', price: 19,
      img: ASSET_BASE + 'images/brise-marine-rose-desktop.jpg', imgWebp: ASSET_BASE + 'images/brise-marine-rose-desktop.webp' },
    { id: 'plaisir-blanc', gamme: 'Cuvée Plaisir', cuvee: 'Brise Marine', color: 'Blanc', price: 19,
      img: ASSET_BASE + 'images/brise-marine-blanc-desktop.jpg', imgWebp: ASSET_BASE + 'images/brise-marine-blanc-desktop.webp' },
    { id: 'plaisir-rouge', gamme: 'Cuvée Plaisir', cuvee: 'Brise Marine', color: 'Rouge', price: 19,
      img: ASSET_BASE + 'images/brise-marine-rouge-desktop.jpg', imgWebp: ASSET_BASE + 'images/brise-marine-rouge-desktop.webp' },
    { id: 'gastronomie-rose', gamme: 'Cuvée Gastronomie', cuvee: 'Terroir', color: 'Rosé', price: 29,
      img: ASSET_BASE + 'images/terroir-rose-desktop.jpg', imgWebp: ASSET_BASE + 'images/terroir-rose-desktop.webp' },
    { id: 'gastronomie-blanc', gamme: 'Cuvée Gastronomie', cuvee: 'Terroir', color: 'Blanc', price: 29,
      img: ASSET_BASE + 'images/terroir-blanc-desktop.jpg', imgWebp: ASSET_BASE + 'images/terroir-blanc-desktop.webp' },
    { id: 'gastronomie-rouge', gamme: 'Cuvée Gastronomie', cuvee: 'Terroir', color: 'Rouge', price: 29,
      img: ASSET_BASE + 'images/terroir-rouge-desktop.jpg', imgWebp: ASSET_BASE + 'images/terroir-rouge-desktop.webp' },
    { id: 'coffret-rose', gamme: 'Coffrets', cuvee: 'Coffret Rosé', color: 'Brise Marine + Terroir', price: 44,
      img: ASSET_BASE + 'images/coffret-rose-desktop.jpg', imgWebp: ASSET_BASE + 'images/coffret-rose-desktop.webp' },
    { id: 'coffret-blanc', gamme: 'Coffrets', cuvee: 'Coffret Blanc', color: 'Brise Marine + Terroir', price: 44,
      img: ASSET_BASE + 'images/coffret-blanc-desktop.jpg', imgWebp: ASSET_BASE + 'images/coffret-blanc-desktop.webp' },
    { id: 'coffret-rouge', gamme: 'Coffrets', cuvee: 'Coffret Rouge', color: 'Brise Marine + Terroir', price: 44,
      img: ASSET_BASE + 'images/coffret-rouge-desktop.jpg', imgWebp: ASSET_BASE + 'images/coffret-rouge-desktop.webp' },
  ];

  function getCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
  }

  function addToCart(id, qty) {
    qty = qty || 1;
    const items = getCart();
    const existing = items.find((i) => i.id === id);
    if (existing) existing.qty += qty;
    else items.push({ id: id, qty: qty });
    saveCart(items);
  }

  function updateQty(id, qty) {
    const items = getCart();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (qty <= 0) {
      saveCart(items.filter((i) => i.id !== id));
      return;
    }
    item.qty = qty;
    saveCart(items);
  }

  function removeFromCart(id) {
    saveCart(getCart().filter((i) => i.id !== id));
  }

  function clearCart() {
    saveCart([]);
  }

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function cartLines() {
    return getCart()
      .map((item) => {
        const product = findProduct(item.id);
        return product ? { product: product, qty: item.qty } : null;
      })
      .filter(Boolean);
  }

  function cartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function cartTotal() {
    return cartLines().reduce((sum, line) => sum + line.product.price * line.qty, 0);
  }

  function updateCartBadge() {
    const count = cartCount();
    document.querySelectorAll('.site-header__cart-badge').forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    });
  }

  window.AuraCart = {
    PRODUCTS: PRODUCTS,
    getCart: getCart,
    addToCart: addToCart,
    updateQty: updateQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    findProduct: findProduct,
    cartLines: cartLines,
    cartCount: cartCount,
    cartTotal: cartTotal,
    updateCartBadge: updateCartBadge,
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAgeGate();
    initHeader();
    initCookieBanner();
    initReveals();
    updateCartBadge();
  });
})();
