import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginForm from "../Auth/LoginForm";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

function LoginPage() {
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
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBo1sboUzQnPMPfQF-IzGl1rz7JUwpj5ZP1Pvn9MeANxdAghRvVd9iQoq6JDLSiq4nsUO4MAP1JCx7AkVtmrLGPxUu6G5vhTg1FQB7zRmxfuMEhEAIPVQu22z1G5JWMdcl58mH3ZErrM64cERfdLTGinRbOBxSJzeYQgeNNNeXyZIuSpzFdFS4_vslW4EPoIuTE5PZ2o9TDHaLRlmMmwgmp2wssxABKMViopqYPMHrbu4q8nWa83NHl')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
          <div className="absolute inset-0" style={{ background: 'rgba(14, 14, 15, 0.7)', backdropFilter: 'blur(2px)' }}></div>
        </div>

        <div className="relative z-10 w-full glass-card" style={{ maxWidth: '450px', padding: 'var(--stack-lg)', borderRadius: 'var(--radius-xl)' }}>
          <h1 className="font-headline-lg text-on-surface text-center" style={{ margin: '0 0 var(--stack-sm) 0' }}>Welcome Back</h1>
          <p className="font-body-md text-on-surface-variant text-center" style={{ margin: '0 0 var(--stack-lg) 0' }}>Log in to resume your cinematic journey.</p>
          <LoginForm onSwitch={() => navigate("/signup")} />
        </div>
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default LoginPage;
