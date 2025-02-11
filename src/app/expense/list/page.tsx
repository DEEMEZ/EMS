'use client';

import ExpenseList from "@/components/expense/expenselist/list";  // Modify the import to match your expense list component
import NavbarComponent from "@/components/navbar/navbar";

export default function ExpensesList() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <ExpenseList />  {/* Replace the ExpenseCategoryList with ExpenseList */}
            </div>
        </div>
    );
}
