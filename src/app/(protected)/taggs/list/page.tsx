'use client';

import TagsList from "@/components/tags/tagslist/list";

export default function UserListPage() {
  return (
    <div>
      { /*<NavbarComponent />*/ }
      <div className="container mx-auto px-4 py-8">
        <TagsList />
      </div>
    </div>
  );
}