import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

const dbConnect = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    return await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error('DB connection failed:', error);
  }
};

export default dbConnect;