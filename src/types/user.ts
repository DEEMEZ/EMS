// src/types/user.ts
export interface IUser {
  _id?: string;
  fullname: string;
  email: string;
  password?: string;
  role: 'User'; // Strictly only 'User' role
  phone?: string;
  isVerified?: boolean;
  
  // OTP Verification Fields
  verificationOTP?: string;
  verificationOTPExpires?: Date;
  verificationAttempts?: number;
  
  // Password Reset Fields (matches model exactly)
  resetPasswordOTP?: string;
  resetPasswordOTPExpires?: Date;
  
  // Metadata Fields
  createdAt?: Date;
  modifiedBy?: string;
  modifiedDate?: Date;
  updatedAt?: Date; // From timestamps: true
}