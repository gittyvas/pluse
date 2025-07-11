// google-oauth-app/frontend/src/components/DeleteAccountModal.jsx

import React from 'react';

function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h3 className="text-2xl font-bold text-white mb-6">Confirm Account Deletion</h3>
        <p className="text-gray-300 mb-8">
          Are you absolutely sure you want to delete your account? This action is irreversible. All your associated data (notes, etc.) will be permanently removed.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
