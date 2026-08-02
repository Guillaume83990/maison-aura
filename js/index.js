/* ==========================================================================
   MAISON AURA — index.js
   Séquence continue : intro cinématique (portail) → fondu vers le Hero
   (vignes, figées) → texte de la maison au scroll — le tout épinglé en un
   seul mouvement, avant le reste du site.
   + switch des 3 cuvées + révélations au scroll
   ========================================================================== */

/* ==========================================================================
   1. SÉQUENCE ÉPINGLÉE — portail (canvas) → fondu vers l'image des vignes
      (figée) → texte de la maison, en trois temps sur le même scroll.

      Pourquoi une séquence d'images plutôt qu'une balise <video> pour le
      portail : le seek vidéo (video.currentTime) n'est pas fluide — le
      navigateur doit redécoder depuis la dernière keyframe à chaque appel,
      ce qui saccade au scroll rapide. Une séquence d'images déjà décodées,
      dessinées sur canvas, élimine totalement cette latence.
   ========================================================================== */
(function initCinematicSequence() {
  const section = document.getElementById('cinematic');
  const stage = document.getElementById('cinematic-stage');
  const canvas = document.getElementById('cinematic-canvas');
  const heroContent = document.getElementById('hero-content');
  const scrollcue = document.getElementById('cinematic-scrollcue');
  const overlay = document.getElementById('cinematic-overlay');
  if (!section || !stage || !canvas || !window.gsap || !window.ScrollTrigger) return;

  const ctx = canvas.getContext('2d');
  const FRAME_COUNT = 91;
  const FRAME_PATH = (i) => `${window.AURA_ASSET_BASE || ''}images/sequence/frame-${String(i).padStart(3, '0')}.webp`;

  const frames = [];
  let loadedCount = 0;
  let lastDrawn = -1;

  function drawFrame(index, force) {
    index = Math.max(0, Math.min(FRAME_COUNT - 1, index));
    // Ne jamais tenter de dessiner une image pas encore chargée : on reste
    // sur la dernière frame disponible pendant le préchargement.
    const safeIndex = Math.min(index, Math.max(0, loadedCount - 1));
    if (safeIndex === lastDrawn && !force) return;

    const img = frames[safeIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    lastDrawn = safeIndex;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    // Les frames sont au format paysage. Sur un écran étroit et haut
    // (téléphone, tablette en portrait), un "cover" zoomerait à l'excès et
    // recadrerait le portail sur les côtés — on bascule alors en "contain"
    // façon cinéma (letterbox) pour garder toute la composition, centrée,
    // avec des bandes sombres en haut/bas plutôt qu'un recadrage serré.
    const isNarrowTall = cw / ch < 0.85;
    const scale = isNarrowTall
      ? Math.min(cw / iw, ch / ih)
      : Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function preloadFrames() {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.addEventListener('load', () => {
        loadedCount++;
        if (i === 1) drawFrame(0, true);
      });
      img.src = FRAME_PATH(i);
      frames.push(img);
    }
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(lastDrawn, true);
  }

  preloadFrames();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Texte du Hero — préparé ici, révélé en phase 3 (voir plus bas)
  const contentItems = heroContent
    ? heroContent.querySelectorAll('.hero__logo, .hero__title, .hero__text, .hero__cta')
    : [];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Accessibilité / confort : si l'utilisateur préfère un mouvement réduit,
  // on saute directement à l'état final (image visible, texte déjà là).
  if (prefersReducedMotion) {
    drawFrame(FRAME_COUNT - 1, true);
    gsap.set(canvas, { opacity: 0 });
    if (contentItems.length) gsap.set(contentItems, { autoAlpha: 1, y: 0 });
    if (scrollcue) gsap.set(scrollcue, { autoAlpha: 0 });
    if (overlay) gsap.set(overlay, { autoAlpha: 0 });
    return;
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function segment(p, start, end) {
    if (end === start) return p >= end ? 1 : 0;
    return clamp01((p - start) / (end - start));
  }

  if (contentItems.length) gsap.set(contentItems, { autoAlpha: 0, y: 28 });
  const heroContentTl = contentItems.length
    ? gsap.timeline({ paused: true }).to(contentItems, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        stagger: 0.22,
        ease: 'none',
      })
    : null;

  // Répartition du rail de scroll (fraction de la progression 0 → 1) :
  // 0    → 0.62 : le portail s'ouvre, image par image
  // 0.62 → 0.76 : le canvas se dissout, révélant l'image des vignes (figée)
  // 0.76 → 1    : le texte de la maison se dévoile
  const FRAMES_END = 0.62;
  const IMAGE_REVEAL_START = 0.62;
  const IMAGE_REVEAL_END = 0.76;
  const TEXT_START = 0.76;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    // La distance de scroll est portée par la hauteur CSS de .cinematic
    // elle-même (460vh).
    end: 'bottom bottom',
    pin: stage,
    scrub: 0.6,
    onUpdate(self) {
      const p = clamp01(self.progress);

      // ---- Phase 1 : le portail s'ouvre ----
      const framePhase = clamp01(p / FRAMES_END);
      drawFrame(Math.round(framePhase * (FRAME_COUNT - 1)));

      // ---- Phase 2 : le canvas se dissout sur l'image figée ----
      const revealP = segment(p, IMAGE_REVEAL_START, IMAGE_REVEAL_END);
      canvas.style.opacity = String(1 - revealP);

      // ---- Phase 3 : le texte de la maison se dévoile ----
      if (heroContentTl) {
        const textP = segment(p, TEXT_START, 1);
        heroContentTl.progress(textP);
      }

      // Le repère "Défiler" s'efface dès le tout début du scroll.
      if (scrollcue) {
        scrollcue.style.opacity = String(1 - segment(p, 0, 0.08));
      }

      // "Bienvenue chez MAISON AURA" — apparaît doucement, puis s'efface
      // avant que le portail ne cède la place à l'image des vignes.
      if (overlay) {
        const textIn = segment(p, 0.03, 0.16);
        const textOut = 1 - segment(p, 0.42, 0.58);
        overlay.style.opacity = String(Math.min(textIn, textOut));
      }
    },
  });
})();


