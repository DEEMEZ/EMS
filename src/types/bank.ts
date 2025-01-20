export interface IBank {
  _id?: string;                  // Optional unique identifier for the bank
  name: string;                  // Name of the bank
  accountNumber: string;         // Bank account number
  branch: string;                // Bank branch information
  createdAt?: Date;              // Timestamp for creation
  updatedAt?: Date;              // Timestamp for last update
}
