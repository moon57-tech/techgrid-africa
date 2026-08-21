const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILES = [
  "products-apple.js", "products-samsung.js", "products-google-motorola.js", "products-other.js",
  "products-electronics.js", "products-home.js",
  "products-womens.js", "products-womens-shoes.js",
  "products-mens.js", "products-mens-shoes.js",
  "products-kids.js", "products-kids-shoes.js"
];

function esc(s) { return String(s).replace(/"/g, '\\"'); }

FILES.forEach(file => {
  const filepath = path.join(ROOT, "js", file);
  if (!fs.existsSync(filepath)) return;
  let src = fs.readFileSync(filepath, "utf8");
  
  // Fix string fields: find patterns like `field: "value with "unescaped" quotes"` and escape them
  // This regex finds `key: "value"` patterns and escapes quotes inside the value
  src = src.replace(/(\s+\w+:\s*)"([^"]*(?:"[^"]*)*)"/g, (match, prefix, value) => {
    // Don't process if already escaped or if it's a simple value without internal quotes
    if (!value.includes('"') || value.includes('\\"')) return match;
    return prefix + '"' + value.replace(/"/g, '\\"') + '"';
  });
  
  // Also fix highlights array: ["item 1", "item 2"]
  src = src.replace(/highlights:\s*\[([^\]]+)\]/g, (match, content) => {
    const items = content.split(',').map(item => item.trim());
    const fixed = items.map(item => {
      if (item.startsWith('"') && item.endsWith('"')) {
        const inner = item.slice(1, -1);
        if (inner.includes('"') && !inner.includes('\\"')) {
          return '"' + inner.replace(/"/g, '\\"') + '"';
        }
      }
      return item;
    });
    return 'highlights: [' + fixed.join(", ") + ']';
  });
  
  // Fix specs array: [["key", "value"], ...]
  src = src.replace(/specs:\s*\[\[([\s\S]*?)\]\]/g, (match, content) => {
    return 'specs: [[' + content.replace(/"([^"]*(?:"[^"]*)*)"/g, (m, v) => {
      if (v.includes('"') && !v.includes('\\"')) return '"' + v.replace(/"/g, '\\"') + '"';
      return m;
    }) + ']]';
  });
  
  fs.writeFileSync(filepath, src);
  console.log("Fixed: " + file);
});

console.log("Done fixing all catalog files");