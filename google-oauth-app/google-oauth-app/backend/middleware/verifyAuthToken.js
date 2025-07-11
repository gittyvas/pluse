// backend/middleware/verifyAuthToken.js
const admin = require("firebase-admin"); // Firebase Admin SDK should be initialized in app.js

const verifyAuthToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for Authorization header presence and format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn('verifyAuthToken: Missing or malformed Authorization header.');
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token format." });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    // 2. Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 3. Attach user UID to the request object
    req.user = { uid: decodedToken.uid };

    // 4. Ensure req.app_id is set by a preceding middleware in app.js
    // This is critical for Firestore paths in your controllers.
    if (!req.app_id) {
      console.error('verifyAuthToken: CRITICAL ERROR: req.app_id is not set. Ensure it is set in app.js middleware.');
      return res.status(500).json({ message: 'Server configuration error: App ID missing in request context.' });
    }

    // 5. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // 6. Handle token verification errors
    console.error('verifyAuthToken: Error verifying ID token:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Unauthorized: Token expired. Please log in again.' });
    }
    // Generic error for other token verification failures (e.g., invalid signature, malformed token)
    return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};

module.exports = verifyAuthToken;
