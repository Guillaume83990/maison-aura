/* ==========================================================================
   MAISON AURA — boutique.js
   Rideau d'ouverture + filtres coulissants + grille produits +
   animation "vol vers le panier" à l'ajout

   Chaque section est isolée dans son propre try/catch : une erreur dans
   l'une ne doit jamais empêcher les autres de s'exécuter (c'est ce qui
   pouvait provoquer un écran entièrement noir si une seule section échouait).
   ========================================================================== */

/* ==========================================================================
   1. HERO — même modèle que le reste du site (Ken Burns + parallax + texte)
   ========================================================================== */
(function initBoutiqueHero() {
  const hero = document.getElementById('boutique-hero');
  const heroImage = document.getElementById('boutique-hero-image');
  const heroContent = document.getElementById('boutique-hero-content');
  if (!hero || !window.gsap) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroImage && !prefersReducedMotion) {
    gsap.fromTo(heroImage, { scale: 1.12 }, { scale: 1, duration: 20, ease: 'none' });
    if (window.ScrollTrigger) {
      gsap.to(heroImage, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }
  }

  const items = heroContent ? heroContent.querySelectorAll('.eyebrow, h1, .lede') : [];
  if (items.length) {
    if (prefersReducedMotion) {
      gsap.set(items, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(items, { autoAlpha: 0, y: 26 });
      gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.16, ease: 'power3.out', delay: 0.3 });
    }
  }

  if (!prefersReducedMotion && window.ScrollTrigger) {
    const cue = hero.querySelector('.boutique-hero__scrollcue');
    if (cue) {
      gsap.to(cue, {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'center top', scrub: 0.4 },
      });
    }
  }
})();

/* ==========================================================================
   2. GRILLE PRODUITS — générée depuis le catalogue partagé (global.js)
   ========================================================================== */
const grid = document.getElementById('boutique-grid');
const PRODUCTS = (window.AuraCart && window.AuraCart.PRODUCTS) || [];

function renderProducts() {
  if (!grid) return;
  try {
    grid.innerHTML = PRODUCTS.map((p) => {
      // Toutes les images du catalogue suivent la même convention
      // -mobile/-tablet/-desktop : on dérive les tailles depuis le webp
      // desktop plutôt que d'alourdir le catalogue avec 3 champs par taille.
      const mobileWebp = p.imgWebp.replace('-desktop.', '-mobile.');
      const tabletWebp = p.imgWebp.replace('-desktop.', '-tablet.');
      return `
      <article class="boutique-card" data-gamme="${p.gamme}">
        <div class="boutique-card__media">
          <picture>
            <source media="(max-width: 768px)" srcset="${mobileWebp}" type="image/webp">
            <source media="(max-width: 1024px)" srcset="${tabletWebp}" type="image/webp">
            <source media="(min-width: 1025px)" srcset="${p.imgWebp}" type="image/webp">
            <img src="${p.img}" alt="Flacon ${p.cuvee} ${p.color}, MAISON AURA" loading="lazy">
          </picture>
          <div class="boutique-card__shine" aria-hidden="true"></div>
        </div>
        <span class="boutique-card__gamme">${p.gamme}</span>
        <h3 class="boutique-card__name">${p.cuvee}</h3>
        <p class="boutique-card__color">${p.color}</p>
        <div class="boutique-card__footer">
          <span class="boutique-card__price">${p.price} €</span>
          <button type="button" class="boutique-card__add" data-id="${p.id}">Ajouter</button>
        </div>
      </article>
    `;
    }).join('');
  } catch (err) {
    console.error('MAISON AURA — rendu produits boutique :', err);
  }
}
renderProducts();

