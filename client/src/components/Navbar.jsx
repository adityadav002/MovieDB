import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../style/NavbarStyle.css";
import axios from "axios";
import { BiSolidMovie } from "react-icons/bi";
import { FiSearch, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest(".navbar-container")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    if (!searchOpen) {
      setTimeout(() => {
        document.querySelector(".navbar-search")?.focus();
      }, 100);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      logout();
      setMenuOpen(false);
      navigate("/home");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="logo">
            <Link to={user ? "/" : "/home"} onClick={closeMenu}>
              <span className="logo_text">MovieDB</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="nav-links-desktop">
              {/* <Link to="/" onClick={closeMenu}>
                Movies
              </Link> */}
              <Link to="/favourite" onClick={closeMenu}>
                Favourites
              </Link>
              <Link to="/watchList" onClick={closeMenu}>
                Watch List
              </Link>
              <Link to="/recommendations" onClick={closeMenu}>
                Recommendations
              </Link>
              <Link onClick={handleLogout}>Logout</Link>
            </div>
          )}
        </div>

        <div className="navbar-right">
          {/* Search Bar */}
          {user && (
            <div className={`search-container ${searchOpen ? "active" : ""}`}>
              <FiSearch className="search-icon" onClick={toggleSearch} />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="navbar-search"
              />
              {searchOpen && (
                <FiX
                  className="search-close"
                  onClick={() => setSearchOpen(false)}
                />
              )}
            </div>
          )}

          {/* User Info */}
          {user && (
            <Link to="/profile" className="profile-link">
              <div className="navbar-user">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <span className="user-name">{user.name}</span>
              </div>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className={`menu-btn ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`nav-links-mobile ${menuOpen ? "show" : ""}`}>
          <div className="mobile-menu-header">
            {user && (
              <div className="mobile-user-info">
                <div className="user-avatar-large">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="mobile-user-name">{user.name}</span>
              </div>
            )}
          </div>

          <div className="mobile-menu-links">
            {!user ? (
              <Link to="/home" onClick={closeMenu}>
                <span>🏠</span> Home
              </Link>
            ) : (
              <>
                <Link to="/" onClick={closeMenu}>
                  <span>🎬</span> Movies
                </Link>
                <Link to="/favourite" onClick={closeMenu}>
                  <span>❤️</span> Favourites
                </Link>
                <Link to="/watchList" onClick={closeMenu}>
                  <span>📋</span> Watch List
                </Link>
                <Link to="/recommendations" onClick={closeMenu}>
                  <span>💡</span> Recommendations
                </Link>
                <hr />
                <button className="logout-btn" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Overlay */}
        {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      </div>
    </nav>
  );
}

export default Navbar;
