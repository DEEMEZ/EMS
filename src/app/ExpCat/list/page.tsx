'use client';

import ExpenseCategoryList from "@/components/expensecategories/expensecategorieslist/list";
import NavbarComponent from "@/components/navbar/navbar";

export default function ExpenseCategoriesListPage() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <ExpenseCategoryList />
            </div>
        </div>
    );
}
