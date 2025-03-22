/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth/signup/route.ts
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { fullname, email, password, phone } = await req.json();
    
    // Validate required fields
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phone: phone || "",
      modifiedBy: "System",
    });
    
    // Remove password from response
    const user = newUser.toObject();
    delete user.password;
    
    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    return NextResponse.json(
      { message: "Failed to create user", error: error.message },
      { status: 500 }
    );
  }
}