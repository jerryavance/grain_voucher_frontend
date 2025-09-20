export interface IHub {
    id: string;
    name: string;
    slug: string;
    location: string;
    is_active: boolean;
    hub_admin: IHubAdmin[];
}


export interface IHubAdmin {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
}


export interface IHubResults {
    count: number;
    results: IHub[];
}
