// src/types/user.ts
export interface IUser {
  _id?: string;
  fullname: string; 
  email: string;
  password?: string; // Add password field
  phone?: string; 
  createdAt?: Date; 
  modifiedBy?: string; 
  modifiedDate?: Date; 
}