

// Define the User interface
import { IUser } from "@/types/user";
import mongoose, { Document, Schema } from "mongoose";

const UserSchema = new Schema<IUser & Document>(
  {
    fullname: { type: String, required: true },
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
