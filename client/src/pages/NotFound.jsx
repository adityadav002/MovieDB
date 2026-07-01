import React from 'react'

function NotFound() {
  return (
    <>
  <div style={{ textAlign: 'center', padding: '2rem', marginTop: '8rem', marginBottom: '8rem'}}>
      <h1>404 - Page <span style={{color: 'red'}}>Not Found</span></h1>
       <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Oops! The page you are looking for doesn't exist or may have been moved.
      </p>
       <img 
        src="https://media.giphy.com/media/UoeaPqYrimha6rdTFV/giphy.gif" 
        alt="Confused Travolta"
        style={{ maxWidth: '300px', width: '100%', marginBottom: '2rem' }}
      />
       <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
        If you believe this is an error, please contact support or try refreshing the page.
      </p>
    </div>
    </>
  )
}

export default NotFound