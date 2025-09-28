// LedgerEntries Interface
export interface ILedgerEntries {
    id: string;
    name: string;
    slug: string;
    location: string;
    is_active: boolean;
    LedgerEntries_admin: ILedgerEntriesAdmin | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface ILedgerEntriesAdmin {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }
  
  // API Response interfaces
  export interface ILedgerEntriesListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ILedgerEntries[];
  }
  
  export interface ILedgerEntriesMembershipRequest {
    LedgerEntries: string; // UUID string
    reason: string;
  }
  
  export interface ILedgerEntriesMembership {
    id: string;
    LedgerEntries_id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    created_at: string;
    updated_at: string;
  }


// export interface ILedgerEntries {
//     id: string;
//     name: string;
//     slug: string;
//     location: string;
//     is_active: boolean;
//     LedgerEntries_admin: ILedgerEntriesAdmin[];
// }


// export interface ILedgerEntriesAdmin {
//     id: string;
//     first_name: string;
//     last_name: string;
//     phone_number: string;
// }


export interface ILedgerEntriesResults {
    count: number;
    results: ILedgerEntries[];
}


// export interface IJoinLedgerEntriesProps {
//     LedgerEntriesId: string;
//     LedgerEntriesName: string;
//     handleCancel: () => void;
//   }