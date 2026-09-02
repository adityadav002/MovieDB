import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import notify from "../utils/toast";
import { BiSolidMovie } from "react-icons/bi";
import { FiSearch, FiX, FiMenu } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  const navItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)",
      textDecoration: "none",
      transition: "color 0.3s",
      fontWeight: isActive ? 600 : 400,
    };
  };

  const glassStyle = {
    background: scrolled ? "rgba(19, 19, 20, 0.8)" : "transparent",
    backdropFilter: scrolled ? "blur(24px)" : "none",
    borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
    transition: "background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 50,
    height: "80px",
    display: "flex",
    alignItems: "center",
    padding: "0 var(--margin-mobile)",
  };

  return (
    <>
      <nav style={glassStyle}>
        <div className="container-max w-full flex justify-between items-center mx-auto" style={{ position: 'relative' }}>
          {/* Logo */}
          <Link to={user ? "/home" : "/"} style={{ textDecoration: "none" }}>
            <div className="font-headline-md text-primary-container" style={{ fontWeight: 800, letterSpacing: "-0.05em" }}>
              MovieDB
            </div>
          </Link>

          {/* Centered Desktop Nav Links */}
          {user && (
            <div className="flex items-center gap-6" style={{ display: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} id="desktop-center-links">
              <style>{`@media(min-width: 768px) { #desktop-center-links { display: flex !important; } }`}</style>
              <Link to="/home" style={navItemStyle("/home")} onMouseOver={(e)=>e.target.style.color='var(--color-primary)'} onMouseOut={(e)=>e.target.style.color=navItemStyle("/home").color}>Home</Link>
              <Link to="/discover" style={navItemStyle("/discover")} onMouseOver={(e)=>e.target.style.color='var(--color-primary)'} onMouseOut={(e)=>e.target.style.color=navItemStyle("/discover").color}>Discover</Link>
              <Link to="/favourite" style={navItemStyle("/favourite")} onMouseOver={(e)=>e.target.style.color='var(--color-primary)'} onMouseOut={(e)=>e.target.style.color=navItemStyle("/favourite").color}>Favourites</Link>
              <Link to="/watchList" style={navItemStyle("/watchList")} onMouseOver={(e)=>e.target.style.color='var(--color-primary)'} onMouseOut={(e)=>e.target.style.color=navItemStyle("/watchList").color}>Watchlist</Link>
              <Link to="/recommendations" style={navItemStyle("/recommendations")} onMouseOver={(e)=>e.target.style.color='var(--color-primary)'} onMouseOut={(e)=>e.target.style.color=navItemStyle("/recommendations").color}>Recommendations</Link>
            </div>
          )}

          {/* Right Nav (Search & Profile / Login) */}
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6" style={{ display: 'none' }} id="desktop-right-actions">
                <style>{`@media(min-width: 768px) { #desktop-right-actions { display: flex !important; } }`}</style>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiSearch style={{ color: 'var(--color-on-surface-variant)', position: 'absolute', left: '10px' }} />
                  <input 
                    type="text" 
                    placeholder="Search movies..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--color-on-surface)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '8px 16px 8px 36px',
                      outline: 'none',
                      width: '200px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px'
                    }} 
                  />
                </div>

                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', 
                    background: 'var(--color-surface-container-high)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-on-surface)', fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="font-body-md text-on-surface-variant" style={{ textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e)=>e.target.style.color='var(--color-primary)'} onMouseOut={(e)=>e.target.style.color='var(--color-on-surface-variant)'}>
                  Login
                </Link>
                <Link to="/signup" className="btn-primary font-body-md" style={{ textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'none', border: 'none', color: 'var(--color-on-surface)', fontSize: '24px', cursor: 'pointer', display: 'none' }}
                id="mobile-menu-btn"
              >
                <style>{`@media(max-width: 767px) { #mobile-menu-btn { display: block !important; } }`}</style>
                {menuOpen ? <FiX /> : <FiMenu />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {user && menuOpen && (
        <div style={{
          position: 'fixed', top: '80px', left: 0, width: '100%', height: 'calc(100vh - 80px)',
          background: 'var(--color-surface)', zIndex: 40,
          display: 'flex', flexDirection: 'column', padding: 'var(--margin-mobile)',
          gap: '1.5rem'
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <FiSearch style={{ color: 'var(--color-on-surface-variant)', position: 'absolute', left: '16px' }} />
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--color-on-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: '12px 16px 12px 48px',
                outline: 'none',
                width: '100%',
                fontFamily: 'var(--font-body)',
                fontSize: '16px'
              }} 
            />
          </div>
          
          <div className="flex flex-col gap-6" style={{ marginTop: '1rem' }}>
            <Link to="/home" onClick={()=>setMenuOpen(false)} style={{...navItemStyle("/home"), fontSize: '1.2rem'}}>Home</Link>
            <Link to="/discover" onClick={()=>setMenuOpen(false)} style={{...navItemStyle("/discover"), fontSize: '1.2rem'}}>Discover</Link>
            <Link to="/favourite" onClick={()=>setMenuOpen(false)} style={{...navItemStyle("/favourite"), fontSize: '1.2rem'}}>Favourites</Link>
            <Link to="/watchList" onClick={()=>setMenuOpen(false)} style={{...navItemStyle("/watchList"), fontSize: '1.2rem'}}>Watchlist</Link>
            <Link to="/recommendations" onClick={()=>setMenuOpen(false)} style={{...navItemStyle("/recommendations"), fontSize: '1.2rem'}}>Recommendations</Link>
            <Link to="/profile" onClick={()=>setMenuOpen(false)} style={{...navItemStyle("/profile"), fontSize: '1.2rem'}}>Profile</Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
