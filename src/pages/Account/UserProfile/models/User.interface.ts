import { IHub } from "../../../Hub/Hub.interface";

export interface IUser {
    id: string;
    profile: {
        gender: string;
        country: string;
        date_of_birth: string;
        bank_details?: IHub
    }
}