import { IIncomeSources } from "@/types/incomesource";
import { IOrganization } from "@/types/organization";
import { ITransaction } from "@/types/transaction";

export interface IIncome {
  _id?: string;
  transactionId: string | ITransaction;
  incomeSourceId: string | IIncomeSources;
  orgId: string | IOrganization;
  amount: number;
}