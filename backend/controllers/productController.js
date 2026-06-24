import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const search = req.query.search;
    const sort = req.query.sort || "default";
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : null;
    const inStock = req.query.inStock === "true";

    const filter = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { productID: regex },
      ];
    }

    // Price filter
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    // Stock filter
    if (inStock) {
      filter.stock = { $gt: 0 };
    }

    let query = Product.find(filter);

    // Sorting
    switch (sort) {
      case "price_low_to_high":
        query = query.sort({ price: 1 });
        break;
      case "price_high_to_low":
        query = query.sort({ price: -1 });
        break;
      case "name_a_to_z":
        query = query.sort({ name: 1 });
        break;
      case "name_z_to_a":
        query = query.sort({ name: -1 });
        break;
      case "newest":
        query = query.sort({ createdAt: -1 });
        break;
      default:
        query = query.sort({ _id: -1 });
    }

    const products = await query.exec();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};