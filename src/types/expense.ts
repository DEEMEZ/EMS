import { IUser } from "@/types/user";
import { IExpenseCategories } from "@/types/expensecategories";
import { IOrganization } from "@/types/organization";

// Updated IExpense interface
export interface IExpense {
  id: string;
  transactionId: string;  // Foreign key reference to ITransaction
  expCatId: string;       // Foreign key reference to IExpenseCategory
  orgId: string;          // Foreign key reference to IOrganization
  paymentMethod: string;
  amount: number;
  createdAt: Date;
}