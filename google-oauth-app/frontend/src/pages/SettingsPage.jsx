import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../lib/firebase"; // Corrected import path for firebase.js
import { deleteUser } from "firebase/auth"; // Keep this for the deleteUser function
import { doc, deleteDoc } from "firebase/firestore"; // Import Firestore functions

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Firebase App ID (from AuthContext or global window)
  const appId = typeof window.__app_id !== 'undefined' ? window.____app_id : 'default-app-id'; // Corrected __app_id access

  // Removed: States to hold Firebase instances (firebaseAuth, firestoreDb)
  // Removed: useEffect to initialize Firebase instances, as auth and db are now imported directly

  const handleDeleteAccount = async () => {
    // Use the imported 'auth' and 'db' directly
    if (!auth || !db || !user || !user.userId) {
      setError("Firebase or user data not ready for deletion.");
      return;
    }

    setShowDeleteConfirm(false); // Hide confirmation modal

    try {
      // 1. Delete user data from Firestore
      const userDocRef = doc(db, `artifacts/${appId}/users/${user.userId}`);
      await deleteDoc(userDocRef);
      console.log(`SettingsPage: Deleted user data from Firestore for ID: ${user.userId}`);

      // 2. Delete contacts data from Firestore (if a separate collection exists)
      const contactsCollectionRef = window.firebase.firestore.collection(db, `artifacts/${appId}/users/${user.userId}/contacts`);
      const contactsSnapshot = await window.firebase.firestore.getDocs(contactsCollectionRef);
      const deleteContactsPromises = contactsSnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deleteContactsPromises);
      console.log(`SettingsPage: Deleted ${contactsSnapshot.size} contacts from Firestore for user: ${user.userId}`);

      // 3. Delete pinned contacts data from Firestore (if a separate collection exists)
      const pinnedContactsCollectionRef = window.firebase.firestore.collection(db, `artifacts/${appId}/users/${user.userId}/pinnedContacts`);
      const pinnedContactsSnapshot = await window.firebase.firestore.getDocs(pinnedContactsCollectionRef);
      const deletePinnedContactsPromises = pinnedContactsSnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePinnedContactsPromises);
      console.log(`SettingsPage: Deleted ${pinnedContactsSnapshot.size} pinned contacts from Firestore for user: ${user.userId}`);


      // 4. Delete the user from Firebase Authentication
      // Get the current Firebase Auth user
      const currentUser = auth.currentUser; // Use the imported 'auth'
      if (currentUser && currentUser.uid === user.userId) {
        await deleteUser(currentUser);
        console.log(`SettingsPage: Deleted user from Firebase Auth: ${user.userId}`);
        setSuccessMessage("Account and all associated data deleted successfully. Logging out...");
        setTimeout(logout, 2000); // Logout after a short delay
      } else {
        setError("No authenticated Firebase user found or mismatch. Please log in again.");
        logout(); // Force logout if auth state is problematic
      }

    } catch (err) {
      console.error("SettingsPage: Error deleting account:", err);
      // Firebase Auth errors can include 'auth/requires-recent-login'
      if (err.code === 'auth/requires-recent-login') {
        setError("For security, please log in again to delete your account.");
        logout(); // Force logout so user can re-authenticate
      } else {
        setError("Failed to delete account. Please try again. Error: " + err.message);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Access Denied. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-400">Settings</h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
      >
        ← Back to Dashboard
      </button>

      {error && (
        <div className="bg-red-800 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-800 text-white p-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}

      <Card className="bg-gray-800 border border-gray-700 text-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold mb-4">Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Here you can manage your account settings. Be careful with actions like deleting your account, as this cannot be undone.
          </p>

          <h3 className="text-lg font-semibold mb-2 text-red-400">Delete Account</h3>
          <p className="mb-4">
            Permanently delete your Pulse CRM account and all associated data. This action is irreversible.
          </p>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Delete My Account
          </Button>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
                <p className="text-lg font-semibold mb-4">Are you absolutely sure?</p>
                <p className="mb-6 text-gray-300">
                  This action cannot be undone. This will permanently delete your account and all your data.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
                  >
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
