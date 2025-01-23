import mongoose from 'mongoose';

// PaymentMethods Schema
const PaymentmethodsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Payment method name is required'],
      maxLength: 100,
      trim: true
    },
    description: {
      type: String,
      maxLength: 200,
      trim: true
    }
  },
  {
    timestamps: true 
  }
);

PaymentmethodsSchema.index({ name: 1 });

export default mongoose.models.Paymentmethods || mongoose.model('Paymentmethods', PaymentmethodsSchema);
