import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expensecategoriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      required: true,
    },
    monthlyLimit: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true, 
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema);