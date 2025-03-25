import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Keeping as String to align with token.id or token.sub
      required: true,
      index: true // Adding index for optimized queries
    },
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
    transactionAmount: { 
      type: Number, 
      required: false 
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.pre(['find', 'findOne'], function (next) {
  this.populate('transactionId', 'amount type transactionDate');
  next();
});

expenseSchema.pre('save', function (next) {
  if (this.paymentMethod === 'Transfer' && !this.bankId) {
    return next(new Error('bankId is required when paymentMethod is Transfer.'));
  }
  next();
});

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
