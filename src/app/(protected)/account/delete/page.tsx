/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/account/delete/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAccountPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE MY ACCOUNT") {
      setError("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await logout();
      router.push("/auth/signin?accountDeleted=true");
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Trash2 className="mx-auto h-12 w-12 text-red-600" />
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Delete Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            This action cannot be undone. All your data will be permanently removed.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Type <span className="font-bold">DELETE MY ACCOUNT</span> to confirm
            </label>
            <input
              id="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="DELETE MY ACCOUNT"
            />
          </div>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={loading || confirmText !== "DELETE MY ACCOUNT"}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting Account...
              </>
            ) : "Permanently Delete Account"}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <button
            onClick={() => router.back()}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
}