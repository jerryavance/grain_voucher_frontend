// Voucher.interface.ts
export interface IProfile {
  location: string;
}

export interface IHub {
  id: string;
  name: string;
  slug: string;
  role?: string;
  status?: string;
  location?: string;
  is_active?: boolean;
  hub_admin?: IHubAdmin;
  created_at?: string;
  updated_at?: string;
}

export interface IHubAdmin {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface IUser {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: string;
  is_superuser: boolean;
  profile: IProfile;
  hubs: IHub[];
}

export interface IGrainType {
  id: string;
  name: string;
  description: string;
}

export interface IQualityGrade {
  id: string;
  name: string;
  min_moisture: string;
  max_moisture: string;
  description: string;
}

export interface IDeposit {
  id: string;
  farmer: IUser;
  hub: IHub;
  agent: IUser | null;
  grain_type_details: IGrainType;
  quality_grade_details: IQualityGrade;
  quantity_kg: string;
  moisture_level: string;
  deposit_date: string;
  validated: boolean;
  grn_number: string;
  notes: string;
  value: number;
}

export interface IVoucher {
  id: string;
  deposit: IDeposit;
  holder: IUser;
  issue_date: string;
  entry_price: string;
  current_value: string;
  status: 'issued' | 'traded' | 'redeemed';
  grn_number: string;
  signature_farmer: string;
  signature_agent: string;
  updated_at: string;
}

export interface IRedemption {
  id?: string;
  voucher: string;
  voucher_details?: IVoucher;
  requester?: IUser;
  amount: string;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
  notes: string;
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface ITrade {
  id?: string;
  voucher: string;
  voucher_details?: IVoucher;
  seller?: IUser;
  buyer?: IUser;
  amount: string;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'crypto';
  notes: string;
  status?: 'pending' | 'approved' | 'completed' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiFilters {
  search?: string;
  status?: string;
  grain_type?: string;
  page?: number;
  page_size?: number;
}


// import { IDeposit } from "../Deposit/Deposit.interface";
// import { IHub } from "../Hub/Hub.interface";

// export interface IVoucher {
//     id: string;
//     name: string;
//     type: string;
//     code: string;
//     deposit: IDeposit;
//     hub: IHub;
//     holder: string;
//   }

// export interface IVoucherResults {
//     results: IVoucher[];
//     count: number;
// }