/* ==========================================================================
   MAISON AURA — checkout.js
   Récapitulatif de commande, formatage des champs carte, simulation de
   paiement (aucune transaction réelle) et confirmation animée
   ========================================================================== */

(function initCheckout() {
  const layout = document.getElementById('checkout-layout');
  const emptyEl = document.getElementById('checkout-empty');
  const successEl = document.getElementById('checkout-success');
  const linesEl = document.getElementById('checkout-summary-lines');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const shippingEl = document.getElementById('checkout-shipping');
  const totalEl = document.getElementById('checkout-total');
  const submitAmountEl = document.getElementById('checkout-submit-amount');
  const form = document.getElementById('checkout-form');
  if (!window.AuraCart) return;

  const FREE_SHIPPING_THRESHOLD = 100;
  const SHIPPING_COST = 9;

  const lines = window.AuraCart.cartLines();

  if (lines.length === 0) {
    if (layout) layout.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  const subtotal = window.AuraCart.cartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  if (linesEl) {
    linesEl.innerHTML = lines
      .map(
        (line) => `
      <div class="checkout-summary__line">
        <picture>
          <source srcset="${line.product.imgWebp}" type="image/webp">
          <img src="${line.product.img}" alt="">
        </picture>
        <span class="checkout-summary__line-name">
          ${line.product.cuvee} — ${line.product.color}
          <small>Qté ${line.qty}</small>
        </span>
        <span>${line.product.price * line.qty} €</span>
      </div>
    `
      )
      .join('');
  }
  if (subtotalEl) subtotalEl.textContent = subtotal + ' €';
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Offerte' : shipping + ' €';
  if (totalEl) totalEl.textContent = total + ' €';
  if (submitAmountEl) submitAmountEl.textContent = total + ' €';

  /* ---- Formatage des champs carte (visuel uniquement) ---- */
  const cardNumber = document.getElementById('ck-card-number');
  const cardExpiry = document.getElementById('ck-card-expiry');
  const cardCvc = document.getElementById('ck-card-cvc');

  if (cardNumber) {
    cardNumber.addEventListener('input', () => {
      const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
      cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
  }
  if (cardExpiry) {
    cardExpiry.addEventListener('input', () => {
      let digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) digits = digits.slice(0, 2) + ' / ' + digits.slice(2);
      cardExpiry.value = digits;
    });
  }
  if (cardCvc) {
    cardCvc.addEventListener('input', () => {
      cardCvc.value = cardCvc.value.replace(/\D/g, '').slice(0, 3);
    });
  }

  /* ---- Soumission — simulation, aucune transaction réelle ---- */
  if (!form) return;
  const submitBtn = document.getElementById('checkout-submit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const name = document.getElementById('ck-name').value.trim();

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      const orderNumber = 'AURA-' + Math.floor(100000 + Math.random() * 900000);
      const successNameEl = document.getElementById('checkout-success-name');
      const orderNumberEl = document.getElementById('checkout-order-number');
      if (successNameEl) successNameEl.textContent = name || 'votre commande';
      if (orderNumberEl) orderNumberEl.textContent = orderNumber;

      window.AuraCart.clearCart();

      if (layout) layout.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        if (window.gsap) {
          const check = successEl.querySelector('.checkout-success__check');
          const circle = successEl.querySelector('.checkout-success__mark circle');
          const rest = successEl.querySelectorAll('.eyebrow, h2, .lede, .btn');

          if (check) {
            const len = check.getTotalLength();
            gsap.set(check, { strokeDasharray: len, strokeDashoffset: len });
          }
          gsap.set(circle, { autoAlpha: 0, scale: 0.7, transformOrigin: 'center' });
          gsap.set(rest, { autoAlpha: 0, y: 16 });

          const tl = gsap.timeline();
          tl.to(circle, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' })
            .to(check, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, '-=0.15')
            .to(rest, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, '-=0.2');
        }
      }
    }, 1600);
  });
})();
