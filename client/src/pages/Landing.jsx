import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../style/Landing.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FAQ from "../components/FAQ";
import { FaPlay, FaWandMagicSparkles, FaBookmark, FaGem, FaLaptopCode, FaPlus, FaMinus } from "react-icons/fa6";

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return <div className="global-loader">Loading...</div>;
  }

  return (
    <div className="landing-container">
      <Navbar />

      <main className="landing-main" style={{ flexGrow: 1, paddingTop: '80px' }}>
        {/* Hero Section */}
        <section className="relative w-full flex items-center justify-center" style={{ height: '870px', position: 'relative' }}>
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnG2WfXfCu8u9i291bRZYHW742M1k8KND2gNvaf1ai62wmaWHEfS9Z0WgRkN7qMC_4l65lq1Zfx-34aQY6LBoQ-5LfLI66HW-z4-XV7-LytoaV_Px1SGit1eRNZ16gsuwDGPNLtckMJLBdpKkqjZQTLNoAy6rSTNLQshUHwgSpM0CcT4ZPGkiS17xWgL4AJu-rqD2Fo7plyezl7Gu4BKBjdNiHoTaYZ0ar4M45MIFPksKnoNVXjayf')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
            <div className="absolute inset-0 hero-gradient"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 text-center container-max flex flex-col items-center gap-stack-lg mx-auto" style={{ padding: '0 var(--margin-mobile)', maxWidth: '900px', gap: 'var(--stack-lg)' }}>
            <h1 className="font-display-lg text-on-primary-container" style={{ margin: 0, fontSize: 'clamp(40px, 5vw, 64px)' }}>
              Your Next Cinematic Journey Starts Here.
            </h1>
            <p className="font-body-lg text-secondary" style={{ maxWidth: '650px', margin: 0 }}>
              Discover thousands of movies, build your ultimate watchlist, and experience personalized recommendations tailored to your unique taste. Step into the dark.
            </p>
            <div className="flex flex-col sm:flex-row gap-4" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-primary font-headline-md" style={{ padding: '16px 32px', borderRadius: 'var(--radius-lg)' }} onClick={() => navigate("/signup")}>
                Get Started
              </button>
              <button className="glass-card hover-lift font-body-lg text-on-surface flex items-center justify-center gap-2" style={{ padding: '16px 32px', borderRadius: 'var(--radius-lg)', color: 'var(--color-on-surface)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => navigate("/login")}>
                <FaPlay /> Explore Library
              </button>
            </div>
          </div>
        </section>

        {/* Feature Highlights (Bento Grid) */}
        <section className="container-max mx-auto" style={{ padding: '96px var(--margin-mobile)' }}>
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '16px' }}>Why Join MovieDB?</h2>
            <p className="font-body-md text-on-surface-variant mx-auto" style={{ maxWidth: '600px' }}>Elevate your viewing experience with tools designed for true cinephiles.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Feature 1 */}
            <div className="glass-card hover-lift flex flex-col items-start gap-4" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
              <div className="flex items-center justify-center bg-surface-container text-primary-container" style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '24px' }}>
                <FaWandMagicSparkles />
              </div>
              <h3 className="font-headline-md text-on-surface" style={{ margin: 0, fontSize: '24px' }}>Personalized Recommendations</h3>
              <p className="font-body-md text-on-surface-variant" style={{ margin: 0 }}>Our advanced algorithm learns your taste to suggest hidden gems you'll actually love.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card hover-lift flex flex-col items-start gap-4" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', gridColumn: 'span 2' }}>
              <div className="flex items-center justify-center bg-surface-container text-primary-container" style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '24px' }}>
                <FaBookmark />
              </div>
              <h3 className="font-headline-md text-on-surface" style={{ margin: 0, fontSize: '24px' }}>Curated Watchlists</h3>
              <p className="font-body-md text-on-surface-variant" style={{ margin: 0 }}>Organize your cinematic aspirations. Create custom lists, track what you've seen, and never forget a recommendation again.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-card hover-lift flex flex-col items-start gap-4" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', gridColumn: 'span 2' }}>
              <div className="flex items-center justify-center bg-surface-container text-primary-container" style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '24px' }}>
                <FaGem />
              </div>
              <h3 className="font-headline-md text-on-surface" style={{ margin: 0, fontSize: '24px' }}>Exclusive Content</h3>
              <p className="font-body-md text-on-surface-variant" style={{ margin: 0 }}>Access behind-the-scenes footage, director's cuts, and deep-dive editorial essays available only to members.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="glass-card hover-lift flex flex-col items-start gap-4" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
              <div className="flex items-center justify-center bg-surface-container text-primary-container" style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '24px' }}>
                <FaLaptopCode />
              </div>
              <h3 className="font-headline-md text-on-surface" style={{ margin: 0, fontSize: '24px' }}>Cross-Platform</h3>
              <p className="font-body-md text-on-surface-variant" style={{ margin: 0 }}>Sync your profile seamlessly across mobile, tablet, and smart TV apps.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-surface-container-lowest" style={{ padding: '96px var(--margin-mobile)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <FAQ />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Landing;
