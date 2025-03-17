import mongoose from 'mongoose';

// Bank Schema
const bankSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Bank name is required'],
      maxLength: 100,
      trim: true
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      maxLength: 30,
      trim: true
    },
    branch: {
      type: String,
      required: [true, 'Branch information is required'],
      maxLength: 100,
      trim: true
    }
  },
  {
    timestamps: true 
  }
);

// Add indexes
bankSchema.index({ name: 1 });
bankSchema.index({ accountNumber: 1 });

// Export the Bank model
export default mongoose.models.Bank || mongoose.model('Bank', bankSchema);
