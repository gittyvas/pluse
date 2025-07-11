// google-oauth-app/google-oauth-app/backend/app.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
// FIX: Corrected the quote for 'morgan' - MUST BE CONSISTENT QUOTES
var logger = require("morgan"); // Consider 'tiny' or 'common' for production for less verbosity
var cors = require("cors");
var firebase = require("firebase-admin");

// Load environment variables. In production, these are typically set directly in the environment.
// For local development, ensure you have a .env file with these variables.
// require("dotenv").config(); // Uncomment this line if you are using a .env file for local development

var app = express();

// --- Environment Variable Checks (CRITICAL for Production) ---
if (!process.env.FRONTEND_URL) {
  console.error('CRITICAL ERROR: FRONTEND_URL environment variable is not set!');
  process.exit(1); // Exit the process if critical env var is missing
}
if (!process.env.APP_ID) {
  console.error('CRITICAL ERROR: APP_ID environment variable (Firebase Project ID) is not set!');
  process.exit(1);
}
if (!process.env.FIREBASE_CONFIG) {
  console.error('CRITICAL ERROR: FIREBASE_CONFIG environment variable (stringified service account JSON) is not set!');
  process.exit(1);
}

// Set up CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Use env var directly, no fallback
    credentials: true,
  })
);

// --- Initialize Firebase Admin SDK ---
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const appId = process.env.APP_ID; // Use env var directly, no fallback
console.log(`Backend: Initializing Firebase Admin SDK for APP_ID: ${appId}`);

const firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  projectId: firebaseConfig.projectId
}, appId);

// Make Firestore instance available globally via app.locals (good practice)
app.locals.db = firebase.firestore(firebaseAdminApp);
app.locals.authAdmin = firebase.auth(firebaseAdminApp); // Also make authAdmin available

// Now require routes/controllers AFTER Firebase is initialized
var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var apiRouter = require("./routes/api"); // This is where your profileRouter should be mounted

app.use(logger("dev")); // 'dev' is good for development, consider 'combined' or 'tiny' for production
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// --- Middleware to attach app_id to the request object ---
// This ensures req.app_id is available to all subsequent middleware and route handlers
app.use((req, res, next) => {
  req.app_id = process.env.APP_ID; // APP_ID is already checked at startup
  next();
});

// --- Route Mounting ---
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/api", apiRouter); // Your main API router, which should include profileRouter

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler (simplified for API-only backend)
app.use(function (err, req, res, next) {
  console.error("Backend Error Handler:", err.stack); // Log the full stack trace

  res.status(err.status || 500);

  res.json({
    message: err.message,
    // Only provide stacktrace in development environment
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;
