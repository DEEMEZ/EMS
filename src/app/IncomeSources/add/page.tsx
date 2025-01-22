'use client';

import NavbarComponent from "@/components/navbar/navbar";
import IncomeSourcesForm from "@/components/IncomeSources/Incsform/form";

export default function AddIncomeSource() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <IncomeSourcesForm  />
            </div>
        </div>
    );
}
