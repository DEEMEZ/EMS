import { IIncomeSources } from "@/types/incomesource";
import { IOrganization } from "@/types/organization";
import { ITransaction } from "@/types/transaction";

export interface IIncome {
  _id?: string;
  transactionId: string | ITransaction;
  incomeSourceId: string | IIncomeSources;
  orgId: string | IOrganization;
<<<<<<< HEAD
  transactionAmount?: number; 
}
=======
  amount: number;
}
>>>>>>> 0d3f764e2fe628951247675006f660fead32f8c3
