/* ==========================================================================
   MAISON AURA — experiences.js
   Hero + révélations au scroll pour la page "Expériences"
   ========================================================================== */

/* ==========================================================================
   1. HERO — Ken Burns lent + parallax + apparition du texte
   ========================================================================== */
(function initExperiencesHero() {
  const hero = document.getElementById('experiences-hero');
  const heroImage = document.getElementById('experiences-hero-image');
  const heroContent = document.getElementById('experiences-hero-content');
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
    const cue = hero.querySelector('.experiences-hero__scrollcue');
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
   2. RÉVÉLATIONS AU SCROLL — cartes, réservation, CTA
   ========================================================================== */
(function initExperiencesReveals() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  /* ---- Cartes expériences : image en balayage + texte en cascade ---- */
  document.querySelectorAll('.experiences-card').forEach((card) => {
    const media = card.querySelector('.experiences-card__media');
    const textItems = card.querySelectorAll(
      '.experiences-card__content .eyebrow, .experiences-card__content h3, .experiences-card__content .lede, .experiences-card__meta'
    );

    if (media) gsap.set(media, { clipPath: 'inset(0 0 100% 0)', scale: 1.08 });
    gsap.set(textItems, { autoAlpha: 0, y: 28 });

    ScrollTrigger.create({
      trigger: card,
      start: 'top 76%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (media) {
          tl.to(media, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.inOut' }, 0)
            .to(media, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0);
        }
        tl.to(textItems, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.3);
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
  });

  /* ---- Réservation : étapes en cascade ---- */
  const bookingItems = document.querySelectorAll('.experiences-booking__item');
  if (bookingItems.length) {
    gsap.set(bookingItems, { autoAlpha: 0, y: 32 });
    ScrollTrigger.create({
      trigger: '.experiences-booking__grid',
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(bookingItems, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' });
      },
    });
  }

  /* ---- CTA final ---- */
  const cta = document.getElementById('experiences-cta-reveal');
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
