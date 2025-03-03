import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
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
    }
  },
  {
    timestamps: true
  }
);

incomeSchema.pre('find', function (next) {
  this.populate('transactionId', 'amount');
  next();
});

incomeSchema.pre('findOne', function (next) {
  this.populate('transactionId', 'amount');
  next();
});

export default mongoose.models.Income || mongoose.model('Income', incomeSchema);
