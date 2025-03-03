import { IExpenseCategories } from '@/types/expensecategories';
import { IUser } from '@/types/user';

export interface IBudget {
  _id?: string;
  userId: string | IUser;
  expensecategoriesId: string | IExpenseCategories;
  monthlyLimit: number;
  amount: number; 
  startDate: Date;
  endDate: Date;
}