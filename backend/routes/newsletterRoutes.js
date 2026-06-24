import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // In a real app, you'd save this to a database or send to an email service
    console.log(`Newsletter subscription: ${email}`);
    res.json({ message: "Subscribed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Subscription failed" });
  }
});

export default router;
