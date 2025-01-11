// src/models/IncomeSources.ts
import mongoose from 'mongoose';

const IncomeSourcesSchema = new mongoose.Schema({
  // IncsId: {
  //   type: Number,
  //   required: true,
  //   unique: true,
  //   default: () => Math.floor(Math.random() * 1000000) // Simple auto-generation
  // },
  name: {
    type: String,
    required: [true, 'Please provide IncomeSources name'],
    maxLength: 90,
    trim: true
  },
  description: {
    type: String,
    maxLength: 200,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active',
    maxLength: 100
  },
  modifiedBy: {
    type: String,
    maxLength: 70,
    trim: true
  },
  modifiedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes
IncomeSourcesSchema.index({ name: 1 });
IncomeSourcesSchema.index({ status: 1 });

export default mongoose.models.IncomeSources || mongoose.model('IncomeSources', IncomeSourcesSchema);