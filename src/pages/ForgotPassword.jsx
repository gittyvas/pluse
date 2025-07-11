// google-oauth-app/frontend/src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button'; // Assuming Button component path

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // --- Backend Integration Placeholder ---
    // In a real application, you would send a request to your backend
    // to send a password reset email to the provided email address.
    // The backend would generate a unique, time-limited token and include it
    // in a link sent to the user's email.
    //
    // Example using Firebase Authentication (if applicable):
    // import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
    // const auth = getAuth();
    // try {
    //   await sendPasswordResetEmail(auth, email);
    //   setMessage('Password reset email sent! Please check your inbox.');
    // } catch (firebaseError) {
    //   setError(`Failed to send reset email: ${firebaseError.message}`);
    // } finally {
    //   setLoading(false);
    // }
    // --- End Backend Integration Placeholder ---

    try {
      // Simulate API call to your backend
      const response = await fetch('/api/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('If an account exists with that email, a password reset link has been sent to your inbox. Please check your spam folder too.');
        setEmail(''); // Clear email field
      } else {
        // For security, it's common practice not to reveal if an email exists or not.
        // So, even on error, you might show a generic success message.
        setMessage('If an account exists with that email, a password reset link has been sent to your inbox. Please check your spam folder too.');
        // Or, if you prefer to show specific errors for development:
        // setError(data.message || 'Failed to send reset email.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Forgot password fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
        <p className="text-gray-600 mb-8">Enter your email to receive a password reset link.</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your Email Address"
            className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-md transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="mt-6 text-gray-600 text-sm">
          Remember your password?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer transition-colors duration-200"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
