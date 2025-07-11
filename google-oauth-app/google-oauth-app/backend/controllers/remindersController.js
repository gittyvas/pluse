// google-oauth-app/google-oauth-app/backend/controllers/remindersController.js

// const { getFirestore } = require("firebase-admin/firestore"); // Removed: Will use req.app.locals.db
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

require("dotenv").config();
const APP_ID = process.env.APP_ID || "default-app-id";

/**
 * Get all reminders for the authenticated user.
 */
exports.getReminders = async (req, res) => {
  console.log("\n--- Reminders Controller: getReminders Start ---");
  console.log("Reminders Controller: User ID:", req.user.userId);

  if (!req.user || !req.user.userId) {
    console.error("Reminders Controller: User not authenticated.");
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Access Firestore instance from app.locals
    const db = req.app.locals.db;
    if (!db) {
      console.error("Reminders Controller: Firestore DB instance not found in app.locals.");
      return res.status(500).json({ message: "Firebase DB not initialized in backend." });
    }

    const remindersCollectionRef = db.collection(`artifacts/${APP_ID}/users/${req.user.userId}/reminders`);
    const snapshot = await remindersCollectionRef.get();

    const reminders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Reminders Controller: Found ${reminders.length} reminders.`);
    res.status(200).json({ reminders });
  } catch (error) {
    console.error("Reminders Controller: Error fetching reminders:", error.message);
    res.status(500).json({ message: "Failed to fetch reminders.", error: error.message });
  } finally {
    console.log("--- Reminders Controller: getReminders End ---\n");
  }
};

/**
 * Create a new reminder for the authenticated user.
 */
exports.createReminder = async (req, res) => {
  console.log("\n--- Reminders Controller: createReminder Start ---");
  console.log("Reminders Controller: User ID:", req.user.userId);
  console.log("Reminders Controller: Request Body:", req.body);

  const { title, description, dueDate } = req.body;

  if (!title || !dueDate) {
    console.error("Reminders Controller: Missing title or dueDate for new reminder.");
    return res.status(400).json({ message: "Title and Due Date are required." });
  }
  if (!req.user || !req.user.userId) {
    console.error("Reminders Controller: User not authenticated.");
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Access Firestore instance from app.locals
    const db = req.app.locals.db;
    if (!db) {
      console.error("Reminders Controller: Firestore DB instance not found in app.locals.");
      return res.status(500).json({ message: "Firebase DB not initialized in backend." });
    }

    const remindersCollectionRef = db.collection(`artifacts/${APP_ID}/users/${req.user.userId}/reminders`);

    const newReminder = {
      id: uuidv4(), // Generate a unique ID for the reminder
      title,
      description: description || "",
      dueDate: new Date(dueDate).toISOString(), // Store as ISO string
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await remindersCollectionRef.doc(newReminder.id).set(newReminder); // Use set with doc.id for explicit ID

    console.log("Reminders Controller: New reminder created:", newReminder.id);
    res.status(201).json({ message: "Reminder created successfully.", reminder: newReminder });
  } catch (error) {
    console.error("Reminders Controller: Error creating reminder:", error.message);
    res.status(500).json({ message: "Failed to create reminder.", error: error.message });
  } finally {
    console.log("--- Reminders Controller: createReminder End ---\n");
  }
};

/**
 * Update an existing reminder for the authenticated user.
 */
exports.updateReminder = async (req, res) => {
  console.log("\n--- Reminders Controller: updateReminder Start ---");
  console.log("Reminders Controller: User ID:", req.user.userId);
  console.log("Reminders Controller: Reminder ID:", req.params.id);
  console.log("Reminders Controller: Request Body:", req.body);

  const { id } = req.params;
  const updates = req.body;

  if (!req.user || !req.user.userId) {
    console.error("Reminders Controller: User not authenticated.");
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Access Firestore instance from app.locals
    const db = req.app.locals.db;
    if (!db) {
      console.error("Reminders Controller: Firestore DB instance not found in app.locals.");
      return res.status(500).json({ message: "Firebase DB not initialized in backend." });
    }

    const reminderDocRef = db.collection(`artifacts/${APP_ID}/users/${req.user.userId}/reminders`).doc(id);
    const reminderDoc = await reminderDocRef.get();

    if (!reminderDoc.exists) {
      console.warn("Reminders Controller: Reminder not found for update:", id);
      return res.status(404).json({ message: "Reminder not found." });
    }

    // Prepare updates, ensuring dueDate is converted to ISO string if present
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    if (updatedFields.dueDate) {
      updatedFields.dueDate = new Date(updatedFields.dueDate).toISOString();
    }

    await reminderDocRef.update(updatedFields);

    const updatedReminder = { id: reminderDoc.id, ...reminderDoc.data(), ...updatedFields };
    console.log("Reminders Controller: Reminder updated:", id);
    res.status(200).json({ message: "Reminder updated successfully.", reminder: updatedReminder });
  } catch (error) {
    console.error("Reminders Controller: Error updating reminder:", error.message);
    res.status(500).json({ message: "Failed to update reminder.", error: error.message });
  } finally {
    console.log("--- Reminders Controller: updateReminder End ---\n");
  }
};

/**
 * Delete a reminder for the authenticated user.
 */
exports.deleteReminder = async (req, res) => {
  console.log("\n--- Reminders Controller: deleteReminder Start ---");
  console.log("Reminders Controller: User ID:", req.user.userId);
  console.log("Reminders Controller: Reminder ID:", req.params.id);

  const { id } = req.params;

  if (!req.user || !req.user.userId) {
    console.error("Reminders Controller: User not authenticated.");
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Access Firestore instance from app.locals
    const db = req.app.locals.db;
    if (!db) {
      console.error("Reminders Controller: Firestore DB instance not found in app.locals.");
      return res.status(500).json({ message: "Firebase DB not initialized in backend." });
    }
    const reminderDocRef = db.collection(`artifacts/${APP_ID}/users/${req.user.userId}/reminders`).doc(id);
    await reminderDocRef.delete();

    console.log("Reminders Controller: Reminder deleted:", id);
    res.status(200).json({ message: "Reminder deleted successfully." });
  } catch (error) {
    console.error("Reminders Controller: Error deleting reminder:", error.message);
    res.status(500).json({ message: "Failed to delete reminder.", error: error.message });
  } finally {
    console.log("--- Reminders Controller: deleteReminder End ---\n");
  }
};
