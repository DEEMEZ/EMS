

// Define the User interface
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new Schema<IUser & Document>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    createdAt: { type: Date, default: Date.now },
    modifiedBy: { type: String, default: "System" },
    modifiedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser & Document>("User", UserSchema);
