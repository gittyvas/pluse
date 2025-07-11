// google-oauth-app/google-oauth-app/backend/routes/auth.js

var express = require("express");
var router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

require("dotenv").config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/oauth";
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const APP_ID = process.env.APP_ID || "default-app-id";

console.log("Auth Route Init: GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "Loaded" : "MISSING");
console.log("Auth Route Init: GOOGLE_CLIENT_SECRET:", GOOGLE_CLIENT_SECRET ? "Loaded" : "MISSING");
console.log("Auth Route Init: REDIRECT_URI:", REDIRECT_URI);

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

router.get("/google", (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/contacts.readonly",
      "https://www.googleapis.com/auth/contacts.other.readonly",
    ],
    prompt: "consent",
  });
  console.log("Auth Route: Redirecting to Google OAuth URL:", authUrl);
  res.redirect(authUrl);
});

router.get("/oauth", async (req, res) => {
  const { code } = req.query;
  console.log("Auth Route: Received OAuth callback with code:", code ? "Exists" : "Missing");

  if (!code) {
    console.error("Auth Route: No code received in OAuth callback.");
    return res.redirect(`${FRONTEND_URL}/login?error=no_code_received`);
  }

  try {
    console.log("Auth Route: Attempting to exchange code for tokens...");
    console.log("Auth Route: getToken parameters - Client ID:", client._clientId);
    console.log("Auth Route: getToken parameters - Client Secret:", client._clientSecret ? "Loaded" : "MISSING");
    console.log("Auth Route: getToken parameters - Redirect URI:", client.redirectUri);
    console.log("Auth Route: getToken parameters - Code length:", code.length);

    const { tokens } = await client.getToken(code);
    console.log("Auth Route: Successfully exchanged code for tokens!");
    console.log("Auth Route: Received tokens - Access Token present:", !!tokens.access_token);
    console.log("Auth Route: Received tokens - Refresh Token present:", !!tokens.refresh_token);
    console.log("Auth Route: Received tokens - Expiry Date:", new Date(tokens.expiry_date).toISOString());

    client.setCredentials(tokens);
    console.log("Auth Route: Client credentials set.");

    const oauth2 = google.oauth2({
      auth: client,
      version: "v2",
    });

    console.log("Auth Route: Attempting to fetch user info from Google...");
    const { data: userProfile } = await client.request({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    console.log("Auth Route: User Profile fetched successfully:", userProfile.email);
    console.log("Auth Route: User Profile Picture:", userProfile.picture);

    const db = req.app.locals.db;
    if (!db) {
      console.error("Auth Route: Firestore DB instance not found in app.locals.");
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent("Firebase DB not initialized in backend.")}`);
    }

    const userId = userProfile.id || userProfile.sub;
    const userDocRef = db.collection(`artifacts/${APP_ID}/users`).doc(userId);

    await userDocRef.set(
      {
        userId: userId,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || null,
        googleTokenExpiryDate: new Date(tokens.expiry_date).toISOString(),
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("Auth Route: User data and Google tokens saved/updated in Firestore:", userId);

    const appToken = jwt.sign(
      {
        userId: userId,
        email: userProfile.email,
        name: userProfile.name,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Auth Route: Generated app JWT:", appToken);

    const redirectUrl = `${FRONTEND_URL}/dashboard?token=${appToken}&email=${encodeURIComponent(userProfile.email)}&name=${encodeURIComponent(userProfile.name)}&picture=${encodeURIComponent(userProfile.picture || "")}&userId=${encodeURIComponent(userId)}`;
    console.log("Auth Route: Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Auth Route: Error during OAuth callback:", error);
    if (error.response && error.response.data) {
      console.error("Auth Route: Google API Error Response Data:", error.response.data);
    }
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error.message || "oauth_failed")}`);
  }
});

module.exports = router;
