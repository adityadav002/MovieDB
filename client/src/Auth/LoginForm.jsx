import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import "../style/AuthStyle.css";
import { useAuth } from "../context/AuthContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      // ── Validation ──
      if (!email || !password) {
        notify.warning("Please fill all required fields.");
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        notify.warning("Invalid email format.");
        return;
      }

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { user, token } = res.data;
      login(user, token);

      setEmail("");
      setPassword("");

      notify.success(`Welcome back, ${user.name}!`);
      navigate("/");
    } catch (error) {
      // Parse specific backend error messages
      const message =
        error.response?.data?.message || "";

      if (error.response?.status === 400) {
        if (message.toLowerCase().includes("not found")) {
          notify.error("No account found with this email.");
        } else if (message.toLowerCase().includes("invalid")) {
          notify.error("Email or password is incorrect.");
        } else if (message.toLowerCase().includes("required")) {
          notify.warning("Please fill all required fields.");
        } else {
          notify.error(message || "Login failed. Please try again.");
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
      <p className="text-center">Sign in with:</p>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="options">
        <label>
          <input type="checkbox" />
          Remember me
        </label>
        <a href="#">Forgot password?</a>
      </div>

      <button className="submit-button" type="submit" onClick={handleLogin}>
        Sign in
      </button>
    </div>
  );
};

export default LoginForm;
