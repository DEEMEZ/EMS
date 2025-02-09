import { IUser } from "@/types/user";

export interface IBudgets {
  _id?: string;
  userId: string | IUser;  
  expensecategoriesid: string;
  monthlyLimit: number;
  startDate?: Date;
  endDate?: Date;
}