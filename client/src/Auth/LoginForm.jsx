import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

const LoginForm = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        notify.warning("Please fill all required fields.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        notify.warning("Invalid email format.");
        return;
      }
      const res = await api.post("/api/auth/login", { email, password });
      const { user } = res.data;
      login(user);
      setEmail("");
      setPassword("");
      notify.success(`Welcome back, ${user.name}!`);
      navigate("/home");
    } catch (error) {
      const message = error.response?.data?.message || "";
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
      }
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: '12px 16px 12px 40px',
    color: 'var(--color-on-surface)',
    fontFamily: 'var(--font-body)',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s'
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-md)' }}>
      <div>
        <label className="font-label-caps text-on-surface-variant" style={{ display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Email</label>
        <div style={{ position: 'relative' }}>
          <FiMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} />
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            required
          />
        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginLeft: '4px' }}>
          <label className="font-label-caps text-on-surface-variant">Password</label>
          <a href="#" className="font-label-caps text-primary" style={{ textDecoration: 'none' }}>Forgot Password?</a>
        </div>
        <div style={{ position: 'relative' }}>
          <FiLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: '40px' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            required
          />
          <button 
            type="button"
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-on-surface-variant)', cursor: 'pointer' }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      <button className="btn-primary font-label-caps" type="submit" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', borderRadius: 'var(--radius-lg)', marginTop: 'var(--stack-md)', width: '100%' }}>
        <span>Login</span>
        <FiLogIn size={18} />
      </button>

      <div style={{ marginTop: 'var(--stack-lg)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'var(--stack-md)' }}>
        <p className="font-body-md text-on-surface-variant">
          Don't have an account? <button type="button" onClick={onSwitch} className="text-primary font-body-md" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Sign Up</button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
