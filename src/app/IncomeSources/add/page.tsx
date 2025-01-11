'use client';
import IncomeSourcesForm from "@/components/IncomeSources/Incsform/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function AddIncomeSources() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <IncomeSourcesForm  />
            </div>
        </div>
    );
}
