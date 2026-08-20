/* ============================================================
   Techgrid Africa — PayFast payment integration
   Submits a "Pay Now" form to PayFast's hosted checkout, then
   handles the return redirect (payment_status) on the way back.
   ============================================================ */
const PAYFAST_CONFIG = {
  merchantId: "30676571",      // PayFast merchant / receiver ID (from your form)
  sandbox: false,              // true = https://sandbox.payfast.co.za/eng/process (test)
                               // false = https://payment.payfast.io/eng/process (live)
  passphrase: "",              // optional signature passphrase for a real merchant account
  returnPath: ""               // optional override for the return/cancel URL path
};

const PayFast = (function () {

  function processUrl() {
    return PAYFAST_CONFIG.sandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://payment.payfast.io/eng/process";
  }

  function baseUrl() {
    return window.location.origin + (PAYFAST_CONFIG.returnPath || window.location.pathname);
  }

  function returnUrl(orderId) {
    return baseUrl() + "?order=" + encodeURIComponent(orderId);
  }
  function cancelUrl(orderId) {
    return baseUrl() + "?order=" + encodeURIComponent(orderId) + "&result=cancel";
  }

  /* Build and submit the PayFast "Pay Now" form for an order. */
  function submit(order) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = processUrl();
    form.name = "PayFastPayNowForm";
    form.setAttribute("accept-charset", "utf-8");

    const plan = !!(order.payment && order.payment.plan === "installments");
    const charge = plan ? order.payment.installmentAmount : order.total;

    const fields = {
      cmd: "_paynow",
      receiver: PAYFAST_CONFIG.merchantId,
      amount: Number(charge).toFixed(2),
      item_name: "Techgrid Africa Order " + order.id + (plan ? " (Segment 1 of 3)" : ""),
      item_description: (plan ? "3-segment payment plan — segment 1 of 3. " : "") +
        order.items.slice(0, 5).map(function (i) {
          return i.name + " x" + i.qty;
        }).join(", ") + " — Techgrid Africa",
      return_url: returnUrl(order.id),
      cancel_url: cancelUrl(order.id),
      custom_str1: order.id,
      custom_str2: plan ? "installments" : ""
    };

    Object.keys(fields).forEach(function (k) {
      const inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = k;
      inp.value = fields[k];
      form.appendChild(inp);
    });

    document.body.appendChild(form);
    form.submit();
  }

  /* Parse PayFast's return redirect (?order=...&payment_status=...). */
  function handleReturn() {
    const qs = new URLSearchParams(window.location.search);
    const orderId = qs.get("order");
    if (!orderId) return null;
    return {
      orderId: orderId,
      status: (qs.get("payment_status") || "").toUpperCase(),
      pfId: qs.get("pf_payment_id") || null,
      amount: qs.get("amount") || null,
      result: qs.get("result")
    };
  }

  return {
    config: PAYFAST_CONFIG,
    processUrl: processUrl,
    submit: submit,
    handleReturn: handleReturn
  };
})();