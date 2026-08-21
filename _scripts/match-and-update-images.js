const fs = require("fs");
const path = require("path");

function slug(s) {
  return s.toLowerCase().replace(/&/g, " and ").replace(/[®™]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}

function normalizeName(name) {
  return name.toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ROOT = path.join(__dirname, "..");
const CATALOG_FILES = [
  { file: "products-apple.js", varName: "PRODUCTS_APPLE" },
  { file: "products-samsung.js", varName: "PRODUCTS_SAMSUNG" },
  { file: "products-google-motorola.js", varName: "PRODUCTS_GOOGLE_MOTOROLA" },
  { file: "products-other.js", varName: "PRODUCTS_OTHER" },
  { file: "products-electronics.js", varName: "PRODUCTS_ELECTRONICS_APPLIANCES" },
  { file: "products-home.js", varName: "PRODUCTS_HOME_FURNITURE" },
  { file: "products-womens.js", varName: "PRODUCTS_WOMENS_CLOTHING" },
  { file: "products-womens-shoes.js", varName: "PRODUCTS_WOMENS_FOOTWEAR" },
  { file: "products-mens.js", varName: "PRODUCTS_MENS_CLOTHING" },
  { file: "products-mens-shoes.js", varName: "PRODUCTS_MENS_FOOTWEAR" },
  { file: "products-kids.js", varName: "PRODUCTS_KIDS_CLOTHING" },
  { file: "products-kids-shoes.js", varName: "PRODUCTS_KIDS_FOOTWEAR" }
];

// Load scraped images from Shopify JSON
function loadScrapedFromJson(file) {
  const content = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const json = JSON.parse(content);
  const map = new Map();
  json.products.forEach(p => {
    const name = p.title;
    const handle = p.handle;
    const img = p.images && p.images.length > 0 ? p.images[0].src : null;
    if (img) {
      map.set(normalizeName(name), img);
      map.set(normalizeName(handle), img);
    }
  });
  return map;
}

const techmarkitImages = loadScrapedFromJson(path.join(__dirname, "techmarkit-products.json"));
const revibeImages = loadScrapedFromJson(path.join(__dirname, "revibe-products.json"));

console.log("Techmarkit images:", techmarkitImages.size);
console.log("Revibe images:", revibeImages.size);

// Combine all scraped images
const allScraped = new Map([...techmarkitImages, ...revibeImages]);

// Load all catalog products using vm - concatenate all files like the harness
const vm = require("vm");
let allProducts = [];

const allSrc = CATALOG_FILES.map(entry => {
  const filepath = path.join(ROOT, "js", entry.file);
  if (!fs.existsSync(filepath)) return "";
  return fs.readFileSync(filepath, "utf8").replace(/^const /m, "var ");
}).join("\n");

const sandbox = { Array, String, Object, Math };
vm.createContext(sandbox);
vm.runInContext(allSrc, sandbox);

CATALOG_FILES.forEach(entry => {
  const arr = sandbox[entry.varName];
  if (arr) {
    arr.forEach(p => { p.__sourceFile = entry.file; allProducts.push(p); });
  }
});

console.log("Total catalog products:", allProducts.length);

// Match products to scraped images
let matched = 0;
let unmatched = [];

allProducts.forEach(p => {
  const norm = normalizeName(p.name);
  const brandNorm = normalizeName(p.brand + " " + p.name);
  
  if (allScraped.has(norm)) {
    p.image = allScraped.get(norm);
    p.__matched = true;
    matched++;
  } else if (allScraped.has(brandNorm)) {
    p.image = allScraped.get(brandNorm);
    p.__matched = true;
    matched++;
  } else {
    // Try partial match
    const words = norm.split(" ").filter(w => w.length > 3);
    for (const [scrapedName, img] of allScraped) {
      const scrapedWords = scrapedName.split(" ").filter(w => w.length > 3);
      const common = words.filter(w => scrapedWords.includes(w)).length;
      if (common >= 2 || (words.length <= 3 && common >= 1)) {
        p.image = img;
        p.__matched = true;
        matched++;
        return;
      }
    }
    unmatched.push(p);
  }
});

console.log("Matched:", matched);
console.log("Unmatched:", unmatched.length);

// Keep only products with real images (matched + original 94 with catbox images)
const productsWithRealImages = allProducts.filter(p => {
  if (p.__matched) return true;
  // Check if it has a catbox image (original 94)
  if (p.image && p.image.startsWith("https://")) return true;
  return false;
});

console.log("Products with real images:", productsWithRealImages.length);

// Group by source file and regenerate
const byFile = {};
productsWithRealImages.forEach(p => {
  const f = p.__sourceFile || "products-other.js";
  if (!byFile[f]) byFile[f] = [];
  byFile[f].push(p);
});

// Regenerate each catalog file
Object.keys(byFile).forEach(file => {
  const products = byFile[file];
  const entry = CATALOG_FILES.find(e => e.file === file);
  const varName = entry ? entry.varName : "PRODUCTS_" + file.replace("products-", "").replace(".js", "").toUpperCase().replace(/[^A-Z]+/g, "_");
  
  let output = "// Techgrid Africa — " + file.replace(".js", "").replace(/-/g, " ") + " (prices in ZAR)\n";
  output += "const " + varName + " = [\n";
  
  function esc(s) { return String(s).replace(/"/g, '\\"'); }

products.forEach((p, i) => {
    output += "  {\n";
    output += '    id: "' + esc(p.id) + '",\n';
    output += '    name: "' + esc(p.name) + '",\n';
    output += '    brand: "' + esc(p.brand) + '",\n';
    output += '    category: "' + esc(p.category) + '",\n';
    output += "    price: " + p.price + (p.compareAt ? ", compareAt: " + p.compareAt : "") + ", rating: " + p.rating + ", reviews: " + p.reviews + ",\n";
    output += '    colors: ["' + p.colors.map(esc).join('", "') + '"],\n';
    if (p.tag) output += '    tag: "' + esc(p.tag) + '",\n';
    output += '    description: "' + esc(p.description) + '",\n';
    output += '    highlights: ["' + p.highlights.map(esc).join('", "') + '"],\n';
    output += '    specs: [[' + p.specs.map(s => '["' + esc(s[0]) + '", "' + esc(s[1]) + '"]').join(", ") + "]],\n";
    output += '    image: "' + esc(p.image) + '"\n';
    output += "  }" + (i < products.length - 1 ? "," : "") + "\n";
  });
  
  output += "];\n";
  
  fs.writeFileSync(path.join(ROOT, "js", file), output);
  console.log("Updated " + file + ": " + products.length + " products");
});

// Also update categories.js to only include categories that have products
const cats = {};
productsWithRealImages.forEach(p => {
  if (!cats[p.category]) cats[p.category] = 0;
  cats[p.category]++;
});

console.log("\nCategories with products:");
Object.keys(cats).sort().forEach(c => console.log("  " + c + ": " + cats[c]));

// Update categories.js
const labels = {
  "smartphones": "Smartphones", "tablets": "Tablets", "budget": "Budget Phones",
  "foldables": "Foldables", "rugged": "Rugged Phones",
  "tvs": "TVs", "appliances": "Appliances", "laptops": "Laptops",
  "audio": "Audio", "gaming": "Gaming", "power": "Power & Backup",
  "accessories": "Accessories", "home": "Furniture & Home",
  "womens": "Women's Clothing", "womens-shoes": "Women's Footwear",
  "mens": "Men's Clothing", "mens-shoes": "Men's Footwear",
  "kids": "Kids' Clothing", "kids-shoes": "Kids' Footwear"
};

const catEntries = Object.keys(cats).sort().map(c => 
  '  { id: "' + c + '", label: "' + (labels[c] || c) + '" }'
).join(",\n");

const categoriesContent = "// Techgrid Africa — product categories\nconst CATEGORIES = [\n" + catEntries + "\n];\n";
fs.writeFileSync(path.join(ROOT, "js", "categories.js"), categoriesContent);
console.log("Updated categories.js");