'use client';

import PaymentmethodsForm from "@/components/paymentmethods/paymentform/form";
import NavbarComponent from "@/components/navbar/navbar";

export default function AddPaymentmethods() {
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <PaymentmethodsForm />
            </div>
        </div>
    );
}
