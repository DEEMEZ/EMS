// src/hooks/useAuth.ts
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const userId = session?.user?.id;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  
  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };
  
  return {
    session,
    status,
    userId,
    isAuthenticated,
    isLoading,
    logout,
  };
}