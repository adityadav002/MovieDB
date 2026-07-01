/** @format */

import "../style/FooterStyle.css";
import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>About Us</h4>
          <p>We provide the best movie recommendations and reviews online.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="/addmovies">Add Movies</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a
              href="https://www.linkedin.com/in/aditya-yadav003/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/adityadav002"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.instagram.com/_aditya_yadav__ay/?utm_source=qr&igsh=MTJsMjdxZGduZGQwdA%3D%3D#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagrm"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Movie-List. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
