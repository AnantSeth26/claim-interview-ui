import React, { useState } from "react";
import "../styles/ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    if (!phone.trim()) {
      alert("Please enter phone number");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (!password) {
      alert("Please enter new password");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (!confirmPassword) {
      alert("Please confirm password");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await resetPassword(phone, password);

      if (res.message) {
        alert(res.message);
        navigate("/");
      } else {
        alert(res.error || "Password reset failed");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to reset password");
    }
  };

  return (
    <div className="forgot-page">
  <div className="forgot-container">
    <div className="forgot-box">

         <h2 className="forgot-title">
            Reset Password
          </h2>

          <p className="forgot-subtitle">
            Enter your registered phone number and new password
          </p>

          <input
  className="forgot-input"
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
  className="forgot-input"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
  className="forgot-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
  className="forgot-button"
  onClick={handleReset}
>
            Reset Password
          </button>

         <p
  className="forgot-back"
            style={{ cursor: "pointer", marginTop: "20px" }}
            onClick={() => navigate("/")}
          >
            Back to Login
          </p>

        </div>

      </div>
    </div>
  );
}