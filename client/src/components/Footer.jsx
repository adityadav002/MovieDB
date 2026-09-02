import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full" style={{ borderTop: '1px solid rgba(94, 63, 59, 0.2)' }}>
      <div className="flex flex-col items-center justify-between container-max mx-auto" style={{ padding: 'var(--stack-lg) var(--margin-mobile)', gap: '1.5rem', flexDirection: 'column' }}>
        
        {/* Top layer can be flex-row on desktop */}
        <div className="flex w-full justify-between items-center" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="font-headline-sm text-primary">
            MovieDB
          </div>
          
          <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
            <a className="font-metadata text-on-surface-variant" style={{ opacity: 0.8, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-on-surface-variant)'} href="#">Movies</a>
            <a className="font-metadata text-on-surface-variant" style={{ opacity: 0.8, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-on-surface-variant)'} href="#">TV Shows</a>
            <a className="font-metadata text-on-surface-variant" style={{ opacity: 0.8, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-on-surface-variant)'} href="#">Pricing</a>
            <a className="font-metadata text-on-surface-variant" style={{ opacity: 0.8, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-on-surface-variant)'} href="#">Privacy Policy</a>
            <a className="font-metadata text-on-surface-variant" style={{ opacity: 0.8, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-on-surface-variant)'} href="#">Terms of Service</a>
            <a className="font-metadata text-on-surface-variant" style={{ opacity: 0.8, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-on-surface-variant)'} href="#">Help Center</a>
          </div>
          
          <div className="flex gap-4 items-center">
             <a
              href="https://www.linkedin.com/in/aditya-yadav003/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-on-surface-variant"
              style={{ fontSize: '1.25rem', transition: 'color 0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/adityadav002"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-on-surface-variant"
              style={{ fontSize: '1.25rem', transition: 'color 0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
            >
              <FaGithub />
            </a>
            <a
              href="https://www.instagram.com/_aditya_yadav__ay/?utm_source=qr&igsh=MTJsMjdxZGduZGQwdA%3D%3D#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-on-surface-variant"
              style={{ fontSize: '1.25rem', transition: 'color 0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="w-full font-metadata text-secondary text-center" style={{ paddingTop: '1rem', borderTop: '1px solid rgba(94, 63, 59, 0.1)' }}>
          © {new Date().getFullYear()} MovieDB. All rights reserved. Cinematic Noir Experience.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
