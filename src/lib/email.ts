// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: `"DEEMEZ" <${process.env.EMAIL_FROM}>`,
      ...options,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export function generateVerificationEmail(name: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Email Verification</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 4px; font-size: 24px; font-weight: bold; text-align: center; margin: 16px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br/>DEEMEZ</p>
    </div>
  `;
}

export function generatePasswordResetEmail(name: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Please use the following OTP to proceed:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 4px; font-size: 24px; font-weight: bold; text-align: center; margin: 16px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br/>Your App Team</p>
    </div>
  `;
}