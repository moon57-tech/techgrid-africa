/* ============================================================
   Techgrid Africa — Store (cart + order tracking)
   - Cart is kept in localStorage (fast, sync).
   - Orders & payments are persisted in the local IndexedDB
     (js/db.js) and mirrored in an in-memory cache so the rest of
     the app can read them synchronously.
   Order status advances on a schedule so the tracking timeline
   progresses realistically.
   ============================================================ */
const Store = (function () {
  const LS_CART = "tg_cart";
  const LS_ORDERS = "tg_orders"; // legacy fallback key

  const STAGES = [
    { key: "placed", label: "Order Placed" },
    { key: "confirmed", label: "Payment Confirmed" },
    { key: "packed", label: "Packed & Ready" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" }
  ];

  const DELIVERY_FEE = 99;
  const FREE_DELIVERY_FROM = 5000;

  /* In-memory cache (populated from IndexedDB on init) */
  let ordersCache = [];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  /* ---------------- Local DB init ---------------- */
  let _writeChain = Promise.resolve();

  function init() {
    return DB.getAll("orders").then(function (orders) {
      ordersCache = (orders || []).slice();
      const legacy = read(LS_ORDERS, []);
      if (legacy.length && !ordersCache.length) {
        ordersCache = legacy;
        persistOrders();
      }
      return ordersCache;
    }).catch(function (e) {
      if (window.console) console.warn("[Techgrid] DB load failed, using localStorage fallback:", e);
      ordersCache = read(LS_ORDERS, []);
      return ordersCache;
    });
  }

  function persistOrders() {
    const snapshot = getOrders().slice();
    _writeChain = _writeChain
      .then(function () {
        return Promise.all(snapshot.map(function (o) { return DB.put("orders", o); }));
      })
      .catch(function (e) {
        if (window.console) console.warn("[Techgrid] DB write failed (falling back to localStorage):", e);
        write(LS_ORDERS, snapshot);
      });
    return _writeChain;
  }

  /* ---------------- Cart (localStorage) ---------------- */
  function getCartRaw() { return read(LS_CART, []); }
  function saveCart(cart) {
    write(LS_CART, cart);
    window.dispatchEvent(new CustomEvent("cartchange"));
  }

  function cartCount() {
    return getCartRaw().reduce(function (s, i) { return s + i.qty; }, 0);
  }

  function addToCart(id, qty) {
    qty = Math.max(1, Math.floor(qty || 1));
    const cart = getCartRaw();
    const line = cart.find(function (i) { return i.id === id; });
    if (line) line.qty += qty;
    else cart.push({ id: id, qty: qty });
    saveCart(cart);
    return cartCount();
  }

  function setQty(id, qty) {
    let cart = getCartRaw();
    if (qty <= 0) cart = cart.filter(function (i) { return i.id !== id; });
    else {
      const line = cart.find(function (i) { return i.id === id; });
      if (line) line.qty = qty;
    }
    saveCart(cart);
  }

  function removeFromCart(id) {
    saveCart(getCartRaw().filter(function (i) { return i.id !== id; }));
  }

  function clearCart() { saveCart([]); }

  /* Enriched cart: {items:[{product,qty,lineTotal}], subtotal, count} */
  function getCart() {
    const items = getCartRaw()
      .map(function (line) {
        const product = getProduct(line.id);
        if (!product) return null;
        return { product: product, qty: line.qty, lineTotal: product.price * line.qty };
      })
      .filter(Boolean);
    const subtotal = items.reduce(function (s, i) { return s + i.lineTotal; }, 0);
    const count = items.reduce(function (s, i) { return s + i.qty; }, 0);
    return { items: items, subtotal: subtotal, count: count };
  }

  function deliveryFee(subtotal) {
    return subtotal >= FREE_DELIVERY_FROM || subtotal === 0 ? 0 : DELIVERY_FEE;
  }

  /* ---------------- Orders (IndexedDB cache) ---------------- */
  function getOrders() { return ordersCache; }

  function genOrderId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "TG-";
    for (let i = 0; i < 7; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  }

  function currentStage(order) {
    const now = Date.now();
    let idx = 0;
    order.timeline.forEach(function (t, i) { if (t.at <= now) idx = i; });
    return idx;
  }

  function createOrder(data) {
    const cart = getCart();
    if (!cart.items.length) throw new Error("Your cart is empty.");
    const subtotal = cart.subtotal;
    const delivery = deliveryFee(subtotal);
    const now = Date.now();
    const schedule = [0, 2 * 60 * 1000, 6 * 60 * 1000, 14 * 60 * 1000, 36 * 3600 * 1000];
    const timeline = STAGES.map(function (s, i) {
      return { stage: s.key, label: s.label, at: now + schedule[i] };
    });
    const order = {
      id: genOrderId(),
      userId: data.userId || null,
      email: (data.email || "").trim().toLowerCase(),
      guest: !data.userId,
      customer: {
        name: data.name, phone: data.phone, email: data.email,
        address: data.address, city: data.city, province: data.province, postal: data.postal
      },
      items: cart.items.map(function (i) {
        return { id: i.product.id, name: i.product.name, image: i.product.image, qty: i.qty, price: i.product.price };
      }),
      subtotal: subtotal,
      delivery: delivery,
      total: subtotal + delivery,
      payment: Object.assign(
        { provider: "PayFast", method: "PayFast", status: "Pending", amount: subtotal + delivery },
        data.payment || {}
      ),
      status: "placed",
      timeline: timeline,
      createdAt: new Date().toISOString()
    };
    ordersCache.push(order);
    persistOrders();
    clearCart();
    return order;
  }

  function findOrder(id) {
    if (!id) return null;
    return getOrders().find(function (o) { return o.id.toUpperCase() === String(id).trim().toUpperCase(); }) || null;
  }

  function ordersForUser(userId) {
    if (!userId) return [];
    return getOrders().filter(function (o) { return o.userId === userId; })
      .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  }

  /* Simulate a manual status bump (for demos) */
  function advanceOrder(id) {
    const order = findOrder(id);
    if (!order) return null;
    const idx = currentStage(order);
    const next = Math.min(idx + 1, order.timeline.length - 1);
    order.timeline[next].at = Date.now();
    persistOrders();
    return order;
  }

  /* ---------------- Payments (IndexedDB) ---------------- */
  function recordPayment(order) {
    const rec = {
      id: "pay_" + order.id,
      orderId: order.id,
      provider: "PayFast",
      amount: order.total,
      currency: "ZAR",
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return DB.put("payments", rec).catch(function (e) {
      if (window.console) console.warn("[Techgrid] payment record failed:", e);
    });
  }

  function markPaymentResult(orderId, status, details) {
    const order = findOrder(orderId);
    if (!order) return Promise.resolve(null);
    order.payment = order.payment || {};
    order.payment.status = status;
    order.payment.details = details || null;
    if (status === "Paid") {
      order.payment.paidAt = (details && details.at) || Date.now();
      if (order.timeline && order.timeline[1]) order.timeline[1].at = Date.now();
    }
    const rec = {
      id: "pay_" + order.id,
      orderId: order.id,
      provider: "PayFast",
      amount: order.total,
      currency: "ZAR",
      status: status,
      details: details || null,
      updatedAt: new Date().toISOString()
    };
    return Promise.all([persistOrders(), DB.put("payments", rec).catch(function () {})]);
  }

  function paymentsForOrder(orderId) {
    return DB.get("payments", "pay_" + orderId);
  }

  return {
    STAGES, DELIVERY_FEE, FREE_DELIVERY_FROM,
    init,
    addToCart, setQty, removeFromCart, clearCart, cartCount, getCart, deliveryFee,
    createOrder, findOrder, ordersForUser, advanceOrder, currentStage, genOrderId,
    recordPayment, markPaymentResult, paymentsForOrder
  };
})();