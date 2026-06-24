import Product from "../models/Product.js";

const normalize = (s) => (s || "").toString().toLowerCase().trim();
const extractPriceRange = (text) => {
  const t = normalize(text);

  const underMatch = t.match(/(?:under|below|less than|upto|up to)\s*(\d+)/i);
  if (underMatch) return { min: null, max: Number(underMatch[1]) };

  const overMatch = t.match(/(?:over|above|more than)\s*(\d+)/i);
  if (overMatch) return { min: Number(overMatch[1]), max: null };

  const betweenMatch = t.match(/between\s*(\d+)\s*(?:and|to)\s*(\d+)/i);
  if (betweenMatch) return { min: Number(betweenMatch[1]), max: Number(betweenMatch[2]) };

  const cheapest = /cheapest|lowest price|lowest/i.test(t);
  if (cheapest) return { min: null, max: null };

  return { min: null, max: null };
};

const addPriceFilter = (filter, min, max) => {
  if (min === null && max === null) return filter;
  const priceClause = {};
  if (min !== null) priceClause.$gte = min;
  if (max !== null) priceClause.$lte = max;
  if (!Object.keys(filter).length) return { price: priceClause };
  return { $and: [filter, { price: priceClause }] };
};

const detectIntent = (text) => {
  const t = normalize(text);

  if (!t) return "unknown";

  if (/in stock|available|stock/i.test(t)) return "stock";
  if (/recommend|suggest|gift/i.test(t)) return "recommend";
  if (/under|below|less than|between|cheapest|lowest|over|above|more than|up to|upto/i.test(t)) return "price";
  if (/about|details|spec|specification|tell me about|features|description/i.test(t)) return "details";
  if (/category|fashion|electronics|home|kitchen|accessories|sports|beauty|books|mobile|phones|audio|wearables|camera|gaming|toy|toys/i.test(t)) return "category";

  if (/show|find|list|options|i want/i.test(t)) return "search";

  return "search";
};

const detectCategory = (text) => {
  const t = normalize(text);

  if (/laptop|keyboard|mouse|monitor|pc|computer|ssd|printer/.test(t)) return "Computers";
  if (/phone|smartphone|tablet|mobile/.test(t)) return "Mobile";
  if (/headphone|speaker|microphone|webcam|audio/.test(t)) return "Audio";
  if (/watch|wearable/.test(t)) return "Wearables";
  if (/bag|wallet|accessor|belt|sunglass|jacket|jeans|t-shirt|tshirt/.test(t)) return "Accessories";
  if (/camera/.test(t)) return "Camera";
  if (/gaming/.test(t)) return "Gaming";
  if (/toy|lego|puzzle|doll|action figure|board game/i.test(t)) return "Toys";
  if (/sport|gym|yoga|cricket|tennis|skateboard|roller skate|bicycle/i.test(t)) return "Sports";
  if (/sofa|pillow|home|rug|mirror|curtains|bed|dining|table/.test(t)) return "Home";
  if (/blender|coffee|kitchen|cookware|microwave|toaster|tea kettle|dishwasher|dinner set|glasses/.test(t)) return "Kitchen";
  if (/book|novel|programming/.test(t)) return "Books";
  if (/face|cream|perfume|beauty|shampoo|conditioner|lotion|soap|deodorant|hair oil|mask/.test(t)) return "Beauty";
  if (/fashion|t-shirt|jeans|jacket/.test(t)) return "Fashion";
  if (/electronics/.test(t)) return "Electronics";

  return null;
};

