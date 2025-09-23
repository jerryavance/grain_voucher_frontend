// HubMembership.interface.ts
export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'inactive';

export type MembershipRole = 'farmer' | 'member' | 'hub_admin' | 'agent';

export interface IMembership {
  id: string;
  user: {
    id: string;
    name: string;
    phone_number: string;
  };
  hub: {
    id: string;
    name: string;
    location: string;
  };
  role: MembershipRole;
  status: MembershipStatus;
  reason?: string;
  notes?: string;
  requested_at: string;
  approved_at?: string;
  approved_by_name?: string;
}

export interface HubMembershipApproval {
  status: MembershipStatus;
  role?: MembershipRole;
  notes?: string;
}

export interface HubMembershipRequest {
  hub: string;
  reason?: string;
}


// export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'inactive';

// export type MembershipRole = 'farmer' | 'member' | 'hub_admin';

// export interface IMembership {
//   id: string;
//   user: {
//     id: string;
//     name: string;
//     phone_number: string;
//   };
//   hub: {
//     id: string;
//     name: string;
//     location: string;
//   };
//   role: MembershipRole;
//   status: MembershipStatus;
//   reason?: string;
//   notes?: string;
//   requested_at: string;
//   approved_at?: string;
//   approved_by_name?: string;
// }

// export interface HubMembershipApproval {
//   status: MembershipStatus; // Now includes 'active'
//   role?: MembershipRole;
//   notes?: string;
// }

// export interface HubMembershipRequest {
//   hub: string;
//   reason?: string;
// }