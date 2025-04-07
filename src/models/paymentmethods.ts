import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      // Removed index: true
    },
    name: {
      type: String,
      required: [true, 'Payment method name is required'],
      maxLength: [100, 'Name cannot exceed 100 characters'],
      trim: true
    },
    description: {
      type: String,
      maxLength: [200, 'Description cannot exceed 200 characters'],
      trim: true
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
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        if (ret.modifiedDate) {
          ret.modifiedDate = ret.modifiedDate.toISOString();
        }
        return ret;
      }
    }
  }
);

// Single index declaration with unique constraint
PaymentMethodSchema.index(
  { userId: 1, name: 1 },
  { unique: true, partialFilterExpression: { name: { $exists: true } }
}
);

const PaymentMethodModel =
  mongoose.models.PaymentMethod ||
  mongoose.model('PaymentMethod', PaymentMethodSchema);

export default PaymentMethodModel;