const buildCategoryFilter = (category) => {
  if (!category) return {};

  // Use keyword filters over name/description/productID
  // (Since your schema doesn’t have a dedicated category field.)
  switch (category) {
    case "Computers":
      return { $or: [{ name: /laptop|monitor|keyboard|mouse|graphics card/i }, { description: /laptop|monitor|keyboard|mouse|graphics card/i }] };
    case "Mobile":
      return { $or: [{ name: /phone|smartphone|tablet/i }, { description: /phone|smartphone|tablet/i }] };
    case "Audio":
      return { $or: [{ name: /headphones|speaker|microphone/i }, { description: /headphones|speaker|microphone/i }] };
    case "Wearables":
      return { $or: [{ name: /watch/i }, { description: /watch/i }] };
    case "Camera":
      return { $or: [{ name: /camera/i }, { description: /camera/i }] };
    case "Kitchen":
      return {
        $or: [
          { name: /blender|coffee maker|microwave|toaster|tea kettle|dishwasher|dinner set|glasses/i },
          { description: /blender|coffee maker|microwave|toaster|tea kettle|dishwasher|dinner set|glasses/i },
        ],
      };
    case "Home":
      return {
        $or: [
          { name: /sofa|pillow|rug|mirror|curtains|bed|dining table/i },
          { description: /sofa|pillow|rug|mirror|curtains|bed|dining table/i },
        ],
      };
    case "Books":
      return {
        $or: [
          { name: /book|novel|programming/i },
          { description: /book|novel|programming/i },
        ],
      };
    case "Beauty":
      return {
        $or: [
          { name: /face cream|perfume|shampoo|conditioner|lotion|soap|deodorant|hair oil|mask/i },
          { description: /face cream|perfume|shampoo|conditioner|lotion|soap|deodorant|hair oil|mask/i },
        ],
      };
    case "Fashion":
      return {
        $or: [
          { name: /t-shirt|jeans|jacket|dress|trousers|shoes/i },
          { description: /t-shirt|jeans|jacket|dress|trousers|shoes/i },
        ],
      };
    case "Gaming":
      return {
        $or: [
          { name: /gaming|console|cricket bat|tennis racket|skateboard|roller skate/i },
          { description: /gaming|console|cricket bat|tennis racket|skateboard|roller skate/i },
        ],
      };
    case "Accessories":
      return {
        $or: [
          { name: /bag|wallet|sunglasses|belt|scarf|hat|gloves|tie|ring|bracelet|necklace/i },
          { description: /bag|wallet|sunglasses|belt|scarf|hat|gloves|tie|ring|bracelet|necklace/i },
        ],
      };
    case "Toys":
      return {
        $or: [
          { name: /board game|puzzle|action figure|lego|doll/i },
          { description: /board game|puzzle|action figure|lego|doll/i },
        ],
      };
    case "Sports":
      return {
        $or: [
          { name: /yoga mat|dumbbell|treadmill|bicycle|skateboard|roller skate|cricket bat|tennis racket/i },
          { description: /yoga mat|dumbbell|treadmill|bicycle|skateboard|roller skate|cricket bat|tennis racket/i },
        ],
      };
    case "Electronics":
      return {
        $or: [
          { name: /laptop|phone|gaming console|graphics card|camera|monitor/i },
          { description: /laptop|phone|gaming console|graphics card|camera|monitor/i },
        ],
      };
    default:
      return {};
  }
};

const formatINR = (n) => {
  if (typeof n !== "number") return "";
  return `₹${n.toLocaleString("en-IN")}`;
};

const makeProductCard = (p) => ({
  productID: p.productID,
  name: p.name,
  image: p.image,
  price: p.price,
  stock: p.stock,
  description: p.description,
});

