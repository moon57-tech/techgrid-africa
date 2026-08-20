# Techgrid Africa — E-commerce Storefront

A complete, self-contained e-commerce website for **Techgrid Africa**: smartphones, foldables, tablets, rugged phones and budget devices with real product data, hosted product images, cart, checkout and live order tracking.

The entire app is vanilla HTML/CSS/JS — no build step, no framework, no backend. All data is in `js/*.js` files; the cart is in `localStorage` and **orders & payments are tracked in a browser-local database (IndexedDB)**.

## Features

- **94 products** across 5 categories with descriptions, highlights, specs, ratings, color variants and tags.
- **Currency toggle** — ZAR (default) / USD, prices auto-convert at a fixed rate (18.2).
- **Shop page** — category filters, price-range slider, sorting (featured / price / rating / name), live search in the header.
- **Product pages** — gallery image, price + discount, highlights, full spec table, quantity selector, add-to-cart / buy-now, related products.
- **Guest checkout** — anyone can buy without an account; orders are tracked by their `TG-XXXXXXX` number.
- **PayFast payments** — checkout redirects to PayFast's hosted "Pay Now" page (card, EFT, SnapScan, Zapper, mobile money). Payment results are recorded on return.
- **Cart & checkout** — quantity controls, delivery fee (R99, free over R5,000), order summary, contact & delivery form.
- **Order tracking** — each order gets a `TG-XXXXXXX` id and an animated timeline: *Order Placed → Payment Confirmed → Packed & Ready → Shipped → Delivered*. Status advances automatically on a schedule (demo-friendly), and a **"Simulate next update"** button bumps it instantly.
- **Local database** — orders and payment records are stored in IndexedDB (`techgrid_db` → `orders`, `payments` stores), auto-migrated from the old `localStorage` key.
- **Accounts** — optional email + password sign-up/sign-in (localStorage, password hashed) **and** Google Sign-In (once you add a Client ID — see below). Accounts are optional; guests can check out directly.
- **Responsive** dark UI, header search, account button, cart badge, toasts, empty states.

## Run it locally

The site relies on `localStorage` (accounts/cart) and must be opened over HTTP — opening `index.html` directly via `file://` will degrade some features (Google sign-in, crypto hashing).

Pick any static server. From the project folder:

**Python:**
```
python -m http.server 8080
```
then open http://localhost:8080

**VS Code:** install the *Live Server* extension → right-click `index.html` → *Open with Live Server*.

**Node:**
```
npx serve .
```

### Deploying

The site is currently deployed at:

**🔗 https://moon57-tech.github.io/techgrid-africa/**

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, Vercel. Just publish the project root (everything, including `js/`, `css/`, `images/`). The `Products/` folder (original source images) is excluded via `.gitignore`.

- **GitHub Pages:** push to a repo → Settings → Pages → deploy from `main` branch root.
- **Netlify:** drag-and-drop the folder onto https://app.netlify.com/drop

## PayFast payments

Payment processing uses **PayFast**'s hosted "Pay Now" checkout (no card data ever touches this site).

- Config lives in `js/payfast.js` (`PAYFAST_CONFIG`).
- The merchant / receiver ID is set to `30676571` (from the PayFast "Buy Now" example form). Replace it with **your own PayFast merchant ID** for real payments.
- `sandbox: false` posts to the live gateway `https://payment.payfast.io/eng/process`. Set `sandbox: true` to post to `https://sandbox.payfast.co.za/eng/process` for testing (no real money).
- On success/cancel PayFast redirects back to the site with `?order=TG-…&payment_status=…`; `js/payfast.js` (`PayFast.handleReturn`) parses this and `Store.markPaymentResult` records it in the local database.
- PayFast's server-to-server ITN (instant notification) needs a server endpoint, which a static site can't receive — so confirmation uses the return redirect. For a full production integration add a small backend to handle the ITN and verify the signature (see `passphrase` in `PAYFAST_CONFIG`).

