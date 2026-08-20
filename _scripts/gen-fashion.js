// Techgrid Africa — fashion catalog generator (Ackermans / Bash-style value fashion).
// Emits js/products-womens.js, js/products-womens-shoes.js, js/products-mens.js,
// js/products-mens-shoes.js, js/products-kids.js, js/products-kids-shoes.js.
const fs = require("fs");
const path = require("path");

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function slug(s) {
  return s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
function rating(n) { return 3.9 + (n % 11) / 10; }
function reviews(n) { return 15 + (n % 420); }

const W = "images/ph/womens.svg";
const WS = "images/ph/womens-shoes.svg";
const M = "images/ph/mens.svg";
const MS = "images/ph/mens-shoes.svg";
const K = "images/ph/kids.svg";
const KS = "images/ph/kids-shoes.svg";

const BRANDS = ["Ackermans", "B.Fabulous", "A-list", "Redbat", "Cotton On", "Relay Jeans", "Exact", "Soda Bloc", "Sissy Boy", "Union DNM", "G-Star Raw", "Vans", "Puma", "adidas", "The North Face", "Diesel", "Converse"];
const WOMEN_BRANDS = ["Ackermans", "B.Fabulous", "A-list", "Cotton On", "Sissy Boy", "Redbat", "G-Star Raw", "Vans"];
const MEN_BRANDS = ["Ackermans", "Redbat", "Relay Jeans", "Cotton On", "G-Star Raw", "Union DNM", "Diesel", "Puma"];
const KIDS_BRANDS = ["Ackermans", "Redbat", "Exact", "Soda Bloc", "Cotton On Kids", "Puma", "Converse", "adidas Kids"];

const W_COLORS = ["Black", "White", "Navy", "Grey", "Beige", "Dusty Pink", "Sage", "Mocha", "Burgundy", "Lilac", "Charcoal", "Olive", "Cream", "Sky Blue"];
const M_COLORS = ["Black", "White", "Navy", "Grey", "Charcoal", "Olive", "Khaki", "Burgundy", "Slate", "Camel"];
const K_COLORS = ["Navy", "Grey", "Black", "White", "Pink", "Blue", "Red", "Mustard", "Green", "Lilac"];

function mk(name, brand, price, cat, image, colors) {
  const id = slug(name + "-" + brand);
  const h = hash(id);
  const sizeLabel = cat.indexOf("shoes") > -1 ? ["36", "37", "38", "39", "40", "41"] :
    ["XS", "S", "M", "L", "XL", "XXL"];
  return {
    id: id,
    name: name,
    brand: brand,
    category: cat,
    price: price,
    rating: Math.round(rating(h) * 10) / 10,
    reviews: reviews(h),
    colors: colors,
    description: name + " from " + brand + " — everyday value and lasting comfort, in a soft quality fabric that washes well and keeps its shape. Perfect for the whole family at prices that make sense.",
    highlights: ["Soft, comfortable quality fabric", "True-to-size fit", "Machine washable", "Great everyday value"],
    specs: [["Material", cat.indexOf("shoes") > -1 ? "Durable man-made upper / cushioned sole" : "Cotton-rich blend"], ["Sizes", sizeLabel.join(", ")], ["Care", "Machine washable / wipe clean"]],
    image: image,
    tag: (h % 5 === 1 ? "Bestseller" : h % 7 === 2 ? "New In" : null)
  };
}

/* Expand a list of lines {name, brand, price, colors[]} into products */
function build(lines, cat, image, target) {
  const out = [];
  lines.forEach(function (l) {
    l.colors.forEach(function (c) {
      out.push(mk(l.name + " — " + c, l.brand, l.price, cat, image, [c]));
    });
  });
  // top up to target with extra color variants
  const palettes = { womens: W_COLORS, "womens-shoes": W_COLORS, mens: M_COLORS, "mens-shoes": M_COLORS, kids: K_COLORS, "kids-shoes": K_COLORS };
  const pal = palettes[cat];
  let i = 0;
  while (out.length < target) {
    const l = lines[i % lines.length];
    const c = pal[i % pal.length];
    out.push(mk(l.name + " — " + c, l.brand, l.price, cat, image, [c]));
    i++;
  }
  return out.slice(0, target);
}

/* ---------------- Women's clothing (target 305) ---------------- */
const WOMEN_LINES = [];
const dressNames = [
  ["Maxi Dress", 349], ["Midi Dress", 299], ["Shift Dress", 249], ["Wrap Dress", 299],
  ["T-Shirt Dress", 229], ["Summer Sun Dress", 249], ["Floral Midi Dress", 329], ["Evening Cocktail Dress", 399],
  ["Shirt Dress", 299], ["Smock Dress", 249], ["Satin Slip Dress", 329], ["Denim Dress", 399],
  ["Knitted Dress", 329], ["A-Line Mini Dress", 249], ["Off-Shoulder Dress", 299], ["Halter Neck Dress", 279],
  ["Fit-and-Flare Dress", 299], ["Bodycon Midi Dress", 279], ["Pleated Midi Dress", 319], ["Bardot Dress", 299]
];
dressNames.forEach(function (d, i) {
  WOMEN_LINES.push({ name: d[0], brand: WOMEN_BRANDS[i % WOMEN_BRANDS.length], price: d[1], colors: ["Black", "Dusty Pink", "Mocha", "Sage"].slice(0, 2 + (i % 3)) });
});
const topNames = [
  ["Basic Crew Tee", 129], ["Graphic Print Tee", 149], ["Long-Sleeve Top", 169], ["Button-Up Blouse", 199],
  ["Sleeveless Blouse", 169], ["Crop Top", 129], ["Peasant Top", 179], ["Polo Neck Top", 169],
  ["Ribbed Fitted Top", 139], ["Satin Cami", 159], ["Knit Knit Top", 179], ["Tank Top", 119],
  ["Puff-Sleeve Top", 179], ["Tie-Front Top", 169], ["Hooded Sweatshirt", 249], ["Crew Sweatshirt", 219],
  ["Longline Tunic", 199], ["Off-Shoulder Top", 189], ["Wrap Front Top", 189], ["Mesh Detail Top", 169],
  ["V-Neck Jersey Top", 149], ["Scoop Neck Tee", 129], ["Striped Breton Top", 169], ["Linen Look Top", 179],
  ["3-Pack Basic Tees", 249]
];
topNames.forEach(function (t, i) {
  WOMEN_LINES.push({ name: t[0], brand: WOMEN_BRANDS[(i + 2) % WOMEN_BRANDS.length], price: t[1], colors: ["White", "Black", "Navy", "Grey", "Sage", "Dusty Pink"].slice(0, 2 + (i % 4)) });
});
const bottomNames = [
  ["High-Rise Leggings", 199], ["Jeggings", 249], ["Slim Chinos", 299], ["Palazzo Pants", 279],
  ["Wide-Leg Pants", 279], ["Straight-Leg Trousers", 299], ["Culottes", 249], ["Capri Pants", 199],
  ["Track Pants", 219], ["Cargo Pants", 299], ["Linen Trousers", 299], ["Pleated Pants", 279],
  ["Skinny Jeans", 349], ["Mom Jeans", 349], ["Flared Jeans", 379], ["Ripped Boyfriend Jeans", 379],
  ["High-Rise Straight Jeans", 349], ["Wide-Leg Jeans", 379], ["Denim Shorts", 249], ["Linen Shorts", 199],
  ["High-Waist Shorts", 219], ["Gym Shorts", 149], ["Biker Shorts", 149], ["Mini Skirt", 199],
  ["Midi Pencil Skirt", 229], ["Pleated Skirt", 249], ["Denim Skirt", 249], ["Maxi Skirt", 279],
  ["Wrap Skirt", 229], ["A-Line Skirt", 219]
];
bottomNames.forEach(function (b, i) {
  WOMEN_LINES.push({ name: b[0], brand: WOMEN_BRANDS[(i + 1) % WOMEN_BRANDS.length], price: b[1], colors: ["Black", "Navy", "Denim Blue", "Grey", "Mocha", "Olive"].slice(0, 2 + (i % 3)) });
});
const outfitNames = [
  ["Jumpsuit", 399], ["Romper Playsuit", 349], ["Co-Ord Lounge Set", 299], ["Two-Piece Co-Ord Set", 349],
  ["Pyjama Lounge Set", 279], ["Track Suit Set", 399], ["Shorts Co-Ord Set", 329], ["Pant Co-Ord Set", 379],
  ["Summer Bikini Set", 249], ["One-Piece Swimsuit", 299], ["Tankini Set", 349], ["Swim Shorts", 149],
  ["Rash Vest", 179], ["Bikini Top", 149], ["Bikini Bottom", 129], ["Swimming Costume", 279]
];
outfitNames.forEach(function (o, i) {
  WOMEN_LINES.push({ name: o[0], brand: WOMEN_BRANDS[(i + 3) % WOMEN_BRANDS.length], price: o[1], colors: ["Black", "Navy", "Burgundy", "Lilac", "Dusty Pink"].slice(0, 2 + (i % 3)) });
});
const knitNames = [
  ["Crew Knit Jersey", 299], ["Longline Cardigan", 349], ["Crewneck Sweater", 299], ["Turtleneck Knit", 299],
  ["Knitted Vest", 199], ["V-Neck Jersey", 279], ["Oversized Knit", 319], ["Argyle Jersey", 329],
  ["Chunky Knit Jumper", 349], ["Fine Knit Top", 219], ["Button Cardigan", 299], ["Ribbed Knit Set", 329]
];
knitNames.forEach(function (kn, i) {
  WOMEN_LINES.push({ name: kn[0], brand: WOMEN_BRANDS[(i + 4) % WOMEN_BRANDS.length], price: kn[1], colors: ["Cream", "Charcoal", "Sage", "Mocha", "Black"].slice(0, 2 + (i % 3)) });
});
const coatNames = [
  ["Denim Jacket", 399], ["Bomber Jacket", 349], ["Fitted Blazer", 449], ["Puffer Jacket", 499],
  ["Trench Coat", 549], ["Parka Winter Coat", 599], ["Biker Jacket", 449], ["Fleece Zip Jacket", 249],
  ["Windbreaker", 299], ["Utility Jacket", 399], ["Leather-Look Jacket", 449], ["Raincoat", 349],
  ["Quilted Jacket", 399], ["Teddy Coat", 449]
];
coatNames.forEach(function (c, i) {
  WOMEN_LINES.push({ name: c[0], brand: WOMEN_BRANDS[(i + 5) % WOMEN_BRANDS.length], price: c[1], colors: ["Black", "Camel", "Navy", "Grey"].slice(0, 2 + (i % 2)) });
});
const sleepNames = [
  ["2-Piece Pyjama Set", 249], ["Short Pyjama Set", 229], ["Satin Nightdress", 279], ["Nightshirt", 199],
  ["Sleep Shorts", 149], ["Pyjama Pants", 179], ["Sleep Dress", 229], ["Cosy Robe", 299],
  ["Flannel Pyjama Set", 299], ["Long-Sleeve Pyjama Set", 259], ["Bralette", 129], ["Seamless Bra", 179],
  ["Shapewear Shorts", 199], ["Bodysuit", 249], ["Satin Cami Set", 229]
];
sleepNames.forEach(function (s, i) {
  WOMEN_LINES.push({ name: s[0], brand: WOMEN_BRANDS[(i + 6) % WOMEN_BRANDS.length], price: s[1], colors: ["Black", "Blush", "White", "Navy"].slice(0, 2 + (i % 2)) });
});

/* ---------------- Women's shoes (target 52) ---------------- */
const WS_LINES = [];
const wsNames = [
  ["Block Heel Sandals", 349], ["Stiletto Heels", 399], ["Kitten Heel Pumps", 329], ["Strappy Heels", 379],
  ["Low Wedge Heels", 299], ["Platform Heels", 349], ["Ballet Flats", 249], ["Pointed Flats", 279],
  ["Loafers", 329], ["Mary Jane Flats", 249], ["Espadrille Flats", 279], ["Flat Sandals", 199],
  ["Slide Sandals", 179], ["Gladiator Sandals", 249], ["Ankle Strap Sandals", 229], ["Strappy Flat Sandals", 249],
  ["Canvas Sneakers", 349], ["White Court Trainers", 379], ["Slip-On Sneakers", 329], ["Platform Sneakers", 399],
  ["Everyday Trainers", 429], ["Chunky Sneakers", 429], ["Knitted Sneakers", 349], ["Skate Sneakers", 349],
  ["Comfort Slippers", 149], ["Memory Foam Slippers", 199], ["Fleece Slippers", 179], ["Ankle Boots", 449],
  ["Chelsea Boots", 499], ["Combat Boots", 549], ["Knee-High Boots", 599], ["Lace-Up Boots", 479],
  ["Winter Boots", 549], ["Wedge Slides", 229], ["Flat Sliders", 179], ["Wedges", 329],
  ["Lace Flats", 259], ["T-Bar Flats", 279], ["Slingback Heels", 349], ["Pumps", 279],
  ["Cushioned Slippers", 169], ["Pool Sliders", 99], ["Strap Sandals", 229], ["Crossover Sandals", 249],
  ["Chunky Heels", 399], ["Pointed Pumps", 329], ["Ballerina Pumps", 269], ["Rhinestone Flats", 299],
  ["Suede Ankle Boots", 479], ["Riding Boots", 599], ["Western Boots", 549], ["Suede Chelsea Boots", 519]
];
wsNames.forEach(function (s, i) {
  WS_LINES.push({ name: s[0], brand: WOMEN_BRANDS[i % WOMEN_BRANDS.length], price: s[1], colors: ["Black", "Nude", "Tan", "White", "Brown"].slice(0, 1 + (i % 3)) });
});

/* ---------------- Men's clothing (target 155) ---------------- */
const MEN_LINES = [];
const menTop = [
  ["Basic Crew Tee", 139], ["Heavyweight Tee", 169], ["Graphic Tee", 179], ["Vest Singlet", 129],
  ["Long-Sleeve Tee", 189], ["Henley Tee", 199], ["Polo Shirt", 249], ["Short-Sleeve Shirt", 279],
  ["Oxford Shirt", 329], ["Denim Shirt", 329], ["Flannel Shirt", 299], ["Chambray Shirt", 299],
  ["Linen Shirt", 299], ["Checked Shirt", 279], ["Formal White Shirt", 299], ["Twill Shirt", 279],
  ["Crew Sweatshirt", 269], ["Hooded Sweatshirt", 299], ["Zip Hoodie", 329], ["Track Top", 249],
  ["Quarter-Zip Jersey", 279], ["Rugby Jersey", 299], ["Knit Jumper", 329], ["Cardigan", 349],
  ["Crewneck Jumper", 329], ["V-Neck Jumper", 319], ["Turtleneck Jumper", 329], ["Cable Knit Jumper", 349]
];
menTop.forEach(function (t, i) {
  MEN_LINES.push({ name: t[0], brand: MEN_BRANDS[i % MEN_BRANDS.length], price: t[1], colors: ["White", "Black", "Navy", "Grey", "Charcoal", "Olive"].slice(0, 2 + (i % 3)) });
});
const menBottom = [
  ["Slim Fit Jeans", 349], ["Straight Jeans", 349], ["Regular Fit Jeans", 329], ["Skinny Jeans", 349],
  ["Tapered Jeans", 369], ["Relaxed Jeans", 349], ["Chinos", 329], ["Slim Chinos", 329],
  ["Cargo Pants", 329], ["Jogger Pants", 279], ["Track Pants", 249], ["Twill Pants", 299],
  ["Linen Trousers", 299], ["Dress Trousers", 349], ["Cargo Shorts", 249], ["Chino Shorts", 229],
  ["Denim Shorts", 269], ["Athletic Shorts", 179], ["Swim Shorts", 199], ["Board Shorts", 229],
  ["Bermuda Shorts", 249], ["5-Pocket Jeans", 349]
];
menBottom.forEach(function (b, i) {
  MEN_LINES.push({ name: b[0], brand: MEN_BRANDS[(i + 1) % MEN_BRANDS.length], price: b[1], colors: ["Navy", "Black", "Denim Blue", "Grey", "Khaki", "Olive"].slice(0, 2 + (i % 2)) });
});
const menOuter = [
  ["Denim Jacket", 449], ["Bomber Jacket", 399], ["Harrington Jacket", 349], ["Puffer Jacket", 549],
  ["Parka Coat", 599], ["Trench Coat", 599], ["Biker Jacket", 499], ["Fleece Jacket", 299],
  ["Softshell Jacket", 399], ["Windbreaker", 329], ["Rain Jacket", 379], ["Utility Jacket", 449],
  ["Blazer", 549], ["Suit Jacket", 899]
];
menOuter.forEach(function (o, i) {
  MEN_LINES.push({ name: o[0], brand: MEN_BRANDS[(i + 2) % MEN_BRANDS.length], price: o[1], colors: ["Black", "Navy", "Grey", "Olive"].slice(0, 2 + (i % 2)) });
});
const menOther = [
  ["3-Pack Boxer Briefs", 199], ["5-Pack Socks", 149], ["2-Pack Vests", 179], ["Pyjama Set", 279],
  ["Pyjama Pants", 199], ["Lounge Shorts", 149], ["Bathrobe", 299], ["Waffle Robe", 349],
  ["Gym Tee", 179], ["Gym Joggers", 279], ["Sports Shorts", 169], ["Compression Top", 249],
  ["Training Tracksuit", 449], ["Track Jacket", 299], ["Suit Trousers", 449], ["Waistcoat", 449]
];
menOther.forEach(function (o, i) {
  MEN_LINES.push({ name: o[0], brand: MEN_BRANDS[(i + 3) % MEN_BRANDS.length], price: o[1], colors: ["Black", "Navy", "Grey", "White", "Charcoal"].slice(0, 2 + (i % 2)) });
});

/* ---------------- Men's shoes (target 50) ---------------- */
const MS_LINES = [];
const msNames = [
  ["Leather Lace-Up Shoes", 499], ["Oxford Dress Shoes", 549], ["Brogue Shoes", 599], ["Derby Shoes", 499],
  ["Casual Lace-Up Sneakers", 349], ["Canvas Sneakers", 299], ["Leather Sneakers", 449], ["White Sneakers", 379],
  ["Low-Top Trainers", 379], ["High-Top Sneakers", 419], ["Chunky Sneakers", 449], ["Everyday Running Shoes", 499],
  ["Gym Training Shoes", 429], ["Trail Running Shoes", 549], ["Football Boots", 399], ["Hiking Boots", 599],
  ["Ankle Boots", 549], ["Chelsea Boots", 599], ["Chukka Boots", 549], ["Desert Boots", 549],
  ["Work Boots", 649], ["Combat Boots", 599], ["Loafers", 429], ["Penny Loafers", 449],
  ["Slip-On Shoes", 379], ["Moccasins", 399], ["Espadrilles", 299], ["Boat Shoes", 399],
  ["Slide Sandals", 179], ["Flip Flops", 129], ["Sport Slides", 199], ["Slippers", 179],
  ["Memory Foam Slippers", 199], ["Mule Slippers", 189], ["Canvas Slip-Ons", 279], ["Wool Slippers", 229],
  ["Court Shoes", 499], ["Monk Strap Shoes", 599], ["Tassel Loafers", 479], ["Driving Shoes", 449],
  ["Summer Sandals", 249], ["Strappy Sandals", 279], ["Pool Slides", 129], ["Birk-Inspired Sandals", 349],
  ["Lace-Up Boots", 549], ["Winter Boots", 599], ["Aussie Boots", 549], ["Rubber Chelsea Boots", 499],
  ["Canvas High-Tops", 349], ["Basketball Sneakers", 549]
];
msNames.forEach(function (s, i) {
  MS_LINES.push({ name: s[0], brand: MEN_BRANDS[i % MEN_BRANDS.length], price: s[1], colors: ["Black", "Brown", "Tan", "White", "Navy"].slice(0, 1 + (i % 3)) });
});

/* ---------------- Kids' clothing (target 205) ---------------- */
const KID_LINES = [];
const kidNames = [
  ["Girls Floral Dress", 229], ["Girls Party Dress", 249], ["Girls Denim Dress", 279], ["Girls Summer Dress", 199],
  ["Girls Tulle Dress", 269], ["Girls Pinafore Dress", 229], ["Boys Basic Tee", 99], ["Girls Basic Tee", 99],
  ["Kids Graphic Tee", 129], ["Boys Polo Shirt", 149], ["Girls Blouse", 159], ["Kids Long-Sleeve Top", 129],
  ["Kids Hoodie", 199], ["Kids Zip Hoodie", 219], ["Kids Sweatshirt", 179], ["Kids Track Top", 169],
  ["Boys Tracksuit Set", 299], ["Girls Tracksuit Set", 299], ["Boys Denim Jeans", 229], ["Girls Denim Jeans", 229],
  ["Kids Joggers", 179], ["Girls Leggings", 129], ["Boys Cargo Pants", 219], ["Kids Chinos", 199],
  ["Kids Shorts", 129], ["Boys Swimmers", 149], ["Girls Swimsuit", 199], ["Kids Rash Vest", 129],
  ["Kids Rain Jacket", 249], ["Kids Puffer Jacket", 299], ["Kids Denim Jacket", 249], ["Kids Bomber Jacket", 249],
  ["Kids Cardigan", 199], ["Kids Knit Jumper", 199], ["Kids Pyjama Set", 199], ["Kids Flannel Pyjamas", 229],
  ["Kids Nightshirt", 149], ["Kids Onesie", 249], ["Baby Grow Set", 179], ["Baby Bodysuit 3-Pack", 199],
  ["Baby Set Outfit", 249], ["Baby Sleepsuit", 179], ["Baby Cardigan Set", 199], ["Baby Dungarees", 199],
  ["Baby Knitted Outfit", 249], ["Girls Leggings 2-Pack", 179], ["Kids Socks 5-Pack", 99], ["Kids Underwear 3-Pack", 149],
  ["Boys School Shirt", 129], ["Girls School Shirt", 129], ["Boys School Trousers", 179], ["Girls School Skirt", 159],
  ["Boys School Shorts", 149], ["Girls School Pinafore", 189], ["Kids School Jumper", 179], ["School Track Top", 179],
  ["Boys Sport Shorts", 119], ["Girls Sport Skort", 149], ["Kids Sports Tee", 129], ["Kids Swim Shorts", 129],
  ["Kids Playsuit", 179], ["Girls Jumpsuit", 229], ["Kids Romper", 179], ["Girls Skirt", 149],
  ["Kids Leggings", 119], ["Girls Tights 2-Pack", 99], ["Kids Beanie", 99], ["Kids Scarf & Gloves Set", 149],
  ["Kids Backpack", 249], ["Kids Lunch Bag", 99], ["Kids Water Bottle", 79], ["Kids Party Dress", 229],
  ["Boys Waistcoat", 199], ["Girls Cardigan", 179], ["Kids Fleece Jacket", 199], ["Kids Gilet", 199]
];
kidNames.forEach(function (k, i) {
  KID_LINES.push({ name: k[0], brand: KIDS_BRANDS[i % KIDS_BRANDS.length], price: k[1], colors: ["Navy", "Grey", "Black", "Pink", "Blue"].slice(0, 2 + (i % 3)) });
});

/* ---------------- Kids' shoes (target 32) ---------------- */
const KS_LINES = [];
const ksNames = [
  ["Boys School Shoes", 249], ["Girls School Shoes", 249], ["Girls T-Bar School Shoes", 269], ["Boys Lace-Up School Shoes", 269],
  ["Kids Canvas Sneakers", 199], ["Kids Lace-Up Sneakers", 249], ["Kids Velcro Sneakers", 229], ["Kids Hi-Top Sneakers", 249],
  ["Kids Running Shoes", 299], ["Kids Sports Shoes", 279], ["Girls Ballet Flats", 199], ["Girls Mary Jane Shoes", 229],
  ["Kids Sandals", 149], ["Kids Strap Sandals", 179], ["Kids Flip Flops", 99], ["Kids Slides", 129],
  ["Kids Ankle Boots", 249], ["Kids Winter Boots", 299], ["Kids Rain Boots", 199], ["Girls Boots", 279],
  ["Kids Slippers", 99], ["Kids Character Slippers", 149], ["Kids Faux-Fur Slippers", 149], ["Kids Socks 5-Pack", 99],
  ["Kids School Socks", 79], ["Girls Tights 2-Pack", 99], ["Kids Football Boots", 199], ["Kids All-Stars Sneakers", 249],
  ["Kids Dress Shoes", 249], ["Girls Sandals", 169], ["Kids Velcro Sandals", 179], ["Kids Water Shoes", 129]
];
ksNames.forEach(function (s, i) {
  KS_LINES.push({ name: s[0], brand: KIDS_BRANDS[i % KIDS_BRANDS.length], price: s[1], colors: ["Black", "Navy", "White", "Pink", "Blue"].slice(0, 1 + (i % 3)) });
});

/* ---------------- build + emit ---------------- */
const WOMEN = build(WOMEN_LINES, "womens", W, 305);
const WSHOES = build(WS_LINES, "womens-shoes", WS, 52);
const MEN = build(MEN_LINES, "mens", M, 155);
const MSHOES = build(MS_LINES, "mens-shoes", MS, 50);
const KIDS = build(KID_LINES, "kids", K, 205);
const KSHOES = build(KS_LINES, "kids-shoes", KS, 32);
console.log("womens:", WOMEN.length, "| womens-shoes:", WSHOES.length,
  "| mens:", MEN.length, "| mens-shoes:", MSHOES.length,
  "| kids:", KIDS.length, "| kids-shoes:", KSHOES.length,
  "| fashion total:", WOMEN.length + WSHOES.length + MEN.length + MSHOES.length + KIDS.length + KSHOES.length);

const OUT = "C:/Users/Hq1/Documents/Claude/Techgrid Africa/js/";

function render(products, constName) {
  const lines = [];
  lines.push("// Techgrid Africa — " + constName + " (prices in ZAR)");
  lines.push("const PRODUCTS_" + constName.toUpperCase() + " = [");
  products.forEach(function (p, i) {
    lines.push("  {");
    lines.push('    id: "' + p.id + '",');
    lines.push('    name: "' + p.name + '",');
    lines.push('    brand: "' + p.brand + '",');
    lines.push('    category: "' + p.category + '",');
    lines.push("    price: " + p.price + ", rating: " + p.rating + ", reviews: " + p.reviews + ",");
    lines.push('    colors: ["' + p.colors.join('", "') + '"],');
    if (p.tag) lines.push('    tag: "' + p.tag + '",');
    lines.push('    description: "' + p.description.replace(/"/g, '\\"') + '",');
    lines.push('    highlights: ["' + p.highlights.join('", "') + '"],');
    lines.push('    specs: [[' + p.specs.map(function (s) { return '["' + s[0] + '", "' + s[1].replace(/"/g, '\\"') + '"]'; }).join(", ") + "]],");
    lines.push('    image: "' + p.image + '"');
    lines.push("  }" + (i < products.length - 1 ? "," : ""));
  });
  lines.push("];");
  lines.push("");
  return lines.join("\n");
}

const map = [
  [WOMEN, "Womens Clothing", "products-womens.js"],
  [WSHOES, "Womens Footwear", "products-womens-shoes.js"],
  [MEN, "Mens Clothing", "products-mens.js"],
  [MSHOES, "Mens Footwear", "products-mens-shoes.js"],
  [KIDS, "Kids Clothing", "products-kids.js"],
  [KSHOES, "Kids Footwear", "products-kids-shoes.js"]
];
map.forEach(function (m) {
  fs.writeFileSync(OUT + m[2], render(m[0], m[1].toUpperCase().replace(/[^A-Z]+/g, "_")));
});
console.log("wrote 6 fashion product files");