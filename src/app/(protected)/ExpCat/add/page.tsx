'use client';

import ExpenseCategoryForm from "@/components/expensecategories/expensecategoriesform/form";

export default function ExpenseCategoryPage() { 
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <ExpenseCategoryForm />
            </div>
        </div>
    );
}
