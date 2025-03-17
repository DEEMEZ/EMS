// src/lib/auth.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// Function to get the current user ID from server components
export async function getCurrentUserId() {
  const session = await getServerSession();
  return session?.user?.id || null;
}

// Function to check authentication and return user ID or unauthorized response
export async function authenticate() {
  const session = await getServerSession();
  
  if (!session || !session.user || !session.user.id) {
    return { 
      userId: null, 
      unauthorized: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    };
  }
  
  return { 
    userId: session.user.id, 
    unauthorized: null 
  };
}