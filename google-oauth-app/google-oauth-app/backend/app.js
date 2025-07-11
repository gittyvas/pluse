// google-oauth-app/google-oauth-app/backend/app.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var firebase = require("firebase-admin"); // Import firebase-admin
var { getFirestore } = require("firebase-admin/firestore"); // Import getFirestore

require("dotenv").config(); // Load environment variables

var app = express(); // --- CRITICAL: Define 'app' here first! ---

// Set up CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow requests from your frontend
    credentials: true, // Allow cookies and authorization headers
  })
);

// --- Initialize Firebase Admin SDK AFTER 'app' is defined ---
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const appId = process.env.APP_ID || "default-app-id";
console.log(`Backend: Initializing Firebase Admin SDK for APP_ID: ${appId}`);
const firebaseAdminApp = firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  projectId: firebaseConfig.projectId // Explicitly set projectId
}, appId); // Pass appId as the name for the Firebase app
app.locals.db = getFirestore(firebaseAdminApp); // Make Firestore instance available globally via app.locals

// Now require routes/controllers AFTER Firebase is initialized and app.locals.db is set
var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var apiRouter = require("./routes/api");


// Removed view engine setup as this is an API-only backend
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/", authRouter); // Mount authRouter directly under /
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler (simplified for API-only backend)
app.use(function (err, req, res, next) {
  console.error("Backend Error Handler:", err.stack); // Log the full stack trace

  // Set status code (default to 500 if not set)
  res.status(err.status || 500);

  // Send JSON error response
  res.json({
    message: err.message,
    // Only provide stacktrace in development environment
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;
