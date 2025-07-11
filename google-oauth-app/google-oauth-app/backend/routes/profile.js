// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyAuthToken = require('../middleware/verifyAuthToken'); // Your authentication middleware

// Protect all profile routes with authentication middleware
router.use(verifyAuthToken); // Assuming verifyAuthToken attaches req.user.uid and req.app_id

// Route to disconnect Google account
router.post('/disconnect', profileController.disconnectGoogleAccount);

// Route to delete user account
router.delete('/account', profileController.deleteUserAccount);

// Route to update notification settings
router.post('/notifications', profileController.updateNotificationSettings);

// Route to end a specific session (simplified)
router.post('/sessions/end', profileController.endSession);

module.exports = router;
