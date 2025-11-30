import { TOption } from "../../@types/common";

// ============================================================================
// CORE TRADE INTERFACE - Multi-Delivery Support
// ============================================================================
export interface ITrade {
  id: string;
  trade_number: string;
  
  // Parties
  buyer: any;
  buyer_id?: string;
  supplier: any;
  supplier_id?: string;
  hub: any;
  hub_id?: string;
  
  // Grain Details
  grain_type: any;
  grain_type_id?: string;
  quality_grade: any;
  quality_grade_id?: string;
  
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
  bennu_fees: number;
  bennu_fees_payer: 'buyer' | 'seller' | 'split';
  bennu_fees_payer_display?: string;
  
  // Loss Tracking
  loss_quantity_kg: number;
  loss_cost: number;
  loss_reason?: string;
  loss_summary?: {
    has_loss: boolean;
    quantity_kg: number;
    cost: number;
    percentage: number;
    reason?: string;
  };
  
  // Calculated Totals
  total_trade_cost: number;
  payable_by_buyer: number;
  margin: number;
  gross_margin_percentage: number;
  roi_percentage: number;
  total_brokerage_cost?: number;
  total_additional_costs?: number;
  net_profit?: number;
  
  // Payment - Multi-invoice support
  payment_status?: string;
  payment_status_display?: string;
  amount_due?: number;
  payment_terms: string;
  payment_terms_display?: string;
  payment_terms_days: number;
  credit_terms_days: number;
  
  // Delivery - Multi-delivery progress
  delivery_status: string;
  delivery_status_display?: string;
  delivery_date: string;
  delivery_location: string;
  delivery_distance_km?: number;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  delivery_completion_percentage?: number;  // NEW
  delivered_quantity_kg?: number;            // NEW
  remaining_quantity_kg?: number;            // NEW
  
  // Vehicle
  vehicle_number?: string;
  driver_name?: string;
  driver_id?: string;
  driver_phone?: string;
  
  // Weight Details
  gross_weight_kg?: number;
  tare_weight_kg?: number;
  net_weight_kg?: number;
  
  // Status & Workflow
  status: string;
  status_display?: string;
  initiated_by?: any;
  approved_by?: any;
  approved_at?: string;
  
  // Voucher Allocation
  vouchers_count?: number;
  vouchers_detail?: any[];
  allocation_complete: boolean;
  requires_voucher_allocation: boolean;
  inventory_available?: boolean;
  
  // Financing
  requires_financing: boolean;
  financing_complete: boolean;
  total_financing_allocated?: number;
  total_loans?: number;
  financing_allocations?: ITradeFinancing[];
  loans?: ITradeLoan[];
  
  // Additional
  additional_costs?: ITradeCost[];
  brokerages?: IBrokerage[];
  
  // Multi-delivery & invoicing - FIXED
  grns?: IGRN[];                    // CHANGED from singular
  grn_count?: number;               // NEW
  invoices_list?: IInvoice[];       // CHANGED from singular
  invoice_count?: number;           // NEW
  total_invoiced?: number;
  has_losses?: boolean;
  
  // Notes
  remarks?: string;
  internal_notes?: string;
  contract_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// ============================================================================
// TRADE LIST ITEM
// ============================================================================
export interface ITradeListItem {
  id: string;
  trade_number: string;
  buyer_name: string;
  supplier_name: string;
  grain_type_name: string;
  quality_grade_name: string;
  hub_name: string;
  net_tonnage: number;
  quantity_kg: number;
  buying_price: number;
  selling_price: number;
  payable_by_buyer: number;
  margin: number;
  roi_percentage: number;
  status: string;
  status_display: string;
  payment_status_display?: string;
  requires_voucher_allocation: boolean;
  delivery_status: string;
  initiated_by_name: string;
  vouchers_count: number;
  allocation_complete: boolean;
  requires_financing: boolean;
  financing_complete: boolean;
  delivery_date: string;
  created_at: string;
  amount_due?: number;
  bennu_fees_payer: string;
  has_losses?: boolean;
  grn_count?: number;                         // NEW
  delivery_completion_percentage?: number;     // NEW
}

// ============================================================================
// GRN (Goods Received Note)
// ============================================================================
export interface IGRN {
  id: string;
  grn_number: string;
  trade: string;
  trade_number?: string;
  grain_type?: string;
  quality_grade?: string;
  
