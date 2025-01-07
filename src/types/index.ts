// src/types/index.ts
export interface IProduct {
  _id?: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  createdAt?: Date;
}