## Local database

Orders and payments are stored in **IndexedDB** (`js/db.js`) in the `orders` and `payments` object stores. The cart and accounts stay in `localStorage` for speed. On first load, orders from the old `tg_orders` `localStorage` key are auto-migrated into IndexedDB.

## Enable Google sign-in

1. Go to https://console.cloud.google.com → create a project (or pick one).
2. **APIs & Services → OAuth consent screen** → set it up (External, app name "Techgrid Africa", your email).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → choose **Web application**.
4. In *Authorized JavaScript origins* add your site origin, e.g. `http://localhost:8080` and your production domain.
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).
6. Open `js/auth.js` and paste it into `TG_CONFIG.GOOGLE_CLIENT_ID`:

```js
const TG_CONFIG = {
  GOOGLE_CLIENT_ID: "YOUR_CLIENT_ID.apps.googleusercontent.com"
};
```

Reload and the Google button appears on the sign-in page. (The Google script is already loaded in `index.html`.)

## Project structure

```
index.html                  Site shell (header, nav, footer, modal, toasts, script tags)
css/style.css               Full design system (dark theme)
js/
  imgurls.js                IMGURLS — product id → hosted image URL (catbox.moe)
  categories.js             CATEGORIES — the 5 categories
  products-apple.js         Apple catalog (17)
  products-samsung.js       Samsung catalog (23)
  products-google-motorola.js  Google + Motorola catalog (21)
  products-other.js         Everything else (33)
  products.js               Loader — combines arrays, attaches image/priceUsd, helpers
  auth.js                   Email + Google auth, TG_CONFIG
  db.js                     IndexedDB wrapper (orders, payments stores)
  store.js                  Cart + order tracking + payment records (IndexedDB-backed)
  payfast.js                PayFast config + "Pay Now" form + return handling
  app.js                    Router, pages, currency, search, interactions
images/                     94 local product images (fallback if CDN unreachable)
_scripts/                   Dev tools (image mapping/upload PowerShell scripts)
```

## Adding or editing products

Each product is an object in the catalog files:

```js
{
  id: "apple-iphone-15-black",            // unique slug — must match IMGURLS key + image filename
  name: "Apple iPhone 15",
  brand: "Apple",
  category: "smartphones",                // one of CATEGORIES ids
  price: 17999, compareAt: 19999,         // ZAR; compareAt optional (for "was" price + Save %)
  rating: 4.8, reviews: 214,
  colors: ["Black", "Blue", "Pink"],
  tag: "Bestseller",                      // optional badge
  description: "…",
  highlights: ["…", "…"],
  specs: [["Display", "6.1\" OLED"], ["Chip", "A16 Bionic"]]
}
```

- `products.js` auto-adds `image` (from `IMGURLS`, falling back to `images/<id>.png`) and `priceUsd`.
- The USD rate (18.2) is defined in `js/products.js` (for `priceUsd`) and `js/app.js` (`USD_RATE`). Change both to update the rate.

## Product images

- All 94 images were uploaded to **catbox.moe** (free anonymous hosting) and mapped in `js/imgurls.js`.
- Local copies live in `images/<id>.png` as a fallback and for reference.
- The `_scripts/` PowerShell scripts document the mapping/upload workflow (`image-map.csv` maps source → slug; note: `image-urls.csv` has no header row).

## Notes & disclaimer

- **Demo storefront** — prices are indicative. Payments go through PayFast's hosted checkout; the merchant ID in `js/payfast.js` is the PayFast sample ID, so set `sandbox: true` (test mode) or replace it with your own merchant ID before taking real payments.
- Orders are stored **in the browser only** (IndexedDB `orders`/`payments`, plus `tg_users` in localStorage). Clearing browser data wipes them.
- Order statuses advance automatically relative to creation time (placed now → confirmed +2min → packed +6min → shipped +14min → delivered +36h) so the tracking timeline looks realistic in demos. Use *Simulate next update* to fast-forward.