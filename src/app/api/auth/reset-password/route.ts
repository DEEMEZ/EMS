// src/app/api/auth/reset-password/route.ts
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();

    if (!email || !otp || otp.length !== 6) {
      return NextResponse.json(
        { error: "Valid email and 6-digit OTP required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email,
      resetPasswordOTPExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid OTP or expired" },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, user.resetPasswordOTP || "");
    if (!isValidOTP) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(otp, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      isVerified: true, 
      resetPasswordOTP: undefined,
      resetPasswordOTPExpires: undefined
    });

    return NextResponse.json(
      { 
        message: "Password reset successfully",
        note: "Your email has also been verified",
        temporaryPassword: otp 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}