// ---------- “AI” helper (optional) ----------
// Note: A truly “free + high quality” hosted LLM is not reliable without a provider key.
// This helper never invents products; it only rewrites the already-computed replyText
// to be clearer while referencing ONLY provided products.
async function callAI(userMessage, products = [], intent, computedReplyText) {
  try {
    // If you don’t have any AI key configured, just return computed reply.
    const hfKey = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // If no free/hosted key available, no rewrite.
    if (!hfKey && !openRouterKey) return computedReplyText;

    // We keep this intentionally simple and safe.
    const shortList = (products || []).slice(0, 6).map((p) => ({
      name: p.name,
      price: p.price,
      stock: p.stock,
      productID: p.productID,
    }));

    const safeProductText = shortList.length
      ? shortList
          .map((p) => {
            const price = typeof p.price === "number" ? `₹${p.price}` : "Price N/A";
            const stock = typeof p.stock === "number" ? (p.stock > 0 ? `In stock (${p.stock})` : "Out of stock") : "Stock N/A";
            return `${p.name} | ${price} | ${stock}`;
          })
          .join("; ")
      : "No product results were returned.";

    const system = "You are a careful shopping assistant. You must not invent products. If products are provided, only reference those products by name. Keep replies short and relevant (max 3 sentences).";

    const user = `Question: ${userMessage}\nDetected intent: ${intent}\nComputed reply (must be preserved in meaning): ${computedReplyText}\nProducts available: ${safeProductText}\nNow rewrite the reply to be clearer, still answering the question. Do not add new products.`;

    // Prefer OpenRouter if available (often compatible with free-tier offers), but still optional.
    if (openRouterKey) {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Small model to reduce cost; change if needed
          model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.2,
          max_tokens: 160,
        }),
      });

      if (!resp.ok) return computedReplyText;
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      return typeof content === "string" && content.trim() ? content.trim() : computedReplyText;
    }

    // Fallback to Hugging Face Blenderbot if HF key exists.
    const prompt = `${system}\n\n${user}`;

    const resp = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!resp.ok) return computedReplyText;
    const data = await resp.json();

    if (Array.isArray(data) && data[0] && data[0].generated_text) return data[0].generated_text.trim() || computedReplyText;
    if (data.generated_text) return String(data.generated_text).trim() || computedReplyText;
    if (typeof data === "string") return data.trim() || computedReplyText;

    return computedReplyText;
  } catch {
    return computedReplyText;
  }
}
// ---------- Controller ----------
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const intent = detectIntent(message);

    if (!message || !normalize(message)) {
      return res.status(400).json({ replyText: "Please type a message to search products." });
    }

    const t = normalize(message);

    // Stock intent
    if (intent === "stock") {
      const inStockOnly = /in stock|available/i.test(t);

      const filter = inStockOnly ? { stock: { $gt: 0 } } : {};

      const products = await Product.find(filter)
        .sort({ stock: -1, createdAt: -1 })
        .limit(6)
        .select("productID name image price description stock");

      if (!products.length) {
        return res.json({
          replyText: "I couldn’t find any products matching that stock request.",
          products: [],
        });
      }

      const top = products[0];
      const replyText = inStockOnly
        ? `These look available right now. Top pick: ${top.name} (${formatINR(top.price)}).`
        : `Here are some products and their current stock status.`;

      // Optional rewrite to make reply clearer. Never invent products.
      const aiReply = await callAI(message, products.map(makeProductCard), intent, replyText);
      return res.json({ replyText: aiReply || replyText, products: products.map(makeProductCard) });
    }

    // Price intent
    if (intent === "price") {
      const { min, max } = extractPriceRange(message);
      const isCheapest = /cheapest|lowest price|lowest/i.test(t);

      const filter = {};
      if (max !== null) filter.price = { ...(filter.price || {}), $lte: max };
      if (min !== null) filter.price = { ...(filter.price || {}), $gte: min };

      const query = Product.find(filter).select("productID name image price description stock");

      if (isCheapest) {
        query.sort({ price: 1 }).limit(6);
      } else if (max !== null && min !== null) {
        query.sort({ price: 1 }).limit(6);
      } else {
        // under/below/less than
        query.sort({ price: 1 }).limit(6);
      }

      const products = await query.exec();

      if (!products.length) {
        return res.json({ replyText: "I couldn’t find products in that price range.", products: [] });
      }

      let replyText = "I found some options";
      if (max !== null) replyText += ` under ${formatINR(max)}:`;
      else if (isCheapest) replyText += ` — here are the cheapest options:`;
      else replyText += ":";

      // Add a short qualitative hint
      const cheapest = products.reduce((a, b) => (a.price < b.price ? a : b));
      replyText += ` Best value: ${cheapest.name} (${formatINR(cheapest.price)}).`;

      const aiReply = await callAI(message, products.map(makeProductCard), intent, replyText);
      return res.json({ replyText: aiReply || replyText, products: products.map(makeProductCard) });
    }

    // Category intent
    if (intent === "category") {
      const category = detectCategory(message);
      const { min, max } = extractPriceRange(message);
      const filter = addPriceFilter(buildCategoryFilter(category), min, max);

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .limit(6)
        .select("productID name image price description stock");

      const label = category || "that category";
      if (!products.length) {
        return res.json({ replyText: `I couldn’t find ${label} products right now.`, products: [] });
      }

      const aiReply = await callAI(message, products.map(makeProductCard));
      return res.json({
        replyText: aiReply || `Here are some ${label} options:`,
        products: products.map(makeProductCard),
      });
    }

    // Recommendations
    if (intent === "recommend") {
      const category = detectCategory(message);
      const { min, max } = extractPriceRange(message);
      const filter = addPriceFilter(buildCategoryFilter(category), min, max);

      const products = await Product.find(filter)
        .sort({ stock: -1, price: 1 })
        .limit(6)
        .select("productID name image price description stock");

      if (!products.length) {
        return res.json({ replyText: "I couldn’t find matching recommendations right now.", products: [] });
      }

      const replyText = `I picked these recommendations based on your request. Want value, quality, or portability?`;
      const aiReply = await callAI(message, products.map(makeProductCard), intent, replyText);
      return res.json({ replyText: aiReply || replyText, products: products.map(makeProductCard) });
    }

    // Details intent
    if (intent === "details") {
      const productNameMatch = message.match(/(laptop|headphones|watch|bag|wallet|sofa|pillow|blender|camera|console|graphics card|keyboard|mouse|treadmill|cricket bat|perfume|face cream|gaming console|jeans|jacket|t-shirt|tablet|speaker|phone|microwave|toaster|charger|necklace|ring|bracelet|book|shoes|scarf|hat|doll|puzzle)/i);
      const keyword = productNameMatch ? productNameMatch[0] : message;

      const regex = new RegExp(keyword.toLowerCase(), "i");
      const product = await Product.findOne({ $or: [{ name: regex }, { description: regex }, { productID: regex }] })
        .select("productID name image price description stock")
        .sort({ createdAt: -1 });

      if (!product) {
        return res.json({
          replyText: "I couldn’t find that product for details. Try asking like ‘Tell me about the laptop’.",
          products: [],
        });
      }

      const replyText = `${product.name} — ${formatINR(product.price)}. ${product.description || ""} Stock: ${product.stock}.`;
      const aiReply = await callAI(message, [makeProductCard(product)]);
      return res.json({ replyText: aiReply || replyText, products: [makeProductCard(product)] });
    }

    // Default search intent
    {
      const parts = t.split(/\s+/).filter(Boolean);
      const cleanedParts = parts.filter((word) => !/^(under|below|less|between|cheapest|lowest|over|above|more|than|up|to|upto|\d+)$/i.test(word));
      const queryStr = cleanedParts.length ? cleanedParts.slice(0, 6).join(" ") : parts.slice(0, 6).join(" ");
      const regex = new RegExp(queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      let products = await Product.find({
        $or: [
          { name: regex },
          { description: regex },
          { productID: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("productID name image price description stock");

      if (!products.length && cleanedParts.length) {
        const broadRegex = new RegExp(cleanedParts.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
        products = await Product.find({
          $or: [
            { name: broadRegex },
            { description: broadRegex },
            { productID: broadRegex },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .select("productID name image price description stock");
      }

      if (!products.length) {
        return res.json({
          replyText: "I couldn’t find exact matches. Try ‘show laptops’, ‘headphones under 4000’, or ‘available products’.",
          products: [],
        });
      }

      const replyText = `I found these matches:`;
      const aiReply = await callAI(message, products.map(makeProductCard));
      return res.json({ replyText: aiReply || replyText, products: products.map(makeProductCard) });
    }
  } catch (err) {
    return res.status(500).json({ replyText: "Chatbot failed to respond. Please try again.", error: err.message });
  }
};

