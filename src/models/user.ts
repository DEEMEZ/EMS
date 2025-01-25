import mongoose, { Schema, Document } from 'mongoose';

// Define the User interface
export interface IUser extends Document {
    FullName: string;
    Email: string;
    Phone: string;
    Role: string;
    CreatedAt: Date;
}

// Define the User schema
const UserSchema: Schema = new Schema({
    FullName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Phone: { type: String, required: true },
    Role: { type: String, required: true, enum: ['Admin', 'User'] },
    CreatedAt: { type: Date, default: Date.now },
});

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;
