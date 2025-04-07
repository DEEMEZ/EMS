// src/app/api/auth/forgot-password/route.ts
import { sendEmail } from "@/lib/email";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "If account exists, OTP has been sent" },
        { status: 200 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); 

    const hashedOTP = await bcrypt.hash(otp, 10);

    await User.findByIdAndUpdate(user._id, {
      resetPasswordOTP: hashedOTP,
      resetPasswordOTPExpires: expires,
      verificationAttempts: 0
    });

    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div>
          <h2>Password Reset</h2>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 15 minutes and will be your new password.</p>
          <p>Note: This will also verify your email address.</p>
        </div>
      `
    });

    return NextResponse.json(
      { message: "OTP sent to email" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}