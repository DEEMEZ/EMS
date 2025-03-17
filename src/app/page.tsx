// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect if status is known
    if (status === "authenticated") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    
    // Fallback redirect after a timeout (in case session checking takes too long)
    const timeout = setTimeout(() => {
      if (status === "loading") {
        router.push("/auth/signin");
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [status, router]);

  // Loading indicator
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p>Please wait while we check your authentication status.</p>
        <button 
          onClick={() => router.push("/auth/signin")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}