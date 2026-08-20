/* ============================================================
   Techgrid Africa — App (router, pages, interactions)
   ============================================================ */
const App = (function () {

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  const USD_RATE = 18.2;
  let currency = (function () {
    try { return localStorage.getItem("tg_cur") || "ZAR"; } catch (e) { return "ZAR"; }
  })();

  function setCurrency(c) {
    currency = c;
    try { localStorage.setItem("tg_cur", c); } catch (e) {}
    $$(".cur-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.cur === c);
    });
    render();
  }

  function fmtPrice(zar) {
    if (currency === "USD") {
      const v = Math.round(zar / USD_RATE);
      return { main: "$" + v.toLocaleString("en-US"), alt: "R " + zar.toLocaleString("en-ZA"), value: v };
    }
    return { main: "R " + zar.toLocaleString("en-ZA"), alt: "$" + Math.round(zar / USD_RATE).toLocaleString("en-US"), value: zar };
  }

  function stars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
  }

  /* ---------- toast ---------- */
  function toast(msg, type) {
    const box = $("#toasts");
    const t = document.createElement("div");
    t.className = "toast " + (type || "success");
    t.innerHTML = '<span class="t-ic">' + (type === "error" ? "✕" : "✓") + "</span><span>" + esc(msg) + "</span>";
    box.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .3s"; }, 3200);
    setTimeout(function () { t.remove(); }, 3600);
  }

  /* ---------- icons ---------- */
  const ICONS = {
    smartphone: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/></svg>',
    foldables: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M12 3v18"/></svg>',
    layer: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>',
    tablet: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="3"/><path d="M11 18h2"/></svg>',
    rugged: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/></svg>',
    shield: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/></svg>',
    budget: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>',
    zap: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>',
    shield: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/></svg>',
    truck: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 12l5 5L20 6"/></svg>',
    lock: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 118 0v3"/></svg>',
    refresh: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 11-2.3-5.6"/><path d="M20 4v4h-4"/></svg>',
    cart: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></svg>',
    user: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
    home: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    tag: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12l-8 8-9-9V4h7z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>'
  };

  /* ---------- state ---------- */
  const state = {
    search: "",
    cat: "all",
    sort: "featured",
    maxPrice: 60000
  };

  /* ---------- global UI ---------- */
  function renderHeaderNav() {
    const drop = $("#navDrop");
    if (!drop) return;
    drop.innerHTML = CATEGORIES.map(function (c) {
      const count = productsByCategory(c.id).length;
      return '<a href="#/shop/' + c.id + '"><span class="cat-icon">' + ICONS[c.icon] + "</span>" +
        esc(c.label) + '<span class="cat-count">' + count + "</span></a>";
    }).join("");
    $$(".cat-count").forEach(function (el) {
      const n = parseInt(el.textContent, 10);
      el.style.color = n ? "" : "var(--faint)";
    });
  }

  function renderFooter() {
    $("#footerCount").textContent = PRODUCT_COUNT;
    $("#footerCatCount").textContent = CATEGORIES.length;
    $("#footerCats").innerHTML = CATEGORIES.map(function (c) {
      return '<a href="#/shop/' + c.id + '" class="footer-link">' + esc(c.label) + "</a>";
    }).join("");
  }

  function updateCartCount() {
    const c = $("#cartCount");
    if (c) c.textContent = Store.cartCount();
  }

  function updateAccountBtn() {
    const btn = $("#accountBtn");
    if (!btn) return;
    const u = Auth.currentUser();
    btn.title = u ? "Account: " + u.name : "Sign in / Create account";
    btn.style.borderColor = u ? "var(--green)" : "";
  }

  /* ---------- router ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "") || "home";
    const parts = raw.split("/").filter(Boolean);
    const name = parts[0] || "home";
    const arg = parts[1] ? decodeURIComponent(parts[1]) : null;
    const arg2 = parts[2] ? decodeURIComponent(parts[2]) : null;
    return { name: name, arg: arg, arg2: arg2 };
  }

  function render() {
    const r = parseHash();
    const app = $("#app");
    let html = "";
    let scrollTop = true;

    if (r.name === "home") html = pageHome();
    else if (r.name === "shop") html = pageShop(r.arg);
    else if (r.name === "product") html = pageProduct(r.arg);
    else if (r.name === "cart") html = pageCart();
    else if (r.name === "checkout") html = pageCheckout();
    else if (r.name === "success") html = pageSuccess(r.arg);
    else if (r.name === "track") html = pageTrack();
    else if (r.name === "order") html = pageOrderDetail(r.arg);
    else if (r.name === "account") html = pageAccount();
    else if (r.name === "auth") html = pageAuth(r.arg || "signin");
    else if (r.name === "about") html = pageAbout();
    else { html = pageHome(); }

    app.innerHTML = '<div class="page-enter">' + html + "</div>";
    if (scrollTop) window.scrollTo(0, 0);
    afterRender(r);
  }

  /* ============================================================
     PAGES
     ============================================================ */
  function pageHome() {
    const cats = CATEGORIES.map(function (c) {
      const count = productsByCategory(c.id).length;
      return '<a href="#/shop/' + c.id + '" class="cat-card">' +
        '<div class="cat-icon">' + ICONS[c.icon] + "</div>" +
        "<h3>" + esc(c.label) + "</h3><p>" + count + " products</p></a>";
    }).join("");

    const featured = PRODUCTS.filter(function (p) { return p.tag; }).slice(0, 8);
    const newest = PRODUCTS.filter(function (p) { return p.tag === "New"; })
      .concat(PRODUCTS.filter(function (p) { return p.tag !== "New"; }))
      .slice(0, 8);
    const deals = PRODUCTS.filter(function (p) { return p.compareAt && p.compareAt > p.price; })
      .slice()
      .sort(function (a, b) { return (b.compareAt - b.price) - (a.compareAt - a.price); })
      .slice(0, 8);

    return (
      '<section class="hero">' +
        '<div class="hero-content">' +
          '<span class="hero-badge">◆ Trusted tech retailer — South Africa</span>' +
          '<h1>Upgrade your world.<br /><span class="grad">Tech for every budget.</span></h1>' +
          '<p>From flagship foldables to dependable everyday phones — genuine devices, honest prices and nationwide delivery from Techgrid Africa.</p>' +
          '<div class="hero-actions">' +
            '<a href="#/shop" class="btn btn-primary">Shop all devices</a>' +
            '<a href="#/about" class="btn btn-ghost">Why Techgrid?</a>' +
          '</div>' +
          '<div class="hero-stats">' +
            '<div class="hero-stat"><b>' + PRODUCT_COUNT + "</b><span>Products in store</span></div>" +
            '<div class="hero-stat"><b>5</b><span>Device categories</span></div>' +
            '<div class="hero-stat"><b>24-72h</b><span>Nationwide delivery</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section-head"><div><h2>Shop by category</h2><p class="sub">Find exactly what you need</p></div></div>' +
        '<div class="cat-grid">' + cats + "</div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="section-head"><div><h2>Featured &amp; bestsellers</h2><p class="sub">Hand-picked by our team</p></div><a class="more" href="#/shop">View all →</a></div>' +
        '<div class="grid">' + featured.map(cardHtml).join("") + "</div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="section-head"><div><h2>Just landed</h2><p class="sub">The newest devices</p></div><a class="more" href="#/shop">View all →</a></div>' +
        '<div class="grid">' + newest.map(cardHtml).join("") + "</div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="section-head"><div><h2>Hot deals</h2><p class="sub">Save on these today</p></div><a class="more" href="#/shop">View all →</a></div>' +
        '<div class="grid">' + deals.map(cardHtml).join("") + "</div>" +
      "</section>"
    );
  }

  function cardHtml(p) {
    const price = fmtPrice(p.price);
    const hasOld = p.compareAt && p.compareAt > p.price;
    const tag = p.tag ? '<span class="card-tag ' + tagClass(p.tag) + '">' + esc(p.tag) + "</span>" : "";
    return (
      '<article class="card" data-pid="' + p.id + '">' +
        '<div class="card-media">' + tag +
          '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" />' +
          '<button class="add-btn" data-add="' + p.id + '" title="Add to cart" aria-label="Add ' + esc(p.name) + ' to cart">' + ICONS.cart + "</button>" +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-brand">' + esc(p.brand) + "</div>" +
          '<h3 class="card-name"><a href="#/product/' + p.id + '">' + esc(p.name) + "</a></h3>" +
          '<div class="card-rating"><span class="stars">' + stars(p.rating) + "</span>" + p.ratingLabel + " (" + p.reviews + ")</div>" +
          '<div class="card-foot">' +
            '<div class="price">' + price.main +
              (hasOld ? ' <span class="was">' + fmtPrice(p.compareAt).main + "</span>" : "") +
              "<small>" + (currency === "ZAR" ? "≈ " + price.alt : "≈ " + price.alt) + "</small>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function tagClass(t) {
    const map = { "Bestseller": "bestseller", "New": "new", "Pro": "pro", "Ultra": "ultra",
      "Limited": "limited", "Foldable": "foldable", "Rugged": "rugged", "Slim": "slim",
      "Value": "value", "Creator": "creator", "Classic": "classic", "Eye-care": "eye-care" };
    return map[t] || "new";
  }

  function filteredProducts() {
    let list = PRODUCTS.slice();
    if (state.cat !== "all") list = list.filter(function (p) { return p.category === state.cat; });
    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) !== -1 ||
          p.brand.toLowerCase().indexOf(q) !== -1 ||
          p.category.indexOf(q) !== -1;
      });
    }
    list = list.filter(function (p) { return p.price <= state.maxPrice; });

    if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
    else if (state.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else list.sort(function (a, b) { return (b.compareAt - b.price || 0) - (a.compareAt - a.price || 0) || b.rating - a.rating; });
    return list;
  }

  function pageShop(catArg) {
    if (catArg && catArg !== "all") state.cat = catArg;
    const list = filteredProducts();
    const currentCat = getCategory(state.cat);

    const filters = CATEGORIES.map(function (c) {
      const count = productsByCategory(c.id).length;
      return '<div class="filter-item' + (state.cat === c.id ? " active" : "") + '" data-cat="' + c.id + '">' +
        "<span>" + esc(c.label) + "</span><span class=\"cat-count\">" + count + "</span></div>";
    }).join("");
    const maxV = state.maxPrice;
    const priceFmt = fmtPrice(maxV);

    return (
      '<div class="shop-layout">' +
        '<aside class="filters">' +
          "<h3>Categories</h3>" +
          '<div class="filter-item' + (state.cat === "all" ? " active" : "") + '" data-cat="all"><span>All Products</span><span class="cat-count">' + PRODUCT_COUNT + "</span></div>" +
          filters +
          '<div class="filter-price" style="margin-top:16px">' +
            "<label>Max price — <b>" + priceFmt.main + "</b></label>" +
            '<input type="range" min="500" max="60000" step="500" value="' + maxV + '" id="priceRange" />' +
          "</div>" +
        "</aside>" +
        '<div>' +
          '<div class="shop-toolbar">' +
            '<span class="result-count"><b>' + list.length + "</b> product" + (list.length === 1 ? "" : "s") +
              (currentCat ? " in " + esc(currentCat.label) : "") + "</span>" +
            '<select class="sort-select" id="sortSelect">' +
              '<option value="featured"' + (state.sort === "featured" ? " selected" : "") + ">Sort: Featured</option>" +
              '<option value="price-asc"' + (state.sort === "price-asc" ? " selected" : "") + ">Price: Low to High</option>" +
              '<option value="price-desc"' + (state.sort === "price-desc" ? " selected" : "") + ">Price: High to Low</option>" +
              '<option value="rating"' + (state.sort === "rating" ? " selected" : "") + ">Top Rated</option>" +
              '<option value="name"' + (state.sort === "name" ? " selected" : "") + ">Name (A–Z)</option>" +
            "</select>" +
          "</div>" +
          (list.length ? '<div class="grid">' + list.map(cardHtml).join("") + "</div>" :
            '<div class="empty-state"><div class="big">🔍</div><h3>No products found</h3><p>Try a different search or category.</p></div>') +
        "</div>" +
      "</div>"
    );
  }

  function pageProduct(id) {
    const p = getProduct(id);
    if (!p) return '<div class="empty-state"><div class="big">⚠️</div><h3>Product not found</h3><a class="btn btn-primary mt-20" href="#/shop">Back to shop</a></div>';
    const price = fmtPrice(p.price);
    const save = p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    const cat = getCategory(p.category);

    const specs = p.specs.map(function (s) {
      return '<div class="spec-row"><dt>' + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd></div>";
    }).join("");

    const related = productsByCategory(p.category)
      .filter(function (x) { return x.id !== p.id; })
      .sort(function (a, b) { return b.rating - a.rating; })
      .slice(0, 4);

    return (
      '<nav class="pd-breadcrumb"><a href="#/">Home</a> › <a href="#/shop">Shop</a> › <a href="#/shop/' + p.category + '">' + esc(cat.label) + "</a> › " + esc(p.name) + "</nav>" +
      '<div class="pd">' +
        '<div class="pd-media"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" /></div>' +
        '<div>' +
          '<div class="pd-brand">' + esc(p.brand) + "</div>" +
          "<h1>" + esc(p.name) + "</h1>" +
          '<div class="pd-rating"><span class="stars">' + stars(p.rating) + "</span>" +
            '<b>' + p.ratingLabel + "</b> · " + p.reviews + " verified reviews</div>" +
          '<div class="pd-price">' +
            '<span class="now">' + price.main + "</span>" +
            (p.compareAt && p.compareAt > p.price ? '<span class="was">' + fmtPrice(p.compareAt).main + "</span>" : "") +
            (save ? '<span class="save">Save ' + save + "%</span>" : "") +
          "</div>" +
          '<div class="pd-desc">' + esc(p.description) + "</div>" +
          '<ul class="pd-highlights">' + p.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>" +
          '<div class="color-row">' + p.colors.map(function (c, i) {
            return '<span class="color-chip' + (i === 0 ? " sel" : "") + '" data-color="' + esc(c) + '">' + esc(c) + "</span>";
          }).join("") + "</div>" +
          '<div class="pd-actions">' +
            '<div class="qty"><button data-qty="down" aria-label="Decrease">−</button><span id="pdQty">1</span><button data-qty="up" aria-label="Increase">+</button></div>' +
            '<button class="btn btn-primary" id="addToCartBtn">Add to cart</button>' +
            '<button class="btn" id="buyNowBtn">Buy now</button>' +
          "</div>" +
          '<div class="pd-meta">' +
            "<span><b>✓</b> In stock &amp; ready to ship</span>" +
            "<span><b>🚚</b> Delivery in 24–72 hours nationwide</span>" +
            "<span><b>🛡️</b> 12-month warranty + 30-day returns</span>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="specs"><h2>Specifications</h2><dl class="spec-table">' + specs + "</dl></div>" +
      '<section class="section"><div class="section-head"><div><h2>You may also like</h2></div><a class="more" href="#/shop">View all →</a></div>' +
        '<div class="grid">' + related.map(cardHtml).join("") + "</div></section>"
    );
  }

  function pageCart() {
    const cart = Store.getCart();
    const price = fmtPrice(cart.subtotal);
    const delivery = Store.deliveryFee(cart.subtotal);

    if (!cart.items.length) {
      return '<div class="empty-state"><div class="big">🛒</div><h3>Your cart is empty</h3><p>Add some amazing tech and it will show up here.</p><a class="btn btn-primary mt-20" href="#/shop">Browse products</a></div>';
    }

    const rows = cart.items.map(function (i) {
      const lp = fmtPrice(i.lineTotal);
      return (
        '<div class="cart-item" data-pid="' + i.product.id + '">' +
          '<img src="' + esc(i.product.image) + '" alt="' + esc(i.product.name) + '" />' +
          '<div><h4><a href="#/product/' + i.product.id + '">' + esc(i.product.name) + "</a></h4>" +
            '<div class="sub">' + esc(i.product.brand) + " · " + fmtPrice(i.product.price).main + "</div>" +
            '<div class="qty-sm">' +
              '<button data-cdec="' + i.product.id + '" aria-label="Decrease">−</button><b>' + i.qty + "</b>" +
              '<button data-cinc="' + i.product.id + '" aria-label="Increase">+</button>' +
            "</div></div>" +
          '<div><div class="line-price">' + lp.main + "</div>" +
            '<button class="remove" data-remove="' + i.product.id + '">Remove</button></div>' +
        "</div>"
      );
    }).join("");

    return (
      '<h1 style="font-size:30px;margin-bottom:22px">Your cart</h1>' +
      '<div class="cart-layout">' +
        "<div>" + rows + "</div>" +
        '<div class="summary">' +
          "<h3>Order summary</h3>" +
          '<div class="sum-row"><span>Subtotal</span><span>' + price.main + "</span></div>" +
          '<div class="sum-row"><span>Delivery</span><span>' + (delivery ? fmtPrice(delivery).main : "Free") + "</span></div>" +
          '<div class="sum-row total"><span>Total</span><span class="price">' + fmtPrice(cart.subtotal + delivery).main + "</span></div>" +
          '<button class="btn btn-primary btn-block mt-20" id="checkoutBtn">Proceed to checkout</button>' +
          '<div class="sum-note">✓ Secure checkout · ✓ 30-day returns</div>' +
        "</div>" +
      "</div>"
    );
  }

  function pageCheckout() {
    const cart = Store.getCart();
    if (!cart.items.length) {
      return '<div class="empty-state"><div class="big">🛒</div><h3>Nothing to checkout</h3><a class="btn btn-primary mt-20" href="#/shop">Browse products</a></div>';
    }
    const user = Auth.currentUser();
    const u = user || {};
    const delivery = Store.deliveryFee(cart.subtotal);

    const miniItems = cart.items.map(function (i) {
      return '<div class="order-item"><img src="' + esc(i.product.image) + '" alt="" />' +
        '<div class="oi-name">' + esc(i.product.name) + '<div class="oi-meta">Qty ' + i.qty + "</div></div>" +
        '<div class="oi-price">' + fmtPrice(i.lineTotal).main + "</div></div>";
    }).join("");

    return (
      '<h1 style="font-size:30px;margin-bottom:22px">Checkout</h1>' +
      '<div class="guest-note">🛡️ <b>Guest checkout</b> — no account needed. Place your order and track it anytime with your order number.</div>' +
      '<form id="checkoutForm" novalidate>' +
      '<div class="checkout-grid">' +
        "<div>" +
          '<div class="form-card"><h3><span class="form-step">1</span> Contact &amp; delivery</h3>' +
            '<div class="form-row"><div class="field"><label>Full name *</label><input name="name" value="' + esc(u.name || "") + '" required /></div>' +
            '<div class="field"><label>Phone *</label><input name="phone" type="tel" placeholder="+27 00 000 0000" required /></div></div>' +
            '<div class="form-row single"><div class="field"><label>Email *</label><input name="email" type="email" value="' + esc(u.email || "") + '" required /></div></div>' +
            '<div class="form-row single"><div class="field"><label>Street address *</label><input name="address" placeholder="House / street no, street name" required /></div></div>' +
            '<div class="form-row"><div class="field"><label>City *</label><input name="city" required /></div>' +
            '<div class="field"><label>Province</label><select name="province">' +
              ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"].map(function (p) {
                return "<option>" + p + "</option>";
              }).join("") + "</select></div></div>" +
            '<div class="form-row single"><div class="field"><label>Postal code</label><input name="postal" /></div></div>' +
          "</div>" +
          '<div class="form-card"><h3><span class="form-step">2</span> Payment — PayFast</h3>' +
            '<div class="payfast-box">' +
              '<div class="pf-brand"><span class="pf-logo">PayFast</span><span class="pf-tag">Secure checkout</span></div>' +
              '<p>Pay securely with <b>PayFast</b> — credit/debit card, EFT, SnapScan, Zapper, Masterpass or mobile money. You will be redirected to PayFast\u2019s hosted checkout to complete your payment.</p>' +
              (PAYFAST_CONFIG.sandbox ? '<div class="pf-note warn">Test mode is active (sandbox gateway). No real money moves.</div>' : '<div class="pf-note">🔒 Payment details are handled by PayFast. Techgrid never sees your card.</div>') +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="summary">' +
          "<h3>Your order</h3>" +
          '<div class="order-items">' + miniItems + "</div>" +
          '<div class="order-totals">' +
            '<div class="sum-row"><span>Subtotal</span><span>' + fmtPrice(cart.subtotal).main + "</span></div>" +
            '<div class="sum-row"><span>Delivery</span><span>' + (delivery ? fmtPrice(delivery).main : "Free") + "</span></div>" +
            '<div class="sum-row total"><span>Total</span><span class="price">' + fmtPrice(cart.subtotal + delivery).main + "</span></div>" +
          "</div>" +
          '<button type="submit" class="btn btn-primary btn-block mt-20">Pay with PayFast</button>' +
          '<div class="sum-note">You\u2019ll be taken to PayFast to complete payment, then returned here with your order confirmation.</div>' +
        "</div>" +
      "</div>" +
      "</form>"
    );
  }

  function pageSuccess(orderId) {
    const order = Store.findOrder(orderId);
    const id = order ? order.id : (orderId || "").toUpperCase();
    const pay = order && order.payment;
    const badge = pay
      ? '<div class="pay-badge ' + (pay.status === "Paid" ? "ok" : pay.status === "Cancelled" ? "no" : "wait") + '">' +
          (pay.status === "Paid" ? "Payment received via PayFast ✓" :
           pay.status === "Cancelled" ? "Payment was cancelled" :
           "Payment pending — awaiting PayFast confirmation") +
        "</div>"
      : "";
    return (
      '<div class="success-wrap">' +
        '<div class="success-icon">' + ICONS.check + "</div>" +
        "<h2>Thank you! Order received</h2>" +
        "<p>Your order number is</p>" +
        '<div class="success-id">' + esc(id) + "</div>" +
        badge +
        "<p>A confirmation has been sent to your email. Track your delivery anytime.</p>" +
        '<div class="hero-actions" style="justify-content:center">' +
          '<a class="btn btn-primary" href="#/order/' + esc(id) + '">Track this order</a>' +
          '<a class="btn" href="#/shop">Continue shopping</a>' +
        "</div>" +
      "</div>"
    );
  }

  function pageTrack() {
    return (
      '<h1 style="font-size:30px;margin-bottom:8px;text-align:center">Track your order</h1>' +
      '<p class="center muted" style="margin-bottom:26px">Enter your order number (e.g. TG-ABCD234) to see live status.</p>' +
      '<div class="track-search">' +
        '<input id="trackInput" placeholder="TG-XXXXXXX" autocomplete="off" />' +
        '<button class="btn btn-primary" id="trackBtn">Track</button>' +
      "</div>" +
      '<div id="trackResult"></div>'
    );
  }

  function pageOrderDetail(id) {
    const order = Store.findOrder(id);
    if (!order) {
      return '<div class="empty-state"><div class="big">📦</div><h3>Order not found</h3><p>Double-check your order number or place a new order.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="#/track">Try another number</a><a class="btn" href="#/shop">Shop</a></div></div>';
    }
    return orderCard(order, true);
  }

  function orderCard(order, full) {
    const idx = Store.currentStage(order);
    const timeline = Store.STAGES.map(function (s, i) {
      const t = order.timeline[i];
      const cls = i < idx ? "done" : (i === idx ? "current" : "");
      const time = t && t.at <= Date.now() ? new Date(t.at).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
      return '<div class="tl-step ' + cls + '"><div class="tl-dot">' + (i < idx ? "✓" : i + 1) + "</div>" +
        '<div class="tl-label">' + esc(s.label) + '</div><div class="tl-time">' + esc(time) + "</div></div>";
    }).join("");

    const items = order.items.map(function (i) {
      return '<div class="order-item"><img src="' + esc(i.image) + '" alt="" />' +
        '<div class="oi-name">' + esc(i.name) + '<div class="oi-meta">Qty ' + i.qty + "</div></div>" +
        '<div class="oi-price">' + fmtPrice(i.price * i.qty).main + "</div></div>";
    }).join("");

    const totals = (
      '<div class="sum-row"><span>Subtotal</span><span>' + fmtPrice(order.subtotal).main + "</span></div>" +
      '<div class="sum-row"><span>Delivery</span><span>' + (order.delivery ? fmtPrice(order.delivery).main : "Free") + "</span></div>" +
      '<div class="sum-row total"><span>Total</span><span class="price">' + fmtPrice(order.total).main + "</span></div>"
    );

    const pay = order.payment || {};
    const payStatus = pay.status || "Pending";
    const payChip = '<span class="pay-chip ' + (payStatus === "Paid" ? "ok" : payStatus === "Cancelled" ? "no" : "wait") + '">' + esc(payStatus) + "</span>";
    const customer = '<div class="pd-meta"><span><b>👤</b> ' + esc(order.customer.name) + " — " + esc(order.customer.phone) + "</span>" +
      "<span><b>📍</b> " + esc([order.customer.address, order.customer.city, order.customer.province].filter(Boolean).join(", ")) + "</span>" +
      "<span><b>💳</b> PayFast · " + esc(pay.provider || "PayFast") + " " + payChip + "</span></div>";

    return (
      '<div class="order-card">' +
        '<div class="order-head"><div><div class="id">' + esc(order.id) + "</div>" +
        '<div class="date">Placed ' + new Date(order.createdAt).toLocaleString("en-ZA") + "</div></div>" +
        (full ? '<button class="btn btn-sm" data-sim="' + order.id + '">' + ICONS.refresh + " Simulate next update</button>" : "") +
        "</div>" +
        '<div class="timeline">' + timeline + "</div>" +
        "<h3 style='font-size:16px;margin:18px 0 10px'>Items</h3>" +
        '<div class="order-items">' + items + "</div>" +
        '<div class="order-totals">' + totals + "</div>" +
        (full ? customer : "") +
      "</div>"
    );
  }

  function pageAccount() {
    const user = Auth.currentUser();
    if (!user) {
      return '<div class="empty-state"><div class="big">🔐</div><h3>You are not signed in</h3>' +
        '<p>Create an account to track orders, save details and check out faster.</p>' +
        '<div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="#/auth/signup">Create account</a><a class="btn" href="#/auth/signin">Sign in</a></div></div>';
    }

    const orders = Store.ordersForUser(user.uid);
    const orderRows = orders.length ? orders.map(function (o) {
      const idx = Store.currentStage(o);
      const status = Store.STAGES[idx].label;
      return (
        '<a href="#/order/' + o.id + '" class="order-card" style="display:block">' +
          '<div class="order-head"><div><div class="id">' + esc(o.id) + "</div>" +
          '<div class="date">' + new Date(o.createdAt).toLocaleString("en-ZA") + " · " + o.items.length + " item(s)</div></div>" +
          '<div style="text-align:right"><span class="card-tag new">' + esc(status) + '</span><div class="sub" style="font-size:13px;color:var(--muted);margin-top:6px">' + fmtPrice(o.total).main + "</div></div></div>" +
        "</a>"
      );
    }).join("") : '<p class="muted">No orders yet. <a href="#/shop" style="color:var(--accent)">Start shopping →</a></p>';

    const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

    return (
      '<div class="account-head">' +
        '<div class="avatar">' + esc(initial) + "</div>" +
        "<div><h2>" + esc(user.name) + "</h2>" +
        "<p>" + esc(user.email) + " · " + (user.provider === "google" ? "Signed in with Google" : "Techgrid account") + "</p></div>" +
      "</div>" +
      '<div class="account-tabs">' +
        '<a class="account-tab active" href="#/account">My orders (' + orders.length + ")</a>" +
        '<a class="account-tab" href="#/track">Track by number</a>' +
        '<button class="account-tab" id="logoutBtn" style="border-color:var(--red);color:var(--red)">Sign out</button>' +
      "</div>" +
      '<section class="section" style="margin-top:6px"><h2 style="font-size:20px;margin-bottom:16px">Order history</h2>' + orderRows + "</section>"
    );
  }

  function pageAuth(mode) {
    const u = Auth.currentUser();
    if (u) {
      return '<div class="empty-state"><div class="big">👋</div><h3>Signed in as ' + esc(u.email) + "</h3>" +
        '<a class="btn btn-primary mt-20" href="#/account">Go to my account</a></div>';
    }
    const signin = mode !== "signup";
    const googleBox = Auth.googleReady() ? '<div id="gButton"></div>' :
      '<div class="form-err" style="display:block">Google sign-in is not configured yet. Paste your Google OAuth Client ID in <code>js/auth.js</code> (see README for steps).</div>';

    return (
      '<div class="auth-wrap">' +
        '<div class="auth-card">' +
          "<h2>" + (signin ? "Welcome back" : "Create your account") + "</h2>" +
          '<p class="sub">' + (signin ? "Sign in to track orders and check out faster" : "Join Techgrid Africa — it takes less than a minute") + "</p>" +
          '<div class="form-err" id="authErr"></div>' +
          '<div class="form-ok" id="authOk"></div>' +
          '<form id="authForm" novalidate>' +
            (signin ? "" : '<div class="field" style="margin-bottom:14px"><label>Full name</label><input name="name" autocomplete="name" /></div>') +
            '<div class="field" style="margin-bottom:14px"><label>Email address</label><input name="email" type="email" autocomplete="email" /></div>' +
            '<div class="field"><label>Password</label><input name="password" type="password" autocomplete="' + (signin ? "current-password" : "new-password") + '" /></div>' +
            '<button class="btn btn-primary btn-block mt-20" type="submit">' + (signin ? "Sign in" : "Create account") + "</button>" +
          "</form>" +
          '<div class="auth-divider">or continue with</div>' +
          googleBox +
          '<div class="auth-toggle">' +
            (signin ? 'New to Techgrid? <a href="#/auth/signup">Create an account</a>' : 'Already have an account? <a href="#/auth/signin">Sign in</a>') +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function pageAbout() {
    const topBrands = {};
    PRODUCTS.forEach(function (p) { topBrands[p.brand] = (topBrands[p.brand] || 0) + 1; });
    const brands = Object.keys(topBrands).sort(function (a, b) { return topBrands[b] - topBrands[a]; });
    const brandHtml = brands.map(function (b) {
      return '<span class="color-chip">' + esc(b) + " · " + topBrands[b] + "</span>";
    }).join("");

    return (
      '<h1 style="font-size:34px">Why Techgrid Africa?</h1>' +
      '<p class="muted" style="max-width:720px;margin-top:10px">We make premium tech accessible across Africa. Every device on our store is genuine, backed by warranty and priced honestly — from flagship foldables to dependable everyday phones.</p>' +
      '<div class="about-grid">' +
        '<div class="about-card"><div class="ic">' + ICONS.shield + "</div><h3>Genuine devices</h3><p>Every product is sourced from official distributors with full manufacturer warranty.</p></div>" +
        '<div class="about-card"><div class="ic">' + ICONS.truck + "</div><h3>Nationwide delivery</h3><p>Fast, tracked delivery to all 9 provinces in 24–72 hours.</p></div>" +
        '<div class="about-card"><div class="ic">' + ICONS.lock + "</div><h3>Secure checkout</h3><p>Encrypted checkout, flexible payment and full buyer protection.</p></div>" +
        '<div class="about-card"><div class="ic">' + ICONS.refresh + "</div><h3>Easy returns</h3><p>30-day returns and dedicated support on every order.</p></div>" +
      "</div>" +
      '<section class="section"><div class="section-head"><div><h2>Our catalogue</h2><p class="sub">' + PRODUCT_COUNT + " products · " + CATEGORIES.length + " categories</p></div></div>" +
        "<div style='display:flex;gap:8px;flex-wrap:wrap'>" + brandHtml + "</div></section>"
    );
  }

  /* ============================================================
     POST-RENDER HOOKS
     ============================================================ */
  function afterRender(r) {
    // product page
    const addBtn = $("#addToCartBtn");
    if (addBtn) {
      let qty = 1;
      const qtyEl = $("#pdQty");
      $$("[data-qty]").forEach(function (b) {
        b.addEventListener("click", function () {
          qty = Math.max(1, qty + (b.dataset.qty === "up" ? 1 : -1));
          qtyEl.textContent = qty;
        });
      });
      addBtn.addEventListener("click", function () {
        const pid = r.arg;
        Store.addToCart(pid, qty);
        toast("Added to cart");
        updateCartCount();
        pulseCart();
      });
      const buyBtn = $("#buyNowBtn");
      if (buyBtn) {
        buyBtn.addEventListener("click", function () {
          Store.addToCart(r.arg, qty);
          location.hash = "#/checkout";
        });
      }
    }

    // shop page events (delegated below too)
    const sortEl = $("#sortSelect");
    if (sortEl) sortEl.addEventListener("change", function () { state.sort = sortEl.value; render(); });
    const rangeEl = $("#priceRange");
    if (rangeEl) rangeEl.addEventListener("input", function () {
      state.maxPrice = parseInt(rangeEl.value, 10);
      const lbl = rangeEl.parentElement.querySelector("b");
      if (lbl) lbl.textContent = fmtPrice(state.maxPrice).main;
    });

    // checkout
    const form = $("#checkoutForm");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        placeOrder();
      });
    }

    // track page
    const tBtn = $("#trackBtn");
    if (tBtn) {
      const doTrack = function () {
        const val = $("#trackInput").value.trim();
        if (!val) return toast("Enter an order number", "error");
        const order = Store.findOrder(val);
        $("#trackResult").innerHTML = order ? orderCard(order, true) :
          '<div class="empty-state"><div class="big">📦</div><h3>Order not found</h3><p>Please check the number and try again.</p></div>';
      };
      tBtn.addEventListener("click", doTrack);
      $("#trackInput").addEventListener("keydown", function (e) { if (e.key === "Enter") doTrack(); });
    }

    // simulate status (delegated via [data-sim])

    // logout
    const loBtn = $("#logoutBtn");
    if (loBtn) loBtn.addEventListener("click", function () {
      Auth.logout();
      updateAccountBtn();
      toast("Signed out");
      render();
    });

    // auth page
    const authForm = $("#authForm");
    if (authForm) {
      authForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        doAuth(r.arg || "signin");
      });
    }
    if ($("#gButton")) Auth.renderGoogleButton($("#gButton"));

    // color chips
    $$(".color-chip[data-color]").forEach(function (el) {
      el.addEventListener("click", function () {
        $$(".color-chip").forEach(function (x) { x.classList.remove("sel"); });
        el.classList.add("sel");
      });
    });
  }

  /* ============================================================
     ACTIONS
     ============================================================ */
  function placeOrder() {
    const form = $("#checkoutForm");
    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      province: form.province.value,
      postal: form.postal.value.trim()
    };
    if (!data.name || !data.phone || !data.email || !data.address || !data.city) {
      toast("Please complete the required fields", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
      toast("Please enter a valid email address", "error");
      return;
    }
    const user = Auth.currentUser();
    let order;
    try {
      order = Store.createOrder({
        userId: user ? user.uid : null,
        email: data.email,
        name: data.name, phone: data.phone, address: data.address,
        city: data.city, province: data.province, postal: data.postal,
        payment: { provider: "PayFast", method: "PayFast", status: "Pending" }
      });
    } catch (e) {
      toast(e.message, "error");
      return;
    }
    Store.recordPayment(order);
    toast("Redirecting to PayFast…");
    setTimeout(function () { PayFast.submit(order); }, 500);
  }

  /* Handle PayFast return redirect: ?order=...&payment_status=... */
  function handlePayfastReturn() {
    const res = PayFast.handleReturn();
    if (!res) return;
    try { history.replaceState({}, "", window.location.pathname); } catch (e) {}

    if (res.status === "COMPLETE") {
      Store.markPaymentResult(res.orderId, "Paid", { pfId: res.pfId, amount: res.amount, at: Date.now() })
        .then(function () {
          toast("Payment successful — thank you!");
          location.hash = "#/success/" + res.orderId;
        });
    } else if (res.status === "CANCELLED" || res.result === "cancel") {
      Store.markPaymentResult(res.orderId, "Cancelled", { at: Date.now() })
        .then(function () {
          toast("Payment was cancelled.", "error");
          location.hash = "#/order/" + res.orderId;
        });
    } else {
      location.hash = "#/order/" + res.orderId;
    }
  }

  function doAuth(mode) {
    const form = $("#authForm");
    const errBox = $("#authErr");
    const okBox = $("#authOk");
    errBox.style.display = "none";
    okBox.style.display = "none";
    const email = (form.email.value || "").trim();
    const password = form.password.value || "";
    const name = form.name ? (form.name.value || "").trim() : "";

    if (!Auth.isEmailValid(email)) { showAuthErr(errBox, "Please enter a valid email address."); return; }
    if (password.length < 6) { showAuthErr(errBox, "Password must be at least 6 characters."); return; }
    if (mode === "signup" && !name) { showAuthErr(errBox, "Please enter your name."); return; }

    const p = mode === "signup"
      ? Auth.registerUser(name, email, password)
      : Auth.loginUser(email, password);

    p.then(function () {
      okBox.textContent = mode === "signup" ? "Account created — welcome to Techgrid!" : "Signed in successfully.";
      okBox.style.display = "block";
      updateAccountBtn();
      setTimeout(function () { location.hash = "#/account"; }, 700);
    }).catch(function (e) {
      showAuthErr(errBox, e.message);
    });
  }

  function showAuthErr(box, msg) {
    box.textContent = msg;
    box.style.display = "block";
  }

  function pulseCart() {
    const btn = $("#cartBtn");
    if (btn) { btn.style.transform = "scale(1.12)"; setTimeout(function () { btn.style.transform = ""; }, 180); }
  }

  /* ---------- global events ---------- */
  function bindGlobal() {
    // currency toggle
    $$(".cur-btn").forEach(function (b) {
      b.addEventListener("click", function () { setCurrency(b.dataset.cur); });
    });

    // cart button
    $("#cartBtn").addEventListener("click", function () { location.hash = "#/cart"; });
    $("#accountBtn").addEventListener("click", function () {
      location.hash = Auth.isLoggedIn() ? "#/account" : "#/auth/signin";
    });

    // search
    const syncSearch = function () {
      const q = $("#searchInput").value.trim();
      const mq = $("#mobileSearch input");
      if (mq && mq.value !== q) mq.value = q;
      state.search = q;
      if (location.hash.indexOf("shop") === -1) location.hash = "#/shop";
      else render();
    };
    let timer = null;
    $("#searchInput").addEventListener("input", function () {
      clearTimeout(timer); timer = setTimeout(syncSearch, 350);
    });
    $("#mobileSearch input").addEventListener("input", function () {
      $("#searchInput").value = this.value;
      clearTimeout(timer); timer = setTimeout(syncSearch, 350);
    });

    // delegated clicks
    document.addEventListener("click", function (e) {
      const t = e.target.closest("[data-add],[data-cat],[data-cdec],[data-cinc],[data-remove],[data-sim]");
      if (!t) return;
      e.preventDefault();

      if (t.hasAttribute("data-sim")) {
        const order = Store.advanceOrder(t.dataset.sim);
        if (order) { toast("Status updated"); render(); }
      } else if (t.hasAttribute("data-add")) {
        Store.addToCart(t.dataset.add, 1);
        toast("Added to cart");
        updateCartCount();
        pulseCart();
        const btn = t; btn.classList.add("added");
        setTimeout(function () { btn.classList.remove("added"); }, 900);
      } else if (t.hasAttribute("data-cat")) {
        state.cat = t.dataset.cat;
        state.maxPrice = 60000;
        location.hash = state.cat === "all" ? "#/shop" : "#/shop/" + state.cat;
        render();
      } else if (t.hasAttribute("data-cinc")) {
        const line = Store.getCartRaw().find(function (i) { return i.id === t.dataset.cinc; });
        if (line) { Store.setQty(line.id, line.qty + 1); render(); updateCartCount(); }
      } else if (t.hasAttribute("data-cdec")) {
        const line = Store.getCartRaw().find(function (i) { return i.id === t.dataset.cdec; });
        if (line) { Store.setQty(line.id, line.qty - 1); render(); updateCartCount(); }
      } else if (t.hasAttribute("data-remove")) {
        Store.removeFromCart(t.dataset.remove);
        toast("Removed from cart");
        render(); updateCartCount();
      }
    });

    // auth change
    window.addEventListener("authchange", function () { updateAccountBtn(); });

    // cart change
    window.addEventListener("cartchange", function () { updateCartCount(); });

    // hash routing
    window.addEventListener("hashchange", function () { render(); });
  }

  /* ---------- init ---------- */
  function init() {
    Store.init().then(function () {
      handlePayfastReturn();
      renderHeaderNav();
      renderFooter();
      updateCartCount();
      updateAccountBtn();
      $$(".cur-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.cur === currency); });
      bindGlobal();
      render();
    });
  }

  return { init: init, toast: toast, render: render };
})();

document.addEventListener("DOMContentLoaded", function () { App.init(); });