'use client';

import { IUser } from "@/types/user";
import { useEffect, useState } from "react";

export default function UserList({ onEdit }: { onEdit: (user: IUser) => void }) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`/api/users?search=${search}`);
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Users List</h2>
      <input
        type="text"
        placeholder="Search users..."
        className="border p-2 w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left w-1/4">Full Name</th>
              <th className="border p-2 text-left w-1/4">Email</th>
              <th className="border p-2 text-left w-1/4">Role</th>
              <th className="border p-2 text-left w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border">
                <td className="p-2 text-left">{user.fullname}</td>
                <td className="p-2 text-left">{user.email}</td>
                <td className="p-2 text-left">{user.role}</td>
                <td className="p-2 text-left">
                  <button 
                    onClick={() => onEdit(user)} 
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
