// frontend/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Router should be the outermost component for react-router-dom hooks to work */}
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
