// google-oauth-app/frontend/src/utils/auth.js

// This is the URL where Google will redirect to your BACKEND after authentication.
// Your backend MUST have an endpoint configured to handle this.
// For local development, this assumes your backend is running on port 3000
// and has a route like /oauth.
const BACKEND_REDIRECT_URI = 'http://localhost:3000/oauth';

// In a Vite app, environment variables prefixed with VITE_ are exposed to the browser.
// Make sure to set VITE_GOOGLE_CLIENT_ID in your .env.local file for local development
// and in Render's environment variables for deployment.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_NOT_SET';

export const initiateOAuth = () => {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_NOT_SET') {
    console.error("VITE_GOOGLE_CLIENT_ID is not set. Please set it in your .env.local file or Render environment variables.");
    alert("Google Client ID is not configured. Please check console for details.");
    return;
  }

  const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/contacts.other.readonly',
    'openid'
  ].join(' ');

  // Construct the Google OAuth URL. Google will redirect to BACKEND_REDIRECT_URI
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: BACKEND_REDIRECT_URI, // Points to backend
    response_type: 'code',
    scope: scope,
    access_type: 'offline',
    prompt: 'consent'
  }).toString()}`;

  window.location.href = authUrl;
};

// handleOAuthCallback is no longer needed on the frontend as the backend handles the redirect.
// The backend will redirect the browser directly to /dashboard after processing.
