'use client';

import ExpenseCategoryList from "@/components/expensecategories/expensecategorieslist/list";

export default function ExpenseCategoriesList() {
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <ExpenseCategoryList />
            </div>
        </div>
    );
}
