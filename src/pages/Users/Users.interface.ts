import { TOption } from "../../@types/common";
import { IHub } from "../Hub/Hub.interface";

export interface IUser {
    id: string;
    first_name: string;
    last_name: string;
    other_name?: string;
    bank_details?: IHub
}

export interface IUsersResults {
    results: IUser[];
    count: number;
}

export type TUserTableActions = (user: IUser) => void;

export interface IUserFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}


export interface TUserFormProps {
    banks: TOption[];
    handleBankSearch(value: any): void
};
