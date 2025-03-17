// src/models/organization.ts
import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending"],
      required: true,
    },
    userId: {
      type: String, // Changed from ObjectId to String for compatibility
      required: true,
    },
    modifiedBy: {
      type: String,
      default: "System",
    },
    modifiedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

// Note: We're using a simple index instead of a compound unique index
// while we're sorting out the authentication issues
organizationSchema.index({ userId: 1 });

// Export the model - use mongoose.models to prevent recompiling model error
const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);

export default Organization;