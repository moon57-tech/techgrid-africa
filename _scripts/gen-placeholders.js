// Techgrid Africa — category placeholder SVG generator (images/ph/*.svg)
const fs = require("fs");
const path = require("path");

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
  "kids-shoes": { label: "Kids' Footwear",   accent: "#f59e0b", glyph: "S" },
  "ph":         { label: "Techgrid Africa",  accent: "#00e5ff", glyph: "T" }
};

function svgFor(cat) {
  const c = CATS[cat];
  if (!c) return null;
  const label = c.label.toUpperCase();
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
  <circle cx="200" cy="180" r="150" fill="url(#glow)"/>
  <rect x="30" y="30" width="340" height="340" rx="18" fill="none" stroke="${c.accent}" stroke-opacity="0.35" stroke-width="1.5"/>
  <circle cx="200" cy="170" r="62" fill="none" stroke="${c.accent}" stroke-opacity="0.85" stroke-width="3"/>
  <text x="200" y="200" text-anchor="middle" fill="${c.accent}" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="bold">${c.glyph}</text>
  <text x="200" y="290" text-anchor="middle" fill="#e6ecf5" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold">${label}</text>
  <text x="200" y="322" text-anchor="middle" fill="#7b8aa8" font-family="Arial, Helvetica, sans-serif" font-size="13">TECHGRID AFRICA</text>
</svg>
`;
}

const outDir = path.join(__dirname, "..", "images", "ph");
fs.mkdirSync(outDir, { recursive: true });
let n = 0;
Object.keys(CATS).forEach((cat) => {
  const svg = svgFor(cat);
  if (!svg) return;
  fs.writeFileSync(path.join(outDir, cat + ".svg"), svg);
  n++;
});
console.log("Wrote", n, "placeholder SVGs to", outDir);