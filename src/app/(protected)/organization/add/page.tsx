'use client';
import OrganizationForm from "@/components/organization/orgform/form";

export default function AddOrganization() {
    return (
        <div>
            { /*<NavbarComponent />*/ }
            <div className="container mx-auto px-4 py-8">
                <OrganizationForm  />
            </div>
        </div>
    );
}
