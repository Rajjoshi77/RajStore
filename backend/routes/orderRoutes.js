import express from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  processPayment,
  verifyPayment,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// Get all orders (Admin only)
router.get("/", requireAuth, requireAdmin, getAllOrders);

// Update order status (Admin only)
router.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

// Create order with payment
router.post("/checkout", requireAuth, createOrder);

// Verify payment
router.post("/verify-payment", requireAuth, verifyPayment);

// Get user's orders
router.get("/my-orders", requireAuth, getUserOrders);

// Get order by ID
router.get("/:id", requireAuth, getOrderById);

// Process payment
router.post("/payment", requireAuth, processPayment);

export default router;

