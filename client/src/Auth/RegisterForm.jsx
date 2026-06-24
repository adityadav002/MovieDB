import { useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
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
    console.log(name, email, password);
    try {
      if (!name || !email || !password) {
        console.log("All fields are required.");
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/register`,
        {
          name: name,
          email: email,
          password: password,
        }
      );
      setName("")
      setEmail("")
      setPassword("")
      return res.data;
    } catch (error) {
      console.log("Somethin went wrong RegisterForm", error);
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

//       <div className="social-buttons">
//         <button><FaFacebookF /></button>
//         <button><FaTwitter /></button>
//         <button><FaGoogle /></button>
//         <button><FaGithub /></button>
//       </div>

//       <p className="text-center">or:</p>
