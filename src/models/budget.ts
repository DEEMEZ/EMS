import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Change to ObjectId
      ref: 'User', // Reference the User model
      required: true,
      index: true,
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
    spentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    remainingBudget: {
      type: Number,
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

budgetSchema.pre('save', function (next) {
  this.remainingBudget = this.monthlyLimit - this.spentAmount;
  next();
});

budgetSchema.virtual('calculatedRemainingBudget').get(function () {
  return this.monthlyLimit - this.spentAmount;
});

// Add index for common query patterns
budgetSchema.index({ userId: 1, expensecategoriesId: 1 });
budgetSchema.index({ startDate: -1 });
budgetSchema.index({ endDate: -1 });

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema);