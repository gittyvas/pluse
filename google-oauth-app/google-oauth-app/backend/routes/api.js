// google-oauth-app/google-oauth-app/backend/routes/api.js

var express = require("express");
var router = express.Router();
var verifyToken = require("../middleware/auth"); // Auth middleware
var contactsController = require("../controllers/contactsController");
var remindersController = require("../controllers/remindersController"); // Assuming this exists

// Middleware to log all API requests
router.use((req, res, next) => {
  console.log(`\n--- API Route: ${req.method} ${req.originalUrl} ---`);
  next();
});

// Protected route for contacts
// This route will first go through verifyToken middleware
router.get("/contacts", verifyToken, contactsController.getContacts);
console.log("API Routes: Registered GET /contacts route with verifyToken middleware.");


// Protected routes for reminders
router.get("/reminders", verifyToken, remindersController.getReminders);
router.post("/reminders", verifyToken, remindersController.createReminder);
router.put("/reminders/:id", verifyToken, remindersController.updateReminder);
router.delete("/reminders/:id", verifyToken, remindersController.deleteReminder);
console.log("API Routes: Registered /reminders routes with verifyToken middleware.");


// Example unprotected route (for testing if needed)
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Test API route hit successfully!" });
});
console.log("API Routes: Registered GET /test route (unprotected).");

module.exports = router;
