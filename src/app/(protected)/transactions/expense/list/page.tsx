'use client';

import ExpenseList from "@/components/expense/expenselist/list";

export default function ExpenseListPage() {
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <ExpenseList />
            </div>
        </div>
    );
}
