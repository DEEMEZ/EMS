import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    transactionId: mongoose.Types.ObjectId;
    expCatId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    paymentMethod: string;
    amount: number;
    createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
    transactionId: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction', // Reference to Transaction model
        required: true,
    },
    expCatId: {
        type: Schema.Types.ObjectId,
        ref: 'ExpenseCategory', // Reference to ExpenseCategory model
        required: true,
    },
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization', // Reference to Organization model
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Bank Transfer'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Export the model
const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
