// google-oauth-app/frontend/src/pages/UpdatePassword.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button'; // Assuming Button component path

function UpdatePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    // --- Backend Integration Placeholder ---
    // In a real application, you would send a request to your backend
    // to update the user's password. This typically involves:
    // 1. Authenticating the user (e.g., via a session token or re-authentication with current password).
    // 2. Verifying the current password.
    // 3. Hashing and updating the new password in your database.
    //
    // Example using Firebase Authentication (if applicable):
    // import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
    // const auth = getAuth();
    // const user = auth.currentUser;
    // const credential = EmailAuthProvider.credential(user.email, currentPassword);
    //
    // try {
    //   await reauthenticateWithCredential(user, credential); // Re-authenticate first
    //   await updatePassword(user, newPassword);
    //   setMessage('Password updated successfully!');
    //   setCurrentPassword('');
    //   setNewPassword('');
    //   setConfirmNewPassword('');
    // } catch (firebaseError) {
    //   setError(`Failed to update password: ${firebaseError.message}`);
    // } finally {
    //   setLoading(false);
    // }
    // --- End Backend Integration Placeholder ---

    try {
      // Simulate API call to your backend
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization token if your API requires it
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        // Optionally navigate to profile or dashboard after success
        // navigate('/profile');
      } else {
        setError(data.message || 'Failed to update password. Please check your current password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Update password fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Update Your Password</h2>
        <p className="text-gray-600 mb-8">Change your password for Pulse CRM.</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Current Password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
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
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
