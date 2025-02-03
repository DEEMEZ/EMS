'use client';

import UserList from "@/components/user/userlist/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function UserListPage() {
  return (
    <div>
      <NavbarComponent />
      <div className="container mx-auto px-4 py-8">
        <UserList onEdit={() => {}} />
      </div>
    </div>
  );
}
