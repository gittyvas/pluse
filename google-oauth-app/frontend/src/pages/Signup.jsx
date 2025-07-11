// google-oauth-app/frontend/src/pages/Signup.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiateOAuth } from '../utils/auth';
import { Button } from '../components/ui/button';

function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    console.log('Attempting email signup with:', { fullName, email, password });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage('Email/password signup is not yet implemented. Please use "Sign up with Google".');
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create your Pulse account</h2>
        <p className="text-gray-600 mb-8">Pulse CRM — stay close to who matters</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {message && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

        <form onSubmit={handleEmailSignup}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-md transition-colors duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>

        <div className="my-6 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
          <p className="text-center font-semibold mx-4 text-gray-600">or</p>
        </div>

        {/* Google Signup Button */}
        <Button
          onClick={initiateOAuth}
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-200 transform hover:scale-105 active:scale-95"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/20px-Google_%22G%22_logo.svg.png"
            alt="Google logo"
            className="w-5 h-5 mr-2"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/20x20/cccccc/333333?text=G"; }}
          />
          Sign up with Google
        </Button>

        <p className="mt-6 text-gray-600 text-sm">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-emerald-500 hover:text-emerald-600 font-semibold cursor-pointer transition-colors duration-200"
          >
            Log in
          </span>
        </p>

        <div className="mt-8 text-gray-500 text-xs flex justify-center space-x-4">
          <a href="/privacy.html" className="hover:text-emerald-500 transition-colors duration-200">Privacy Policy</a>
          <a href="/terms.html" className="hover:text-emerald-500 transition-colors duration-200">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}

export default Signup;
