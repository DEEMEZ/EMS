import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    amount: { 
      type: Number, 
      required: true 
    },
    userId: { // Reference to User model
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userTokenId: { // Store token user ID as a string
      type: String,
      required: true,
      index: true
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

// Indexing for optimized queries
transactionSchema.index({ userTokenId: 1, transactionDate: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
