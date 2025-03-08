import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending"],
      required: true,
    },
    modifiedDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
