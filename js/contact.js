/* ==========================================================================
   MAISON AURA — contact.js
   Hero (emblème dessiné au trait) + formulaire à labels flottants +
   animation "sceau de cire" à l'envoi
   ========================================================================== */


/* ==========================================================================
   1. HERO — Ken Burns + parallax + emblème dessiné au trait + texte
   ========================================================================== */
(function initContactHero() {
  const hero = document.getElementById('contact-hero');
  const heroImage = document.getElementById('contact-hero-image');
  const heroContent = document.getElementById('contact-hero-content');
  const emblem = document.getElementById('contact-emblem');
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

  // ---- L'emblème sunburst se dessine au trait, avant le reste du texte ----
  if (emblem) {
    const strokes = emblem.querySelectorAll('.emblem-ring, .emblem-ray');
    strokes.forEach((el) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
    });
    if (prefersReducedMotion) {
      gsap.set(strokes, { strokeDashoffset: 0 });
    } else {
      gsap.to(strokes, {
        strokeDashoffset: 0,
        duration: 1.1,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.2,
      });
    }
  }

  const items = heroContent
    ? heroContent.querySelectorAll('.eyebrow, h1, .lede')
    : [];
  if (items.length) {
    if (prefersReducedMotion) {
      gsap.set(items, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(items, { autoAlpha: 0, y: 22 });
      gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.16, ease: 'power3.out', delay: 0.9 });
    }
  }

  if (!prefersReducedMotion && window.ScrollTrigger) {
    const cue = hero.querySelector('.contact-hero__scrollcue');
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
   2. FORMULAIRE — label flottant du <select>, puis "sceau de cire" à l'envoi
   ========================================================================== */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const seal = document.getElementById('contact-seal');
  const select = document.getElementById('cf-subject');
  if (!form) return;

  // Le <select> n'a pas d'équivalent CSS à :not(:placeholder-shown) —
  // on bascule la classe qui fait flotter son label nous-mêmes.
  if (select) {
    select.addEventListener('change', () => {
      select.classList.toggle('has-value', Boolean(select.value));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const name = form.querySelector('#cf-name').value.trim();
    const email = form.querySelector('#cf-email').value.trim();
    const subject = form.querySelector('#cf-subject').value || 'Demande de contact';
    const message = form.querySelector('#cf-message').value.trim();

    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:contact@maisonaura.fr?subject=${encodeURIComponent(
      'MAISON AURA — ' + subject
    )}&body=${encodeURIComponent(body)}`;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!window.gsap || prefersReducedMotion) {
      window.location.href = mailto;
      return;
    }

    const stamp = seal ? seal.querySelector('.contact-seal__stamp') : null;
    const sealText = seal ? seal.querySelectorAll('.contact-seal__text, .contact-seal__subtext') : [];

    const tl = gsap.timeline();
    tl.to(form, {
      autoAlpha: 0,
      y: -14,
      duration: 0.5,
      ease: 'power2.in',
    })
      .add(() => {
        if (seal) seal.classList.add('is-visible');
      })
      .fromTo(
        stamp,
        { scale: 0, rotate: -25, autoAlpha: 0 },
        { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.2)' }
      )
      .fromTo(
        sealText,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      )
      .add(() => {
        window.location.href = mailto;
      }, '+=1.1');
  });
})();
