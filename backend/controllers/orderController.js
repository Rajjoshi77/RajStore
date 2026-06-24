import Order from "../models/Order.js";
import Razorpay from "razorpay";

// Lazy-load Razorpay to ensure env vars are loaded
let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// Create a new order with payment
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    console.log("createOrder called:", { totalAmount, paymentMethod, itemsCount: items?.length });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // For COD, create order directly without payment
    if (paymentMethod === "cod") {
      const order = new Order({
        user: req.user.id,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "confirmed",
      });

      const savedOrder = await order.save();

      return res.status(201).json({
        message: "Order placed successfully",
        order: savedOrder,
      });
    }

    // For card/upi payments, create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id,
      },
    });

    // Create order in our database with pending payment
    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "card",
      paymentStatus: "pending",
      orderStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      message: "Order created",
      order: savedOrder,
      razorpayOrder: razorpayOrder,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const crypto = await import("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update order status
    const order = await Order.findOne({ razorpayOrderId });
    if (order) {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
    }

    return res.status(200).json({ message: "Payment verified successfully", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("-__v");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Process payment (simulated for demo)
export const processPayment = async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Simulated payment processing
    // In production, integrate with real payment gateway (Stripe, Razorpay, etc.)
    const paymentSuccess = true;

    if (paymentSuccess) {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      await order.save();

      return res.status(200).json({
        message: "Payment successful",
        order,
        transactionId: `TXN_${Date.now()}`,
      });
    } else {
      order.paymentStatus = "failed";
      await order.save();

      return res.status(400).json({
        message: "Payment failed",
        order,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    return res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};