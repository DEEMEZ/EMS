export interface IUser {
    _id: string;
    fullname: string; 
    email: string;
    phone?: string; 
    role: "Admin" | "User"; 
    createdAt: Date; 
    modifiedBy: string; 
    modifiedDate: Date; 
  }
  