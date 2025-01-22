'use client';

import BankForm from "@/components/bank/bankform/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function AddBank() {
    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <BankForm />
            </div>
        </div>
    );
}
