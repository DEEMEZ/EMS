import mongoose from 'mongoose';

const budgetsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expensecategoriesid: {
      type: String,
      required: true
    },
    monthlyLimit: {
      type: Date,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Budgets || mongoose.model('Budgets', budgetsSchema);
