
/* =========================
   Nakha Menu
========================= */

// Categories
const CATS = {
  snacks: 'سناك',
  appetizers: 'مقبلات',
  main: 'أطباق رئيسية',
  drinks: 'مشروبات',
  sweets: 'حلويات',
  offers: 'عروض'
};

// Products
// Format: [category, name, image, price, oldPrice?]
const ITEMS = [
  ['snacks', 'زبادي مع فواكه', 'yogurt.jpg', 4.5],
  ['snacks', 'جرانولا بار', 'bar.jpg', 3.5],
  ['snacks', 'مكسرات', 'nuts.jpg', 5],
  ['snacks', 'بوشار', 'popcorns.jpg', 3],
  ['snacks', 'تشيبس أو كراكرز', 'krakers.jpg', 3],
  ['snacks', 'بسكويت أو كوكيز', 'cookies.jpg', 3.5],

  ['appetizers', 'شوربة عدس', 'soup.jpg', 4.5],
  ['appetizers', 'بطاطا ودجز مع صوص جبنة', 'batata.jpg', 6],
  ['appetizers', 'سمبوسك بالجبنة أو اللحم', 'sambousek.jpg', 6.5],
  ['appetizers', 'حمص مدقوق بطحينة', 'hommoss.jpg', 5.5],
  ['appetizers', 'ورق عنب بزيت', 'wara2.jpg', 6],
  ['appetizers', 'فتة حمص', 'fatteh.jpg', 7],

  ['main', 'باستا ألفريدو مع دجاج', 'pasta.jpg', 12.99, 15.99],
  ['main', 'بيتزا مارغريتا أو خضار', 'pizza.jpg', 11],
  ['main', 'برغر لحم', 'burger.jpg', 10.5],
  ['main', 'ستيك لحم', 'steak.jpg', 18],

  ['drinks', 'عصير برتقال طبيعي', 'orange.jpg', 4],
  ['drinks', 'ليموناضة بالنعناع', 'Lemon_Mint_Juice.jpg', 3.5],
  ['drinks', 'قهوة لاتيه', 'coffee.jpg', 4],
  ['drinks', 'شاي أخضر', 'tea.jpg', 2.5],

  ['sweets', 'تشيز كيك بالتوت', 'blueberry.jpg', 6.5, 8],
  ['sweets', 'آيس كريم شوكولاتة وفانيليا', 'ice cream.jpg', 4.5],
  ['sweets', 'كنافة بالجبنة', 'kanava-cheese-2.jpeg', 7, 8.5],
  ['sweets', 'براونيز دافئ', 'Sweet-Nutella-Brownies.jpg', 5.5],
  ['sweets', 'دونات', 'donat.jpg', 3.5],
  ['sweets', 'ماكرون', 'macaron.JPG', 6]
].map((a, i) => ({
  id: i,
  cat: a[0],
  name: a[1],
  img: a[2],
  price: a[3],
  old: a[4]
}));

// Helpers
const $ = id => document.getElementById(id);

const money = n => '$' + Number(n).toFixed(2);

const safeGet = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Continue if browser storage is unavailable.
  }
};

// Application state
let cart = safeGet('nakha-cart', {});
let favs = new Set(safeGet('nakha-favs', []));
let active = 'all';
let query = '';

// Keep only valid cart items and quantities
function cleanCart() {
  const cleaned = {};

  for (const [id, qty] of Object.entries(cart)) {
    const index = Number(id);
    const amount = Number(qty);

    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < ITEMS.length &&
      Number.isInteger(amount) &&
      amount > 0
    ) {
      cleaned[index] = amount;
    }
  }

  cart = cleaned;
}

cleanCart();

// Product card
function card(it) {
  const price = it.old
    ? `<span class="old">${money(it.old)}</span> ${money(it.price)}`
    : money(it.price);

  return `
    <article class="gallery">

      ${it.old ? '<span class="badge">عرض</span>' : ''}

      <img
        src="${it.img}"
        alt="${it.name}"
        loading="lazy"
      >

      <p>${it.name}</p>

      <div class="price">${price}</div>

      <div class="icons">

        <button
          type="button"
          class="icon-btn fav ${favs.has(it.id) ? 'on' : ''}"
          data-fav="${it.id}"
          aria-label="أضف للمفضلة"
          aria-pressed="${favs.has(it.id)}"
        >
          <i class="fas fa-heart"></i>
        </button>

        <button
          type="button"
          class="cart-btn"
          data-add="${it.id}"
        >
          <i class="fas fa-plus"></i>
          أضف للسلة
        </button>

        <button
          type="button"
          class="icon-btn"
          data-share="${it.id}"
          aria-label="مشاركة"
        >
          <i class="fas fa-share"></i>
        </button>

      </div>
    </article>
  `;
}

