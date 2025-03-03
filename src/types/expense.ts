import { IBank } from "@/types/bank";
import { IExpenseCategories } from "@/types/expensecategories";
import { IOrganization } from "@/types/organization";
import { ITransaction } from "@/types/transaction";

export interface IExpense {
  _id?: string;
  transactionId: string | ITransaction;
  expenseCategoryId: string | IExpenseCategories;
  orgId: string | IOrganization;
  paymentMethod: 'Cash' | 'Transfer';
  bankId: string | IBank; 
  transactionAmount?: number; 
}
