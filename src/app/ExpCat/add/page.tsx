'use client';

import ExpenseCategoryForm from "@/components/expensecategories/expensecategoriesform/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function AddExpenseCategory() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <ExpenseCategoryForm />
            </div>
        </div>
    );
}
