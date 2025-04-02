'use client';

import TagsForm from "@/components/tags/tagsform/form";

export default function AddTagPage() {
  return (
    <div>
      { /*<NavbarComponent />*/ }
      <div className="container mx-auto px-4 py-8">
        <TagsForm onSuccess={() => {}} />
      </div>
    </div>
  );
}