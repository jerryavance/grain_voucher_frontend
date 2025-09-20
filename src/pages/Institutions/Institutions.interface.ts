export interface IInstitutions {
    id: string;
    name: string;
    swift_code: string;
    country: string;
    address: string;
    logo: string;
    website: string;
    email: string;
    phone_primary: string;
    description: string;
    is_active: boolean;
}

export interface IInstitutionsResults {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
      institutions: IInstitutions[];
    };
  }
