import React, { useState, useContext } from "react";
import {
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

import { register, login } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { LoadingContext } from "../context/LoadingContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();
  const { setLoading } = useContext(LoadingContext);
    const getPasswordStrength = () => {
    if (password.length < 6) {
      return {
        text: "Weak",
        color: "#ef4444"
      };
    }

    if (password.length < 10) {
      return {
        text: "Medium",
        color: "#f59e0b"
      };
    }

    return {
      text: "Strong",
      color: "#22c55e"
    };
  };

  const handleSubmit = async () => {
    if (!phone.trim()) {
      alert("Enter phone number");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        alert("Enter name");
        return;
      }

      if (!password) {
        alert("Enter password");
        return;
      }

      if (password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
      }

      if (!confirmPassword) {
        alert("Confirm your password");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    } else {
      if (!password) {
        alert("Enter password");
        return;
      }

      if (password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
      }
    }

    try {
      setLoading(true);
       setIsSubmitting(true);

      if (isRegister) {
        const registerResponse = await register(
          phone,
          name,
          password,
          confirmPassword
        );

        if (registerResponse.error) {
          alert(registerResponse.error);
          return;
        }
      }

      const res = await login(phone, password);

      if (res.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(res.user)
        );

        localStorage.setItem(
          "token",
          res.token
        );

        navigate("/dashboard");
      } else {
        alert(
          res.error || "Login failed"
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={darkMode ? "page" : "page light-mode"}>
      <div className="login-container">

        {/* Left Side */}
        <div
    className="theme-toggle"
    onClick={() =>
      setDarkMode(!darkMode)
    }
  >
    {darkMode ? "☀️ Light" : "🌙 Dark"}
  </div>
        <div className="login-left">
          <div className="logo">
  <span className="logo-icon">🛡</span>
  <span>ClaimIQ</span>
</div>

          <h1 className="hero-title">
            AI Insurance
            <br />
            Claim Detection
          </h1>

          <p className="hero-text">
            Securely analyze insurance claims,
            detect fraud, and streamline
            investigations using intelligent
            automation.
          </p>

          <div className="features">
  <div className="feature-card">
    ✓ Fraud Detection
  </div>

  <div className="feature-card">
    ✓ AI Analysis
  </div>

  <div className="feature-card">
    ✓ Claim Verification
  </div>
</div>
<div className="ai-status">
  <span className="status-dot"></span>
  AI Fraud Engine Active
</div>
<div className="stats">
  <div className="stat-card">
    <h3>10K+</h3>
    <p>Claims Processed</p>
  </div>

  <div className="stat-card">
    <h3>98%</h3>
    <p>Fraud Detection</p>
  </div>

  <div className="stat-card">
    <h3>24/7</h3>
    <p>AI Monitoring</p>
  </div>
</div>
        </div>

        {/* Right Side */}
        <div className="login-box">

          <h2 className="login-title">
            {isRegister
              ? "Create Account"
              : "Welcome Back"}
          </h2>

          <p className="login-subtitle">
            {isRegister
              ? "Register to access the insurance platform"
              : "Sign in to access your claim dashboard"}
          </p>

          {isRegister && (
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          )}

          <div className="input-group">
            <FaPhone className="input-icon" />
            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />
          </div>

          <div className="input-group">
  <FaLock className="input-icon" />

  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
  />

  <span
    className="eye-icon"
    onClick={() =>
      setShowPassword(!showPassword)
    }
  >
    {showPassword ? (
      <FaEyeSlash />
    ) : (
      <FaEye />
    )}
  </span>
</div>
          {isRegister && password && (
  <div
    className="password-strength"
    style={{
      color: getPasswordStrength().color
    }}
  >
    Password Strength: {getPasswordStrength().text}
  </div>
)}
          {isRegister && (
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>
          )}
          <div className="options-row">
  <label className="remember-me">
    <input type="checkbox" />
    Remember Me
  </label>

  <span className="forgot-password">
    Forgot Password?
  </span>
</div>
          <button
  onClick={handleSubmit}
  disabled={isSubmitting}
>
  {isSubmitting
    ? "Authenticating..."
    : isRegister
      ? "Register & Login"
      : "Login"}
</button>
          <p className="security-note">
  🔒 Enterprise-grade secure authentication
</p>

          <p
            className="switch-text"
            onClick={() =>
              setIsRegister(!isRegister)
            }
          >
            {isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </p>

        </div>
      </div>
    </div>
  );
}