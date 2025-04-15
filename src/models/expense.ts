import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
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
      // Updated to reference a PaymentMethod document
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMethod',
      required: true
    },
    transactionAmount: {
      type: Number,
      required: false
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
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret._id = ret._id.toString();
        ret.createdAt = ret.createdAt ? ret.createdAt.toISOString() : null;
        ret.updatedAt = ret.updatedAt ? ret.updatedAt.toISOString() : null;
        if (ret.modifiedDate) {
          ret.modifiedDate = ret.modifiedDate.toISOString();
        }
        return ret;
      }
    }
  }
);

expenseSchema.pre(['find', 'findOne'], function (next) {
  this.populate('transactionId', 'amount type transactionDate');
  next();
});

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);