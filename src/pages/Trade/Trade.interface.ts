// Trade.interface.ts - UPDATED
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
  role?: string;
}

export interface IVoucher {
  id: string;
  voucher_number: string;
  status: string;
  current_value: number;
  deposit?: {
    quantity_kg: number;
  };
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

export interface ITradeFinancing {
  id: string;
  trade: string;
  trade_number?: string;
  investor: IUser;
  investor_account_id: string;
  allocated_amount: number;
  allocation_percentage: number;
  margin_earned: number;
  investor_margin: number;
  amsaf_margin: number;
  allocation_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ITradeLoan {
  id: string;
  trade: string;
  trade_number?: string;
  investor: IUser;
  investor_account_id: string;
  amount: number;
  interest_rate: number;
  disbursement_date: string;
  due_date: string;
  status: 'pending' | 'active' | 'repaid' | 'defaulted';
  amount_repaid: number;
  interest_earned: number;
  total_due: number;
  outstanding_balance: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IGoodsReceivedNote {
  id: string;
  grn_number: string;
  trade: string;
  trade_number?: string;
  grain_type?: string;
  quality_grade?: string;
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
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ITrade {
  id: string;
  trade_number: string;
  grn_number?: string;
  
  // Parties
  buyer: IAccount;
  buyer_name?: string;
  supplier?: IUser;
  supplier_name?: string;
  grain_type: IGrainType;
  grain_type_name?: string;
  quality_grade: IQualityGrade;
  quality_grade_name?: string;
  hub: IHub;
  hub_name?: string;
  
  // Quantities
  gross_tonnage: number;
  net_tonnage: number;
  quantity_kg: number;
  quantity_bags?: number;
  bag_weight_kg: number;
  
  // Pricing
  buying_price: number;
  selling_price: number;
  
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
  other_expenses: number;
  amsaf_fees: number;
  
  // Calculated totals
  total_trade_cost: number;
  payable_by_buyer: number;
  margin: number;
  gross_margin_percentage: number;
  roi_percentage: number;
  total_brokerage_cost?: number;
  total_additional_costs?: number;
  net_profit?: number;
  
  // Payment
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_status_display?: string;
  amount_paid: number;
  amount_due: number;
  payment_due_date: string;
  payment_terms: string;
  payment_terms_display?: string;
  payment_terms_days: number;
  credit_terms_days: number;
  
  // Delivery
  delivery_status: 'pending' | 'in_transit' | 'delivered';
  delivery_status_display?: string;
  delivery_date: string;
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
  
  // Status & Workflow
  status: 'draft' | 'pending_approval' | 'approved' | 'pending_allocation' | 
          'allocated' | 'in_transit' | 'delivered' | 'completed' | 
          'cancelled' | 'rejected';
  status_display?: string;
  initiated_by?: IUser;
  initiated_by_name?: string;
  approved_by?: IUser;
  approved_at?: string;
  
  // Voucher Allocation
  vouchers_count?: number;
  vouchers_detail?: IVoucher[];
  allocation_complete: boolean;
  
  // Investor Financing (NEW)
  requires_financing: boolean;
  financing_complete: boolean;
  total_financing_allocated?: number;
  total_loans?: number;
  financing_allocations?: ITradeFinancing[];
  loans?: ITradeLoan[];
  
  // Relations
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

  // Warnings
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
  transport_cost: number;
  margin: number;
  payable_by_buyer: number;
  total_trade_cost: number;
  purchase_cost: number;
  aflatoxin_qa_cost: number;
  weighbridge_cost: number;
  offloading_cost: number;
  loading_cost: number;
  transport_cost_total: number;
  financing_cost: number;
  git_insurance_cost: number;
  deduction_cost: number;
  other_expenses: number;
  amsaf_fees: number;
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
    pending_approval: number;
    approved: number;
    completed: number;
    in_transit: number;
  };
  status_breakdown: Array<{
    status: string;
    count: number;
    total_value: number;
  }>;
}

export interface IPaymentRecord {
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'check';
  reference_number?: string;
  notes?: string;
}

export interface ITradeStatusUpdate {
  status: string;
  notes?: string;
  actual_delivery_date?: string;
  vehicle_number?: string;
  driver_name?: string;
}

export interface ITradeApproval {
  notes?: string;
}

export interface IVoucherAllocation {
  allocation_type: 'auto' | 'manual';
  voucher_ids?: string[];
}

export interface IAvailableVouchers {
  count: number;
  total_quantity_kg: number;
  vouchers: IVoucher[];
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
  suppliers: TOption[];
  handleHubSearch?: (value: any) => void;
  handleGrainTypeSearch?: (value: any) => void;
  handleQualityGradeSearch?: (value: any) => void;
  handleBuyerSearch?: (value: any) => void;
  handleSupplierSearch?: (value: any) => void;
}