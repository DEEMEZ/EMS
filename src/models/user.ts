// src/models/user.ts
import { IUser } from "@/types/user";
import mongoose, { Document, Schema } from "mongoose";

const UserSchema = new Schema<IUser & Document>(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: "User" },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpires: { type: Date },
    verificationOTPExpires: { type: Date },
    verificationAttempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedBy: { type: String, default: "System" },
    modifiedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser & Document>("User", UserSchema);
export default User;