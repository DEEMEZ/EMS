// src/models/organization.ts
import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  // orgId: {
  //   type: Number,
  //   required: true,
  //   unique: true,
  //   default: () => Math.floor(Math.random() * 1000000) // Simple auto-generation
  // },
  name: {
    type: String,
    required: [true, 'Please provide organization name'],
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
organizationSchema.index({ name: 1 });
organizationSchema.index({ status: 1 });

export default mongoose.models.Organization || mongoose.model('Organization', organizationSchema);