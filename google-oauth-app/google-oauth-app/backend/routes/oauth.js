// google-oauth-app/backend/routes/oauth.js

var express = require("express");
var router = express.Router();
const axios = require("axios");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken

router.get("/", async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;
  const db = req.app.locals.db; // Access Firestore

  if (error) {
    console.error("Google OAuth Error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    console.error("No authorization code received from Google.");
    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=${encodeURIComponent("No authorization code received")}`
    );
  }

  try {
    // 1. Exchange Authorization Code for Access Token and Refresh Token
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI, // Ensure this matches Google Cloud Console and your .env
      grant_type: "authorization_code",
    });

    const { access_token, refresh_token, id_token } = tokenResponse.data;
    console.log("Successfully exchanged code for tokens!");

    // 2. Fetch User Profile with Access Token
    const userProfileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const userProfile = userProfileResponse.data;
    console.log("User Profile:", userProfile);

    // 3. Create/Find User in Firestore and Store Tokens
    const usersCollection = db.collection("users");
    const userDocRef = usersCollection.doc(userProfile.sub); // Use Google ID as Firestore doc ID

    await userDocRef.set(
      {
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        googleAccessToken: access_token,
        // Only store refresh_token if it's provided (it's not always provided on subsequent logins, only first time or when scope changes)
        ...(refresh_token && { googleRefreshToken: refresh_token }),
        // Add other profile fields as needed
      },
      { merge: true }
    );

    console.log("User data and Google tokens saved/updated in Firestore:", userProfile.sub);

    // 4. Generate your application-specific JWT
    const appToken = jwt.sign(
      { userId: userProfile.sub, email: userProfile.email, name: userProfile.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );
    console.log("Generated app JWT:", appToken);

    // 5. Redirect to Frontend Dashboard with App JWT and User Info
    const frontendDashboardUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`;

    // Ensure this entire string is on ONE LOGICAL LINE (no internal newlines within the backticks)
    const redirectUrl = `${frontendDashboardUrl}?token=${appToken}&email=${encodeURIComponent(userProfile.email)}&name=${encodeURIComponent(userProfile.name)}&picture=${encodeURIComponent(userProfile.picture || "")}&userId=${userProfile.sub}`;

    console.log("Backend: Redirecting to:", redirectUrl); // Keep this log for verification

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Error during Google OAuth process:", err.response ? err.response.data : err.message);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=${encodeURIComponent("OAuth process failed. Please try again.")}`
    );
  }
});

module.exports = router;
