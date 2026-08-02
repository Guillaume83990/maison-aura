/* ==========================================================================
   MAISON AURA — cuvees.js
   Hero + révélations au scroll + switchs Rosé/Blanc/Rouge (Plaisir & Gastronomie)
   ========================================================================== */

/* ==========================================================================
   1. HERO — Ken Burns lent + parallax + apparition du texte
   ========================================================================== */
(function initCuveesHero() {
  const hero = document.getElementById('cuvees-hero');
  const heroImage = document.getElementById('cuvees-hero-image');
  const heroContent = document.getElementById('cuvees-hero-content');
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
    const cue = hero.querySelector('.cuvees-hero__scrollcue');
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
   2. RÉVÉLATIONS AU SCROLL — comparatif, showcases, service, CTA
   ========================================================================== */
(function initCuveesReveals() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  /* ---- Trait doré sous les grands titres — se dessine à l'arrivée ---- */
  document.querySelectorAll('.cuvees-underline').forEach((line) => {
    ScrollTrigger.create({
      trigger: line,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(line, { scaleX: 1, duration: 0.9, delay: 0.3, ease: 'power3.inOut' });
      },
    });
  });

  /* ---- Cartes du comparatif ---- */
  const compareCards = document.querySelectorAll('.cuvees-compare__card');
  if (compareCards.length) {
    gsap.set(compareCards, { autoAlpha: 0, y: 34 });
    ScrollTrigger.create({
      trigger: '.cuvees-compare__grid',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(compareCards, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.14, ease: 'power3.out' });
      },
    });
  }

  /* ---- Showcases détaillés : texte en cascade + visuel en fondu ---- */
  document.querySelectorAll('.cuvees-showcase').forEach((section) => {
    const introItems = section.querySelectorAll(
      '.cuvees-showcase__intro .eyebrow, .cuvees-showcase__intro h2, .cuvees-showcase__intro .lede, .cuvee-switch, .cuvee-detail, .cuvees-showcase__price'
    );
    const visual = section.querySelector('.cuvees-showcase__visual');

    gsap.set(introItems, { autoAlpha: 0, y: 26 });
    if (visual) gsap.set(visual, { autoAlpha: 0, scale: 0.94 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        gsap.to(introItems, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
        if (visual) gsap.to(visual, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.1 });
      },
    });
  });

  /* ---- Service : cartes en cascade ---- */
  const serviceItems = document.querySelectorAll('.cuvees-service__item');
  if (serviceItems.length) {
    gsap.set(serviceItems, { autoAlpha: 0, y: 32 });
    ScrollTrigger.create({
      trigger: '.cuvees-service__grid',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(serviceItems, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' });
      },
    });
  }

  /* ---- CTA final ---- */
  const cta = document.getElementById('cuvees-cta-reveal');
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
})();

/* ==========================================================================
   3. SWITCHS ROSÉ / BLANC / ROUGE — Plaisir & Gastronomie, chacun indépendant
   ========================================================================== */
(function initCuveesSwitchers() {
  const ORDER = ['rose', 'blanc', 'rouge'];
  const GLOW = {
    rose: 'rgba(227,183,166,.55)',
    blanc: 'rgba(233,223,176,.5)',
    rouge: 'rgba(91,27,34,.6)',
  };

  document.querySelectorAll('.cuvees-showcase').forEach((section) => {
    const book = section.querySelector('.cuvee-book');
    const visual = section.querySelector('.cuvees-showcase__visual');
    const glow = section.querySelector('.cuvees-showcase__glow');
    const buttons = Array.from(section.querySelectorAll('.cuvee-switch__btn'));
    const details = Array.from(section.querySelectorAll('.cuvee-detail__item'));
    if (!book || !buttons.length || !window.gsap) return;

    let current = section.dataset.activeCuvee || 'rose';
    gsap.set(book, { xPercent: -ORDER.indexOf(current) * 33.3333 });
    if (glow) glow.style.background = `radial-gradient(circle, ${GLOW[current]} 0%, transparent 70%)`;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Ken Burns continu, très lent, même sans interaction ----
    if (!prefersReducedMotion) {
      gsap.to(book, {
        scale: 1.035,
        duration: 9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    // ---- Léger tilt magnétique au survol (desktop uniquement) ----
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHover && visual && !prefersReducedMotion) {
      visual.addEventListener('mousemove', (e) => {
        const rect = visual.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(book, {
          rotateY: nx * 6,
          rotateX: -ny * 4,
          duration: 0.6,
          ease: 'power2.out',
          transformPerspective: 1600,
        });
      });
      visual.addEventListener('mouseleave', () => {
        gsap.to(book, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' });
      });
    }

    function findDetail(name) {
      return details.find((d) => d.dataset.cuvee === name);
    }

    function switchTo(name) {
      if (name === current || !ORDER.includes(name)) return;
      const fromIndex = ORDER.indexOf(current);
      const toIndex = ORDER.indexOf(name);
      const goingForward = toIndex > fromIndex;
      const outgoing = findDetail(current);
      const incoming = findDetail(name);

      // Glissement + légère bascule façon page qui tourne, cohérent avec le
      // reste du site (accueil / Cuvée d'Exception)
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      tl.to(book, { xPercent: -toIndex * 33.3333, duration: 1 }, 0)
        .to(book, { rotateY: goingForward ? -6 : 6, duration: 0.45, ease: 'power2.out' }, 0)
        .to(book, { rotateY: 0, duration: 0.5, ease: 'power2.inOut' }, 0.45)
        .fromTo(
          book,
          { filter: 'brightness(1)' },
          { filter: 'brightness(0.85)', duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 },
          0
        );

      // Halo qui change de teinte avec la couleur sélectionnée
      if (glow) {
        gsap.to(glow, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            glow.style.background = `radial-gradient(circle, ${GLOW[name]} 0%, transparent 70%)`;
            gsap.to(glow, { opacity: 0.5, duration: 0.6, ease: 'power2.out' });
          },
        });
      }

      if (outgoing) {
        gsap.to(outgoing, {
          autoAlpha: 0,
          y: -12,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => outgoing.classList.remove('is-active'),
        });
      }
      if (incoming) {
        gsap.fromTo(
          incoming,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            delay: 0.2,
            ease: 'power2.out',
            onStart: () => incoming.classList.add('is-active'),
          }
        );
      }

      buttons.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.cuvee === name));
      });

      current = name;
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => switchTo(btn.dataset.cuvee));
    });
  });
})();
