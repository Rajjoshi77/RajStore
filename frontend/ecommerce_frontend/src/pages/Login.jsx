import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { login, forgotPasswordAPI, resetPasswordAPI } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import "../component_css/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await login({
        email,
        password,
        remember,
      });

      loginSuccess();

      navigate("/cart");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await forgotPasswordAPI(resetEmail);
      setResetStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await resetPasswordAPI(resetEmail, resetOtp, newPassword);
      setIsForgotPassword(false);
      setResetStep(1);
      setResetOtp("");
      setNewPassword("");
      setResetEmail("");
      setError("Password successfully reset! You can now log in.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-pattern"></div>

      <div className="container">

        <div className="row justify-content-center align-items-center min-vh-100">

          <div className="col-lg-5 col-md-8">

            <div className="login-card">

              <div className="login-header">

                <div className="logo-circle">
                  🛍️
                </div>

                <h2>{isForgotPassword ? (resetStep === 1 ? "Forgot Password" : "Reset Password") : "Welcome Back"}</h2>

                <p>
                  {isForgotPassword ? "Follow the steps to reset your password" : "Sign in to continue shopping"}
                </p>

              </div>

              {error && (
                <div className={`alert ${error.includes('successfully reset') ? 'alert-success' : 'alert-danger'}`}>
                  {error}
                </div>
              )}

              {isForgotPassword ? (
                resetStep === 1 ? (
                  <form onSubmit={handleForgotPasswordSubmit}>
                    <div className="mb-4">
                      <label>Registered Email Address</label>
                      <div className="modern-input">
                        <Mail size={18} />
                        <input
                          type="email"
                          placeholder="raj@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button className="signin-btn" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                    <div className="mt-4 text-center">
                      <a href="#!" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setError(""); }}>
                        Back to Login
                      </a>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit}>
                    <div className="mb-3">
                      <label>OTP from Email</label>
                      <div className="modern-input">
                        <ShieldCheck size={18} />
                        <input
                          type="text"
                          placeholder="123456"
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label>New Password</label>
                      <div className="modern-input">
                        <Lock size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="eye-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button className="signin-btn" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                    <div className="mt-4 text-center">
                      <a href="#!" onClick={(e) => { e.preventDefault(); setResetStep(1); }}>
                        Back to Email Input
                      </a>
                    </div>
                  </form>
                )
              ) : (
                <>
                  <form onSubmit={onSubmit}>

                    <div className="mb-4">
                      <label>Email Address</label>
                      <div className="modern-input">
                        <Mail size={18} />
                        <input
                          type="email"
                          placeholder="raj@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label>Password</label>
                      <div className="modern-input">
                        <Lock size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="eye-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="login-options">
                      <label className="remember">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={() => setRemember(!remember)}
                        />
                        Remember me
                      </label>
                      <a href="#!" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(""); }}>
                        Forgot Password?
                      </a>
                    </div>

                    <button className="signin-btn" disabled={loading}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Signing In...</>
                      ) : (
                        <>Sign In<ArrowRight size={18} className="ms-2" /></>
                      )}
                    </button>
                  </form>

                  <div className="divider">
                    <span>OR</span>
                  </div>

                  <button className="google-btn">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                    Continue with Google
                  </button>

                  <div className="register-section">
                    Don't have an account? <Link to="/register">Create Account</Link>
                  </div>
                </>
              )}

              <div className="secure-login">
                <ShieldCheck size={16} />
                <span>Your data is protected with secure encryption</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;