// src/types/IncomeSources.ts
export interface IIncomeSources {
    _id?: string;
    // IncsId: number;
    _Id: string;
    Name: string;
    Description?: string;
    createdAt?: Date;
}

// export interface IIncomeSourcesFormData {
//     name: string;
//     description: string;
//     status: 'Active' | 'Inactive' | 'Pending';
// }

// export interface IncomeSourcesFormProps {
//     initialData?: IIncomeSources;
//     onSubmit: (data: IIncomeSourcesFormData) => Promise<void>;
//     onCancel?: () => void;
// }

// export type IncomeSourcesSortField = 'name' | 'status' | 'modifiedDate' | 'createdAt';
// export type SortOrder = 'asc' | 'desc';