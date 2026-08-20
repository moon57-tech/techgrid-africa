// Techgrid Africa — per-product SVG image generator.
// Reads the generated catalog files and writes one branded SVG per product
// whose image points at a local placeholder (images/ph/<id>.svg).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILES = [
  ["products-electronics.js", "PRODUCTS_ELECTRONICS_APPLIANCES"],
  ["products-home.js", "PRODUCTS_HOME_FURNITURE"],
  ["products-womens.js", "PRODUCTS_WOMENS_CLOTHING"],
  ["products-womens-shoes.js", "PRODUCTS_WOMENS_FOOTWEAR"],
  ["products-mens.js", "PRODUCTS_MENS_CLOTHING"],
  ["products-mens-shoes.js", "PRODUCTS_MENS_FOOTWEAR"],
  ["products-kids.js", "PRODUCTS_KIDS_CLOTHING"],
  ["products-kids-shoes.js", "PRODUCTS_KIDS_FOOTWEAR"]
];

const CATS = {
  "tvs":         { label: "Televisions",       accent: "#3b82f6", glyph: "TV" },
  "appliances":  { label: "Home Appliances",   accent: "#22c55e", glyph: "W" },
  "laptops":     { label: "Laptops & PCs",     accent: "#8b5cf6", glyph: "L" },
  "audio":       { label: "Audio & Sound",     accent: "#f59e0b", glyph: "A" },
  "gaming":      { label: "Gaming",            accent: "#ef4444", glyph: "G" },
  "power":       { label: "Power & Backup",    accent: "#eab308", glyph: "P" },
  "accessories": { label: "Accessories",       accent: "#06b6d4", glyph: "X" },
  "home":        { label: "Furniture & Home",  accent: "#a78bfa", glyph: "H" },
  "womens":      { label: "Women's Clothing",  accent: "#ec4899", glyph: "W" },
  "womens-shoes":{ label: "Women's Footwear",  accent: "#f472b6", glyph: "S" },
  "mens":        { label: "Men's Clothing",    accent: "#60a5fa", glyph: "M" },
  "mens-shoes":  { label: "Men's Footwear",    accent: "#38bdf8", glyph: "S" },
  "kids":        { label: "Kids' Clothing",    accent: "#fbbf24", glyph: "K" },
  "kids-shoes":  { label: "Kids' Footwear",    accent: "#f59e0b", glyph: "S" }
};

function xml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function wrapWords(text, width) {
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

function svgFor(p) {
  const c = CATS[p.category] || CATS["accessories"];
  const name = xml(p.name);
  const brand = xml(p.brand || "Techgrid Africa");
  const lines = wrapWords(p.name, 22);
  const font = lines.some(function (l) { return l.length > 16; }) ? 24 : 27;
  const lh = font + 9;
  const startY = 200 - ((lines.length - 1) * lh) / 2;
  const text = lines.map(function (l, i) {
    return `<text x="200" y="${startY + i * lh}" text-anchor="middle" fill="#e6ecf5" font-family="Arial, Helvetica, sans-serif" font-size="${font}" font-weight="bold">${xml(l)}</text>`;
  }).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e17"/>
      <stop offset="1" stop-color="#141b2d"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c.accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${c.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="200" cy="175" r="150" fill="url(#glow)"/>
  <rect x="30" y="30" width="340" height="340" rx="18" fill="none" stroke="${c.accent}" stroke-opacity="0.35" stroke-width="1.5"/>
  <circle cx="200" cy="112" r="40" fill="#0d1322" stroke="${c.accent}" stroke-opacity="0.9" stroke-width="2.5"/>
  <text x="200" y="126" text-anchor="middle" fill="${c.accent}" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="bold">${c.glyph}</text>
  ${text}
  <text x="200" y="352" text-anchor="middle" fill="${c.accent}" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold">${brand}</text>
  <text x="200" y="374" text-anchor="middle" fill="#7b8aa8" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="2">TECHGRID AFRICA</text>
</svg>
`;
}

const all = [];
FILES.forEach(function (entry) {
  const src = fs.readFileSync(path.join(ROOT, "js", entry[0]), "utf8");
  const js = src.replace(/^const /m, "var ");
  eval(js);
  const arr = eval(entry[1]);
  all.push({ name: entry[0], arr: arr });
});

const outDir = path.join(ROOT, "images", "ph");
fs.mkdirSync(outDir, { recursive: true });
let n = 0;
all.forEach(function (f) {
  f.arr.forEach(function (p) {
    if (!String(p.image || "").startsWith("images/ph/")) return;
    fs.writeFileSync(path.join(outDir, p.id + ".svg"), svgFor(p));
    n++;
  });
});
console.log("Wrote", n, "per-product SVGs to", outDir);