'use client';

import IncomeSourceForm from "@/components/incomesource/incomeform/form";

export default function AddIncomeSource() {
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <IncomeSourceForm />
            </div>
        </div>
    );
}
