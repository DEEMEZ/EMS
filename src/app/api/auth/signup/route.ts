/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth/signup/route.ts
import { generateVerificationEmail, sendEmail } from "@/lib/email";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { fullname, email, password, phone } = await req.json();
    
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); 
    
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phone: phone || "",
      verificationOTP: otp,
      verificationOTPExpires: otpExpires,
      modifiedBy: "System",
    });
    
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: generateVerificationEmail(fullname, otp)
    });
    
    const user = newUser.toObject();
    delete user.password;
    delete user.verificationOTP;
    delete user.verificationOTPExpires;
    
    return NextResponse.json(
      { message: "Verification OTP sent to email", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Signup failed", error: error.message },
      { status: 500 }
    );
  }
}