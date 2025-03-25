import mongoose from 'mongoose';

const ExpenseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {  // 🔥 Add this field
    type: String, // Match the type in the organization model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent recompilation issues
const ExpenseCategory =
  mongoose.models.ExpenseCategory || mongoose.model("ExpenseCategory", ExpenseCategorySchema);

export default ExpenseCategory;
