import mongoose from "mongoose";

const ExpenseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ExpenseCategory =
  mongoose.models.ExpenseCategory || mongoose.model("ExpenseCategory", ExpenseCategorySchema);

export default ExpenseCategory;
