import { IExpenseCategories } from '@/types/expensecategories';
import { IUser } from '@/types/user';

export interface IBudget {
  _id?: string;
  userId: string | IUser;
  expensecategoriesId: string | IExpenseCategories;
  monthlyLimit: number;
  spentAmount: number; 
  remainingBudget: number;
  startDate: Date;
  endDate: Date;
}
