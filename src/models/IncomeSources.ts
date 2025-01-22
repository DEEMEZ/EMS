// src/models/IncomeSources.ts
import mongoose from 'mongoose';

const IncomeSourcesSchema = new mongoose.Schema({
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
}, {
  timestamps: true
});

// Add indexes
IncomeSourcesSchema.index({ name: 1 });

export default mongoose.models.IncomeSources || mongoose.model('IncomeSources', IncomeSourcesSchema);