/* ==========================================================================
   2. RÉVÉLATIONS AU SCROLL — texte et images, en un mouvement chorégraphié
   ========================================================================== */
(function initSectionReveals() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  /* ---- Showcase Cuvée d'Exception : cascade eyebrow -> titre -> texte -> switch -> note -> CTA ---- */
  const showcaseIntro = document.querySelector('.showcase__intro');
  if (showcaseIntro) {
    const items = showcaseIntro.querySelectorAll(
      '.eyebrow, h2, p, .cuvee-switch, .cuvee-note, .btn'
    );
    gsap.set(items, { autoAlpha: 0, y: 26 });
    ScrollTrigger.create({
      trigger: showcaseIntro,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
    });
  }

  /* ---- Showcase : le flacon lui-même apparaît en fondu + léger zoom ---- */
  const showcaseVisual = document.querySelector('.showcase__visual');
  if (showcaseVisual) {
    gsap.set(showcaseVisual, { autoAlpha: 0, scale: 0.94 });
    ScrollTrigger.create({
      trigger: showcaseVisual,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(showcaseVisual, {
          autoAlpha: 1,
          scale: 1,
          duration: 1.3,
          ease: 'power3.out',
        });
      },
    });
  }

  /* ---- Gammes : cartes Plaisir / Gastronomie en cascade ---- */
  const gammeCards = document.querySelectorAll('.gamme');
  if (gammeCards.length) {
    gsap.set(gammeCards, { autoAlpha: 0, y: 36 });
    ScrollTrigger.create({
      trigger: '.gammes',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(gammeCards, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        });
      },
    });
  }

  /* ---- Expériences : accroche en cascade ---- */
  const experiences = document.getElementById('experiences-reveal');
  if (experiences) {
    const items = experiences.querySelectorAll('.eyebrow, h2, p, .btn');
    gsap.set(items, { autoAlpha: 0, y: 24 });
    ScrollTrigger.create({
      trigger: experiences,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
    });
  }
})();

/* ==========================================================================
   3. SHOWCASE — "livre" à défilement pour les 3 couleurs de la Cuvée Très Exception
   ========================================================================== */
(function initCuveeBook() {
  const showcase = document.querySelector('.showcase');
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
  gsap.set(book, { xPercent: -ORDER.indexOf(current) * 33.3333 });

  function switchTo(name) {
    if (name === current || !ORDER.includes(name)) return;

    const fromIndex = ORDER.indexOf(current);
    const toIndex = ORDER.indexOf(name);
    const goingForward = toIndex > fromIndex;
    const ambiance = AMBIANCE[name];
    const outgoingNote = findNote(current);
    const incomingNote = findNote(name);

    // Glissement du rail + légère bascule 3D façon page qui tourne
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

    // Fiche de dégustation — glissement vertical feutré
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

/* ==========================================================================
   4. GAMMES — boutons Rosé/Blanc/Rouge cliquables sur Plaisir & Gastronomie
   ========================================================================== */
(function initGammeSwitchers() {
  const ORDER = ['rose', 'blanc', 'rouge'];

  document.querySelectorAll('.gamme').forEach((card) => {
    const book = card.querySelector('.gamme-book');
    const buttons = Array.from(card.querySelectorAll('.gamme__color-btn'));
    if (!book || !buttons.length || !window.gsap) return;

    let current = book.dataset.activeCuvee || 'rose';
    gsap.set(book, { xPercent: -ORDER.indexOf(current) * 33.3333 });

    function switchTo(name) {
      if (name === current || !ORDER.includes(name)) return;
      const toIndex = ORDER.indexOf(name);

      gsap.to(book, { xPercent: -toIndex * 33.3333, duration: 0.9, ease: 'power3.inOut' });

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
