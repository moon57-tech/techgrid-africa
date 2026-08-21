// Techgrid Africa — product catalog generator with real images and proper escaping.
// Generates js/products-*.js files with only products that have real images.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Category accent/glyph mapping (same as gen-placeholders)
const CATS = {
  "tvs":        { label: "Televisions",      accent: "#3b82f6", glyph: "TV" },
  "appliances": { label: "Home Appliances",  accent: "#22c55e", glyph: "W" },
  "laptops":    { label: "Laptops & PCs",    accent: "#8b5cf6", glyph: "L" },
  "audio":      { label: "Audio & Sound",    accent: "#f59e0b", glyph: "A" },
  "gaming":     { label: "Gaming",           accent: "#ef4444", glyph: "G" },
  "power":      { label: "Power & Backup",   accent: "#eab308", glyph: "P" },
  "accessories":{ label: "Accessories",      accent: "#06b6d4", glyph: "X" },
  "home":       { label: "Furniture & Home", accent: "#a78bfa", glyph: "H" },
  "womens":     { label: "Women's Clothing", accent: "#ec4899", glyph: "W" },
  "womens-shoes":{ label: "Women's Footwear",accent: "#f472b6", glyph: "S" },
  "mens":       { label: "Men's Clothing",   accent: "#60a5fa", glyph: "M" },
  "mens-shoes": { label: "Men's Footwear",   accent: "#38bdf8", glyph: "S" },
  "kids":       { label: "Kids' Clothing",   accent: "#fbbf24", glyph: "K" },
  "kids-shoes": { label: "Kids' Footwear",   accent: "#f59e0b", glyph: "S" }
};

