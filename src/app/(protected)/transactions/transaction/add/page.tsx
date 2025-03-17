'use client';

import NavbarComponent from "@/components/navbar/navbar";
import TransactionForm from "@/components/transactions/transactionform/form";

export default function AddTransaction() {
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <TransactionForm />
            </div>
        </div>
    );
}