// Render products and categories
function render() {
  const term = query.trim().toLocaleLowerCase();

  const matches = it =>
    it.name.toLocaleLowerCase().includes(term);

  const groups = Object.keys(CATS).filter(
    c => active === 'all' || active === c
  );

  let html = '';
  let shown = 0;

  for (const c of groups) {
    const list = ITEMS.filter(it =>
      (c === 'offers' ? Boolean(it.old) : it.cat === c) &&
      matches(it)
    );

    if (!list.length) continue;

    shown += list.length;

    html += `
      <section class="box" id="cat-${c}">
        <h2 class="group-title">${CATS[c]}</h2>

        <div class="gallery-container">
          ${list.map(card).join('')}
        </div>
      </section>
    `;
  }

  $('menu').innerHTML = html;
  $('empty').hidden = shown > 0;
}

// Render category filters
function renderChips() {
  const all = {
    all: 'الكل',
    ...CATS
  };

  $('chips').innerHTML = Object.entries(all)
    .map(([key, value]) => `
      <button
        type="button"
        class="chip ${key === active ? 'active' : ''}"
        data-cat="${key}"
        role="tab"
        aria-selected="${key === active}"
      >
        ${value}
      </button>
    `)
    .join('');
}

// Render shopping cart
function renderCart() {
  cleanCart();

  const rows = Object.entries(cart).map(([id, qty]) => ({
    it: ITEMS[Number(id)],
    q: qty
  }));

  $('cartList').innerHTML = rows.map(({ it, q }) => `
    <li>
      <img src="${it.img}" alt="${it.name}">

      <div class="li-info">
        <b>${it.name}</b>
        <small>${money(it.price)}</small>
      </div>

      <div class="qty">

        <button
          type="button"
          data-dec="${it.id}"
          aria-label="تقليل الكمية"
        >−</button>

        <span>${q}</span>

        <button
          type="button"
          data-inc="${it.id}"
          aria-label="زيادة الكمية"
        >+</button>

      </div>
    </li>
  `).join('');

  const count = rows.reduce((sum, row) => sum + row.q, 0);

  const total = rows.reduce(
    (sum, row) => sum + row.it.price * row.q,
    0
  );

  $('cartCount').textContent = count;
  $('cartCount').hidden = count === 0;

  $('cartEmpty').hidden = count > 0;
  $('checkout').disabled = count === 0;

  $('cartTotal').textContent = money(total);

  safeSet('nakha-cart', cart);
}

// Toast notifications
let toastTimer;

function toast(message) {
  const element = $('toast');

  element.textContent = message;
  element.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove('show');
  }, 1800);
}

// Open and close cart
function drawer(open) {
  const panel = $('drawer');
  const overlay = $('overlay');

  panel.classList.toggle('open', open);
  overlay.classList.toggle('show', open);

  panel.setAttribute('aria-hidden', String(!open));

  // Prevent background scrolling while cart is open
  document.body.style.overflow = open ? 'hidden' : '';
}

// Open cart button
$('cartOpen').addEventListener('click', () => {
  drawer(true);
});

// Close cart using X
$('cartClose').addEventListener('click', () => {
  drawer(false);
});

// Close cart by clicking the dark overlay
$('overlay').addEventListener('click', () => {
  drawer(false);
});

// Event delegation for product and quantity buttons
document.addEventListener('click', async event => {
  const button = event.target.closest('button');

  if (!button) return;

  const data = button.dataset;

  // Change category
  if (data.cat) {
    active = data.cat;
    renderChips();
    render();
    return;
  }

  // Add product to cart
  if (data.add !== undefined) {
    const id = Number(data.add);
    const it = ITEMS[id];

    if (!it) return;

    cart[id] = (cart[id] || 0) + 1;

    renderCart();

    toast(`أضيف «${it.name}» إلى السلة`);
    return;
  }

  // Increase quantity
  if (data.inc !== undefined) {
    const id = Number(data.inc);

    if (!ITEMS[id]) return;

    cart[id] = (cart[id] || 0) + 1;

    renderCart();
    return;
  }

  // Decrease quantity
  if (data.dec !== undefined) {
    const id = Number(data.dec);

    if (!ITEMS[id] || !cart[id]) return;

    cart[id]--;

    if (cart[id] <= 0) {
      delete cart[id];
    }

    renderCart();
    return;
  }

  // Toggle favorite
  if (data.fav !== undefined) {
    const id = Number(data.fav);

    if (!ITEMS[id]) return;

    if (favs.has(id)) {
      favs.delete(id);
    } else {
      favs.add(id);
    }

    safeSet('nakha-favs', [...favs]);

    button.classList.toggle('on', favs.has(id));
    button.setAttribute('aria-pressed', String(favs.has(id)));

    return;
  }

  // Share product
  if (data.share !== undefined) {
    const it = ITEMS[Number(data.share)];

    if (!it) return;

    const shareData = {
      title: 'نكهة',
      text: `${it.name} من مطعم نكهة`,
      url: location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(location.href);
        toast('تم نسخ الرابط');
      } else {
        toast('المشاركة غير متاحة في هذا المتصفح');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast('تعذّرت المشاركة');
      }
    }
  }
});

