const { OAuth2Client } = require("google-auth-library");

// Your Google OAuth Client ID (from Google Cloud Console)
const CLIENT_ID = "228967078285-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"; // <-- Replace this with your actual client ID

const client = new OAuth2Client(CLIENT_ID);

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // You can attach user info to req.user if needed
    req.user = payload;

    next(); // token is valid
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
