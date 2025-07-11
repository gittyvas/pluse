// google-oauth-app/frontend/src/pages/Login.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = () => {
    // Redirect to your backend’s OAuth route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Log in to your Pluse account</h2>
        <p className="text-gray-600 mb-8">Stay close to who matters most</p>

        {/* Google Login Button */}
        <Button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-200 transform hover:scale-105 active:scale-95"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/20px-Google_%22G%22_logo.svg.png"
            alt="Google logo"
            className="w-5 h-5 mr-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/20x20/cccccc/333333?text=G';
            }}
          />
          Log in with Google
        </Button>

        <p className="mt-6 text-gray-600 text-sm">
          By continuing, you agree to our{' '}
          <a href="/privacy.html" className="text-emerald-500 hover:text-emerald-600 font-semibold">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms.html" className="text-emerald-500 hover:text-emerald-600 font-semibold">
            Terms of Service
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