  // Loading
  point_of_loading: string;
  loading_date: string;
  
  // Delivery
  delivery_date: string;
  delivered_to_name: string;
  delivered_to_address: string;
  delivered_to_contact: string;
  
  // Vehicle
  vehicle_number: string;
  driver_name: string;
  driver_id_number: string;
  driver_phone: string;
  
  // Weight
  quantity_bags?: number;
  gross_weight_kg: number;
  tare_weight_kg?: number;
  net_weight_kg: number;
  
  // Signatures
  warehouse_manager_name: string;
  warehouse_manager_signature?: string;
  warehouse_manager_date: string;
  received_by_name: string;
  received_by_signature?: string;
  received_by_date: string;
  
  // Additional
  remarks?: string;
  reason?: string;
  
  // Invoice relationship - NEW
  invoice?: IInvoice;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INVOICE
// ============================================================================
export interface IInvoice {
  id: string;
  invoice_number: string;
  account: any;
  account_id?: string;
  grn: string;
  grn_number?: string;
  trade: string;
  trade_number?: string;
  
  // Dates
  issue_date: string;
  due_date: string;
  delivery_date: string;
  
  // Line item details
  description: string;
  grain_type: string;
  quality_grade?: string;
  supplier_name: string;
  quantity_kg: number;
  unit_price: number;
  
  // Amounts
  subtotal: number;
  bennu_fees: number;
  logistics_cost: number;
  weighbridge_cost: number;
  other_charges: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  
  // Status
  status: string;
  status_display?: string;
  payment_status: string;
  payment_status_display?: string;
  
  // Batch tracking
  batch_sent_date?: string;
  batch_id?: string;
  
  // Bank details
  beneficiary_bank?: string;
  beneficiary_name?: string;
  beneficiary_account?: string;
  beneficiary_branch?: string;
  
