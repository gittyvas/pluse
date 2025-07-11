// google-oauth-app/backend/routes/contacts.js
// -----------------------------------------------------------------------------
// Contacts route – fetches Google contacts for the authenticated Pulse user.
// Uses Google ID tokens for auth, verifies them with google‑auth‑library, then
// looks up the stored Google *access* token in Firestore to call People API.
// -----------------------------------------------------------------------------

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

// -----------------------------------------------------------------------------
// 🔐  Token‑verification middleware
// -----------------------------------------------------------------------------

// Your Google OAuth Client ID – set this in env so it works in all envs.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ||
  "228967078285-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com";

const oauthClient = new OAuth2Client(CLIENT_ID);

/**
 * verifyAccessToken – Express middleware that checks the Authorization header
 * for a Google **ID token** (JWT that starts with `eyJ…`).  If valid, it places
 * the decoded payload on `req.user` (email, sub, etc.) and calls `next()`.  If
 * invalid/missing, it returns 401.
 */
async function verifyAccessToken(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const idToken = authorization.split(" ")[1];

    // Verify the token’s signature & audience
    const ticket = await oauthClient.verifyIdToken({ idToken, audience: CLIENT_ID });
    req.user = ticket.getPayload(); // { sub, email, name, picture, … }

    next();
  } catch (err) {
    console.error("ID‑token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired ID token" });
  }
}

// -----------------------------------------------------------------------------
// GET /contacts/list – fetch user’s Google People connections
// -----------------------------------------------------------------------------
router.get("/list", verifyAccessToken, async (req, res) => {
  try {
// routes/contacts.js
router.get(["/", "/list"], verifyAccessToken, async (req, res) => {
  // ... your existing Google People API logic ...
});

    // Firestore handle was attached to Express in app.js:
    //     app.locals.db = admin.firestore();
    const db = req.app.locals.db;
    const usersCol = db.collection("users");

    // Google ID token payload gives us `sub` (Google user ID)
    const googleUid = req.user.sub;
    if (!googleUid) {
      return res.status(400).json({ error: "Could not determine Google UID" });
    }

    // Look up the stored Google *access* token we saved after OAuth flow
    const userSnap = await usersCol.doc(googleUid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User document not found" });
    }

    const { googleAccessToken } = userSnap.data();
    if (!googleAccessToken) {
      return res.status(400).json({ error: "Google access token not stored for user" });
    }

    // Call Google People API
    const { data } = await axios.get(
      "https://people.googleapis.com/v1/people/me/connections",
      {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
        params: {
          personFields: "names,emailAddresses,phoneNumbers,photos",
          pageSize: 200,
        },
      }
    );

    const connections = data.connections || [];
    const contacts = connections.map((c) => ({
      resource_name: c.resourceName,
      name: c.names?.[0]?.displayName || null,
      emails: c.emailAddresses || [],
      phones: c.phoneNumbers || [],
      photo_url: c.photos?.[0]?.url || null,
    }));

    return res.json(contacts);
  } catch (err) {
    console.error("Error fetching Google contacts:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch contacts", details: err.message });
  }
});

module.exports = router;
