import { IUser } from "@/types/user";

export interface ITransaction {
  _id?: string;
  userId: string | IUser;  
  type: 'Income' | 'Expense';
  transactionDate: Date;
  loggedDate?: Date;
  description?: string;
}