  // Terms
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  
  // Tracking
  created_by?: any;
  last_reminder_sent?: string;
  days_overdue?: number;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DELIVERY PROGRESS (API Response)
// ============================================================================
export interface IDeliveryProgress {
  trade_number: string;
  buyer: string;
  status: string;
  delivery_summary: {
    total_ordered_kg: number;
    total_delivered_kg: number;
    remaining_kg: number;
    completion_percentage: number;
    is_fully_delivered: boolean;
    delivery_count: number;
    can_create_more_deliveries: boolean;
  };
  deliveries: Array<{
    grn_number: string;
    delivery_date: string;
    net_weight_kg: number;
    vehicle_number: string;
    driver_name: string;
    invoice?: {
      invoice_number: string;
      total_amount: number;
      amount_paid: number;
      amount_due: number;
      status: string;
      payment_status: string;
      due_date: string;
      is_overdue: boolean;
    };
  }>;
  payment_summary: {
    total_invoiced: number;
    total_paid: number;
    total_due: number;
    all_paid: boolean;
  };
  next_steps: string[];
}

// ============================================================================
// TRADE FINANCING
// ============================================================================
export interface ITradeFinancing {
  id: string;
  trade: string;
  trade_number?: string;
  investor: any;
  investor_account_id?: string;
  allocated_amount: number;
  allocation_percentage: number;
  margin_earned: number;
  investor_margin: number;
  bennu_margin: number;
  allocation_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TRADE LOAN
// ============================================================================
export interface ITradeLoan {
  id: string;
  trade: string;
  trade_number?: string;
  investor: any;
  investor_account_id?: string;
  amount: number;
  interest_rate: number;
  disbursement_date: string;
  due_date: string;
  status: string;
  amount_repaid: number;
  interest_earned: number;
  total_due?: number;
  outstanding_balance?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TRADE COST
// ============================================================================
export interface ITradeCost {
  id: string;
  trade: string;
  cost_type: string;
  description?: string;
  amount: number;
  is_per_unit: boolean;
  total_amount?: number;
  created_at: string;
}

// ============================================================================
// BROKERAGE
// ============================================================================
export interface IBrokerage {
  id: string;
  trade: string;
  agent?: any;
  agent_id?: string;
  commission_type: 'percentage' | 'per_mt' | 'per_kg' | 'fixed';
  commission_value: number;
  amount: number;
  notes?: string;
  created_at: string;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================
export interface ITradeDashboardStats {
  summary: {
    total_trades: number;
    total_revenue: number;
    total_profit: number;
    total_quantity_kg: number;
    avg_roi: number;
    pending_approval: number;
    approved: number;
    ready_for_delivery: number;
    in_transit: number;
    delivered: number;
    completed: number;
  };
  status_breakdown: {
    status: string;
    count: number;
    total_value: number;
  }[];
}

// ============================================================================
// API REQUESTS
// ============================================================================
export interface ITradesResults {
  results: ITradeListItem[];
  count: number;
}

export interface ICreateDeliveryBatchRequest {
  net_weight_kg: number;
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
  warehouse_manager_name: string;
  warehouse_manager_date: string;
  received_by_name: string;
  received_by_date: string;
  remarks?: string;
}

export interface IVoucherAllocationRequest {
  allocation_type: 'auto' | 'manual';
  voucher_ids?: string[];
}

export interface ITradeStatusUpdateRequest {
  status?: string;
  notes?: string;
  actual_delivery_date?: string;
  vehicle_number?: string;
  driver_name?: string;
}

export interface IProgressStatusRequest {
  notes?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
}

export interface IApproveRejectRequest {
  notes?: string;
  reason?: string;
}

// ============================================================================
// FORM PROPS
// ============================================================================
export interface ITradeFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

export interface TTradeFormProps {
  buyers: TOption[];
  suppliers: TOption[];
  grainTypes: TOption[];
  qualityGrades: TOption[];
  hubs: TOption[];
  handleBuyerSearch?: (value: any) => void;
  handleSupplierSearch?: (value: any) => void;
  handleGrainTypeSearch?: (value: any) => void;
  handleQualityGradeSearch?: (value: any) => void;
  handleHubSearch?: (value: any) => void;
}

export type TTradeTableActions = (trade: ITradeListItem) => void;














// import { TOption } from "../../@types/common";

// // Core Trade Interface
// export interface ITrade {
//   grn: any;
//   id: string;
//   trade_number: string;
//   grn_number?: string;
  
//   // Parties
//   buyer: any;
//   buyer_id?: string;
//   supplier: any;
//   supplier_id?: string;
//   hub: any;
//   hub_id?: string;
  
//   // Grain Details
//   grain_type: any;
//   grain_type_id?: string;
//   quality_grade: any;
//   quality_grade_id?: string;
  
//   // Quantities
//   gross_tonnage: number;
//   net_tonnage: number;
//   quantity_kg: number;
//   quantity_bags?: number;
//   bag_weight_kg: number;
  
//   // Pricing
//   buying_price: number;
//   selling_price: number;
  
//   // Costs
//   aflatoxin_qa_cost: number;
//   weighbridge_cost: number;
//   offloading_cost: number;
//   loading_cost: number;
//   transport_cost_per_kg: number;
//   financing_fee_percentage: number;
//   financing_days: number;
//   git_insurance_percentage: number;
//   deduction_percentage: number;
//   other_expenses: number;
//   bennu_fees: number;
//   bennu_fees_payer: 'buyer' | 'seller' | 'split';
//   bennu_fees_payer_display?: string;
  
//   // Loss Tracking
//   loss_quantity_kg: number;
//   loss_cost: number;
//   loss_reason?: string;
//   loss_summary?: {
//     has_loss: boolean;
//     quantity_kg: number;
//     cost: number;
//     percentage: number;
//     reason?: string;
//   };
  
//   // Calculated Totals
//   total_trade_cost: number;
//   payable_by_buyer: number;
//   margin: number;
//   gross_margin_percentage: number;
//   roi_percentage: number;
//   total_brokerage_cost?: number;
//   total_additional_costs?: number;
//   net_profit?: number;
  
//   // Payment
//   payment_status?: string;
//   payment_status_display?: string;
//   amount_due?: number;
//   payment_due_date?: string;
//   payment_terms: string;
//   payment_terms_display?: string;
//   payment_terms_days: number;
//   credit_terms_days: number;
  
//   // Delivery
//   delivery_status: string;
//   delivery_status_display?: string;
//   delivery_date: string;
//   delivery_location: string;
//   delivery_distance_km?: number;
//   expected_delivery_date?: string;
//   actual_delivery_date?: string;
  
//   // Vehicle
//   vehicle_number?: string;
//   driver_name?: string;
//   driver_id?: string;
//   driver_phone?: string;
  
//   // Weight Details
//   gross_weight_kg?: number;
//   tare_weight_kg?: number;
//   net_weight_kg?: number;
  
//   // Status & Workflow
//   status: string;
//   status_display?: string;
//   initiated_by?: any;
//   approved_by?: any;
//   approved_at?: string;
  
//   // Voucher Allocation
//   vouchers_count?: number;
//   vouchers_detail?: any[];
//   allocation_complete: boolean;
//   requires_voucher_allocation: boolean;
//   inventory_available?: boolean;
  
//   // Financing
//   requires_financing: boolean;
//   financing_complete: boolean;
//   total_financing_allocated?: number;
//   total_loans?: number;
//   financing_allocations?: ITradeFinancing[];
//   loans?: ITradeLoan[];
  
//   // Additional
//   additional_costs?: ITradeCost[];
//   brokerages?: IBrokerage[];
  
//   // Invoices
//   invoice?: any;
//   invoice_id?: string;
//   invoices_list?: IInvoiceListItem[];
//   invoice_count?: number;
//   total_invoiced?: number;
//   has_losses?: boolean;
  
//   // Notes
//   remarks?: string;
//   internal_notes?: string;
//   contract_notes?: string;
  
//   // Timestamps
//   created_at: string;
//   updated_at: string;
//   is_active: boolean;
// }

// // Trade List Item (simplified for table view)
// export interface ITradeListItem {
//   id: string;
//   trade_number: string;
//   grn_number?: string;
//   buyer_name: string;
//   supplier_name: string;
//   grain_type_name: string;
//   quality_grade_name: string;
//   hub_name: string;
//   net_tonnage: number;
//   quantity_kg: number;
//   buying_price: number;
//   selling_price: number;
//   payable_by_buyer: number;
//   margin: number;
//   roi_percentage: number;
//   status: string;
//   status_display: string;
//   payment_status_display?: string;
//   delivery_status: string;
//   initiated_by_name: string;
//   vouchers_count: number;
//   allocation_complete: boolean;
//   requires_financing: boolean;
//   financing_complete: boolean;
//   delivery_date: string;
//   created_at: string;
//   amount_due?: number;
//   bennu_fees_payer: string;
//   has_losses?: boolean;
//   invoice_count?: number;
//   total_invoiced?: number;
// }

// // Trade Results
// export interface ITradesResults {
//   results: ITradeListItem[];
//   count: number;
// }

// // Trade Financing
// export interface ITradeFinancing {
//   id: string;
//   trade: string;
//   trade_number?: string;
//   investor: any;
//   investor_account_id?: string;
//   allocated_amount: number;
//   allocation_percentage: number;
//   margin_earned: number;
//   investor_margin: number;
//   bennu_margin: number;
//   allocation_date: string;
//   notes?: string;
//   created_at: string;
//   updated_at: string;
// }

// // Trade Loan
// export interface ITradeLoan {
//   id: string;
//   trade: string;
//   trade_number?: string;
//   investor: any;
//   investor_account_id?: string;
//   amount: number;
//   interest_rate: number;
//   disbursement_date: string;
//   due_date: string;
//   status: string;
//   amount_repaid: number;
//   interest_earned: number;
//   total_due?: number;
//   outstanding_balance?: number;
//   notes?: string;
//   created_at: string;
//   updated_at: string;
// }

// // Trade Cost
// export interface ITradeCost {
//   id: string;
//   trade: string;
//   cost_type: string;
//   description?: string;
//   amount: number;
//   is_per_unit: boolean;
//   total_amount?: number;
//   created_at: string;
// }

// // Brokerage
// export interface IBrokerage {
//   id: string;
//   trade: string;
//   agent?: any;
//   agent_id?: string;
//   commission_type: 'percentage' | 'per_mt' | 'per_kg' | 'fixed';
//   commission_value: number;
//   amount: number;
//   notes?: string;
//   created_at: string;
// }

// // GRN
// export interface IGRN {
//   id: string;
//   grn_number: string;
//   trade: string;
//   trade_number?: string;
//   grain_type?: string;
//   quality_grade?: string;
  
//   // Loading
//   point_of_loading: string;
//   loading_date: string;
  
//   // Delivery
//   delivery_date: string;
//   delivered_to_name: string;
//   delivered_to_address: string;
//   delivered_to_contact: string;
  
//   // Vehicle
//   vehicle_number: string;
//   driver_name: string;
//   driver_id_number: string;
//   driver_phone: string;
  
//   // Weight
//   quantity_bags?: number;
//   gross_weight_kg: number;
//   tare_weight_kg?: number;
//   net_weight_kg: number;
  
//   // Signatures
//   warehouse_manager_name: string;
//   warehouse_manager_signature?: string;
//   warehouse_manager_date: string;
//   received_by_name: string;
//   received_by_signature?: string;
//   received_by_date: string;
  
//   // Additional
//   remarks?: string;
//   reason?: string;
  
//   created_at: string;
//   updated_at: string;
// }

// // Invoice List Item
// export interface IInvoiceListItem {
//   id: string;
//   invoice_number: string;
//   grn_number?: string;
//   total_amount: number;
//   amount_due: number;
//   status: string;
// }

// // Dashboard Stats
// export interface ITradeDashboardStats {
//   summary: {
//     total_trades: number;
//     total_revenue: number;
//     total_profit: number;
//     total_quantity_kg: number;
//     avg_roi: number;
//     pending_approval: number;
//     approved: number;
//     ready_for_delivery: number;
//     in_transit: number;
//     delivered: number;
//     completed: number;
//   };
//   status_breakdown: {
//     status: string;
//     count: number;
//     total_value: number;
//   }[];
// }

// // Form Props
// export interface ITradeFormProps {
//   handleClose: () => void;
//   formType?: 'Save' | 'Update';
//   initialValues?: any;
//   callBack?: () => void;
// }

// export interface TTradeFormProps {
//   buyers: TOption[];
//   suppliers: TOption[];
//   grainTypes: TOption[];
//   qualityGrades: TOption[];
//   hubs: TOption[];
//   handleBuyerSearch?: (value: any) => void;
//   handleSupplierSearch?: (value: any) => void;
//   handleGrainTypeSearch?: (value: any) => void;
//   handleQualityGradeSearch?: (value: any) => void;
//   handleHubSearch?: (value: any) => void;
// }

// // Table Actions
// export type TTradeTableActions = (trade: ITradeListItem) => void;

// // Voucher Allocation Request
// export interface IVoucherAllocationRequest {
//   allocation_type: 'auto' | 'manual';
//   voucher_ids?: string[];
// }

// // Status Update Request
// export interface ITradeStatusUpdateRequest {
//   status?: string;
//   notes?: string;
//   actual_delivery_date?: string;
//   vehicle_number?: string;
//   driver_name?: string;
// }

// // Payment Record Request
// export interface IPaymentRecordRequest {
//   amount: number;
//   payment_date: string;
//   payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'check';
//   reference_number?: string;
//   notes?: string;
// }

// // Dispatch Request
// export interface IDispatchRequest {
//   vehicle_number: string;
//   driver_name: string;
//   driver_phone?: string;
//   driver_id?: string;
//   notes?: string;
// }

// // Progress Status Request
// export interface IProgressStatusRequest {
//   notes?: string;
//   vehicle_number?: string;
//   driver_name?: string;
//   driver_phone?: string;
// }

// // Approve/Reject Request
// export interface IApproveRejectRequest {
//   notes?: string;
//   reason?: string;
// }