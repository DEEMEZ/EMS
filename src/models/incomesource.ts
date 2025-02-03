import mongoose from 'mongoose';

// IncomeSources Schema
const incomeSourcesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Income source name is required'],
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

incomeSourcesSchema.index({ name: 1 });

export default mongoose.models.IncomeSources || mongoose.model('IncomeSources', incomeSourcesSchema);
