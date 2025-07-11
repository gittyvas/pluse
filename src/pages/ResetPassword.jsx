// google-oauth-app/frontend/src/pages/ResetPassword.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button'; // Assuming Button component path

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [oobCode, setOobCode] = useState(null); // Firebase specific: out-of-band code

  useEffect(() => {
    // Extract the 'oobCode' (or 'token' depending on your backend) from URL parameters
    const code = searchParams.get('oobCode') || searchParams.get('token');
    if (code) {
      setOobCode(code);
      setTokenValid(true); // Assume token is valid for now, backend will verify
    } else {
      setError('Invalid or missing password reset token.');
      setTokenValid(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!oobCode) {
      setError('Password reset token is missing or invalid.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    // --- Backend Integration Placeholder ---
    // In a real application, you would send a request to your backend
    // to confirm the password reset using the token and the new password.
    // The backend would verify the token's validity and expiration,
    // then update the user's password.
    //
    // Example using Firebase Authentication (if applicable):
    // import { getAuth, confirmPasswordReset } from 'firebase/auth';
    // const auth = getAuth();
    // try {
    //   await confirmPasswordReset(auth, oobCode, newPassword);
    //   setMessage('Your password has been reset successfully! You can now log in.');
    //   setNewPassword('');
    //   setConfirmNewPassword('');
    //   setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
    // } catch (firebaseError) {
    //   setError(`Failed to reset password: ${firebaseError.message}`);
    // } finally {
    //   setLoading(false);
    // }
    // --- End Backend Integration Placeholder ---

    try {
      // Simulate API call to your backend
      const response = await fetch('/api/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: oobCode, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Your password has been reset successfully! You can now log in.');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
      } else {
        setError(data.message || 'Failed to reset password. The link may be expired or invalid.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Reset password fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Invalid Link</h2>
          <p className="text-red-600 mb-8">{error}</p>
          <Button
            onClick={() => navigate('/forgot-password')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h2>
        <p className="text-gray-600 mb-8">Enter your new password for Pulse CRM.</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            minLength="6"
          />
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-md transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
