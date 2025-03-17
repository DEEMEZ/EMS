export interface IBudget {
  _id?: string;
  userId?: string;
  expensecategoriesId: string | { _id: string; name: string };
  monthlyLimit: number;
  spentAmount: number;
  remainingBudget: number;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}