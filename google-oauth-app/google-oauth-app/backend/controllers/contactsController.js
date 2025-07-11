// google-oauth-app/google-oauth-app/backend/controllers/contactsController.js

const { google } = require("googleapis");
require("dotenv").config();

const APP_ID = process.env.APP_ID || "default-app-id";

/**
 * Fetches contacts from Google People API for the authenticated user.
 * Requires req.user.googleAccessToken to be set by auth middleware.
 */
exports.getContacts = async (req, res) => {
  console.log("\n--- Contacts Controller: getContacts Start ---");
  console.log("Contacts Controller: User ID from JWT:", req.user.userId);
  console.log("Contacts Controller: Google Access Token present:", !!req.user.googleAccessToken);

  if (!req.user || !req.user.googleAccessToken) {
    console.error("Contacts Controller: Missing user or Google access token in request.");
    return res.status(401).json({ message: "Not authenticated with Google." });
  }

  try {
    // 🔐 Wrap the access token into an OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: req.user.googleAccessToken });

    const people = google.people({
      version: "v1",
      auth: oauth2Client, // ✅ This is now the correct auth object
    });

    // Fetch connections (contacts)
    const response = await people.people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses,phoneNumbers,photos",
      pageSize: 2000,
    });

    const connections = response.data.connections || [];
    console.log(`Contacts Controller: Found ${connections.length} Google contacts.`);

    // Optional: Access Firestore instance if needed
    const db = req.app.locals.db;
    if (!db) {
      console.error("Contacts Controller: Firestore DB instance not found in app.locals.");
      return res.status(500).json({ message: "Firebase DB not initialized in backend." });
    }

    // Optional: You can save/update contacts in Firestore here if needed
    // const userContactsCollectionRef = db.collection(`artifacts/${APP_ID}/users/${req.user.userId}/contacts`);

    res.status(200).json(connections);
    console.log("Contacts Controller: Successfully sent contacts response.");
  } catch (error) {
    console.error("Contacts Controller: Error fetching Google contacts:", error.message);
    if (error.code === 401 || error.code === 403) {
      console.error("Contacts Controller: Google API returned 401/403. Suggesting re-authentication.");
      return res.status(401).json({ message: "Google API authentication failed. Please re-authenticate." });
    }
    res.status(500).json({ message: "Failed to fetch contacts from Google.", error: error.message });
  } finally {
    console.log("--- Contacts Controller: getContacts End ---\n");
  }
};
