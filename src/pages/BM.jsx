import React from "react";

function BM() {
  return (
    <div
      style={{
        backgroundImage: `url('/bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* optional dark overlay for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 0,
        }}
      />

      {/* content with the two display images */}
      <div style={{ position: 'relative', zIndex: 1, padding: '2rem', color: '#fff' }}>
        <h1>Welcome Home</h1>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <img
            src="/image1.png"
            alt="Display 1"
            style={{ width: '300px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
          />
          <img
            src="/image2.png"
            alt="Display 2"
            style={{ width: '300px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
          />
        </div>

        {/* note section */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            maxWidth: '620px',
          }}
        >
          <h2 style={{ marginBottom: '0.5rem' }}>Note</h2>
          <p style={{ lineHeight: 1.6 }}>
            Write your note here. You can describe anything you want visitors to read on this page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BM;
