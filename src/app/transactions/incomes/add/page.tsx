'use client';

import IncomeForm from "@/components/income/incomeform/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function AddIncome() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <IncomeForm />
            </div>
        </div>
    );
}
