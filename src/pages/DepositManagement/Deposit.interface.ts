export type DepositStatus = 'pending' | 'validated' | 'rejected';
export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export interface IDeposit {
  id: string;
  farmer: {
    id: string;
    name: string;
    phone_number: string;
  };
  hub: {
    id: string;
    name: string;
    location: string;
  };
  agent?: {
    id: string;
    name: string;
    phone_number: string;
  };
  grain_type_details: {
    id: string;
    name: string;
    description?: string;
  };
  quality_grade_details: {
    id: string;
    name: string;
    min_moisture: number;
    max_moisture: number;
  };
  quantity_kg: string;
  moisture_level: string;
  deposit_date: string;
  validated: boolean;
  grn_number?: string;
  notes?: string;
  value: string;
  voucher?: {
    id: string;
    status: string;
    verification_status: VerificationStatus;
    current_value: string;
  };
}

export interface DepositValidation {
  validated: boolean;
  notes?: string;
}

export interface DepositFilters {
  search?: string;
  hub?: string;
  grain_type?: string;
  validated?: boolean;
  farmer_name?: string;
  agent?: string;
  page?: number;
  page_size?: number;
}

export interface VoucherAction {
  reason?: string;
}

export interface DepositApproval {
  validated: boolean;
  notes?: string;
}