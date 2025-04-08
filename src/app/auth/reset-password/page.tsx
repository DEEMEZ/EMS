// src/app/auth/reset-password/page.tsx
import { Suspense } from "react";
import { ResetPasswordContent } from "./reset-password-content";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Suspense fallback={
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <p>Loading password reset form...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}