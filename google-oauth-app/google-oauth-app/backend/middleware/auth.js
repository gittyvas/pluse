// google-oauth-app/google-oauth-app/backend/middleware/auth.js

const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
// const { getFirestore } = require("firebase-admin/firestore"); // Removed: Will use req.app.locals.db

// Load environment variables
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Middleware to verify JWT and attach user info to req.
 * Also retrieves and attaches Google access token from Firestore for API calls.
 */
const verifyToken = async (req, res, next) => {
  console.log("\n--- Backend Auth Middleware Start ---");
  console.log("Request URL:", req.originalUrl);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log("Received Authorization Header:", authHeader ? "Exists" : "Missing");
  console.log("Extracted JWT Token:", token ? "Exists" : "Missing");


  if (!token) {
    console.log("Auth Middleware: No token provided. Sending 401.");
    return res.status(401).json({ message: "Access Denied: No token provided." });
  }

  try {
    // 1. Verify the application JWT
    console.log("Auth Middleware: Verifying application JWT...");
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded JWT payload (userId, email, name)
    console.log("Auth Middleware: JWT Decoded successfully. User ID:", decoded.userId, "Email:", decoded.email);

    // 2. Retrieve Google access token from Firestore
    // Access Firestore instance from app.locals
    const db = req.app.locals.db;
    if (!db) {
      console.error("Auth Middleware: Firestore DB instance not found in app.locals.");
      return res.status(500).json({ message: "Firebase DB not initialized in backend." });
    }

    const appId = process.env.APP_ID || "default-app-id"; // Ensure APP_ID is consistent
    console.log("Auth Middleware: Using APP_ID:", appId);

    const userDocRef = db.collection(`artifacts/${appId}/users`).doc(req.user.userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.warn("Auth Middleware: User document not found in Firestore for userId:", req.user.userId);
      return res.status(401).json({ message: "Access Denied: User data not found in Firestore." });
    }

    const userData = userDoc.data();
    let googleAccessToken = userData.googleAccessToken;
    let googleRefreshToken = userData.googleRefreshToken;
    const googleTokenExpiryDate = userData.googleTokenExpiryDate ? new Date(userData.googleTokenExpiryDate) : null;

    console.log("Auth Middleware: Google Access Token Expiry:", googleTokenExpiryDate ? googleTokenExpiryDate.toISOString() : "None");
    console.log("Auth Middleware: Current Time:", new Date().toISOString());

    // Check if Google access token is expired or about to expire (e.g., within 5 minutes)
    if (!googleAccessToken || !googleTokenExpiryDate || googleTokenExpiryDate.getTime() < (Date.now() + 5 * 60 * 1000)) {
      console.log("Auth Middleware: Google access token expired or near expiry. Attempting to refresh...");
      if (!googleRefreshToken) {
        console.error("Auth Middleware: No Google refresh token available for user:", req.user.userId);
        return res.status(401).json({ message: "Access Denied: Google session expired, no refresh token." });
      }

      try {
        // Use google-auth-library to refresh the token
        client.setCredentials({ refresh_token: googleRefreshToken });
        const { credentials } = await client.refreshAccessToken();

        googleAccessToken = credentials.access_token;
        const newExpiryDate = new Date(Date.now() + (credentials.expires_in * 1000)); // expires_in is in seconds

        // Update Firestore with new tokens and expiry
        await userDocRef.update({
          googleAccessToken: googleAccessToken,
          googleTokenExpiryDate: newExpiryDate.toISOString(),
          // googleRefreshToken: credentials.refresh_token || googleRefreshToken // Refresh token might not always be returned
        });
        console.log("Auth Middleware: Google access token refreshed and Firestore updated. New expiry:", newExpiryDate.toISOString());

      } catch (refreshError) {
        console.error("Auth Middleware: Error refreshing Google access token:", refreshError);
        // If refresh fails, the user needs to re-authenticate
        return res.status(401).json({ message: "Access Denied: Could not refresh Google token. Please re-authenticate." });
      }
    } else {
      console.log("Auth Middleware: Google access token is valid and not near expiry.");
    }

    req.user.googleAccessToken = googleAccessToken; // Attach updated Google access token to req.user
    console.log("Auth Middleware: Successfully attached Google Access Token to req.user. Proceeding.");
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("Auth Middleware: JWT verification or token refresh failed:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access Denied: Application token expired." });
    }
    return res.status(403).json({ message: "Access Denied: Invalid token." });
  } finally {
    console.log("--- Backend Auth Middleware End ---\n");
  }
};

module.exports = verifyToken;