// La grille est injectée APRÈS que global.js ait déjà mesuré la page pour
// les [data-reveal] (dont la section "Exception" plus bas) — sans ce
// recalcul, ScrollTrigger garde des positions de déclenchement calculées
// sur une page plus courte que la réalité, et ces sections ne se révèlent
// jamais (elles restent invisibles = le "grand vide noir" avant le footer).
if (window.ScrollTrigger) {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/* ==========================================================================
   3. FILTRES — indicateur coulissant + animation de tri
   ========================================================================== */
(function initBoutiqueFilters() {
  const filtersEl = document.getElementById('boutique-filters');
  const indicator = document.getElementById('boutique-filters-indicator');
  if (!filtersEl || !grid) return;

  try {
    const buttons = Array.from(filtersEl.querySelectorAll('.boutique-filters__btn'));

    function moveIndicator(btn) {
      if (!window.gsap || !indicator) return;
      const filterRect = filtersEl.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      gsap.to(indicator, {
        width: btnRect.width,
        x: btnRect.left - filterRect.left,
        duration: 0.45,
        ease: 'power3.out',
      });
    }

    function applyFilter(filter) {
      const cards = Array.from(grid.querySelectorAll('.boutique-card'));

      if (!window.gsap) {
        cards.forEach((card) => {
          const match = filter === 'all' || card.dataset.gamme === filter;
          card.style.display = match ? '' : 'none';
        });
        return;
      }

      // Important : le tri (display none/'') doit se faire À L'INTÉRIEUR du
      // callback, et la liste des cartes visibles recalculée à ce moment
      // précis — pas avant, sinon GSAP capture la liste AVANT le tri (les
      // cibles sont résolues à l'appel de .to(), pas à l'exécution) et les
      // cartes filtrées réapparaissaient quand même.
      gsap.to(cards, {
        autoAlpha: 0,
        y: 14,
        scale: 0.97,
        duration: 0.25,
        stagger: 0.02,
        ease: 'power2.in',
        onComplete: () => {
          cards.forEach((card) => {
            const match = filter === 'all' || card.dataset.gamme === filter;
            card.style.display = match ? '' : 'none';
          });
          const visible = cards.filter((c) => c.style.display !== 'none');
          gsap.to(visible, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: 'power3.out',
          });
        },
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });
        moveIndicator(btn);
        applyFilter(btn.dataset.filter);
      });
    });

    requestAnimationFrame(() => {
      const active = filtersEl.querySelector('.is-active');
      if (active) moveIndicator(active);
    });
    window.addEventListener('resize', () => {
      const active = filtersEl.querySelector('.is-active');
      if (active) moveIndicator(active);
    });
  } catch (err) {
    console.error('MAISON AURA — filtres boutique :', err);
  }
})();

/* ==========================================================================
   4. SURVOL — reflet qui balaie l'image
   ========================================================================== */
(function initBoutiqueShine() {
  if (!grid || !window.gsap) return;
  try {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    grid.addEventListener('mouseover', (e) => {
      const media = e.target.closest('.boutique-card__media');
      if (!media) return;
      const shine = media.querySelector('.boutique-card__shine');
      if (!shine) return;
      gsap.fromTo(shine, { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: 'power2.inOut' });
    });
  } catch (err) {
    console.error('MAISON AURA — reflet boutique :', err);
  }
})();

/* ==========================================================================
   5. AJOUT AU PANIER — l'image "vole" jusqu'à l'icône panier du header
   ========================================================================== */
(function initAddToCart() {
  if (!grid) return;
  const cartIcon = document.querySelector('.site-header__cart');

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.boutique-card__add');
    if (!btn) return;

    try {
      const id = btn.dataset.id;
      const card = btn.closest('.boutique-card');
      const media = card ? card.querySelector('.boutique-card__media img') : null;

      if (window.AuraCart) window.AuraCart.addToCart(id, 1);

      btn.classList.add('is-added');
      const originalText = btn.textContent;
      btn.textContent = 'Ajouté ✓';
      setTimeout(() => {
        btn.classList.remove('is-added');
        btn.textContent = originalText;
      }, 1400);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!media || !cartIcon || !window.gsap || prefersReducedMotion) return;

      const startRect = media.getBoundingClientRect();
      const endRect = cartIcon.getBoundingClientRect();

      const flying = document.createElement('div');
      flying.className = 'fly-to-cart';
      flying.style.width = startRect.width + 'px';
      flying.style.height = startRect.height + 'px';
      flying.style.left = startRect.left + 'px';
      flying.style.top = startRect.top + 'px';
      flying.innerHTML = `<img src="${media.src}" alt="">`;
      document.body.appendChild(flying);

      gsap.to(flying, {
        left: endRect.left + endRect.width / 2 - 14,
        top: endRect.top + endRect.height / 2 - 14,
        width: 28,
        height: 28,
        rotate: 12,
        opacity: 0.4,
        duration: 0.85,
        ease: 'power2.in',
        onComplete: () => {
          flying.remove();
          gsap.fromTo(cartIcon, { scale: 1 }, { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
        },
      });
    } catch (err) {
      console.error('MAISON AURA — ajout panier boutique :', err);
    }
  });
})();
