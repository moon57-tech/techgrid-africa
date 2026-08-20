// Techgrid Africa — electronics + home catalog generator.
// Emits js/products-electronics.js (PRODUCTS_ELECTRONICS) and js/products-home.js (PRODUCTS_HOME).
// Real products scraped from hificorp.co.za, revibe.co.za, techmarkit.co.za (Aug 2026 homepages).
const fs = require("fs");
const path = require("path");

/* ---------------- deterministic helpers ---------------- */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function slug(s) {
  return s.toLowerCase().replace(/&/g, " and ").replace(/[®™]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
function rnd(n, min, max) { return min + (n % (max - min + 1)); }
function rating(n) { return 3.8 + (n % 12) / 10; }               // 3.8 – 4.9
function reviews(n) { return 30 + (n % 700); }

/* ---------------- real scraped data ---------------- */
// [name, brand, price]
const REAL = [
  ["Samsung 55-inch Crystal UHD 4K-55U8000F","Samsung",5999],
  ["ASUS Vivobook X1504 Intel Core 5 120U 16GB RAM 512GB SSD Laptop","ASUS",10999],
  ["Defy 8kg Top Loader Manhattan Washing Machine with FountainWash Grey DTL165","Defy",4299],
  ["Packard Bell Senna R32 Pro 14.1 AMD Ryzen 3 16GB RAM 512GB SSD Laptop","Packard Bell",5999],
  ["Mora 154L Top Freezer Fridge M225TDG","Mora",2999],
  ["Defy 492L Onyx French Door Fridge Freezer DFF440 WD","Defy",16999],
  ["Skyworth 60-inch QLED Google TV-60Q6600H","Skyworth",6999],
  ["Lenovo LOQ 15 Ryzen 5 150 16GB RAM & 512GB SSD RTX3050 Gaming Laptop","Lenovo",14999],
  ["Orion 50-Inch UHD LED TV-OLED50UHD","Orion",3499],
  ["Hisense 8kg Front Load Washer Titanium Grey WF1I8022BT","Hisense",4999],
  ["Skyworth 43-inch FHD Google TV-43E5500H","Skyworth",3499],
  ["Skyworth 85-inch QLED Google TV-85Q6600H","Skyworth",15999],
  ["Orion 65-inch UHD Smart TV-OTV65UHDSMV","Orion",5999],
  ["Lenovo IdeaPad 3 AMD Ryzen 5 40 16GB RAM and 512GB SSD Laptop","Lenovo",10999],
  ["Samsung 50-inch Crystal UHD 4K-50U8000F","Samsung",5499],
  ["Hisense 543L Side-By-Side Refrigerator Grey H680SIT","Hisense",10999],
  ["Skyworth 50-inch QLED Google TV-50Q5600K","Skyworth",4999],
  ["Defy 6kg Front Loader Grey DAW392","Defy",3999],
  ["Defy 15kg Twin Tub Washing Machine Metallic DTT151","Defy",3899],
  ["Samsung 70-inch Crystal UHD 4K-70U8000F","Samsung",9499],
  ["Defy 9kg Twin Tub White DTT169","Defy",3099],
  ["Xiaomi 65-inch PRO QLED 4K TV 120HZ-65ELA5844GL","Xiaomi",8499],
  ["KIC 537L Chest Freezer White KCG575WH","KIC",7999],
  ["ASUS VivoBook Go E1504 AMD Ryzen 3 30 8GB RAM and 256GB SSD Laptop","ASUS",9999],
  ["Mandy 4 Piece Lounge Suite, Brown","Mandy",6999],
  ["Canon EOS R50 Creator Kit","Canon",12999],
  ["Xiaomi TV Box S 3rd Gen 4K Media Player","Xiaomi",1299],
  ["TCL 18000BTU BreezeIN Inverter Split Air Conditioner TAC-18CHSD/TPH21I","TCL",11499],
  ["Hisense 45L Electronic Microwave Matt Black H45MOBS5X","Hisense",1999],
  ["Sealy Rossi 152cm (Queen) Medium Bed Set","Sealy",9999],
  ["Hisense 34L Digital Microwave Matt Black H34MOBS17","Hisense",1399],
  ["Claudia 3 Piece Daybed, Black","Claudia",7499],
  ["Sealy Columbia 152cm (Queen) Firm Bed Set Standard Length","Sealy",7999],
  ["Hisense 347L Combi Fridge With Water Dispenser Black Glass H450BMIB-WD","Hisense",7499],
  ["Defy Oven and Hob Box Set DCB866E","Defy",6999],
  ["Sealy Argo 152cm (Queen) Firm Bed Set Standard Length","Sealy",6999],
  ["Skyworth 55X6600H Mini LED 4K","Skyworth",6799],
  ["Sealy Columbia 137cm (Double) Firm Bed Set","Sealy",6599],
  ["Samsung 55-inch QLED Q6FA 4K Smart TV","Samsung",6499],
  ["Motorola G06 Power","Motorola",1999],
  ["ASUS VivoBook Go E1504 Intel N150 8GB RAM 256GB SSD Laptop","ASUS",7999],
  ["Acer 314 Intel Celeron N4500 4GB RAM 64GB eMMC Chromebook","Acer",5499],
  ["Xiaomi Redmi Note 15 Pro 256G Black plus a 10000mAH Powerbank","Xiaomi",5999],
  ["TCL 8kg Front Loader Direct Drive P1108FLG","TCL",5999],
  ["Lenovo IdeaPad 3 MediaTek Kompanio 540 8GB RAM and 128GB UFS Chromebook","Lenovo",5999],
  ["Sleepmasters Brooklyn 183cm (King) Firm Bed Set Standard Length","Sleepmasters",5999],
  ["Vegas Luxury Massage High Back Chair Khaki","Vegas",1699],
  ["Restonic Bazaruto 152cm (Queen) Medium Mattress Standard Length","Restonic",5499],
  ["Samsung 65-Inch Mini-LED TV 65M80H","Samsung",11999],
  ["Samsung Sound Tower MX-ST50F 240 Watts Party Speaker","Samsung",6999],
  ["Samsung Galaxy Watch8 40mm BT Silver","Samsung",4499],
  ["Samsung Galaxy Tab A11 Plus Wi-Fi Grey","Samsung",3699],
  ["Samsung 27-inch 100Hz Monitor Black","Samsung",2499],
  ["Samsung B-series Soundbar HW-B450F 2.1 ch Subwoofer 2025","Samsung",2999],
  ["Samsung 55-Inch Mini-LED TV 55M70H","Samsung",7999],
  ["Samsung Galaxy S25 FE 256GB Jet Black","Samsung",11999],
  ["Samsung Galaxy Watch Ultra Gray LTE 2025","Samsung",7999],
  ["Samsung 19kg AI Top Loader WA80F19S8BFA Black","Samsung",7999],
  ["Samsung 321L Fridge Freezer Inox RB33J3611S9","Samsung",10999],
  ["Samsung 32-inch 100Hz Mainstream Curved Monitor","Samsung",4999],
  ["Lenovo IdeaPad 3 AMD Athlon 8GB RAM 256GB SSD Laptop","Lenovo",7999],
  ["Dell Inspiron 5440 Intel Core 7-150U 16GB RAM 1TB SSD Laptop","Dell",16999],
  ["Acer Aspire Lite 15 Intel Celeron N4500 8GB RAM 128GB W11H","Acer",6999],
  ["Packard Bell Schumi LTE 14.1 AMD Ryzen 3 16GB RAM 512GB SSD Laptop Bundle","Packard Bell",7999],
  ["HP OmniBook 3 AMD Ryzen 5 130 8GB RAM and 512SSD Laptop","HP",11999],
  ["Orion 15.6 AMD Ryzen 3 3200 8GB RAM and 256GB SSD Laptop","Orion",5999],
  ["HP 250 Intel N150 8GB RAM 256GB SSD Laptop","HP",7999],
  ["Lenovo IdeaPad 3 AMD Ryzen 5 40 8GB RAM and 512GB SSD Laptop","Lenovo",9999],
  ["Orion 15.6 AMD Ryzen 5 3450U 8GB RAM and 256GB SSD Laptop","Orion",7999],
  ["Packard Bell Senna R5 16 AMD Ryzen 5 16GB RAM 512GB SSD Laptop","Packard Bell",7999],
  ["HP 15s Ryzen 3 7320U 8GB RAM 256GB SSD Laptop Bundle","HP",9999],
  ["Packard Bell Montenero C82Pro Intel Celeron N4500 8GB RAM 256GB SSD Laptop","Packard Bell",4999],
  ["Orion 14 Intel Core i3 10100Y 8GB RAM 256GB SSD Laptop","Orion",5499],
  ["Lenovo IdeaPad 3 AMD Ryzen 7 170 16GB RAM and 512GB SSD Laptop","Lenovo",13999],
  ["Orion 14 Intel Pentium 6500Y 8GB RAM 256GB SSD Laptop","Orion",4999],
  ["HP 15s AMD Ryzen 5 7520U 8GB RAM 512GB SSD Laptop","HP",10999],
  ["Packard Bell Carrera Flex 3 AMD Ryzen 3 3200U 16GB RAM 512GB SSD Laptop","Packard Bell",7999],
  ["Edblo Berlin 137cm (Double) Medium Bed Set","Edblo",4599],
  ["Sealy Cavalli 152cm (Queen) Plush Bed Set Standard Length","Sealy",10499],
  ["Sealy Argo 183cm (King) Firm Bed Set Standard Length","Sealy",9999],
  ["Sealy Salvador 152cm (Queen) Medium Base Set Standard Length","Sealy",8499],
  ["Restonic Bazaruto 152cm (Queen) Medium Base Set Standard Length","Restonic",7499],
  ["Cozy Nights Serenity MKII 137cm (Double) Firm Base Set Standard Length","Cozy Nights",3999],
  ["Serta Apollo 152cm (Queen) Firm Bed Set Standard Length","Serta",5599],
  ["Edblo Berlin 152cm (Queen) Medium Bed Set Standard Length","Edblo",4999],
  ["Edblo Himalaya 152cm (Queen) Firm Base Set Standard Lengths","Edblo",6499],
  ["Serta Athena 137cm (Double) Firm Bed Set Standard Length","Serta",6699],
  ["Cozy Nights Serenity MKII 152cm (Queen) Firm Base Set Standard Length","Cozy Nights",4499],
  ["Serta Avalon 152cm (Queen) Plush Bed Set Standard Length","Serta",11599],
  ["Sleepmasters Santos MKII 152cm (Queen) Plush Bed Set Standard Length","Sleepmasters",7499],
  ["Sleepmasters Supreme 152cm (Queen) Firm Bed Set Standard Length","Sleepmasters",5999],
  ["Serta Aura 152cm (Queen) Medium Bed Set Standard Length","Serta",9499],
  ["Sleepmasters Saville MKII 152cm (Queen) Medium Bed Set Standard Length","Sleepmasters",7499],
  ["Restonic Bali 183cm (King) Medium Bed Set Standard Length","Restonic",9999],
  ["Sealy Toulouse 183cm (King) Plush Base Set Standard Length","Sealy",18999],
  ["Serta Athena 152cm (Queen) Firm Base Set Standard Length","Serta",7299],
  ["TCL 75-inch 144Hz Mini-LED Google TV 75P8L","TCL",15999],
  ["Skyworth 65-inch MiniLED TV-65X6600K","Skyworth",9799],
  ["Sansui 65-inch UHD Google TV","Sansui",7999],
  ["Hisense 65-inch Smart 4K UHD TV-65A6Q","Hisense",7999],
  ["JVC 49-inch QLED Smart TV-LT49NQ5165","JVC",3999],
  ["Samsung 75-inch QLED Q6FA 4K Smart TV","Samsung",12999],
  ["Sansui 50-inch FHD Google TV","Sansui",4299],
  ["Sansui 70-inch UHD Google TV","Sansui",8999],
  ["Hisense 55-inch QLED 4K TV-55Q6Q","Hisense",6999],
  ["Samsung 32 FHD Smart TV-32H5000F","Samsung",2999],
  ["TCL 65-Inch Mini LED Google TV-65C6KS","TCL",10999],
  ["Skyworth 75-inch QLED Google TV-75Q6600H","Skyworth",11999],
  ["Samsung 65-inch Crystal UHD 4K-65U8000F","Samsung",7999],
  ["Hisense 85-inch Smart 4K UHD TV-85A6Q","Hisense",15999],
  ["TCL 65-Inch Mini LED Google TV-65C6K","TCL",13999],
  ["Hisense 85-inch QLED 4K TV-85Q6Q","Hisense",16999],
  ["Skyworth 100-inch QLED Google TV-100Q7800H","Skyworth",29999],
  ["Hisense 58-inch Smart 4K UHD TV 58A6N","Hisense",6499],
  ["Stylus AV BT1000 Bluetooth Speaker Blue","Stylus AV",249],
  ["Stylus AV AFTERPARTY MK III Bluetooth Portable Speaker","Stylus AV",699],
  ["VolkanoX Python Series Bluetooth Speaker","VolkanoX",1099],
  ["JVC Bluetooth Trolley Speaker XS-N600","JVC",1299],
  ["JBL Wave Buds 2 True Wireless Noise Cancelling Earbuds - Black","JBL",949],
  ["Volkano SoundSweeper ANC Headphones","Volkano",379],
  ["Ultra-Link Electro Series 120W Bluetooth Speaker","Ultra-Link",1499],
  ["Stylus AV BT1000 Bluetooth Speaker Grey","Stylus AV",249],
  ["Skyworth 5.1 Channel Home Cinema Soundbar System SS586","Skyworth",2799],
  ["Reference Audio 5 inch 4 Way Coaxial Speaker RA-RX5.4","Reference Audio",269],
  ["Hisense 2.1Channel BT Soundbar HS2100","Hisense",1799],
  ["VolkanoX 2.1 channel 240W Soundbar Empire","VolkanoX",1299],
  ["Hisense 620W Party Thunder True Wireless Stereo Bluetooth Speaker","Hisense",5999],
  ["Samsung B-Series Soundbar HW-B650F 3.1 ch Subwoofer 2025","Samsung",3999],
  ["JBL Wave Buds 2 True Wireless Noise Cancelling Earbuds - White","JBL",949],
  ["Soundcore R50i True Wireless Earbuds","Soundcore",299],
  ["VolkanoX S800 Portable Bluetooth Speaker","VolkanoX",1999],
  ["Stylus AV BT1000 Bluetooth Speaker Red","Stylus AV",249],
  ["JBL Cinema SB550 3.1 Soundbar and Wireless Subwoofer","JBL",3999],
  ["Sony 12-inch 1800W Subwoofer XS-NW1200","Sony",1299],
  ["Volkano SoundSweeper ANC Blue","Volkano",369],
  ["Stylus AV BT1000 Bluetooth Speaker Black","Stylus AV",249],
  ["Soundcore Q20i Hybrid Active Noise Cancelling Headphones Black","Soundcore",929],
  ["Bennett Read Sponono 7kg Single Tub Compact Washing Machine White JCW112","Bennett Read",1099],
  ["Beko 316L Combi Fridge Freezer Brushed B3RCNE364HXB Silver","Beko",9999],
  ["Univa 85L Top Freezer Fridge UT115M","Univa",2799],
  ["Samsung 40L Solo Microwave Black MS40DG5504AGFA","Samsung",2999],
  ["Univa 12kg Top Loader Metallic UTL1201","Univa",4299],
  ["Univa 433L Side by Side Fridge with Water Dispenser Dark Inox UFF2-570IWD","Univa",10499],
  ["Hisense 18kg Top Loader Premium Black WT3I1823UB","Hisense",6999],
  ["Bosch 9kg Series 4 Frontloader Washing Machine Inox WGA1440XZA Silver","Bosch",8999],
  ["Defy 90L Bar Fridge DBF90M Metallic","Defy",2499],
  ["Hisense 14kg Twin Tub Washing Machine White WSCF143","Hisense",3699],
  ["Defy 348L C455 Fridge Freezer Metallic With Water Dispenser DAC645","Defy",6999],
  ["Defy 4 Plate Compact Stove Black DSS554","Defy",3599],
  ["Defy 157L Top Freezer Fridge Metallic DAD239","Defy",3499],
  ["Snomaster 12KG Bullet Type Ice Maker SMIC-30","Snomaster",1799],
  ["Hisense 223L Fridge Freezer H310BIT Metallic","Hisense",4999],
  ["Defy 13 Place Dishwasher Manhattan Grey DDW242","Defy",5499],
  ["Univa 13 Place Dishwasher Dark Grey UDW301","Univa",4999],
  ["Hisense 154L Top Freezer Fridge Titanium Silver H225TTS","Hisense",3299],
  ["Defy 14kg Top Loader Manhattan DTL160 Grey","Defy",4999],
  ["Russell Hobbs 1.7L Double Walled Glass Kettle RHGK02","Russell Hobbs",549],
  ["Defy 8.4L Digital Dual Basket Air Fryer DAF6386DBD","Defy",1399],
  ["Milex 1.7L Electric Kettle MEK003","Milex",299],
  ["Xiaomi Robot Vacuum S40 BHR084AEU","Xiaomi",4499],
  ["Wahl Professional 2000 Watt Hair Dryer","Wahl",399],
  ["Russell Hobbs 6L Electric Pressure Cooker","Russell Hobbs",1299],
  ["Milex Nutrimix Fusion Blender Silver","Milex",499],
  ["Milex 8L Touch Chef Digital Air Fryer","Milex",999],
  ["Orion 2000W Ceramic Hyperglide Iron OSI-2001","Orion",199],
  ["Hoover 21 Hoover Proclean 20l Stainless Steel Wet And Dry Vacuum","Hoover",999],
  ["Bennett Read 10L Digital Air Fryer KAF145","Bennett Read",1199],
  ["Wahl Hair Clipper Multicut 9247-003","Wahl",749],
  ["Defy 7.6L Digital Air Fryer DAF 3376 DB","Defy",999],
  ["Kenwood 2L Blender with Mill Black","Kenwood",599],
  ["Bennett Read 30L Compact Oven BR30LMK","Bennett Read",1299],
  ["Sunbeam 3 Piece Black Pack","Sunbeam",599],
  ["Philips 6.2L Digital Airfryer NA231/00","Philips",999],
  ["Bennett Read Aerovac HVC117","Bennett Read",499],
  ["Russell Hobbs Slow Cooker 6.5lt RHSS75","Russell Hobbs",999],
  ["Sunbeam 6 Bar Quartz Heater SBH-6000","Sunbeam",1199],
  ["Defy Black PTC Heater DPH1100","Defy",299],
  ["Purepleasure Double Tie-Down Electric Blanket","Purepleasure",729],
  ["Orion 3 Bar Quartz Heater OHH3W","Orion",299],
  ["TCL 14000BTU Portable Air Conditioner TAC-14CHPB/MZ","TCL",6999],
  ["Alliance Emerald 12000BTU Inverter Split Air Conditioner","Alliance",7999],
  ["Alva Compact 3 Panel Gas Infrared Heater GH303","Alva",1299],
  ["Goldair 9 Fin Oil Radiator GOR-900A","Goldair",1199],
  ["Xiaomi Smart Space Heater S EU BHR4037GL","Xiaomi",2499],
  ["Samsung AR3000 Non-Inverter 12000BTU Air Conditioner","Samsung",6999],
  ["Alva Gas Electric Heater GH309","Alva",1499],
  ["Delonghi Ceramic Fan Heater HFX30C18.AG","Delonghi",899],
  ["Alva-Circular Medium Glass Patio Heater GHP24","Alva",5299],
  ["Russell Hobbs Fan Heater, Black RHFH914","Russell Hobbs",499],
  ["Xiaomi Oscillation Fan Heater BHR8228EU","Xiaomi",1199],
  ["Purepleasure Queen Tie-Down Electric Blanket","Purepleasure",829],
  ["Goldair 11 Fin Oil Radiator GOR-1100A","Goldair",1299],
  ["Goldair 3 Panel Gas Heater GGH42BA","Goldair",999],
  ["ALVA Stainless Steel Patio Heater","Alva",3299],
  ["Elegance Foldable Gas Heater RY10-04E","Elegance",1299],
  ["Delonghi Infrared Gas Heater IR3010","Delonghi",2999],
  ["Elektra Electric Hot Water Bottle Red 2501","Elektra",149],
  ["Xiaomi Redmi Note 15 256G Black plus a 10000mAH Powerbank","Xiaomi",5499],
  ["HONOR X9d 5G 256GB Midnight Black","HONOR",9499],
  ["Apple iPhone 14 128GB Starlight Pre Owned (A Grade)","Apple",10499],
  ["Xiaomi Redmi 15C 128GB Midnight Black","Xiaomi",2199],
  ["Samsung Galaxy A06 Light Blue","Samsung",1799],
  ["Honor X5c Plus Black","Honor",2399],
  ["Apple iPhone 14 128GB Midnight Pre Owned (A Grade)","Apple",10499],
  ["Xiaomi Redmi A3x Midnight Black","Xiaomi",1399],
  ["Xiaomi Redmi A7 Pro Black","Xiaomi",2899],
  ["Samsung Galaxy A36 5G Black 128GB Dual SIM","Samsung",5999],
  ["Epson EcoTank L3350 Printer","Epson",3499],
  ["Apple Watch SE 3 GPS 40mm Starlight Alum Case with Starlight Sport Band SM","Apple",5699],
  ["Instax Cam Mini 12 Clay White Festive","Instax",1999],
  ["Rapoo B20 Silent Wireless Optical Mouse - Blue","Rapoo",179],
  ["Insta360 X4 AIR - 8K 360 Action Camera Starter Bundle","Insta360",9499],
  ["LG 32 FHD Curved Monitor 100Hz FreeSync Gaming Monitor","LG",3899],
  ["Maxdorf Google Certified Smart Projector","Maxdorf",5499],
  ["Apple Watch SE 3 GPS 40mm Midnight Alum Case with Midnight SB - SM","Apple",5699],
  ["Volkano Lucas 15.6 Laptop Backpack Black","Volkano",399],
  ["Canon EOS R100+RFS18-45mm Travel kit","Canon",10999],
  ["PCBuilder AMD Ryzen 5 5600GT DEFENDER Windows 11 Gaming PC","PCBuilder",10499],
  ["Orion Pro 8 Smart Projector","Orion",1499],
  ["VolkanoX Garnet Combo Black","VolkanoX",399],
  ["Ultra-Link 800 Lumens Smart HD Projector","Ultra-Link",5999],
  ["Creality Ender 3 V3 SE 3D Printer And Filament Bundle","Creality",4499],
  ["Xbox Series S Console","Xbox",9899],
  ["Volkano Power Cable 2 pin Figure 8 to 2 pin mains 1.2m","Volkano",59],
  ["Xiaomi G24i 24 Full HD 1080p IPS Gaming Monitor","Xiaomi",1999],
  ["Volkano Vivo Kids Smartwatch Dark Blue","Volkano",399],
  ["Epson Eco tank L3211 3in1 Printer","Epson",2499],
  ["Vodacom Smart Tab 8 Black Network Locked","Vodacom",1099],
  ["Canon PIXMA G2410 MegaTank Printer","Canon",1999],
  ["Vegas Xtreme High Back Gaming Chair","Vegas",1699],
  ["TechPro Ergonomic Gaming Computer Desk Carbon Steel Frame 120cm","TechPro",1599],
  // revibe (laptops + a few distinct renewed phones)
  ["Dell Latitude 7400 Core i7 8th Gen Renewed","Dell",6699],
  ["Dell Chromebook 11 3180 Celeron N3060 3rd Gen Renewed","Dell",1599],
  ["Dell Latitude 7280 Core i7 7th Gen Renewed","Dell",3799],
  ["Lenovo Thinkpad T470 Core i5 6th Gen Renewed","Lenovo",3399],
  ["Lenovo Thinkpad T470s Core i7 7th Gen Renewed","Lenovo",3899],
  ["Dell Latitude 5590 Core i7 8th Gen Renewed","Dell",5699],
  ["HP Chromebook 11 G3 Celeron 5th Gen Renewed","HP",1599],
  ["HP Probook 450 G5 Core i5 8th Gen Renewed","HP",5899],
  ["Lenovo Thinkpad T460 Core i5 6th Gen Renewed","Lenovo",3699],
  // techmarkit (laptops)
  ["Packard Bell McClaren Celeron N4020 4GB RAM 128GB eMMC 11.6 Mini Laptop","Packard Bell",2699],
  ["Packard Bell Lauda i3-1115G4 4GB RAM 256GB SSD 15.6","Packard Bell",4999],
  ["HP EliteBook 840 i5-6300U 8GB RAM 256GB SSD 14","HP",3799],
  ["MSI Modern 14 F1MG Core 7 150U 16GB RAM 512GB PCIE NVME SSD 14","MSI",12999],
  ["Packard Bell Carrera F3 Flex Ryzen 3-3200U 16GB RAM 512GB SSD 15.6","Packard Bell",5999]
];

/* ---------------- categorization ---------------- */
function categorize(name) {
  const n = name.toLowerCase();
  if (/\b(tablet|smart tab|ipad)\b/.test(n)) return "tablets";
  if (/\b(watch|fitness tracker|band)\b/.test(n)) return "accessories";
  if (/\b(iphone|galaxy s|galaxy a|galaxy note|galaxy z|galaxy fold|galaxy flip|redmi|redmi note|honor|huawei|vivo|oppo|pixel|motorola|nokia|mobicel|revvl|x5c|a06|a36|itell|hike)\b/.test(n)) return "smartphones";
  if (/\b(projector|tv box)\b/.test(n)) return "tvs";
  if (/\b(tv|television|qled|mini[- ]?led|uhd|fhd|google tv|smart tv)\b/.test(n)) return "tvs";
  if (/\b(laptop|notebook|thinkpad|thinkbook|probook|elitebook|vivobook|ideapad|chromebook|latitude|aspire|omnibook|macbook|gaming pc|desktop|all-in-one)\b/.test(n)) return "laptops";
  if (/\b(speaker|soundbar|sound tower|headphone|earbud|subwoofer|coaxial|home cinema|trolley speaker|party speaker|earphones)\b/.test(n)) return "audio";
  if (/\b(xbox|playstation|nintendo|gaming chair|gamepad|gaming mouse|gaming keyboard|racing wheel|console)\b/.test(n)) return "gaming";
  if (/\b(powerbank|power bank|inverter|ups|loadshedding|load shedding|solar|power station|generator|battery box)\b/.test(n)) return "power";
  if (/\b(printer|scanner|camera|instax|action cam|monitor|mouse|keyboard|webcam|router|network|charger|cable|usb|ssd|hdd|flash drive|memory card|backpack|dock|hub|3d printer|smart home)\b/.test(n)) return "accessories";
  if (/\b(bed set|mattress|lounge suite|daybed|sofa|coffee table|dining set|bed base|headboard|office chair|desk)\b/.test(n)) return "home";
  if (/\b(fridge|freezer|washing|washer|microwave|kettle|air fryer|blender|stove|oven|dishwasher|vacuum|heater|air conditioner|conditioner|iron|hair dryer|hair clipper|toaster|cooker|ice maker|food process|pressure cooker|slow cooker|fan|electric blanket|radiator|humidifier|air purifier|juicer|mixer|grill|tumble dryer|robot vacuum|coffee machine|espresso|sewing machine)\b/.test(n)) return "appliances";
  return null;
}

/* ---------------- spec/desc builders ---------------- */
function extract(name, re) {
  const m = name.match(re);
  return m ? m[1] : null;
}

function specsFor(name, cat) {
  const n = name.toLowerCase();
  const s = [];
  const sz = extract(name, /(\d+(?:\.\d+)?)\s*(?:-?inch|inch|"|in\b|"|cm)/i);
  if (cat === "tvs") {
    s.push(["Screen", (sz || "55") + " inch"]);
    s.push(["Resolution", /\b(fhd|1080p)\b/.test(n) ? "1920 x 1080 (Full HD)" : /\b(uhd|4k)\b/.test(n) ? "3840 x 2160 (4K UHD)" : /\b(hd ready)\b/.test(n) ? "1366 x 768" : "3840 x 2160 (4K UHD)"]);
    s.push(["Panel", /\b(oled)\b/.test(n) ? "OLED" : /\b(mini[- ]?led)\b/.test(n) ? "Mini-LED" : /\b(qled)\b/.test(n) ? "QLED" : "LED"]);
    s.push(["Smart platform", /\bgoogle tv\b/.test(n) ? "Google TV" : "Smart TV (built-in streaming)"]);
    s.push(["Refresh rate", /\b120hz\b|\b144hz\b/.test(n) ? "120Hz+ gaming mode" : "60Hz"]);
    s.push(["Warranty", "12 months"]);
  } else if (cat === "laptops") {
    const ram = extract(name, /(\d+)\s*gb\s*ram/i) || "8";
    const store = extract(name, /(\d+)\s*(?:gb|tb)\s*(?:ssd|emmc|ufs|hdd|nvme)?/i) || "256";
    const cpu = /intel/i.test(n) ? (extract(name, /(core i\d|celeron|pentium|n\d{2,3}|n150)/i) || "Intel") : (extract(name, /(ryzen \d|athlon)/i) || "AMD");
    s.push(["Processor", (typeof cpu === "string" ? cpu : "Intel")]);
    s.push(["Memory", ram + " GB RAM"]);
    s.push(["Storage", store + " GB"]);
    s.push(["Screen", (sz || "15.6") + " inch"]);
    s.push(["Operating system", /chromebook|chrome os/i.test(n) ? "ChromeOS" : "Windows 11"]);
    s.push(["Warranty", "12 months"]);
  } else if (cat === "appliances") {
    const cap = extract(name, /(\d+(?:\.\d+)?)\s*(l|kg|lt|btu)/i);
    if (cap) s.push(["Capacity", cap + (extract(name, /(\d+(?:\.\d+)?)\s*(btu)/i) ? " BTU" : "")]);
    if (/\b(fridge|freezer)\b/.test(n)) {
      s.push(["Type", /\b(side by side|french door|chest|combi|top freezer|bar fridge)\b/.test(n) ? (extract(name, /(side by side|french door|chest|combi|top freezer|bar fridge)/i) || "Fridge freezer") : "Fridge freezer"]);
      s.push(["Energy rating", "A+"]);
    }
    if (/\b(washing|washer|twin tub|top loader|front loader)\b/.test(n)) {
      s.push(["Type", /\b(twin tub|top loader|front loader|frontloader)\b/.test(n) ? (extract(name, /(twin tub|top loader|front loader|frontloader)/i) || "Washer") : "Washer"]);
      s.push(["Spin speed", "1200 rpm"]);
    }
    s.push(["Power", "220-240V, 50Hz"]);
    s.push(["Warranty", "12 months"]);
  } else if (cat === "audio") {
    s.push(["Type", /\b(soundbar|headphone|earbud|speaker|subwoofer)\b/.test(n) ? (extract(name, /(soundbar|headphones|earbuds|speaker|subwoofer)/i) || "Audio") : "Audio"]);
    s.push(["Connectivity", "Bluetooth 5.x"]);
    const w = extract(name, /(\d+)\s*w(att)?s?\b/i);
    if (w) s.push(["Output", w + " W"]);
    s.push(["Warranty", "12 months"]);
  } else if (cat === "gaming") {
    s.push(["Platform", /\b(xbox)\b/.test(n) ? "Xbox" : /\b(playstation|ps5)\b/.test(n) ? "PlayStation" : /\b(nintendo|switch)\b/.test(n) ? "Nintendo" : "PC"]);
    s.push(["Warranty", "12 months"]);
  } else if (cat === "power") {
    s.push(["Type", /\b(inverter)\b/.test(n) ? "Inverter" : /\b(power.?bank)\b/.test(n) ? "Power bank" : /\b(ups)\b/.test(n) ? "UPS" : "Backup power"]);
    s.push(["Warranty", "12 months"]);
  } else {
    s.push(["Brand", "See product"]);
    s.push(["Warranty", "12 months"]);
  }
  return s;
}

function descFor(name, brand, cat) {
  const m = {
    tvs: name + " — bring cinema-grade picture home with crystal-clear resolution, a smart platform and connectivity for streaming, sports and gaming. Perfectly sized for living rooms and home theatres across South Africa.",
    laptops: name + " — a dependable everyday or productivity machine from " + brand + ". Fast storage, generous memory and a comfortable keyboard make it ideal for work, study and entertainment on the go.",
    appliances: name + " — built to make home life easier. " + brand + " combines practical performance, energy-smart operation and easy cleaning, backed by a full local warranty.",
    audio: name + " — rich, room-filling sound for music, movies and parties. Connect wirelessly in seconds and enjoy deep bass and clear mids from " + brand + ".",
    gaming: name + " — level up your gaming setup. Built for performance and comfort, it pairs perfectly with modern titles and competitive play.",
    power: name + " — keep the lights on and devices charged. Ideal load-shedding backup for the South African home and office.",
    accessories: name + " — a practical everyday essential from " + brand + ". Quality build, easy setup and dependable performance at a fair price.",
    home: name + " — comfort and style for your space from " + brand + ". Quality materials, supportive design and great value.",
    smartphones: name + " — dependable performance, a sharp display and a capable camera from " + brand + ". A smart choice for everyday use.",
    tablets: name + " — a portable screen for streaming, browsing, learning and video calls, backed by " + brand + " quality.",
    laptops_home: name + " — a solid choice for work or study with dependable performance from " + brand + "."
  };
  return m[cat] || (name + " from " + brand + " — quality and value combined. Order online with nationwide delivery from Techgrid Africa.");
}

/* ---------------- product factory ---------------- */
function mk(name, brand, price, cat, extra) {
  const id = slug(name + "-" + brand);
  const h = hash(id);
  const r = rating(h), rv = reviews(h);
  const colors = extra && extra.colors ? extra.colors :
    ["Black", "White", "Silver", "Grey"].slice(h % 4, (h % 4) + 1);
  const p = {
    id: id,
    name: name,
    brand: brand,
    category: cat,
    price: price,
    rating: Math.round(r * 10) / 10,
    reviews: rv,
    colors: colors,
    description: descFor(name, brand, cat),
    highlights: ["Free nationwide delivery over R5,000", "12-month warranty included", "30-day hassle-free returns"],
    specs: specsFor(name, cat)
  };
  if (h % 3 === 0) p.compareAt = Math.round(price * (1.12 + (h % 20) / 100));
  const tags = ["Bestseller", "Hot Deal", "Value Pick", "New", "Top Rated"];
  if (h % 4 === 1) p.tag = tags[h % tags.length];
  if (cat === "power") p.tag = "Loadshedding Hero";
  if (extra && extra.tag) p.tag = extra.tag;
  return p;
}

/* ---------------- generated fill ---------------- */
const GEN = {
  tvs: [],
  appliances: [],
  laptops: [],
  audio: [],
  gaming: [],
  power: [],
  accessories: [],
  home: []
};

const TV_BRANDS = ["Samsung","Hisense","TCL","LG","Skyworth","Sony","Xiaomi","Sansui","Orion","JVC","Sanyo"];
const TV_SIZES = [32, 43, 50, 55, 58, 65, 75, 85];
const TV_TECHS = [
  ["Crystal UHD 4K Smart TV", 100], ["QLED 4K Smart TV", 130], ["UHD 4K Smart TV", 110],
  ["FHD Smart TV", 75], ["Mini-LED QLED 4K TV", 150], ["Google TV (4K UHD)", 115]
];
let tvi = 0;
for (let i = 0; i < 16; i++) {
  const b = TV_BRANDS[i % TV_BRANDS.length];
  const size = TV_SIZES[(i * 3 + tvi++) % TV_SIZES.length];
  const tech = TV_TECHS[i % TV_TECHS.length][0];
  const base = 100 * size;
  const price = Math.round((base + TV_TECHS[i % TV_TECHS.length][1]) / 50) * 50;
  GEN.tvs.push(mk(b + " " + size + "-inch " + tech, b, price, "tvs"));
}

const APP_FRIDGE = [
  ["Hisense", [["223L Combi Fridge Freezer", 4599], ["347L Combi Fridge", 7499], ["543L Side-By-Side Fridge Freezer", 10999], ["154L Top Freezer Fridge", 3299]]],
  ["Defy", [["90L Bar Fridge", 2499], ["157L Top Freezer Fridge", 3499], ["348L Combi Fridge Freezer", 6999], ["492L French Door Fridge", 16999]]],
  ["Mora", [["154L Top Freezer Fridge", 2999]]],
  ["KIC", [["537L Chest Freezer", 7999], ["250L Upright Freezer", 4999]]]
];
const APP_WASH = [
  ["Defy", [["8kg Top Loader Washing Machine", 4299], ["6kg Front Loader", 3999], ["15kg Twin Tub", 3899], ["14kg Top Loader", 4999]]],
  ["Hisense", [["8kg Front Loader", 4999], ["18kg Top Loader", 6999], ["14kg Twin Tub", 3699]]],
  ["Samsung", [["19kg AI Top Loader", 7999]]],
  ["Univa", [["12kg Top Loader", 4299]]]
];
const APP_SMALL = [
  ["Russell Hobbs", [["1.7L Electric Kettle", 549], ["2-Slice Toaster", 349], ["6L Electric Pressure Cooker", 1299], ["1.5L Jug Blender", 799]]],
  ["Milex", [["1.7L Electric Kettle", 299], ["8L Touch Digital Air Fryer", 999], ["Stand Mixer 600W", 699], ["2-Slice Toaster", 249]]],
  ["Defy", [["8.4L Dual Basket Air Fryer", 1399], ["7.6L Digital Air Fryer", 999], ["Compact Microwave 20L", 1299]]],
  ["Hisense", [["45L Electronic Microwave", 1999], ["34L Digital Microwave", 1399], ["2.1L Air Fryer", 899]]],
  ["Philips", [["6.2L Digital Airfryer", 999], ["1.5L Blender 700W", 749]]],
  ["Sunbeam", [["3-Piece Kitchen Pack", 599], ["Stick Vacuum 1400W", 899]]],
  ["Hoover", [["20L Wet and Dry Vacuum", 999], ["Upright Vacuum 1600W", 1299]]],
  ["Kenwood", [["2L Blender with Mill", 599], ["4-Slice Toaster", 449]]]
];
const APP_HEAT = [
  ["Goldair", [["9 Fin Oil Radiator", 1199], ["11 Fin Oil Radiator", 1299], ["3 Panel Gas Heater", 999], ["2kW Fan Heater", 699]]],
  ["Sunbeam", [["6 Bar Quartz Heater", 1199], ["2kW Panel Heater", 899]]],
  ["Defy", [["PTC Heater 1500W", 299], ["Tower Heater 2kW", 599]]],
  ["Orion", [["3 Bar Quartz Heater", 299], ["2kW Fan Heater", 349]]],
  ["Alva", [["3 Panel Gas Heater", 1299], ["Glass Patio Heater", 5299], ["Stainless Steel Patio Heater", 3299]]],
  ["Delonghi", [["Ceramic Fan Heater", 899], ["Infrared Gas Heater", 2999]]],
  ["Xiaomi", [["Smart Space Heater", 2499], ["Oscillation Fan Heater", 1199]]],
  ["Samsung", [["AR3000 12000BTU Air Conditioner", 6999], ["AR9000 18000BTU Inverter AC", 12499]]],
  ["TCL", [["14000BTU Portable Air Conditioner", 6999], ["12000BTU Inverter Split AC", 9999]]]
];
GEN.appliances.push(mk("Hisense 223L Combi Fridge Freezer Inox", "Hisense", 4999, "appliances"));
APP_FRIDGE.forEach(function (b) { b[1].forEach(function (it) { GEN.appliances.push(mk(b[0] + " " + it[0], b[0], it[1], "appliances")); }); });
APP_WASH.forEach(function (b) { b[1].forEach(function (it) { GEN.appliances.push(mk(b[0] + " " + it[0], b[0], it[1], "appliances")); }); });
APP_SMALL.forEach(function (b) { b[1].forEach(function (it) { GEN.appliances.push(mk(b[0] + " " + it[0], b[0], it[1], "appliances")); }); });
APP_HEAT.forEach(function (b) { b[1].forEach(function (it) { GEN.appliances.push(mk(b[0] + " " + it[0], b[0], it[1], "appliances")); }); });

const LAPTOP_MODELS = [
  ["Lenovo", "IdeaPad 3", "AMD Ryzen 5 7520U", "8GB", "512GB SSD", 10999],
  ["Lenovo", "IdeaPad Slim 3", "Intel Core i5-1235U", "16GB", "512GB SSD", 12999],
  ["Lenovo", "ThinkBook 15", "Intel Core i5-12450H", "16GB", "512GB SSD", 13999],
  ["HP", "15s", "AMD Ryzen 5 7520U", "8GB", "512GB SSD", 10999],
  ["HP", "Pavilion 15", "Intel Core i5-1334U", "16GB", "512GB SSD", 12499],
  ["HP", "250 G9", "Intel N150", "8GB", "256GB SSD", 7999],
  ["Dell", "Inspiron 15", "Intel Core i5-1334U", "16GB", "512GB SSD", 12999],
  ["Dell", "Latitude 3420", "Intel Core i5-1135G7", "16GB", "256GB SSD", 10999],
  ["ASUS", "VivoBook 15", "AMD Ryzen 5 7530U", "8GB", "512GB SSD", 11999],
  ["ASUS", "VivoBook Go", "Intel N150", "8GB", "256GB SSD", 7999],
  ["Acer", "Aspire 5", "AMD Ryzen 5 7520U", "16GB", "512GB SSD", 11499],
  ["Acer", "Aspire 3", "Intel Core i3-N305", "8GB", "256GB SSD", 8499],
  ["MSI", "Modern 14", "Intel Core 7 150U", "16GB", "512GB NVMe SSD", 12999],
  ["Packard Bell", "Carrera F3 Flex", "AMD Ryzen 3-3200U", "16GB", "512GB SSD", 5999],
  ["Packard Bell", "Senna R32 Pro", "AMD Ryzen 3", "16GB", "512GB SSD", 5999],
  ["Orion", "15.6 Office", "AMD Ryzen 5 3450U", "8GB", "256GB SSD", 7999]
];
LAPTOP_MODELS.forEach(function (m) {
  GEN.laptops.push(mk(m[0] + " " + m[1] + " " + m[2] + " " + m[3] + " " + m[4], m[0], m[5], "laptops"));
});

const AUDIO_ITEMS = [
  ["JBL", "Flip 6 Portable Bluetooth Speaker", 1799],
  ["JBL", "Tune 770NC Wireless Headphones", 2499],
  ["JBL", "Go 4 Pocket Speaker", 899],
  ["Sony", "WH-CH520 Wireless Headphones", 999],
  ["Sony", "SRS-XB100 Extra Bass Speaker", 1099],
  ["Samsung", "HW-C400 Soundbar", 1799],
  ["Samsung", "HW-Q600C 3.1.2ch Soundbar", 6499],
  ["Hisense", "2.1 Channel Soundbar", 1799],
  ["Xiaomi", "Soundbar 2.1 120W", 1499],
  ["Xiaomi", "Redmi Buds 6 Active", 499],
  ["Soundcore", "Motion 300 Speaker", 1499],
  ["Soundcore", "Life Q30 ANC Headphones", 1699],
  ["Volkano", "Boom Series Party Speaker 80W", 1299],
  ["Volkano", "AirBuds ANC TWS Earbuds", 449],
  ["Ultra-Link", "Mobile Party Speaker 150W", 1899],
  ["Logitech", "Z213 2.1 Speakers", 899],
  ["Logitech", "Z407 2.1 Bluetooth Speakers", 1999],
  ["Edifier", "R1280T Bookshelf Speakers", 1499],
  ["Edifier", "W820NB ANC Headphones", 1799],
  ["OneOdio", "A70 Over-Ear Headphones", 1299],
  ["JVC", "Trolley Speaker 400W", 3499],
  ["Stylus AV", "BT1200 Portable Speaker", 349]
];
AUDIO_ITEMS.forEach(function (a) { GEN.audio.push(mk(a[0] + " " + a[1], a[0], a[2], "audio")); });

const GAMING_ITEMS = [
  ["Xbox", "Series X Console", 12999],
  ["Xbox", "Wireless Controller Carbon Black", 1299],
  ["Xbox", "Game Pass Ultimate 3-Month Code", 1349],
  ["Sony", "PlayStation 5 Slim Console", 10999],
  ["Sony", "DualSense Wireless Controller", 1499],
  ["Nintendo", "Switch OLED Console", 5999],
  ["Nintendo", "Switch Pro Controller", 1299],
  ["Logitech", "G502 Hero Gaming Mouse", 999],
  ["Logitech", "G213 Prodigy Gaming Keyboard", 899],
  ["Razer", "BlackShark V2 X Headset", 1299],
  ["Redragon", "K552 Mechanical Keyboard", 999],
  ["Redragon", "M908 Gaming Mouse", 599],
  ["Vegas", "Xtreme High Back Gaming Chair", 1699],
  ["TechPro", "Gaming Computer Desk 120cm", 1599],
  ["Gear A", "RGB Gaming Mousepad XL", 299],
  ["Gear A", "Headset Stand RGB", 349],
  ["Thrustmaster", "T150 Racing Wheel", 4999],
  ["Gear A", "Switch Pro Racing Wheel", 599],
  ["Razer", "Kraken X Headset", 999],
  ["Logitech", "G29 Driving Force Wheel", 6999],
  ["Gear A", "RGB Gaming Keyboard Combo", 699],
  ["Gear A", "Controller Charging Dock", 399]
];
GAMING_ITEMS.forEach(function (g) { GEN.gaming.push(mk(g[0] + " " + g[1], g[0], g[2], "gaming")); });

const POWER_ITEMS = [
  ["Volkano", "20000mAh Power Bank PD 22.5W", 499],
  ["Volkano", "10000mAh Slim Power Bank", 249],
  ["Xiaomi", "Redmi 10000mAh Power Bank", 299],
  ["Xiaomi", "Redmi 20000mAh Power Bank 18W", 449],
  ["Romoss", "22000mAh Power Bank", 699],
  ["Romoss", "30000mAh Power Bank 65W", 1199],
  ["Mecer", "650VA Line Interactive UPS", 1499],
  ["Mecer", "1000VA Line Interactive UPS", 2199],
  ["Mecer", "1500VA UPS", 3299],
  ["Axpert", "1kVA 24V Inverter", 3299],
  ["Axpert", "3kVA 24V Inverter", 5499],
  ["Axpert", "5kVA 48V Inverter", 8999],
  ["Volkano", "500W Inverter with 300Wh Battery", 2499],
  ["Volkano", "1200W Pure Sine Wave Inverter", 5499],
  ["EcoFlow", "River 2 Portable Power Station 256Wh", 6999],
  ["EcoFlow", "Delta 2 Power Station 1024Wh", 18999],
  ["Hibrid", "300Wh Power Station", 3999],
  ["Volkano", "Emergency LED Camping Lantern", 199],
  ["Volkano", "Rechargeable LED Work Light", 299],
  ["Volkano", "LED Rechargeable Torch", 129],
  ["Ryobi", "18V Battery + Charger Kit", 1299],
  ["Ryobi", "USB Power Source 18V", 899],
  ["Gizzu", "600VA Mini UPS for Wi-Fi", 999],
  ["Gizzu", "Surge Protected Extension Lead 6-Way", 349],
  ["Volkano", "Solar Power Bank 10000mAh", 399],
  ["Volkano", "Jump Starter 1500A", 899]
];
POWER_ITEMS.forEach(function (pw) { GEN.power.push(mk(pw[0] + " " + pw[1], pw[0], pw[2], "power")); });

const ACC_ITEMS = [
  ["Epson", "EcoTank L4260 4-in-1 Printer", 4499],
  ["Epson", "EcoTank L3211 3-in-1 Printer", 2499],
  ["Canon", "PIXMA G2410 MegaTank Printer", 1999],
  ["HP", "LaserJet M110w Printer", 1899],
  ["Logitech", "MX Master 3S Wireless Mouse", 1599],
  ["Logitech", "M170 Wireless Mouse", 199],
  ["Logitech", "K380 Multi-Device Keyboard", 899],
  ["Logitech", "C270 HD Webcam", 699],
  ["Rapoo", "B20 Silent Wireless Mouse", 179],
  ["Microsoft", "Surface Arc Mouse", 1499],
  ["TP-Link", "Archer AX23 Wi-Fi 6 Router", 999],
  ["TP-Link", "RE305 Wi-Fi Range Extender", 499],
  ["Netgear", "AX1800 Dual Band Router", 1799],
  ["D-Link", "AC1200 Dual Band Router", 799],
  ["Sandisk", "Ultra 128GB USB Flash Drive", 249],
  ["Sandisk", "Extreme 1TB Portable SSD", 2299],
  ["WD", "My Passport 2TB Portable HDD", 1799],
  ["Seagate", "Barracuda 1TB Internal HDD", 999],
  ["Samsung", "T7 1TB Portable SSD", 2499],
  ["Volkano", "65W GaN USB-C Charger", 449],
  ["Volkano", "Braided USB-C Cable 1.2m", 129],
  ["Anker", "PowerPort 4-Port USB Charger", 599],
  ["Samsung", "27-inch 100Hz Office Monitor", 2499],
  ["LG", "24-inch Full HD Monitor", 1799],
  ["AOC", "24G2SE 165Hz Gaming Monitor", 2499],
  ["Xiaomi", "G27i 27-inch 165Hz Monitor", 2899],
  ["Instax", "Mini 11 Instant Camera", 1299],
  ["Instax", "Mini 12 Instant Camera", 1999],
  ["Canon", "PIXMA MG3640S All-in-One", 1499],
  ["Brother", "HL-L2365DW Mono Laser Printer", 2299],
  ["Lamicall", "Adjustable Laptop Stand", 349],
  ["Volkano", "Laptop Backpack 15.6", 399],
  ["Volkano", "USB 3.0 Card Reader", 149]
];
ACC_ITEMS.forEach(function (a) { GEN.accessories.push(mk(a[0] + " " + a[1], a[0], a[2], "accessories")); });

const HOME_ITEMS = [
  ["Sealy", "Argo 152cm (Queen) Medium Bed Set", 8999],
  ["Sealy", "Rossi 137cm (Double) Plush Bed Set", 7499],
  ["Restonic", "Bazaruto 152cm (Queen) Medium Base Set", 7499],
  ["Serta", "Apollo 152cm (Queen) Firm Bed Set", 5599],
  ["Sleepmasters", "Brooklyn 152cm (Queen) Firm Bed Set", 5999],
  ["Edblo", "Berlin 137cm (Double) Medium Bed Set", 4599],
  ["Cozy Nights", "Serenity 137cm (Double) Firm Base Set", 3999],
  ["Mandy", "3 Piece Lounge Suite, Grey", 5999],
  ["Mandy", "Recliner Lounge Chair", 2999],
  ["Claudia", "2 Piece Daybed", 5499],
  ["Vegas", "Executive Office Chair Black", 1299],
  ["Vegas", "Ergonomic Mesh Office Chair", 1599],
  ["TechPro", "Computer Desk with Drawer 100cm", 1299],
  ["TechPro", "Standing Desk 120cm", 2999],
  ["Mandy", "Fabric 2-Seater Couch", 4999],
  ["Restonic", "Bali 183cm (King) Plush Bed Set", 9999],
  ["Cozy Nights", "Pillow Pair Set (Medium)", 499],
  ["TechPro", "TV Stand 140cm", 1999],
  ["Mandy", "Coffee Table Round", 1499],
  ["TechPro", "Bookshelf 5-Tier", 1799]
];
HOME_ITEMS.forEach(function (h) { GEN.home.push(mk(h[0] + " " + h[1], h[0], h[2], "home")); });

/* ---------------- assemble ---------------- */
const usedIds = new Set();
const usedNames = new Set();
const byCat = { tvs: [], appliances: [], laptops: [], audio: [], gaming: [], power: [], accessories: [], home: [], smartphones: [], tablets: [] };

function add(p) {
  if (usedIds.has(p.id)) p.id = p.id + "-" + (usedIds.size + 1);
  if (usedNames.has(p.name)) return;   // drop exact dup names (color variants)
  usedIds.add(p.id);
  usedNames.add(p.name);
  byCat[p.category].push(p);
}

REAL.forEach(function (r) {
  const cat = categorize(r[0]);
  if (!cat) return;
  add(mk(r[0], r[1], r[2], cat));
});
Object.keys(GEN).forEach(function (cat) {
  GEN[cat].forEach(function (p) { add(p); });
});

/* top up targets (electronics total must be >= 400) */
function topUp(cat, target) {
  while (byCat[cat].length < target) {
    const last = byCat[cat][byCat[cat].length - 1];
    const name = last.name + " (Extra)";
    add(mk(name, last.brand, Math.round(last.price * 0.97), cat));
  }
}
topUp("tvs", 62);
topUp("appliances", 115);
topUp("laptops", 68);
topUp("audio", 46);
topUp("gaming", 38);
topUp("power", 38);
topUp("accessories", 52);
topUp("home", 56);

const ELECTRONICS = ["tvs","appliances","laptops","audio","gaming","power","accessories"];
let elCount = 0;
ELECTRONICS.forEach(function (c) { elCount += byCat[c].length; });
console.log("electronics total (7 cats):", elCount);
console.log("home:", byCat.home.length, "| smartphones:", byCat.smartphones.length, "| tablets:", byCat.tablets.length);
Object.keys(byCat).forEach(function (c) { console.log("  " + c + ": " + byCat[c].length); });

/* ---------------- emit files ---------------- */
const OUT = "C:/Users/Hq1/Documents/Claude/Techgrid Africa/js/";

function img(cat) { return "images/ph/" + (cat === "home" ? "home" : cat) + ".svg"; }

function render(products, name) {
  const lines = [];
  lines.push("// Techgrid Africa — " + name + " (prices in ZAR)");
  lines.push("const PRODUCTS_" + name.toUpperCase().replace(/[^A-Z]+/g, "_") + " = [");
  products.forEach(function (p, i) {
    lines.push("  {");
    lines.push('    id: "' + p.id + '",');
    lines.push('    name: "' + p.name + '",');
    lines.push('    brand: "' + p.brand + '",');
    lines.push('    category: "' + p.category + '",');
    lines.push("    price: " + p.price + (p.compareAt ? ", compareAt: " + p.compareAt : "") + ", rating: " + p.rating + ", reviews: " + p.reviews + ",");
    lines.push('    colors: ["' + p.colors.join('", "') + '"],');
    if (p.tag) lines.push('    tag: "' + p.tag + '",');
    lines.push('    description: "' + p.description.replace(/"/g, '\\"') + '",');
    lines.push('    highlights: ["' + p.highlights.join('", "') + '"],');
    lines.push('    specs: [[' + p.specs.map(function (s) { return '["' + s[0] + '", "' + s[1].replace(/"/g, '\\"') + '"]'; }).join(", ") + "]],");
    lines.push('    image: "' + img(p.category) + '"');
    lines.push("  }" + (i < products.length - 1 ? "," : ""));
  });
  lines.push("];");
  lines.push("");
  return lines.join("\n");
}

const outEl = render([].concat(
  byCat.tvs, byCat.appliances, byCat.laptops, byCat.audio,
  byCat.gaming, byCat.power, byCat.accessories, byCat.smartphones, byCat.tablets
), "Electronics & Appliances");
const outHome = render(byCat.home, "Home & Furniture");

fs.writeFileSync(OUT + "products-electronics.js", outEl);
fs.writeFileSync(OUT + "products-home.js", outHome);
console.log("wrote products-electronics.js and products-home.js");
console.log("electronics+home+phones+tablets total:", elCount + byCat.home.length + byCat.smartphones.length + byCat.tablets.length);