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
<<<<<<< HEAD
  transactionAmount?: number; 
}
=======
  amount: number;
}
>>>>>>> 0d3f764e2fe628951247675006f660fead32f8c3
