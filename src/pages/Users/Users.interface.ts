import { TOption } from "../../@types/common";

// Hub membership shape returned on the user object
export interface IUserHub {
    id: string;
    name: string;
    slug: string;
    role: string;
    status: string;
}

// Aligned with actual API response from auth/users/
export interface IUser {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email?: string;
    role: string;
    is_superuser: boolean;
    profile: {
        location?: string;
    };
    hubs: IUserHub[];
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
    handleBankSearch(value: any): void;
}