// Trade.interface.ts
import { TOption } from "../../@types/common";

export interface IGrainType {
  id: string;
  name: string;
  description?: string;
}

export interface IQualityGrade {
  id: string;
  name: string;
  description?: string;
}

export interface IHub {
  id: string;
  name: string;
  location?: string;
}

export interface IAccount {
  id: string;
  name: string;
  type: string;
}

export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface IVoucher {
  id: string;
  voucher_number: string;
  status: string;
  current_value: number;
}

export interface ITradeCost {
  id: string;
  cost_type: string;
  description?: string;
  amount: number;
  is_per_unit: boolean;
  total_amount: number;
  created_at: string;
}

export interface IBrokerage {
  id: string;
  agent: IUser;
  commission_type: string;
  commission_value: number;
  amount: number;
  notes?: string;
  created_at: string;
}

export interface IGoodsReceivedNote {
  id: string;
  grn_number: string;
  trade_number: string;
  grain_type: string;
  quality_grade: string;
  point_of_loading: string;
  loading_date: string;
  delivery_date: string;
  delivered_to_name: string;
  delivered_to_address: string;
  delivered_to_contact: string;
  vehicle_number: string;
  driver_name: string;
  driver_id_number: string;
  driver_phone: string;
  quantity_bags?: number;
  gross_weight_kg: number;
  tare_weight_kg?: number;
  net_weight_kg: number;
  warehouse_manager_name: string;
  warehouse_manager_date: string;
  received_by_name: string;
  received_by_date: string;
  remarks?: string;
  created_at: string;
}

export interface ITrade {
  id: string;
  trade_number: string;
  buyer: IAccount;
  buyer_name?: string;
  grain_type: IGrainType;
  grain_type_name?: string;
  quality_grade: IQualityGrade;
  quality_grade_name?: string;
  hub: IHub;
  hub_name?: string;
  
  // Quantities
  quantity_kg: number;
  quantity_mt: number;
  quantity_bags?: number;
  bag_weight_kg: number;
  
  // Pricing
  purchase_price_per_kg: number;
  buyer_price_per_kg: number;
  
  // Costs
  aflatoxin_qa_cost: number;
  weighbridge_cost: number;
  offloading_cost: number;
  loading_cost: number;
  transport_cost_per_kg: number;
  financing_fee_percentage: number;
  financing_days: number;
  git_insurance_percentage: number;
  deduction_percentage: number;
  other_costs: number;
  
  // Calculated totals
  total_cost_per_kg: number;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  gross_margin_percentage: number;
  roi_percentage: number;
  total_brokerage_cost?: number;
  total_additional_costs?: number;
  net_profit?: number;
  
  // Logistics
  delivery_location: string;
  delivery_distance_km?: number;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  
  // Transport
  vehicle_number?: string;
  driver_name?: string;
  driver_id?: string;
  driver_phone?: string;
  
  // Weight details
  gross_weight_kg?: number;
  tare_weight_kg?: number;
  net_weight_kg?: number;
  
  // Payment
  payment_terms: string;
  payment_terms_display?: string;
  payment_terms_days: number;
  credit_terms_days: number;
  
  // Status
  status: string;
  status_display?: string;
  allocation_complete: boolean;
  
  // Users
  initiated_by?: IUser;
  initiated_by_name?: string;
  approved_by?: IUser;
  approved_at?: string;
  
  // Relations
  vouchers_count?: number;
  vouchers_detail?: IVoucher[];
  additional_costs?: ITradeCost[];
  brokerages?: IBrokerage[];
  grn?: IGoodsReceivedNote;
  inventory_available?: boolean;
  
  // Notes
  remarks?: string;
  internal_notes?: string;
  contract_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  is_active: boolean;

  // Add warning property
  warning?: string;
}

export interface ITradesResults {
  results: ITrade[];
  count: number;
}

export interface IInventoryAvailability {
  hub_id: string;
  hub_name: string;
  grain_type_id: string;
  grain_type_name: string;
  quality_grade_id: string;
  quality_grade_name: string;
  available_quantity_kg: number;
  available_quantity_mt: number;
  current_price_per_kg: number;
  number_of_vouchers: number;
  oldest_deposit_date: string;
  average_storage_days: number;
}

export interface ICostBreakdown {
  purchase_price_per_kg: number;
  total_purchase_cost: number;
  aflatoxin_qa_cost: number;
  weighbridge_cost: number;
  offloading_cost: number;
  loading_cost: number;
  transport_cost_total: number;
  financing_cost: number;
  git_insurance_cost: number;
  deduction_cost: number;
  other_costs: number;
  brokerage_costs: number;
  additional_costs: number;
  total_costs: number;
  total_revenue: number;
  gross_profit: number;
  net_profit: number;
  gross_margin_percentage: number;
  roi_percentage: number;
}

export interface IDashboardStats {
  summary: {
    total_trades: number;
    total_revenue: number;
    total_profit: number;
    total_quantity_kg: number;
    avg_roi: number;
    pending_approval_count: number;
    approved_count: number;
    completed_count: number;
    in_transit_count: number;
  };
  status_breakdown: Array<{
    status: string;
    count: number;
    total_value: number;
  }>;
  recent_trades: ITrade[];
}

export type TTradeTableActions = (trade: ITrade) => void;

export interface ITradeFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

export interface ITradeFormContext {
  hubs: TOption[];
  grainTypes: TOption[];
  qualityGrades: TOption[];
  buyers: TOption[];
  handleHubSearch?: (value: any) => void;
  handleGrainTypeSearch?: (value: any) => void;
  handleQualityGradeSearch?: (value: any) => void;
  handleBuyerSearch?: (value: any) => void;
}

export interface ITradeStatusUpdate {
  status: string;
  notes?: string;
  actual_delivery_date?: string;
  vehicle_number?: string;
  driver_name?: string;
}

export interface ITradeApproval {
  action: 'approve' | 'reject';
  notes?: string;
}

export interface ITradeAllocation {
  auto_allocate: boolean;
  voucher_ids?: string[];
}