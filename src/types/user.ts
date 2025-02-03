export interface IUser {
    _id: string; // Unique identifier
    fullname: string; // Full name of the user
    email: string; // Email address
    phone?: string; // Optional phone number
    role: "Admin" | "User"; // User role in the system
    createdAt: Date; // Timestamp when the user was created
    modifiedBy: string; // Last person/system who modified the user
    modifiedDate: Date; // Timestamp of last modification
  }
  