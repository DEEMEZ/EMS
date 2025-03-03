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
<<<<<<< HEAD
    transactionAmount: { 
      type: Number, 
      required: false 
=======
    amount: {
      type: Number,
      required: true
>>>>>>> 0d3f764e2fe628951247675006f660fead32f8c3
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.pre('find', function (next) {
  this.populate('transactionId', 'amount');
  next();
});

expenseSchema.pre('findOne', function (next) {
  this.populate('transactionId', 'amount');
  next();
});

expenseSchema.pre('save', function (next) {
  if (this.paymentMethod === 'Transfer' && !this.bankId) {
    return next(new Error('bankId is required when paymentMethod is Transfer.'));
  }
  next();
});

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
