// CRM.interface.ts
import { TOption } from "../../@types/common";

export interface ILead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: 'new' | 'qualified' | 'lost';
  assigned_to?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  assigned_to_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface IAccount {
  id: string;
  name: string;
  type: 'customer' | 'supplier' | 'investor';
  credit_terms_days: number;
  hub?: {
    id: string;
    name: string;
  };
  hub_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface IContact {
  id: string;
  account: IAccount;
  account_id: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface IOpportunity {
  id: string;
  account: IAccount;
  account_id: string;
  name: string;
  expected_volume_mt: number;
  expected_price_per_mt: number;
  stage: 'prospect' | 'quote' | 'won' | 'lost';
  assigned_to?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  assigned_to_id?: string;
  created_at: string;
  updated_at: string;
}

export interface IContract {
  id: string;
  opportunity: IOpportunity;
  opportunity_id: string;
  terms: string;
  signed_at?: string;
  status: 'draft' | 'signed' | 'executed';
  created_at: string;
  updated_at: string;
}

// Results interfaces
export interface ILeadsResults {
  results: ILead[];
  count: number;
}

export interface IAccountsResults {
  results: IAccount[];
  count: number;
}

export interface IContactsResults {
  results: IContact[];
  count: number;
}

export interface IOpportunitiesResults {
  results: IOpportunity[];
  count: number;
}

export interface IContractsResults {
  results: IContract[];
  count: number;
}

// Form props interfaces
export interface ICRMFormProps<T = any> {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: T;
  callBack?: () => void;
}

// Tab types
export type CRMTabType = 'leads' | 'accounts' | 'contacts' | 'opportunities' | 'contracts';

export interface ICRMTabData {
  label: string;
  value: CRMTabType;
  count?: number;
}

// Constants
export const LEAD_STATUS_OPTIONS: TOption[] = [
  { label: 'New', value: 'new' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Lost', value: 'lost' },
];

export const ACCOUNT_TYPE_OPTIONS: TOption[] = [
  { label: 'Customer', value: 'customer' },
  { label: 'Supplier', value: 'supplier' },
  { label: 'Investor', value: 'investor' },
];

export const OPPORTUNITY_STAGE_OPTIONS: TOption[] = [
  { label: 'Prospect', value: 'prospect' },
  { label: 'Quote', value: 'quote' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

export const CONTRACT_STATUS_OPTIONS: TOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Signed', value: 'signed' },
  { label: 'Executed', value: 'executed' },
];

export const LEAD_SOURCE_OPTIONS: TOption[] = [
  { label: 'Referral', value: 'referral' },
  { label: 'Website', value: 'website' },
  { label: 'Cold Call', value: 'cold_call' },
  { label: 'Social Media', value: 'social_media' },
  { label: 'Trade Show', value: 'trade_show' },
  { label: 'Advertisement', value: 'advertisement' },
  { label: 'Other', value: 'other' },
];