'use client';
 import UserForm from "@/components/user/userform/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function AddUserPage() {
  return (
    <div>
      <NavbarComponent />
      <div className="container mx-auto px-4 py-8">
        <UserForm onSuccess={() => {}} />
      </div>
    </div>
  );
}
