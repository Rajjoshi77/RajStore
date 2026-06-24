import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

// Resolve backend/.env reliably when executing: node seed/seed.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath, override: true });

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in env.");
  console.error("Env path attempted:", envPath);
  process.exit(1);
}

const products = [
  { productID: "P1001", name: "Bag", image: "https://source.unsplash.com/600x600/?bag&sig=1", price: 1000, description: "Premium Bag", stock: 20 },
  { productID: "P1002", name: "Watch", image: "https://source.unsplash.com/600x600/?watch&sig=2", price: 2500, description: "Smart Watch", stock: 10 },
  { productID: "P1003", name: "Laptop", image: "https://source.unsplash.com/600x600/?laptop&sig=3", price: 55000, description: "High Performance Laptop", stock: 8 },
  { productID: "P1004", name: "Headphones", image: "https://source.unsplash.com/600x600/?headphones&sig=4", price: 3000, description: "Wireless Bluetooth Headphones", stock: 25 },
  { productID: "P1005", name: "Keyboard", image: "https://source.unsplash.com/600x600/?keyboard&sig=5", price: 1500, description: "Mechanical Gaming Keyboard", stock: 15 },
  { productID: "P1006", name: "Mouse", image: "https://source.unsplash.com/600x600/?computer-mouse&sig=6", price: 800, description: "Wireless Optical Mouse", stock: 30 },
  { productID: "P1007", name: "Monitor", image: "https://source.unsplash.com/600x600/?monitor&sig=7", price: 12000, description: "24-inch Full HD Monitor", stock: 12 },
  { productID: "P1008", name: "Smartphone", image: "https://source.unsplash.com/600x600/?smartphone&sig=8", price: 35000, description: "Latest Android Smartphone", stock: 18 },
  { productID: "P1009", name: "Tablet", image: "https://source.unsplash.com/600x600/?tablet&sig=9", price: 22000, description: "10-inch Android Tablet", stock: 9 },
  { productID: "P1010", name: "Camera", image: "https://source.unsplash.com/600x600/?camera&sig=10", price: 45000, description: "Professional DSLR Camera", stock: 5 },
  { productID: "P1011", name: "Shoes", image: "https://source.unsplash.com/600x600/?running-shoes&sig=11", price: 2500, description: "Running Shoes", stock: 40 },
  { productID: "P1012", name: "Backpack", image: "https://source.unsplash.com/600x600/?backpack&sig=12", price: 1800, description: "Travel Backpack", stock: 22 },
  { productID: "P1013", name: "Speaker", image: "https://source.unsplash.com/600x600/?speaker&sig=13", price: 3500, description: "Portable Bluetooth Speaker", stock: 17 },
  { productID: "P1014", name: "Gaming Chair", image: "https://source.unsplash.com/600x600/?gaming-chair&sig=14", price: 12000, description: "Ergonomic Gaming Chair", stock: 6 },
  { productID: "P1015", name: "Power Bank", image: "https://source.unsplash.com/600x600/?power-bank&sig=15", price: 1500, description: "20000mAh Power Bank", stock: 28 },
  { productID: "P1016", name: "Printer", image: "https://source.unsplash.com/600x600/?printer&sig=16", price: 9000, description: "All-in-One Printer", stock: 7 },
  { productID: "P1017", name: "Microphone", image: "https://source.unsplash.com/600x600/?microphone&sig=17", price: 4000, description: "USB Condenser Microphone", stock: 14 },
  { productID: "P1018", name: "Webcam", image: "https://source.unsplash.com/600x600/?webcam&sig=18", price: 2800, description: "HD Webcam", stock: 16 },
  { productID: "P1019", name: "SSD", image: "https://source.unsplash.com/600x600/?ssd&sig=19", price: 4500, description: "1TB NVMe SSD", stock: 20 },
  { productID: "P1020", name: "Router", image: "https://source.unsplash.com/600x600/?router&sig=20", price: 3200, description: "Dual Band WiFi Router", stock: 13 },
  { productID: "P1021", name: "Cotton T-Shirt", image: "https://source.unsplash.com/600x600/?tshirt&sig=21", price: 450, description: "Premium Cotton T-Shirt", stock: 50 },
  { productID: "P1022", name: "Jeans", image: "https://source.unsplash.com/600x600/?jeans&sig=22", price: 1200, description: "Classic Blue Jeans", stock: 35 },
  { productID: "P1023", name: "Jacket", image: "https://source.unsplash.com/600x600/?jacket&sig=23", price: 3500, description: "Winter Jacket", stock: 20 },
  { productID: "P1024", name: "Shirt", image: "https://source.unsplash.com/600x600/?shirt&sig=24", price: 800, description: "Formal Shirt", stock: 30 },
  { productID: "P1025", name: "Shorts", image: "https://source.unsplash.com/600x600/?shorts&sig=25", price: 600, description: "Casual Shorts", stock: 45 },
  { productID: "P1026", name: "Sweater", image: "https://source.unsplash.com/600x600/?sweater&sig=26", price: 1500, description: "Wool Sweater", stock: 25 },
  { productID: "P1027", name: "Dress", image: "https://source.unsplash.com/600x600/?dress&sig=27", price: 2500, description: "Evening Dress", stock: 15 },
  { productID: "P1028", name: "Trousers", image: "https://source.unsplash.com/600x600/?trousers&sig=28", price: 1800, description: "Office Trousers", stock: 28 },
  { productID: "P1029", name: "Blazer", image: "https://source.unsplash.com/600x600/?blazer&sig=29", price: 4000, description: "Formal Blazer", stock: 18 },
  { productID: "P1030", name: "Sports Shoes", image: "https://source.unsplash.com/600x600/?sports-shoes&sig=30", price: 3500, description: "Professional Sports Shoes", stock: 38 },
  { productID: "P1031", name: "Sunglasses", image: "https://source.unsplash.com/600x600/?sunglasses&sig=31", price: 1800, description: "UV Protection Sunglasses", stock: 42 },
  { productID: "P1032", name: "Belt", image: "https://source.unsplash.com/600x600/?belt&sig=32", price: 600, description: "Leather Belt", stock: 50 },
  { productID: "P1033", name: "Scarf", image: "https://source.unsplash.com/600x600/?scarf&sig=33", price: 800, description: "Wool Scarf", stock: 35 },
  { productID: "P1034", name: "Hat", image: "https://source.unsplash.com/600x600/?hat&sig=34", price: 700, description: "Baseball Cap", stock: 48 },
  { productID: "P1035", name: "Gloves", image: "https://source.unsplash.com/600x600/?gloves&sig=35", price: 500, description: "Winter Gloves", stock: 55 },
  { productID: "P1036", name: "Wallet", image: "https://source.unsplash.com/600x600/?wallet&sig=36", price: 1000, description: "RFID Wallet", stock: 40 },
  { productID: "P1037", name: "Tie", image: "https://source.unsplash.com/600x600/?tie&sig=37", price: 900, description: "Silk Tie", stock: 32 },
  { productID: "P1038", name: "Ring", image: "https://source.unsplash.com/600x600/?ring&sig=38", price: 2500, description: "Silver Ring", stock: 20 },
  { productID: "P1039", name: "Bracelet", image: "https://source.unsplash.com/600x600/?bracelet&sig=39", price: 1500, description: "Leather Bracelet", stock: 28 },
  { productID: "P1040", name: "Necklace", image: "https://source.unsplash.com/600x600/?necklace&sig=40", price: 2000, description: "Gold Necklace", stock: 18 },
  { productID: "P1041", name: "Pillow", image: "https://source.unsplash.com/600x600/?pillow&sig=41", price: 1200, description: "Memory Foam Pillow", stock: 60 },
  { productID: "P1042", name: "Bed Sheet", image: "https://source.unsplash.com/600x600/?bed-sheet&sig=42", price: 1500, description: "Cotton Bed Sheet", stock: 45 },
  { productID: "P1043", name: "Comforter", image: "https://source.unsplash.com/600x600/?comforter&sig=43", price: 2500, description: "Warm Comforter", stock: 30 },
  { productID: "P1044", name: "Lamp", image: "https://source.unsplash.com/600x600/?lamp&sig=44", price: 1800, description: "LED Desk Lamp", stock: 35 },
  { productID: "P1045", name: "Rug", image: "https://source.unsplash.com/600x600/?rug&sig=45", price: 3000, description: "Wool Area Rug", stock: 22 },
  { productID: "P1046", name: "Curtains", image: "https://source.unsplash.com/600x600/?curtains&sig=46", price: 2000, description: "Blackout Curtains", stock: 28 },
  { productID: "P1047", name: "Mirror", image: "https://source.unsplash.com/600x600/?mirror&sig=47", price: 1500, description: "Decorative Mirror", stock: 32 },
  { productID: "P1048", name: "Picture Frame", image: "https://source.unsplash.com/600x600/?picture-frame&sig=48", price: 800, description: "Wall Picture Frame", stock: 48 },
  { productID: "P1049", name: "Sofa", image: "https://source.unsplash.com/600x600/?sofa&sig=49", price: 35000, description: "Modern Sofa Set", stock: 8 },
  { productID: "P1050", name: "Dining Table", image: "https://source.unsplash.com/600x600/?dining-table&sig=50", price: 25000, description: "Wooden Dining Table", stock: 10 },
  { productID: "P1051", name: "Knife Set", image: "https://source.unsplash.com/600x600/?knife-set&sig=51", price: 2500, description: "Stainless Steel Knife Set", stock: 25 },
  { productID: "P1052", name: "Cookware Set", image: "https://source.unsplash.com/600x600/?cookware-set&sig=52", price: 4500, description: "Non-stick Cookware Set", stock: 18 },
  { productID: "P1053", name: "Blender", image: "https://source.unsplash.com/600x600/?blender&sig=53", price: 2000, description: "High Power Blender", stock: 22 },
  { productID: "P1054", name: "Microwave", image: "https://source.unsplash.com/600x600/?microwave&sig=54", price: 6000, description: "Convection Microwave", stock: 15 },
  { productID: "P1055", name: "Toaster", image: "https://source.unsplash.com/600x600/?toaster&sig=55", price: 1200, description: "Automatic Toaster", stock: 30 },
  { productID: "P1056", name: "Coffee Maker", image: "https://source.unsplash.com/600x600/?coffee-maker&sig=56", price: 3500, description: "Digital Coffee Maker", stock: 20 },
  { productID: "P1057", name: "Tea Kettle", image: "https://source.unsplash.com/600x600/?tea-kettle&sig=57", price: 900, description: "Electric Tea Kettle", stock: 35 },
  { productID: "P1058", name: "Dishwasher", image: "https://source.unsplash.com/600x600/?dishwasher&sig=58", price: 25000, description: "Automatic Dishwasher", stock: 8 },
  { productID: "P1059", name: "Dinner Set", image: "https://source.unsplash.com/600x600/?dinner-set&sig=59", price: 2500, description: "12-Piece Dinner Set", stock: 28 },
  { productID: "P1060", name: "Glasses Set", image: "https://source.unsplash.com/600x600/?glass-set&sig=60", price: 1500, description: "Crystal Glass Set", stock: 40 },
  { productID: "P1061", name: "Yoga Mat", image: "https://source.unsplash.com/600x600/?yoga-mat&sig=61", price: 800, description: "Non-slip Yoga Mat", stock: 50 },
  { productID: "P1062", name: "Dumbbells", image: "https://source.unsplash.com/600x600/?dumbbells&sig=62", price: 2000, description: "5kg Dumbbell Pair", stock: 35 },
  { productID: "P1063", name: "Treadmill", image: "https://source.unsplash.com/600x600/?treadmill&sig=63", price: 35000, description: "Motorized Treadmill", stock: 5 },
  { productID: "P1064", name: "Bicycle", image: "https://source.unsplash.com/600x600/?bicycle&sig=64", price: 12000, description: "Mountain Bicycle", stock: 12 },
  { productID: "P1065", name: "Skateboard", image: "https://source.unsplash.com/600x600/?skateboard&sig=65", price: 3000, description: "Professional Skateboard", stock: 20 },
  { productID: "P1066", name: "Roller Skates", image: "https://source.unsplash.com/600x600/?roller-skates&sig=66", price: 2500, description: "Adjustable Roller Skates", stock: 18 },
  { productID: "P1067", name: "Sports Bag", image: "https://source.unsplash.com/600x600/?sports-bag&sig=67", price: 1500, description: "Gym Sports Bag", stock: 32 },
  { productID: "P1068", name: "Water Bottle", image: "https://source.unsplash.com/600x600/?water-bottle&sig=68", price: 600, description: "Insulated Water Bottle", stock: 60 },
  { productID: "P1069", name: "Cricket Bat", image: "https://source.unsplash.com/600x600/?cricket-bat&sig=69", price: 2500, description: "Professional Cricket Bat", stock: 22 },
  { productID: "P1070", name: "Tennis Racket", image: "https://source.unsplash.com/600x600/?tennis-racket&sig=70", price: 3500, description: "Graphite Tennis Racket", stock: 16 },
  { productID: "P1071", name: "Fiction Book", image: "https://source.unsplash.com/600x600/?fiction-book&sig=71", price: 400, description: "Best Selling Novel", stock: 100 },
  { productID: "P1072", name: "Programming Book", image: "https://source.unsplash.com/600x600/?programming-book&sig=72", price: 800, description: "Python Programming Guide", stock: 45 },
  { productID: "P1073", name: "Self-Help Book", image: "https://source.unsplash.com/600x600/?self-help-book&sig=73", price: 500, description: "Personal Development Book", stock: 55 },
  { productID: "P1074", name: "Comic Book", image: "https://source.unsplash.com/600x600/?comic-book&sig=74", price: 300, description: "Marvel Comic Series", stock: 80 },
  { productID: "P1075", name: "Magazine", image: "https://source.unsplash.com/600x600/?magazine&sig=75", price: 200, description: "Technology Magazine", stock: 120 },
  { productID: "P1076", name: "Face Cream", image: "https://source.unsplash.com/600x600/?face-cream&sig=76", price: 600, description: "Anti-aging Face Cream", stock: 70 },
  { productID: "P1077", name: "Shampoo", image: "https://source.unsplash.com/600x600/?shampoo&sig=77", price: 400, description: "Herbal Shampoo", stock: 85 },
  { productID: "P1078", name: "Conditioner", image: "https://source.unsplash.com/600x600/?conditioner&sig=78", price: 400, description: "Moisturizing Conditioner", stock: 80 },
  { productID: "P1079", name: "Body Lotion", image: "https://source.unsplash.com/600x600/?body-lotion&sig=79", price: 500, description: "Aloe Vera Body Lotion", stock: 75 },
  { productID: "P1080", name: "Toothbrush", image: "https://source.unsplash.com/600x600/?toothbrush&sig=80", price: 200, description: "Electric Toothbrush", stock: 100 },
  { productID: "P1081", name: "Perfume", image: "https://source.unsplash.com/600x600/?perfume&sig=81", price: 1500, description: "Premium Fragrance", stock: 40 },
  { productID: "P1082", name: "Deodorant", image: "https://source.unsplash.com/600x600/?deodorant&sig=82", price: 300, description: "24-hour Deodorant", stock: 90 },
  { productID: "P1083", name: "Soap Bar", image: "https://source.unsplash.com/600x600/?soap-bar&sig=83", price: 200, description: "Natural Soap Bar", stock: 150 },
  { productID: "P1084", name: "Hair Oil", image: "https://source.unsplash.com/600x600/?hair-oil&sig=84", price: 300, description: "Coconut Hair Oil", stock: 65 },
  { productID: "P1085", name: "Face Mask", image: "https://source.unsplash.com/600x600/?face-mask&sig=85", price: 400, description: "Mud Face Mask", stock: 55 },
  { productID: "P1086", name: "Gaming Console", image: "https://source.unsplash.com/600x600/?gaming-console&sig=86", price: 30000, description: "Latest Gaming Console", stock: 10 },
  { productID: "P1087", name: "Gaming Controller", image: "https://source.unsplash.com/600x600/?gaming-controller&sig=87", price: 2500, description: "Wireless Gaming Controller", stock: 28 },
  { productID: "P1088", name: "Graphics Card", image: "https://source.unsplash.com/600x600/?graphics-card&sig=88", price: 25000, description: "High-end Graphics Card", stock: 6 },
  { productID: "P1089", name: "Motherboard", image: "https://source.unsplash.com/600x600/?motherboard&sig=89", price: 12000, description: "Gaming Motherboard", stock: 12 },
  { productID: "P1090", name: "RAM Memory", image: "https://source.unsplash.com/600x600/?ram-memory&sig=90", price: 3500, description: "16GB DDR4 RAM", stock: 24 },
  { productID: "P1091", name: "Power Supply", image: "https://source.unsplash.com/600x600/?power-supply&sig=91", price: 4000, description: "1000W Power Supply", stock: 18 },
  { productID: "P1092", name: "USB Hub", image: "https://source.unsplash.com/600x600/?usb-hub&sig=92", price: 800, description: "7-Port USB 3.0 Hub", stock: 35 },
  { productID: "P1093", name: "HDMI Cable", image: "https://source.unsplash.com/600x600/?hdmi-cable&sig=93", price: 300, description: "2m HDMI 2.0 Cable", stock: 60 },
  { productID: "P1094", name: "Phone Charger", image: "https://source.unsplash.com/600x600/?phone-charger&sig=94", price: 600, description: "Fast Charging Phone Charger", stock: 50 },
  { productID: "P1095", name: "Phone Case", image: "https://source.unsplash.com/600x600/?phone-case&sig=95", price: 400, description: "Protective Phone Case", stock: 80 },
  { productID: "P1096", name: "Board Game", image: "https://source.unsplash.com/600x600/?board-game&sig=96", price: 1200, description: "Strategy Board Game", stock: 40 },
  { productID: "P1097", name: "Puzzle", image: "https://source.unsplash.com/600x600/?puzzle&sig=97", price: 600, description: "1000-Piece Jigsaw Puzzle", stock: 50 },
  { productID: "P1098", name: "Action Figure", image: "https://source.unsplash.com/600x600/?action-figure&sig=98", price: 800, description: "Collectible Action Figure", stock: 45 },
  { productID: "P1099", name: "Lego Set", image: "https://source.unsplash.com/600x600/?lego-set&sig=99", price: 2000, description: "Premium Lego Set", stock: 30 },
  { productID: "P1100", name: "Doll", image: "https://source.unsplash.com/600x600/?doll&sig=100", price: 1500, description: "Interactive Doll", stock: 35 },
  { productID: "P1101", name: "Fitness Tracker", image: "https://source.unsplash.com/600x600/?fitness-tracker&sig=101", price: 4500, description: "Activity and Heart Rate Tracker", stock: 26 },
  { productID: "P1102", name: "Road Bike", image: "https://source.unsplash.com/600x600/?road-bike&sig=102", price: 22000, description: "Lightweight Road Bike", stock: 9 },
  { productID: "P1103", name: "Camping Tent", image: "https://source.unsplash.com/600x600/?camping-tent&sig=103", price: 8000, description: "4-Person Camping Tent", stock: 14 },
  { productID: "P1104", name: "Sleeping Bag", image: "https://source.unsplash.com/600x600/?sleeping-bag&sig=104", price: 2500, description: "All-Weather Sleeping Bag", stock: 25 },
  { productID: "P1105", name: "Fishing Rod", image: "https://source.unsplash.com/600x600/?fishing-rod&sig=105", price: 3200, description: "Carbon Fiber Fishing Rod", stock: 18 },
  { productID: "P1106", name: "Hiking Boots", image: "https://source.unsplash.com/600x600/?hiking-boots&sig=106", price: 5000, description: "Waterproof Hiking Boots", stock: 22 },
  { productID: "P1107", name: "Golf Clubs", image: "https://source.unsplash.com/600x600/?golf-clubs&sig=107", price: 15000, description: "Complete Golf Club Set", stock: 8 },
  { productID: "P1108", name: "Yoga Block", image: "https://source.unsplash.com/600x600/?yoga-block&sig=108", price: 700, description: "Non-slip Yoga Block", stock: 45 },
  { productID: "P1109", name: "Protein Powder", image: "https://source.unsplash.com/600x600/?protein-powder&sig=109", price: 1800, description: "Whey Protein Supplement", stock: 50 },
  { productID: "P1110", name: "Camping Lantern", image: "https://source.unsplash.com/600x600/?camping-lantern&sig=110", price: 1200, description: "Rechargeable Camping Lantern", stock: 29 },
  { productID: "P1111", name: "Portable Grill", image: "https://source.unsplash.com/600x600/?portable-grill&sig=111", price: 4500, description: "Compact BBQ Grill", stock: 16 },
  { productID: "P1112", name: "Garden Hose", image: "https://source.unsplash.com/600x600/?garden-hose&sig=112", price: 800, description: "Flexible Garden Hose", stock: 40 },
  { productID: "P1113", name: "Planter", image: "https://source.unsplash.com/600x600/?planter&sig=113", price: 900, description: "Indoor Plant Planter", stock: 34 },
  { productID: "P1114", name: "Lawn Mower", image: "https://source.unsplash.com/600x600/?lawn-mower&sig=114", price: 18000, description: "Electric Lawn Mower", stock: 6 },
  { productID: "P1115", name: "Skincare Set", image: "https://source.unsplash.com/600x600/?skincare-set&sig=115", price: 2200, description: "Daily Skincare Routine Set", stock: 30 },
  { productID: "P1116", name: "Makeup Mirror", image: "https://source.unsplash.com/600x600/?makeup-mirror&sig=116", price: 1600, description: "LED Makeup Mirror", stock: 32 },
  { productID: "P1117", name: "Scented Candle", image: "https://source.unsplash.com/600x600/?scented-candle&sig=117", price: 700, description: "Aromatherapy Scented Candle", stock: 50 },
  { productID: "P1118", name: "Hair Straightener", image: "https://source.unsplash.com/600x600/?hair-straightener&sig=118", price: 3200, description: "Ceramic Hair Straightener", stock: 24 },
  { productID: "P1119", name: "Nail Polish", image: "https://source.unsplash.com/600x600/?nail-polish&sig=119", price: 350, description: "Long-lasting Nail Polish", stock: 70 },
  { productID: "P1120", name: "Shaving Kit", image: "https://source.unsplash.com/600x600/?shaving-kit&sig=120", price: 1200, description: "Men's Shaving Kit", stock: 40 },
];

const IMAGE_BASE = "https://loremflickr.com/600/600";

function getImageUrl(product) {
  const query = product.name
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return `${IMAGE_BASE}/${encodeURIComponent(query)}?lock=${product.productID.replace(/\D/g, "")}`;
}

products.forEach((product) => {
  product.image = getImageUrl(product);
});

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");

  // Idempotent upsert by unique productID
  const ops = products.map((p) => {
    const { productID, ...rest } = p;
    return Product.updateOne(
      { productID },
      { $set: rest },
      { upsert: true }
    );
  });

  try {
    const result = await Promise.all(ops);
    console.log(`Seed complete: ${result.length} products processed`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  }
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
