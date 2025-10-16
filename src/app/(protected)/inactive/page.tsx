"use client";
import { signOut } from "next-auth/react";

export default function InactivePage() {
  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-md shadow text-center space-y-6">
        <div className="text-6xl">🚫</div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Account Inactive</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your account has been deactivated. Please contact an administrator for assistance.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
