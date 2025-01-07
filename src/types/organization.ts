// src/types/organization.ts
export interface IOrganization {
    _id?: string;
    // orgId: number;
    name: string;
    description?: string;
    status: 'Active' | 'Inactive' | 'Pending';
    modifiedBy?: string;
    modifiedDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// export interface IOrganizationFormData {
//     name: string;
//     description: string;
//     status: 'Active' | 'Inactive' | 'Pending';
// }

// export interface OrganizationFormProps {
//     initialData?: IOrganization;
//     onSubmit: (data: IOrganizationFormData) => Promise<void>;
//     onCancel?: () => void;
// }

// export type OrganizationSortField = 'name' | 'status' | 'modifiedDate' | 'createdAt';
// export type SortOrder = 'asc' | 'desc';