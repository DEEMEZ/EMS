import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    amount: { 
      type: Number, 
      required: true 
    }, 
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      required: true
    },
    transactionDate: {
      type: Date,
      required: true
    },
    loggedDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
