import { useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight } from "react-icons/fi";

const RegisterForm = ({ onSwitch }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
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

      const res = await api.post("/api/auth/register", { name, email, password });
      setName("");
      setEmail("");
      setPassword("");
      notify.success("Account created successfully!");
      login(res.data.user);
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
    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-md)' }}>
      <div>
        <label className="sr-only" style={{ display: 'none' }}>Full Name</label>
        <div style={{ position: 'relative' }}>
          <FiUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            required
          />
        </div>
      </div>
      
      <div>
        <label className="sr-only" style={{ display: 'none' }}>Email Address</label>
        <div style={{ position: 'relative' }}>
          <FiMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} />
          <input
            type="email"
            placeholder="Email Address"
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
        <label className="sr-only" style={{ display: 'none' }}>Password</label>
        <div style={{ position: 'relative' }}>
          <FiLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password (min 8 chars)"
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
        <span>Sign Up</span>
        <FiArrowRight size={18} />
      </button>

      <div style={{ marginTop: 'var(--stack-lg)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'var(--stack-md)' }}>
        <p className="font-body-md text-on-surface-variant">
          Already have an account? <button type="button" onClick={onSwitch} className="text-primary font-body-md" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Login</button>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
