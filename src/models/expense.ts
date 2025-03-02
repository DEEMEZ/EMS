import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true
    },
    expensecategoriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      required: true
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Transfer'],
      required: true
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      default: null 
    },
    amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.pre('save', function (next) {
  if (this.paymentMethod === 'Transfer' && !this.bankId) {
    return next(new Error('bankId is required when paymentMethod is Transfer.'));
  }
  next();
});

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
