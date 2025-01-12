// src/types/IncomeSources.ts
export interface IIncomeSources {
    _id?: string;
    //_Id: string;    //it should not be _Id it should be _id?
    name: string;
    description?: string;
    createdAt?: Date;
}
