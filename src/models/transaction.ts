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
      required: true,
      // Removed index: true
    },
    userTokenId: {
      type: String,
      required: true,
      // Removed index: true
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
    },
    modifiedBy: {
      type: String,
      default: 'System'
    },
    modifiedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Single index declaration
transactionSchema.index({ userTokenId: 1, transactionDate: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);