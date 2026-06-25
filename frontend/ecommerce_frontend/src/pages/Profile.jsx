import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { sendUpdateOtp, updateProfile } from "../services/auth";
import { useNavigate } from "react-router-dom";
import "../component_css/Profile_css.css";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    setLoadingOtp(true);
    try {
      const res = await sendUpdateOtp();
      addToast(res.message || "OTP has been sent to your email.", "success");
      setOtpSent(true);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send OTP.";
      addToast(errMsg, "error");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      addToast("Please enter the OTP sent to your email", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        otp,
      });

      addToast("Profile updated successfully!", "success");
      refreshUser();
      setOtp("");
      setOtpSent(false);
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update profile.";
      addToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Manage Profile</h2>
          <p className="profile-subtitle">Update your credentials with OTP security</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password (Leave blank to keep current)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="otp-section-card">
            <div className="otp-actions">
              <button
                type="button"
                className={`otp-trigger-btn ${otpSent ? "otp-sent" : ""}`}
                onClick={handleSendOtp}
                disabled={loadingOtp}
              >
                {loadingOtp ? (
                  "Sending..."
                ) : otpSent ? (
                  "Resend OTP"
                ) : (
                  "Send OTP to registered email"
                )}
              </button>
              {otpSent && <span className="otp-hint-text">Check your inbox for a 6-digit OTP code</span>}
            </div>

            {otpSent && (
              <div className="form-group otp-input-group animated fadeIn">
                <label htmlFor="otp">Enter Verification OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  required
                  className="otp-field-input"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="save-profile-btn"
            disabled={submitting || !otpSent}
          >
            {submitting ? "Updating..." : "Verify & Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
