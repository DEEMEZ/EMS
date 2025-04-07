// src/app/api/account/delete/route.ts
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.sub) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await dbConnect();
    
    await Promise.all([
      User.findByIdAndDelete(token.sub),
      
    ]);

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}