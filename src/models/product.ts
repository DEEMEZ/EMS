import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide product quantity'],
    min: 0,
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);