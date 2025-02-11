'use client';

import BudgetForm from "@/components/budgets/budgetform/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function AddBudget() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <BudgetForm />
            </div>
        </div>
    );
}
