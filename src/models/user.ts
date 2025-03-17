// src/models/user.ts
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new Schema<IUser & Document>(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Add password field
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
    modifiedBy: { type: String, default: "System" },
    modifiedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent model overwrite error in development due to Next.js hot reloading
const User = mongoose.models.User || mongoose.model<IUser & Document>("User", UserSchema);

export default User;