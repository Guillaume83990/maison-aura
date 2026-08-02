/* ==========================================================================
   MAISON AURA — domaine.js
   Hero (Ken Burns + parallax + apparition du texte) + révélations au scroll
   pour la page "Le Domaine"
   ========================================================================== */

/* ==========================================================================
   1. HERO — image du portail ouvert : Ken Burns lent + parallax + texte
   ========================================================================== */
(function initDomaineHero() {
  const hero = document.getElementById('domaine-hero');
  const heroImage = document.getElementById('domaine-hero-image');
  const heroContent = document.getElementById('domaine-hero-content');
  if (!hero || !window.gsap) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Effet Ken Burns — dézoom très lent et continu ----
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

  // ---- Apparition du texte — opacity + translateY + léger stagger ----
  const items = heroContent
    ? heroContent.querySelectorAll('.eyebrow, h1, .lede')
    : [];
  if (items.length) {
    if (prefersReducedMotion) {
      gsap.set(items, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(items, { autoAlpha: 0, y: 26 });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 1.3,
        stagger: 0.16,
        ease: 'power3.out',
        delay: 0.3,
      });
    }
  }

  // ---- Le repère "Défiler" s'efface en avançant dans le Hero ----
  if (!prefersReducedMotion && window.ScrollTrigger) {
    const cue = hero.querySelector('.domaine-hero__scrollcue');
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
   2. RÉVÉLATIONS AU SCROLL — teasers, feature plein écran, grille, CTA
   ========================================================================== */
(function initDomaineReveals() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  /* ---- Teasers (Histoire, Bastide) : image en balayage + texte en cascade ---- */
  document.querySelectorAll('.domaine-teaser').forEach((teaser) => {
    const media = teaser.querySelector('.domaine-teaser__media');
    const textItems = teaser.querySelectorAll(
      '.domaine-teaser__eyebrow, .domaine-teaser__title, .domaine-teaser__text, .domaine-teaser__content > a'
    );

    if (media) gsap.set(media, { clipPath: 'inset(0 0 100% 0)', scale: 1.08 });
    gsap.set(textItems, { autoAlpha: 0, y: 28 });

    ScrollTrigger.create({
      trigger: teaser,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (media) {
          tl.to(media, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power4.inOut' }, 0)
            .to(media, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0);
        }
        tl.to(textItems, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.35);
      },
    });
  });

  /* ---- Feature plein écran (Terroir) : texte en fondu + léger parallax de l'image ---- */
  const feature = document.querySelector('.domaine-feature');
  if (feature) {
    const items = feature.querySelectorAll('.domaine-feature__content > *');
    gsap.set(items, { autoAlpha: 0, y: 24 });
    ScrollTrigger.create({
      trigger: feature,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(items, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power3.out' });
      },
    });

    const featureImg = feature.querySelector('.domaine-feature__media img');
    if (featureImg) {
      gsap.to(featureImg, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: feature, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }
  }

  /* ---- Grille "L'Art de la Vigne" : apparition en cascade ---- */
  const gridItems = document.querySelectorAll('.domaine-grid__item');
  if (gridItems.length) {
    gsap.set(gridItems, { autoAlpha: 0, y: 36 });
    ScrollTrigger.create({
      trigger: '.domaine-grid',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(gridItems, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' });
      },
    });
  }

  /* ---- CTA final : cascade sobre ---- */
  const cta = document.getElementById('domaine-cta-reveal');
  if (cta) {
    const items = cta.querySelectorAll('.eyebrow, h2, p, .btn');
    gsap.set(items, { autoAlpha: 0, y: 24 });
    ScrollTrigger.create({
      trigger: cta,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
      },
    });
  }

  /* ---- Léger tilt au survol des images teaser (profondeur, sobre) ---- */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover) {
    document.querySelectorAll('.domaine-teaser__media').forEach((media) => {
      const img = media.querySelector('img');
      if (!img) return;
      media.addEventListener('mousemove', (e) => {
        const rect = media.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(img, { x: nx * 14, y: ny * 14, scale: 1.04, duration: 0.6, ease: 'power2.out' });
      });
      media.addEventListener('mouseleave', () => {
        gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' });
      });
    });
  }
})();
