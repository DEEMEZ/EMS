import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'your-mongodb-connection-string-here';

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('Already connected to MongoDB');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', (error as Error).message, (error as Error).stack);
    throw error;
  }
};

export default dbConnect;
