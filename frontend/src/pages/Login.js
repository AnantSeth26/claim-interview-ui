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
import React, { useState, useContext, useEffect } from "react";

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
  const [rememberMe, setRememberMe] = useState(false);
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
   
  useEffect(() => {
  const rememberedUser = JSON.parse(
    localStorage.getItem("rememberMe")
  );

  if (rememberedUser) {
    setPhone(rememberedUser.phone);
    setPassword(rememberedUser.password);
    setRememberMe(true);
  }
}, []);

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
        if (rememberMe) {
  localStorage.setItem(
    "rememberMe",
    JSON.stringify({
      phone,
      password,
    })
  );
} else {
  localStorage.removeItem("rememberMe");
}
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

         

<div className="feature-list">

  <div className="feature-item">
    ✓ AI Fraud Detection
  </div>

  <div className="feature-item">
    ✓ Document Intelligence
  </div>

  <div className="feature-item">
    ✓ Vehicle Verification
  </div>

  <div className="feature-item">
    ✓ Speech Analysis
  </div>

  <div className="feature-item">
    ✓ Real-time Risk Scoring
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
  <input
    type="checkbox"
    checked={rememberMe}
    onChange={(e) =>
      setRememberMe(e.target.checked)
    }
  />
  Remember Me
</label>

  <span
  className="forgot-password"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/forgot-password")}
>
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