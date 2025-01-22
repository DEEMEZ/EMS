// src/models/IncomeSources.ts
import mongoose from 'mongoose';

const tagsSchema = new mongoose.Schema({
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
tagsSchema.index({ name: 1 });

export default mongoose.models.tags || mongoose.model('tags', tagsSchema);