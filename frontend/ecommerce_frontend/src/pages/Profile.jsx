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

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Check if fields are modified
  const isDirty =
    user &&
    (formData.name !== (user.name || "") ||
      formData.email !== (user.email || "") ||
      formData.password !== "");

  return (
    <div className="profile-page-container">
      <div className="profile-layout-grid">
        
        {/* Left Side: Avatar and Info Card */}
        <div className="profile-sidebar-card">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              {getInitials(user?.name || formData.name)}
            </div>
            <div className="avatar-glow"></div>
          </div>
          
          <h3 className="profile-sidebar-name">{user?.name || "Guest User"}</h3>
          <p className="profile-sidebar-email">{user?.email || "No email linked"}</p>
          
          <span className="role-badge">{user?.role || "Customer"}</span>
          
          <div className="security-status-widget">
            <div className="security-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>OTP Security Active</span>
            </div>
            <div className="security-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>Identity Verified</span>
            </div>
          </div>
        </div>

        {/* Right Side: Editable Details Card */}
        <div className="profile-main-card">
          <div className="form-header">
            <h2>Manage Credentials</h2>
            <p>Update your account details and security settings below.</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form-grid">
            
            <div className="form-group-custom">
              <label htmlFor="name">Full Name</label>
              <div className="input-field-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
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
            </div>

            <div className="form-group-custom">
              <label htmlFor="email">Email Address</label>
              <div className="input-field-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
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
            </div>

            <div className="form-group-custom full-width-field">
              <label htmlFor="password">New Password (leave blank to keep current)</label>
              <div className="input-field-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {isDirty && !otpSent && (
              <div className="full-width-field animated">
                <div className="security-alert-box">
                  <strong>Changes Detected:</strong> Email verification is required to update credentials. Please generate and submit an OTP code.
                </div>
              </div>
            )}

            {/* OTP Section panel */}
            <div className="otp-panel-card full-width-field">
              <div className="otp-actions-wrapper">
                <button
                  type="button"
                  className="otp-trigger-btn"
                  onClick={handleSendOtp}
                  disabled={loadingOtp}
                >
                  {loadingOtp ? (
                    <>Sending...</>
                  ) : otpSent ? (
                    <>Resend Code</>
                  ) : (
                    <>Send Security OTP</>
                  )}
                </button>
                
                {otpSent && (
                  <span className="otp-status-hint">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Check inbox for 6-digit code
                  </span>
                )}
              </div>

              {otpSent && (
                <div className="form-group-custom otp-input-field-group animated">
                  <label htmlFor="otp">Enter 6-Digit Verification Code</label>
                  <div className="input-field-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="------"
                      maxLength={6}
                      required
                      className="otp-box-input"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="save-profile-btn full-width-field"
              disabled={submitting || !otpSent}
            >
              {submitting ? "Applying Changes..." : "Verify & Save Changes"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
