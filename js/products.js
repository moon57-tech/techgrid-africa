// Techgrid Africa — combined product catalog
const PRODUCTS = PRODUCTS_APPLE
  .concat(PRODUCTS_SAMSUNG)
  .concat(PRODUCTS_GOOGLE_MOTOROLA)
  .concat(PRODUCTS_OTHER)
  .concat(PRODUCTS_ELECTRONICS_APPLIANCES)
  .concat(PRODUCTS_HOME_FURNITURE)
  .concat(PRODUCTS_WOMENS_CLOTHING)
  .concat(PRODUCTS_WOMENS_FOOTWEAR)
  .concat(PRODUCTS_MENS_CLOTHING)
  .concat(PRODUCTS_MENS_FOOTWEAR)
  .concat(PRODUCTS_KIDS_CLOTHING)
  .concat(PRODUCTS_KIDS_FOOTWEAR);

// Add resolved image URL + helpers
PRODUCTS.forEach(function (p) {
  p.image = p.image || IMGURLS[p.id] || ("images/" + p.id + ".png");
  p.priceUsd = Math.round(p.price / 18.2);
  p.ratingLabel = p.rating.toFixed(1);
});

const PRODUCT_COUNT = PRODUCTS.length;

function getProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

function getCategory(id) {
  return CATEGORIES.find(function (c) { return c.id === id; });
}

function productsByCategory(catId) {
  return PRODUCTS.filter(function (p) { return p.category === catId; });
}

// sanity guard for dev
if (typeof console !== "undefined") {
  console.log("[Techgrid] Catalog loaded:", PRODUCT_COUNT, "products");
}