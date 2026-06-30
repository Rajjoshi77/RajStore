import express from "express";
import { login, register, sendUpdateOtp, updateProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-update-otp", requireAuth, sendUpdateOtp);
router.put("/update-profile", requireAuth, updateProfile);

export default router;
