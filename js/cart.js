/* ==========================================================================
   MAISON AURA — cart.js
   Rendu du panier, quantités, suppression animée, résumé de commande
   ========================================================================== */

(function initCartPage() {
  const linesEl = document.getElementById('cart-lines');
  const layout = document.getElementById('cart-layout');
  const emptyEl = document.getElementById('cart-empty');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (!linesEl || !window.AuraCart) return;

  const FREE_SHIPPING_THRESHOLD = 100;
  const SHIPPING_COST = 9;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lineTemplate(line) {
    const p = line.product;
    return `
      <div class="cart-line" data-id="${p.id}">
        <div class="cart-line__media">
          <picture>
            <source srcset="${p.imgWebp}" type="image/webp">
            <img src="${p.img}" alt="Flacon ${p.cuvee} ${p.color}" loading="lazy">
          </picture>
        </div>
        <div class="cart-line__info">
          <p class="cart-line__gamme">${p.gamme}</p>
          <p class="cart-line__name">${p.cuvee}</p>
          <p class="cart-line__color">${p.color}</p>
        </div>
        <div class="cart-line__qty">
          <button type="button" data-action="decrease" aria-label="Diminuer la quantité">−</button>
          <span>${line.qty}</span>
          <button type="button" data-action="increase" aria-label="Augmenter la quantité">+</button>
        </div>
        <div class="cart-line__right">
          <span class="cart-line__price">${p.price * line.qty} €</span>
          <button type="button" class="cart-line__remove" data-action="remove">Retirer</button>
        </div>
      </div>
    `;
  }

  function render() {
    const lines = window.AuraCart.cartLines();
    const isEmpty = lines.length === 0;

    if (layout) layout.hidden = isEmpty;
    if (emptyEl) emptyEl.hidden = !isEmpty;
    if (checkoutBtn) {
      if (isEmpty) checkoutBtn.setAttribute('aria-disabled', 'true');
      else checkoutBtn.removeAttribute('aria-disabled');
    }

    if (isEmpty) return;

    linesEl.innerHTML = lines.map(lineTemplate).join('');

    const subtotal = window.AuraCart.cartTotal();
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = subtotal + ' €';
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Offerte' : shipping + ' €';
    if (totalEl) totalEl.textContent = total + ' €';

    if (!prefersReducedMotion && window.gsap) {
      gsap.set(linesEl.querySelectorAll('.cart-line'), { autoAlpha: 0, y: 16 });
      gsap.to(linesEl.querySelectorAll('.cart-line'), {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      });
    }
  }

  linesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const lineEl = btn.closest('.cart-line');
    const id = lineEl.dataset.id;
    const current = window.AuraCart.getCart().find((i) => i.id === id);
    if (!current) return;

    if (btn.dataset.action === 'increase') {
      window.AuraCart.updateQty(id, current.qty + 1);
      render();
      return;
    }
    if (btn.dataset.action === 'decrease') {
      window.AuraCart.updateQty(id, current.qty - 1);
      render();
      return;
    }
    if (btn.dataset.action === 'remove') {
      if (!prefersReducedMotion && window.gsap) {
        gsap.to(lineEl, {
          autoAlpha: 0,
          x: -24,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.45,
          ease: 'power2.in',
          onComplete: () => {
            window.AuraCart.removeFromCart(id);
            render();
          },
        });
      } else {
        window.AuraCart.removeFromCart(id);
        render();
      }
    }
  });

  render();
})();
