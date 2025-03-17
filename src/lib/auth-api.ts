// src/lib/auth-api.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

// Helper function to protect API routes
export async function authenticateAPI(
  req: NextRequest, 
  handler: (userId: string, req: NextRequest) => Promise<NextResponse>
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    return await handler(session.user.id, req);
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Example usage in an API route:
/*
export async function GET(req: NextRequest) {
  return authenticateAPI(req, async (userId, req) => {
    // Your authenticated API logic here
    // You can access the userId safely
    
    const data = await YourModel.find({ userId });
    
    return NextResponse.json(data);
  });
}
*/