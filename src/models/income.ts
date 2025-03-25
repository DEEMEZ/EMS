import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
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
    incomeSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncomeSources',
      required: true
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
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

incomeSchema.pre(['find', 'findOne'], function (next) {
  this.populate('transactionId', 'amount type transactionDate');
  next();
});

export default mongoose.models.Income || mongoose.model('Income', incomeSchema);
