import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

function NotFound() {
  return (
    <div className="discover-page" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '120px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface-container)',
        padding: '60px 40px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(255,255,255,0.05)',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-headline)', 
          fontSize: '4rem', 
          fontWeight: 800, 
          margin: '0 0 16px 0',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em'
        }}>
          404 <span style={{ color: 'var(--color-primary)' }}>Error</span>
        </h1>
        
        <p style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: '1.2rem', 
          color: 'var(--color-text-secondary)',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Looks like this scene ended up on the cutting room floor. The page you are looking for doesn't exist.
        </p>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto 40px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(229, 9, 20, 0.2)', mixBlendMode: 'overlay', zIndex: 1 }}></div>
          <img 
            src="https://media.giphy.com/media/UoeaPqYrimha6rdTFV/giphy.gif" 
            alt="Confused Travolta"
            style={{ width: '100%', display: 'block', filter: 'grayscale(50%) contrast(120%)' }}
          />
        </div>
        
        <Link 
          to="/home" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary)', 
            color: 'white', 
            textDecoration: 'none',
            padding: '16px 32px',
            borderRadius: '50px',
            fontFamily: 'var(--font-label)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all var(--duration-medium) ease',
            boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.6)';
            e.currentTarget.style.backgroundColor = '#ff4d4d';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.4)';
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          <FaHome style={{ fontSize: '18px' }} />
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;