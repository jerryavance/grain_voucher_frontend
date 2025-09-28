// Inventories Interface
export interface IInventories {
    id: string;
    name: string;
    slug: string;
    location: string;
    is_active: boolean;
    Inventories_admin: IInventoriesAdmin | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface IInventoriesAdmin {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }
  
  // API Response interfaces
  export interface IInventoriesListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: IInventories[];
  }
  
  export interface IInventoriesMembershipRequest {
    Inventories: string; // UUID string
    reason: string;
  }
  
  export interface IInventoriesMembership {
    id: string;
    Inventories_id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    created_at: string;
    updated_at: string;
  }


// export interface IInventories {
//     id: string;
//     name: string;
//     slug: string;
//     location: string;
//     is_active: boolean;
//     Inventories_admin: IInventoriesAdmin[];
// }


// export interface IInventoriesAdmin {
//     id: string;
//     first_name: string;
//     last_name: string;
//     phone_number: string;
// }


export interface IInventoriesResults {
    count: number;
    results: IInventories[];
}


// export interface IJoinInventoriesProps {
//     InventoriesId: string;
//     InventoriesName: string;
//     handleCancel: () => void;
//   }