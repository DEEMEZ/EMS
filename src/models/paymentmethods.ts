import mongoose from 'mongoose';

// PaymentMethods Schema
const PaymentmethodsSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Keeping as String to align with token.id or token.sub
      required: true,
      index: true // Adding index for optimized queries
    },
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
