import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../Auth/LoginForm.jsx";
import RegisterForm from "../Auth/RegisterForm.jsx";
import "../style/AuthStyle.css";
import FAQ from "../components/FAQ.jsx";
import Content from "../components/Content.jsx";

function Home() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <div className="home-background">
        <div className="overlay">
          {/* Hero Content Section */}
          <div className="header-text">
            <section className="hero-screen">
              <Content />
            </section>
          </div>

          {/* Auth Form Container */}
          <section className="auth-screen">
            <div className="container">
              <div className="tabs">
                <button
                  className={activeTab === "login" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("login")}
                  aria-label="Switch to login"
                >
                  Login
                </button>
                <button
                  className={activeTab === "register" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("register")}
                  aria-label="Switch to register"
                >
                  Register
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="faq-screen">
        <FAQ />
      </section>
    </>
  );
}

export default Home;