function xmlEscape(s) {
  return String(s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">")
    .replace(/"/g, "\"").replace(/'/g, "'");
}

function wrapText(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = "";
  words.forEach(function (w) {
    if ((cur + " " + w).trim().length <= width) {
      cur = (cur + " " + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  });
  if (cur) lines.push(cur);
  return lines.slice(0, 5);
}

// Load scraped images from techmarkit (products.json)
function loadTechmarkitImages() {
  try {
    const techPath = path.join(__dirname, "..", ".local", "share", "opencode", "tool-output", "tool_023afa6bf001Ckj8mz5ZFI8ccZ");
    const content = fs.readFileSync(techPath, "utf8").replace(/^\uFEFF/, "");
    const json = JSON.parse(content);
    const map = new Map();
    json.products.forEach(p => {
      const img = p.images && p.images.length > 0 ? p.images[0].src : null;
      if (img) {
        map.set(xmlEscape(p.title).toLowerCase(), img);
        map.set(xmlEscape(p.handle).toLowerCase(), img);
      }
    });
    return map;
  } catch {
    return new Map();
  }
}

// Load scraped images from revibe (products.json)
function loadRevibeImages() {
  try {
    const revPath = path.join(__dirname, "revibe-products.json");
    const content = fs.readFileSync(revPath, "utf8").replace(/^\uFEFF/, "");
    const json = JSON.parse(content);
    const map = new Map();
    json.products.forEach(p => {
      const img = p.images && p.images.length > 0 ? p.images[0].src : null;
      if (img) {
        map.set(xmlEscape(p.title).toLowerCase(), img);
        map.set(xmlEscape(p.handle).toLowerCase(), img);
      }
    });
    return map;
  } catch {
    return new Map();
  }
}

// Escape for JavaScript string literals
function jsEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n");
}

// Generate a single product entry with proper escaping and real image
function generateProduct(p, scrapedImg) {
  const name = xmlEscape(p.name);
  const brand = xmlEscape(p.brand || "Techgrid Africa");
  const category = xmlEscape(p.category || "accessories");
  const price = p.price || 0;
  const compareAt = p.compareAt !== undefined ? p.compareAt : null;
  const rating = typeof p.rating === "number" ? Math.round(p.rating * 10) / 10 : 3.8;
  const reviews = typeof p.reviews === "number" ? Math.max(0, p.reviews) : 30;
  const colors = p.colors || ["Black"];
  const tag = p.tag || null;
  
  // Properly escape description
  const description = xmlEscape(p.description || "");
  
  // Properly escape highlights
  const highlights = (p.highlights || []).map(h => xmlEscape(h)).join(", ");
  
  // Properly escape specs
  const specs = (p.specs || []).map(function (s) {
    return ["" + xmlEscape(s[0]), "" + xmlEscape(s[1])];
  });
  
  // Wrap product name for multi-line display if too long
  const normName = xmlEscape(name).toLowerCase();
  const nameLines = wrapText(name, 22);
  
  // Determine image: use scraped image if available, otherwise placeholder SVG
  let image = scrapedImg || "images/ph/" + p.id + ".svg";
  
  // Build the product object lines
  const lines = [];
  lines.push("  {");
  lines.push('    id: "' + jsEscape(p.id) + '",');
  lines.push('    name: "' + jsEscape(name) + '",');
  lines.push('    brand: "' + jsEscape(brand) + '",');
  lines.push('    category: "' + jsEscape(category) + '",');
  lines.push("    price: " + price + (compareAt !== null ? ", compareAt: " + compareAt : "") + ", rating: " + rating + ", reviews: " + reviews + ",");
  lines.push('    colors: ["' + colors.map(c => jsEscape(c)).join('", "') + '"],');
  if (tag) lines.push('    tag: "' + jsEscape(tag) + '",');
  lines.push('    description: "' + jsEscape(description) + '",');
  lines.push('    highlights: ["' + highlights + '"],');
  // specs as [["key", "value"], ...]
  const specsStr = specs.map(function (s) {
    return '["' + jsEscape(s[0]) + '", "' + jsEscape(s[1]) + '"]';
  }).join(", ");
  lines.push('    specs: [[' + specsStr + "]],");
  lines.push('    image: "' + jsEscape(image) + '"');
  lines.push("  }");
  
  return lines.join("\n");
}

// Main generation function
function generateCatalog(catalogName, productsArray, scrapedMap, categoryKey) {
  // Match products to scraped images
  const matchedProducts = [];
  
  productsArray.forEach(function (p) {
    const normName = xmlEscape(p.name).toLowerCase();
    let img = null;
    
    // Try exact name match first
    if (scrapedMap.has(normName)) {
      img = scrapedMap.get(normName);
    } else {
      // Try partial match: check if any scraped name contains key product words
      const words = normName.split(" ").filter(w => w.length > 3);
      for (const [scrapedName, imgUrl] of scrapedMap) {
        const scrapedWords = scrapedName.split(" ").filter(w => w.length > 3);
        const common = words.filter(w => scrapedWords.includes(w)).length;
        if (common >= 2 || (words.length <= 3 && common >= 1)) {
          img = imgUrl;
          break;
        }
      }
    }
    
    // Only include products with a real image
    if (img) {
      p.image = img;
      matchedProducts.push(p);
    }
  });
  
  // Generate the JS file content
  const constName = "PRODUCTS_" + catalogName.toUpperCase().replace(/[^A-Z]+/g, "_");
  
  let output = "// Techgrid Africa — " + catalogName + " catalog (prices in ZAR)\n";
  output += "const " + constName + " = [\n";
  
  matchedProducts.forEach(function (p, i) {
    const productLines = generateProduct(p, p.image);
    output += productLines;
    output += (i < matchedProducts.length - 1 ? "," : "") + "\n";
  });
  
  output += "];\n";
  output += "\n";
  output += "console.log(\"" + catalogName + " catalog generated: " + matchedProducts.length + " products with real images\")\n";
  
  return { output, count: matchedProducts.length };
}

// -------- Main execution --------

console.log("Loading scraped images...");
const techmarkitImages = loadTechmarkitImages();
const revibeImages = loadRevibeImages();
const allScraped = new Map([...techmarkitImages, ...revibeImages]);
console.log("Techmarkit images:", techmarkitImages.size);
console.log("Revibe images:", revibeImages.size);
console.log("Total scraped images:", allScraped.size);

// Define all catalog files with their source arrays
// The original 4 product files (apple, samsung, google-motorola, other) - these have real catbox images
// The generated files need to be regenerated with real images or they get removed

// For the original 4 files, they keep their catbox images which are real https:// URLs
// For the generated files, we only keep products with real scraped images

// Generate electronics + home catalog
// First, load the existing generated products
const CATALOG_SPECS = [
  { name: "electronics", file: "products-electronics.js", varBase: "PRODUCTS_ELECTRONICS_APPLIANCES" },
  { name: "home", file: "products-home.js", varBase: "PRODUCTS_HOME_FURNITURE" },
  { name: "womens", file: "products-womens.js", varBase: "PRODUCTS_WOMENS_CLOTHING" },
  { name: "womens-shoes", file: "products-womens-shoes.js", varBase: "PRODUCTS_WOMENS_FOOTWEAR" },
  { name: "mens", file: "products-mens.js", varBase: "PRODUCTS_MENS_CLOTHING" },
  { name: "mens-shoes", file: "products-mens-shoes.js", varBase: "PRODUCTS_MENS_FOOTWEAR" },
  { name: "kids", file: "products-kids.js", varBase: "PRODUCTS_KIDS_CLOTHING" },
  { name: "kids-shoes", file: "products-kids-shoes.js", varBase: "PRODUCTS_KIDS_FOOTWEAR" }
];

// For each catalog, load existing products, match images, regenerate
CATALOG_SPECS.forEach(function (catSpec) {
  const filepath = path.join(ROOT, "js", catSpec.file);
  if (!fs.existsSync(filepath)) {
    console.log("File not found: " + catSpec.file);
    return;
  }
  
  // Read and parse the existing products
  const src = fs.readFileSync(filepath, "utf8");
  // Extract products using eval in a sandbox
  const vm = require("vm");
  const sandbox = { Array, String, Object, Math };
  vm.createContext(sandbox);
  // Wrap the source to make const declarations accessible
  const wrappedSrc = "var " + catSpec.varBase + " = [" + src.match(/^const PRODUCTS_[A-Za-z_]+ = \[[\s\S]*?\]\};?/m)?.[0].replace(/^const /m, "var ") || ""; || "";
  try {
    vm.runInContext(wrappedSrc, sandbox);
    const existingProducts = sandbox[catSpec.varBase] || [];
    
    // Match images and filter
    const result = generateCatalog(catSpec.name, existingProducts, allScraped, catSpec.name);
    
    // Write the new file
    fs.writeFileSync(filepath, result.output);
    console.log("Regenerated " + catSpec.file + ": " + result.count + " products with real images");
  } catch (e) {
    console.log("Error regenerating " + catSpec.file + ": " + e.message);
  }
});

// Also handle the original 4 product files - they keep their catbox images (real https URLs)
// These files are: products-apple.js, products-samsung.js, products-google-motorola.js, products-other.js
// They already have real images, so just verify and output info

console.log("\nGeneration complete.");