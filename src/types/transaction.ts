import { IUser } from "@/types/user";

export interface ITransaction {
  _id?: string;
  userId: string | IUser;
  amount: number;
  type: 'Income' | 'Expense';
  transactionDate: Date;
  loggedDate?: Date;
  description?: string;
}