// middleware/verifyAuthToken.js
const admin = require("firebase-admin");

const verifyAuthToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Use Firebase Admin SDK to verify Google access token (indirect workaround)
    const user = await admin.auth().verifyIdToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token", details: err.message });
  }
};
