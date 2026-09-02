import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import RegisterForm from "../Auth/RegisterForm";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface flex flex-col" style={{ minHeight: '100vh' }}>
      <header className="fixed top-0 w-full z-50" style={{ background: 'rgba(14, 14, 15, 0.6)', backdropFilter: 'blur(24px)' }}>
        <div className="container-max mx-auto flex justify-between items-center w-full" style={{ padding: '16px var(--margin-desktop)' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="font-display-lg text-primary" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.05em' }}>MovieDB</div>
          </Link>
        </div>
      </header>

      <main className="flex-grow relative flex items-center justify-center" style={{ minHeight: '80vh', paddingTop: '96px', paddingBottom: '48px', paddingLeft: 'var(--margin-mobile)', paddingRight: 'var(--margin-mobile)' }}>
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJjvP4s6Rb7HqzWYpKpra7tOo4b_lstog4FwiJefsABBRzPe2P036vrGEJ-akKF5ggEyxZsr0Qrwo7mhjLx5zkGMBU4zQx6ji1nuLFgZ9WgocNIz1B86YC2yhVotaH0sjuBDJxmzwck7l3gybgtAWtDcHXk9eVLMdTaj4SV9LBNpI4E09rG_B9hyWYd6i0DmZ0N3nYXGw3pmv9nd53EOqud6KrBjAWx0jP25iPSzRv-VYSMjP7iSf2')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
          <div className="absolute inset-0" style={{ background: 'rgba(14, 14, 15, 0.7)', backdropFilter: 'blur(2px)' }}></div>
        </div>

        <div className="relative z-10 w-full glass-card" style={{ maxWidth: '450px', padding: 'var(--stack-lg)', borderRadius: 'var(--radius-xl)' }}>
          <h1 className="font-headline-lg text-on-surface text-center" style={{ margin: '0 0 var(--stack-sm) 0' }}>Create Account</h1>
          <p className="font-body-md text-on-surface-variant text-center" style={{ margin: '0 0 var(--stack-lg) 0' }}>Join the cinematic universe.</p>
          <RegisterForm onSwitch={() => navigate("/login")} />
        </div>
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default SignupPage;
