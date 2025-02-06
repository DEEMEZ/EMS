export interface ITransaction {
  _id?: string;
  userId: string; 
  type: 'Income' | 'Expense';
  transactionDate: Date;
  loggedDate?: Date;
  description?: string;
}
