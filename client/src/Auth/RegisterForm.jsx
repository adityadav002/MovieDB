import { useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import "../style/AuthStyle.css";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignup = async () => {
    try {
      // ── Validation ──
      if (!name || !email || !password) {
        notify.warning("Please fill all required fields.");
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        notify.warning("Invalid email format.");
        return;
      }

      if (password.length < 8) {
        notify.warning("Password must contain at least 8 characters.");
        return;
      }

      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      setName("");
      setEmail("");
      setPassword("");

      notify.success("Account created successfully!");
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "";

      if (error.response?.status === 400) {
        if (message.toLowerCase().includes("already exists")) {
          notify.error("An account with this email already exists.");
        } else if (message.toLowerCase().includes("required")) {
          notify.warning("Please fill all required fields.");
        } else {
          notify.error(message || "Registration failed. Please try again.");
        }
      } else if (!error.response) {
        // Network error — already handled by interceptor
      } else {
        // 500 etc. — already handled by interceptor
      }
    }
  };

  return (
    <div className="form-container">
      <p className="text-center">Sign up with:</p>
      <input
        type="text"
        placeholder="Username"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="checkbox">
        <label>
          <input type="checkbox" />I have read and agree to the terms
        </label>
      </div>

      <button className="submit-button" type="submit" onClick={handleSignup}>
        Sign up
      </button>
    </div>
  );
};

export default RegisterForm;
