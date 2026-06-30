import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

import User from "../models/User.js";
const signToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  return jwt.sign(payload, secret, { expiresIn });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: req.body.role || "user",
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendUpdateOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const email = user.email;
    const name = user.name;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const sendgridFrom = process.env.SENDGRID_FROM;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const emailSubject = "Security Verification: OTP for Profile Update";
    const emailText = `Hello ${name},\n\nYour OTP for updating your profile is: ${otp}.\nThis OTP is valid for 10 minutes.\n\nIf you did not request this update, please secure your account.`;
    const emailHtml = `<p>Hello <strong>${name}</strong>,</p>
                       <p>Your OTP for updating your profile is: <strong style="font-size: 1.2em; color: #007bff;">${otp}</strong>.</p>
                       <p>This OTP is valid for 10 minutes.</p>
                       <p>If you did not request this update, please ignore this email or secure your account.</p>`;

    let sent = false;

    if (sendgridKey && sendgridFrom) {
      try {
        sgMail.setApiKey(sendgridKey);
        const msg = {
          to: email,
          from: sendgridFrom,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        };
        await sgMail.send(msg);
        console.log(`OTP sent to ${email} via SendGrid`);
        sent = true;
      } catch (err) {
        console.error("SendGrid send error inside authController:", err?.response?.body || err);
      }
    }

    if (!sent && smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(smtpPort),
          secure: Number(smtpPort) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: smtpUser,
          to: email,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email} via SMTP`);
        sent = true;
      } catch (err) {
        console.error("SMTP send error inside authController:", err);
      }
    }

    console.log(`[DEVELOPMENT ONLY] OTP generated for ${email}: ${otp}`);

    return res.status(200).json({
      message: sent
        ? "OTP sent successfully to your registered email"
        : "OTP generated (logged to server console as mailer config is missing/failed)",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required to verify changes" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpires || user.otp !== otp.toString().trim() || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailTaken) {
        return res.status(409).json({ message: "Email is already in use by another account" });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) {
      user.name = name.trim();
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = signToken(user);

    return res.status(200).json({
      message: "Profile updated successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const name = user.name;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const sendgridFrom = process.env.SENDGRID_FROM;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const emailSubject = "Password Reset OTP";
    const emailText = `Hello ${name},\n\nYour OTP to reset your password is: ${otp}.\nThis OTP is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`;
    const emailHtml = `<p>Hello <strong>${name}</strong>,</p>
                       <p>Your OTP to reset your password is: <strong style="font-size: 1.2em; color: #007bff;">${otp}</strong>.</p>
                       <p>This OTP is valid for 10 minutes.</p>
                       <p>If you did not request a password reset, please ignore this email.</p>`;

    let sent = false;

    if (sendgridKey && sendgridFrom) {
      try {
        sgMail.setApiKey(sendgridKey);
        await sgMail.send({ to: email, from: sendgridFrom, subject: emailSubject, text: emailText, html: emailHtml });
        console.log(`Reset OTP sent to ${email} via SendGrid`);
        sent = true;
      } catch (err) {
        console.error("SendGrid send error inside authController:", err?.response?.body || err);
      }
    }

    if (!sent && smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost, port: Number(smtpPort), secure: Number(smtpPort) === 465,
          auth: { user: smtpUser, pass: smtpPass }
        });
        await transporter.sendMail({ from: smtpUser, to: email, subject: emailSubject, text: emailText, html: emailHtml });
        console.log(`Reset OTP sent to ${email} via SMTP`);
        sent = true;
      } catch (err) {
        console.error("SMTP send error inside authController:", err);
      }
    }

    console.log(`[DEVELOPMENT ONLY] Reset OTP generated for ${email}: ${otp}`);

    return res.status(200).json({
      message: sent ? "OTP sent successfully to your registered email" : "OTP generated (logged to server console as mailer config is missing/failed)",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpires || user.otp !== otp.toString().trim() || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
