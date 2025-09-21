// Hub Interface
export interface IHub {
    id: string;
    name: string;
    slug: string;
    location: string;
    is_active: boolean;
    hub_admin: IHubAdmin | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface IHubAdmin {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  }
  
  // API Response interfaces
  export interface IHubListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: IHub[];
  }
  
  export interface IHubMembershipRequest {
    hub: string; // UUID string
    reason: string;
  }
  
  export interface IHubMembership {
    id: string;
    hub_id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    created_at: string;
    updated_at: string;
  }


// export interface IHub {
//     id: string;
//     name: string;
//     slug: string;
//     location: string;
//     is_active: boolean;
//     hub_admin: IHubAdmin[];
// }


// export interface IHubAdmin {
//     id: string;
//     first_name: string;
//     last_name: string;
//     phone_number: string;
// }


export interface IHubResults {
    count: number;
    results: IHub[];
}


// export interface IJoinHubProps {
//     hubId: string;
//     hubName: string;
//     handleCancel: () => void;
//   }