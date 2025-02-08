'use client';

import { IUser } from "@/types/user";
import { useEffect, useState } from "react";

export default function UserForm({ user, onSuccess }: { user?: IUser; onSuccess: () => void }) {
  const [formData, setFormData] = useState<IUser>({
    _id: "",
    fullname: "",
    email: "",
    phone: "",
    role: "User",
    createdAt: new Date(),
    modifiedBy: "System",
    modifiedDate: new Date(),
  });

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = user ? "PUT" : "POST";
    await fetch("/api/users", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">{user ? "Edit User" : "Add User"}</h2>
      <input
        type="text"
        name="fullname"
        placeholder="Full Name"
        value={formData.fullname}
        onChange={handleChange}
        className="border p-2 w-full mb-4"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 w-full mb-4"
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="border p-2 w-full mb-4"
      />
      <select name="role" value={formData.role} onChange={handleChange} className="border p-2 w-full mb-4">
        <option value="User">User</option>
        <option value="Admin">Admin</option>
      </select>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        {user ? "Update User" : "Create User"}
      </button>
    </form>
  );
}
