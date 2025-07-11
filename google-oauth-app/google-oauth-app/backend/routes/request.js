// google-oauth-app/backend/routes/request.js

var express = require('express');
var router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis'); // Ensure googleapis is imported for scopes
require('dotenv').config(); // Ensure env vars are loaded here too

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth'; // Must match Authorized redirect URIs in Google Console

/* POST endpoint to initiate Google OAuth. */
router.post('/', async function(req, res, next) {
  try {
    const oAuth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    // Generate the URL that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline', // To get a refresh token for long-lived access
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',
        'https://www.googleapis.com/auth/contacts.readonly',       // Read-only access to all contacts
        'https://www.googleapis.com/auth/contacts.other.readonly', // Read-only access to "Other contacts"
        'https://www.googleapis.com/auth/calendar.readonly'        // Read-only access to calendar events
      ],
      prompt: 'consent' // Forces consent dialog every time (good for testing)
    });

    // Send the URL back to the frontend
    res.json({ url: authorizeUrl });

  } catch (error) {
    console.error('Error generating Google Auth URL:', error);
    res.status(500).json({ error: 'Failed to initiate authentication.' });
  }
});

module.exports = router;
