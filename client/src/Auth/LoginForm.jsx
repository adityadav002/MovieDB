import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/AuthStyle.css";
import { useAuth } from "../context/AuthContext";

axios.defaults.withCredentials = true;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
  try {
    if (!email || !password) {
      console.log("Fill all details");
      return;
    }

    const res = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/auth/login`,
      {
        email,
        password,
      }
    );
    console.log("Login Response:", res.data);

    const { user, token } = res.data;
    login(user, token);               

    setEmail("");
    setPassword("");

    navigate("/");
  } catch (error) {
    console.log("Error from LoginForm", error);
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
