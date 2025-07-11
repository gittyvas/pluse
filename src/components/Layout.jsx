// google-oauth-app/frontend/src/components/Layout.jsx

import React from 'react';
import Header from './Header'; // Assuming you have a Header component

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header component */}
      <Header />

      {/* Main content area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* No global Footer here, as it's embedded directly in Home.jsx */}
    </div>
  );
}

export default Layout;
