export interface IExpense {
    id: string;
    transactionId: string;
    expCatId: string;
    orgId: string;
    paymentMethod: string;
    amount: number;
    createdAt: Date;
  }
  