// Search products
$('search').addEventListener('input', event => {
  query = event.target.value;
  render();
});

// Close cart with Escape key
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    drawer(false);
  }
});


/* =========================
   Real email checkout
========================= */

// Replace these 3 values with your EmailJS dashboard values.
const EMAILJS_PUBLIC_KEY = 'O5GBGyJ_B1SMOVRzO';
const EMAILJS_SERVICE_ID = 'service_oaon5in';
const EMAILJS_TEMPLATE_ID = 'template_e59wjw6';

const checkoutModal = $('checkoutModal');
const checkoutForm = $('checkoutForm');
const checkoutMessage = $('checkoutMessage');
const sendOrderButton = $('sendOrder');

function openCheckout() {
  if (Object.keys(cart).length === 0) {
    toast('السلة فارغة، أضيفي طبقًا أولًا');
    return;
  }

  drawer(false);

  const rows = Object.entries(cart).map(([id, qty]) => ({
    it: ITEMS[Number(id)],
    q: Number(qty)
  }));

  const summary = rows.map(({ it, q }) =>
    `${it.name} × ${q} — ${money(it.price * q)}`
  ).join('\n');

  const total = rows.reduce(
    (sum, row) => sum + row.it.price * row.q,
    0
  );

  $('checkoutSummary').textContent =
    `${summary}\n\nالمجموع: ${money(total)}`;

  checkoutMessage.textContent = '';
  checkoutModal.classList.add('open');
  checkoutModal.setAttribute('aria-hidden', 'false');

  $('customerName').focus();
}

function closeCheckout() {
  if (sendOrderButton.disabled) return;

  checkoutModal.classList.remove('open');
  checkoutModal.setAttribute('aria-hidden', 'true');
}

// Open the checkout form
$('checkout').addEventListener('click', openCheckout);

// Close the form
$('checkoutClose').addEventListener('click', closeCheckout);

// Close when clicking outside the form
checkoutModal.addEventListener('click', event => {
  if (event.target === checkoutModal) {
    closeCheckout();
  }
});

// Close with Escape
document.addEventListener('keydown', event => {
  if (
    event.key === 'Escape' &&
    checkoutModal.classList.contains('open')
  ) {
    closeCheckout();
  }
});

// Submit a real order email
checkoutForm.addEventListener('submit', async event => {
  event.preventDefault();

  if (Object.keys(cart).length === 0) {
    checkoutMessage.textContent = 'السلة فارغة.';
    return;
  }

  if (
    EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY' ||
    EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID'
  ) {
    checkoutMessage.textContent =
      'يرجى إعداد بيانات EmailJS أولًا.';
    return;
  }

  const customerName = $('customerName').value.trim();
  const customerPhone = $('customerPhone').value.trim();
  const customerAddress = $('customerAddress').value.trim();
  const customerNotes = $('customerNotes').value.trim();

  if (!customerName || !customerPhone || !customerAddress) {
    checkoutMessage.textContent =
      'يرجى تعبئة الاسم ورقم الهاتف والعنوان.';
    return;
  }

  // Snapshot the order before sending it.
  const orderRows = Object.entries(cart).map(([id, qty]) => ({
    it: ITEMS[Number(id)],
    q: Number(qty)
  }));

  const total = orderRows.reduce(
    (sum, row) => sum + row.it.price * row.q,
    0
  );

  const orderItems = orderRows.map(({ it, q }) =>
    `${it.name} × ${q} — ${money(it.price * q)}`
  ).join('\n');

  const orderId =
    'NK-' + Date.now().toString(36).toUpperCase();

  const templateParams = {
    order_id: orderId,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    customer_notes: customerNotes || 'لا توجد ملاحظات',
    order_items: orderItems,
    order_total: money(total),
    order_date: new Date().toLocaleString('ar')
  };

  sendOrderButton.disabled = true;
  sendOrderButton.textContent = 'جارٍ إرسال الطلب...';
  checkoutMessage.textContent = '';

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      { publicKey: EMAILJS_PUBLIC_KEY }
    );

    // Clear the cart only after EmailJS confirms success.
    cart = {};
    renderCart();

    checkoutForm.reset();
    checkoutModal.classList.remove('open');
    checkoutModal.setAttribute('aria-hidden', 'true');

    toast(`تم إرسال الطلب ${orderId} بنجاح`);

  } catch (error) {
    console.error('EmailJS send failed:', error);

    checkoutMessage.textContent =
      'تعذّر إرسال الطلب. لم نفرّغ السلة. تحققي من الاتصال وإعدادات الإيميل ثم حاولي مجددًا.';

  } finally {
    sendOrderButton.disabled = false;
    sendOrderButton.textContent = 'إرسال الطلب';
  }
});


// Initial render
renderChips();
render();
renderCart();
drawer(false);
