'use client';

import ExpenseForm from "@/components/expense/expenseform/form";

export default function AddExpensePage() { 
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <ExpenseForm/>
            </div>
        </div>
    );
}
