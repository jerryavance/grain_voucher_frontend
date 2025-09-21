import { TOption } from "../../@types/common";
import { IUser } from "../Users/Users.interface";

// Core Deposit interface based on your Django model
export interface IDeposit {
  id: string;
  farmer: string | IFarmer; // Foreign key to GrainUser
  hub: string | IHub; // Foreign key to Hub
  agent?: string | IAgent | null; // Optional foreign key to GrainUser (agent)
  grain_type: string | IGrainType; // Foreign key to GrainType
  quantity_kg: number; // DecimalField with max_digits=10, decimal_places=2
  moisture_level: number; // DecimalField with max_digits=5, decimal_places=2
  quality_grade: string | IQualityGrade; // Foreign key to QualityGrade
  deposit_date: string; // DateTimeField (ISO string)
  validated: boolean; // BooleanField
  grn_number?: string; // CharField, max_length=50, optional
  notes?: string; // TextField, optional
  created_at?: string; // Auto-generated timestamp
  updated_at?: string; // Auto-generated timestamp
  calculated_value?: number; // Calculated field from calculate_value method
}

// Related entity interfaces
export interface IFarmer {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  user_type: 'farmer';
  account_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IHub {
  id: string;
  name: string;
  location?: string;
  address?: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  capacity_kg?: number;
  current_stock_kg?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  created_at?: string;
  updated_at?: string;
}

export interface IAgent {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  user_type: 'agent';
  account_type?: string;
  hub?: string | IHub;
  created_at?: string;
  updated_at?: string;
}

export interface IGrainType {
  id: string;
  name: string;
  code?: string;
  description?: string;
  standard_moisture_level?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IQualityGrade {
  id: string;
  name: string;
  description?: string;
  min_quality_score?: number;
  max_quality_score?: number;
  price_adjustment_factor?: number;
  created_at?: string;
  updated_at?: string;
}

// API Response interfaces
export interface IDepositsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IDeposit[];
}

export interface IHubsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IHub[];
}

export interface IGrainTypesResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IGrainType[];
}

export interface IQualityGradesResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IQualityGrade[];
}

export interface IFarmersResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IFarmer[];
}

export interface IAgentsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: IAgent[];
}

// Form-related interfaces
export interface IDepositFormData {
  // General Information
  farmer: string;
  hub: string;
  agent?: string;
  deposit_date: string;
  
  // Deposit Settings
  grain_type: string;
  quantity_kg: number;
  moisture_level: number;
  quality_grade: string;
  
  // Other Information
  grn_number?: string;
  validated: boolean;
  notes?: string;
}

export interface IGeneralFormProps {
  farmers: TOption[];
  hubs: TOption[];
  agents: TOption[];
}

export interface ISettingsFormProps {
  grainTypes: TOption[];
  qualityGrades: TOption[];
}

export interface IOtherFormProps {
  // Currently no specific props needed for other form
}

// Props for components
export interface IDepositDetailsProps {
  depositDetails: IDeposit | null | undefined;
}

export interface IDepositFormProps {
  formType: 'Save' | 'Update';
  formTitle: string;
  userType: string;
  depositDetails?: IDeposit;
}

export interface IDepositListProps {
  deposits: IDeposit[];
  loading: boolean;
  onEdit: (deposit: IDeposit) => void;
  onDelete: (id: string) => void;
  onValidate: (id: string) => void;
}

export interface IDepositValidationProps {
  depositId: string;
  onValidationComplete: () => void;
  onCancel: () => void;
}

// Filter interfaces for API calls
export interface IDepositFilters {
  farmer?: string;
  hub?: string;
  agent?: string;
  grain_type?: string;
  quality_grade?: string;
  validated?: boolean;
  deposit_date_from?: string;
  deposit_date_to?: string;
  grn_number?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IHubFilters {
  name?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IGrainTypeFilters {
  name?: string;
  code?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IQualityGradeFilters {
  name?: string;
  code?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IUserFilters {
  name?: string;
  email?: string;
  phone_number?: string;
  user_type?: 'farmer' | 'agent' | 'admin';
  account_type?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}


export interface IDepositResults {
  count: number;
  results: IHub[];
}