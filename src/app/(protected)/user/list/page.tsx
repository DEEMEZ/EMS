'use client';

import UserList from "@/components/user/userlist/list";

export default function UserListPage() {
  return (
    <div>
      { /*<NavbarComponent />*/ }
      <div className="container mx-auto px-4 py-8">
        <UserList onEdit={() => {}} />
      </div>
    </div>
  );
}
