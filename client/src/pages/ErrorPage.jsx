import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { FaTriangleExclamation, FaRotateRight, FaHouse } from 'react-icons/fa6';

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  
  console.error("Runtime Error Caught by ErrorPage:", error);

  return (
    <div className="discover-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text-primary)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface-container)',
        padding: '60px 40px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(255,255,255,0.05)',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(229, 9, 20, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          border: '1px solid rgba(229, 9, 20, 0.3)'
        }}>
          <FaTriangleExclamation style={{ fontSize: '32px', color: 'var(--color-primary)' }} />
        </div>
        
        <h1 style={{ 
          fontFamily: 'var(--font-headline)', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em'
        }}>
          Something went <span style={{ color: 'var(--color-primary)' }}>wrong</span>
        </h1>
        
        <p style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: '1.1rem', 
          color: 'var(--color-text-secondary)',
          marginBottom: '40px',
          lineHeight: '1.6',
          maxWidth: '400px'
        }}>
          We encountered an unexpected error while processing this scene. Our crew has been notified.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-primary)', 
              color: 'white', 
              border: 'none',
              cursor: 'pointer',
              padding: '14px 28px',
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
            <FaRotateRight style={{ fontSize: '16px' }} />
            Try Again
          </button>
          
          <button 
            onClick={() => navigate('/home')}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-surface-elevated)', 
              color: 'var(--color-text-primary)', 
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              padding: '14px 28px',
              borderRadius: '50px',
              fontFamily: 'var(--font-label)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all var(--duration-medium) ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)';
            }}
          >
            <FaHouse style={{ fontSize: '16px' }} />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
