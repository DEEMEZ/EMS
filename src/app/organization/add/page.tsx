'use client';

import { useRouter } from 'next/navigation';
import OrganizationForm from "@/components/organization/orgform/form";
import NavbarComponent from "@/components/navbar/navbar";
import { IOrganization } from "@/types/organization";
import { useState } from 'react';
export default function AddOrganization() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const handleOrganizationtUpdate = () => {
    setRefreshTrigger((prev: number) => prev + 1);
    };
    const router = useRouter();

    // const handleSubmit = async (data: IOrganizationFormData) => {
    //     try {
    //         const response = await fetch('/api/organizations', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(data),
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to create organization');
    //         }

    //         // Redirect to the organizations list on success
    //         router.push('/organizations');
    //     } catch (error) {
    //         console.error('Error creating organization:', error);
    //         throw error; // This will be caught by the form's error handling
    //     }
    // };

    return (
        <div>
            <NavbarComponent />
            <div className="container mx-auto px-4 py-8">
                <OrganizationForm onOrganizationUpdate={handleOrganizationtUpdate} />
            </div>
        </div>
    );
}
