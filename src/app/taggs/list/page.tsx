'use client';

import TagsList from "@/components/tags/tagslist/list";
import NavbarComponent from "@/components/navbar/navbar";

export default function UserListPage() {
  return (
    <div>
      <NavbarComponent />
      <div className="container mx-auto px-4 py-8">
        <TagsList />
      </div>
    </div>
  );
}
