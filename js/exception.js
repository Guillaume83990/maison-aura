/* ==========================================================================
   MAISON AURA — exception.js
   Hero (Ken Burns + parallax + texte) + révélations au scroll
   + switch "livre" Rouge/Blanc/Rosé pour la page Cuvée d'Exception
   ========================================================================== */

/* ==========================================================================
   1. HERO — flacon sur fond noir : Ken Burns lent + parallax + texte
   ========================================================================== */
(function initExceptionHero() {
  const hero = document.getElementById('exception-hero');
  const heroImage = document.getElementById('exception-hero-image');
  const heroContent = document.getElementById('exception-hero-content');
  if (!hero || !window.gsap) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroImage && !prefersReducedMotion) {
    gsap.fromTo(heroImage, { scale: 1.12 }, { scale: 1, duration: 20, ease: 'none' });

    if (window.ScrollTrigger) {
      gsap.to(heroImage, {
        yPercent: 8,
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

  if (!prefersReducedMotion && window.ScrollTrigger) {
    const cue = hero.querySelector('.exception-hero__scrollcue');
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
   2. RÉVÉLATIONS AU SCROLL — teaser éditorial, intro showcase, allocation
   ========================================================================== */
(function initExceptionReveals() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  /* ---- Teaser éditorial : image en balayage + texte en cascade ---- */
  const teaser = document.querySelector('.exception-teaser');
  if (teaser) {
    const media = teaser.querySelector('.exception-teaser__media');
    const textItems = teaser.querySelectorAll(
      '.exception-teaser__eyebrow, .exception-teaser__title, .exception-teaser__text'
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

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHover && media) {
      const img = media.querySelector('img');
      if (img) {
        media.addEventListener('mousemove', (e) => {
          const rect = media.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(img, { x: nx * 14, y: ny * 14, scale: 1.04, duration: 0.6, ease: 'power2.out' });
        });
        media.addEventListener('mouseleave', () => {
          gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' });
        });
      }
    }
  }

  /* ---- L'Élevage : cartes en cascade ---- */
  const elevageItems = document.querySelectorAll('.exception-elevage__item');
  if (elevageItems.length) {
    gsap.set(elevageItems, { autoAlpha: 0, y: 32 });
    ScrollTrigger.create({
      trigger: '.exception-elevage__grid',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(elevageItems, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' });
      },
    });
  }

  /* ---- Intro du showcase : cascade eyebrow -> titre -> switch -> note -> CTA ---- */
  const showcaseIntro = document.querySelector('.exception-showcase__intro');
  if (showcaseIntro) {
    const items = showcaseIntro.querySelectorAll('.eyebrow, h2, .cuvee-switch, .cuvee-note, .btn');
    gsap.set(items, { autoAlpha: 0, y: 26 });
    ScrollTrigger.create({
      trigger: showcaseIntro,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
      },
    });
  }

  /* ---- Le flacon du showcase : fondu + léger zoom ---- */
  const showcaseVisual = document.querySelector('.exception-showcase__visual');
  if (showcaseVisual) {
    gsap.set(showcaseVisual, { autoAlpha: 0, scale: 0.94 });
    ScrollTrigger.create({
      trigger: showcaseVisual,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(showcaseVisual, { autoAlpha: 1, scale: 1, duration: 1.3, ease: 'power3.out' });
      },
    });
  }

  /* ---- Allocation : cascade sobre ---- */
  const allocation = document.getElementById('allocation-reveal');
  if (allocation) {
    const items = allocation.querySelectorAll('.eyebrow, h2, p, .btn');
    gsap.set(items, { autoAlpha: 0, y: 24 });
    ScrollTrigger.create({
      trigger: allocation,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
      },
    });
  }
})();

/* ==========================================================================
   3. SHOWCASE — "livre" à défilement pour les 3 couleurs
   ========================================================================== */
(function initCuveeBook() {
  const showcase = document.getElementById('exception-showcase');
  const book = document.getElementById('cuvee-book');
  if (!showcase || !book) return;

  const buttons = Array.from(document.querySelectorAll('.cuvee-switch__btn'));
  const notes = Array.from(document.querySelectorAll('.cuvee-note__item'));
  const ORDER = ['rouge', 'blanc', 'rose'];

  const AMBIANCE = {
    rouge: { bg: '#1A1917', txt: '#F3EFE7' },
    blanc: { bg: '#DCD3C0', txt: '#14130F' },
    rose: { bg: '#D9B9A8', txt: '#1A1210' },
  };

  let current = showcase.dataset.activeCuvee || 'rouge';

  function findNote(name) {
    return notes.find((n) => n.dataset.cuvee === name);
  }

  // Position initiale du rail — simple pourcentage, aucune ambiguïté de calcul
  if (window.gsap) gsap.set(book, { xPercent: -ORDER.indexOf(current) * 33.3333 });

  function switchTo(name) {
    if (name === current || !ORDER.includes(name) || !window.gsap) return;

    const fromIndex = ORDER.indexOf(current);
    const toIndex = ORDER.indexOf(name);
    const goingForward = toIndex > fromIndex;
    const ambiance = AMBIANCE[name];
    const outgoingNote = findNote(current);
    const incomingNote = findNote(name);

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    tl.to(book, { xPercent: -toIndex * 33.3333, duration: 1.05 }, 0)
      .to(book, { rotateY: goingForward ? -5 : 5, duration: 0.5, ease: 'power2.out' }, 0)
      .to(book, { rotateY: 0, duration: 0.55, ease: 'power2.inOut' }, 0.5)
      .fromTo(
        book,
        { filter: 'brightness(1)' },
        { filter: 'brightness(0.82)', duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 },
        0
      );

    gsap.to(showcase, {
      backgroundColor: ambiance.bg,
      color: ambiance.txt,
      duration: 0.9,
      ease: 'power2.inOut',
    });

    if (outgoingNote) {
      gsap.to(outgoingNote, {
        autoAlpha: 0,
        y: -14,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => outgoingNote.classList.remove('is-active'),
      });
    }
    if (incomingNote) {
      gsap.fromTo(
        incomingNote,
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          delay: 0.25,
          ease: 'power2.out',
          onStart: () => incomingNote.classList.add('is-active'),
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
})();
