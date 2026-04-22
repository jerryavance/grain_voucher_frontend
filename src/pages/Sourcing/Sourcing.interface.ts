import { IHub } from "../Hub/Hub.interface";
import { IUser } from "../Users/Users.interface";

// ============ Grain Type & Quality Grade ============
export type TProductCategory = 'grain' | 'pesticide' | 'fertilizer' | 'seed' | 'other';
export type TUnitOfMeasure = 'kg' | 'litre' | 'tonne' | 'bag' | 'piece';

export interface IGrainType {
  id: string;
  name: string;
  description?: string;
  /** Broad commodity category (grain, pesticide, fertilizer, seed, other) */
  product_category: TProductCategory;
  product_category_display: string;
  /** Unit used to measure quantity for this product (kg, litre, tonne, …) */
  unit_of_measure: TUnitOfMeasure;
  unit_of_measure_display: string;
  /** Short abbreviation for the unit (kg, L, t, bag, pc) */
  unit_label: string;
}
export interface IQualityGrade { id: string; name: string; min_moisture: number; max_moisture: number; description?: string; }

// ============ Payment Preference ============
export interface IPaymentPreference {
  id: string;
  supplier: string;
  method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
  method_display: string;
  account_number?: string;
  account_name?: string;
  phone?: string;
  bank_name?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ Supplier Profile ============
export interface ISupplierProfile {
  id: string; user: IUser; user_id?: string; hub: IHub | null; hub_id?: string;
  business_name: string; farm_location: string; typical_grain_types: IGrainType[];
  typical_grain_type_ids?: string[]; is_verified: boolean; verified_by: IUser | null;
  verified_at: string | null; payment_preferences: IPaymentPreference[];
  total_orders: number; total_supplied_kg: number; created_at: string; updated_at: string;
}
export interface ISuppliersResults { results: ISupplierProfile[]; count: number; }

// ============ Source Order ============
export type TSourceOrderStatus = 'draft'|'sent'|'accepted'|'in_transit'|'delivered'|'completed'|'cancelled'|'rejected';
export type TLogisticsType = 'bennu_truck'|'supplier_driver'|'third_party';
// NEW
export type TTradeType = 'direct' | 'aggregator';

export type TCurrency = 'UGX' | 'USD' | 'EUR' | 'GBP';

export interface ISourceOrder {
    replacement_order_number: any;
  id: string; order_number: string; supplier: ISupplierProfile; supplier_id?: string;
  hub: IHub; hub_id?: string; created_by: IUser; grain_type: IGrainType; grain_type_id?: string;
  // NEW: trade type
  trade_type: TTradeType;
  quantity_kg: number; offered_price_per_kg: number; grain_cost: number; weighbridge_cost: number;
  logistics_cost: number;
  // NEW: loading/offloading costs
  loading_cost: number;
  offloading_cost: number;
  handling_cost: number; other_costs: number; total_cost: number;
  /** Currency for all monetary amounts on this source order */
  currency: TCurrency;
  currency_display: string;
  /** Unit of measure inherited from the product type (kg, litre, …) */
  unit_of_measure: TUnitOfMeasure;
  unit_label: string;
  payment_method: IPaymentPreference | null; payment_method_id?: string;
  logistics_type: TLogisticsType | ''; logistics_type_display: string;
  driver_name: string; driver_phone: string; expected_delivery_date: string | null;
  status: TSourceOrderStatus; status_display: string; notes: string;
  has_investor_allocation: boolean; has_sale_lot: boolean;
  has_delivery: boolean; has_weighbridge: boolean; has_invoice: boolean;
  // NEW: link to rejected lot if one exists
  rejected_lot: string | null;
  sent_at: string | null; accepted_at: string | null; shipped_at: string | null;
  delivered_at: string | null; completed_at: string | null; created_at: string; updated_at: string;
}

export interface ISourceOrderList {
  id: string; order_number: string; supplier: string; supplier_name: string; supplier_phone: string;
  hub: string; hub_name: string; grain_type: string; grain_type_name: string;
  // NEW
  trade_type: TTradeType;
  quantity_kg: number; offered_price_per_kg: number; total_cost: number;
  status: TSourceOrderStatus; status_display: string; created_by_name: string;
  expected_delivery_date: string | null; has_investor_allocation: boolean; has_sale_lot: boolean;
  created_at: string; accepted_at: string | null; delivered_at: string | null;
}
export interface ISourceOrdersResults { results: ISourceOrderList[]; count: number; }

// ============ Supplier Invoice ============
export type TInvoiceStatus = 'pending'|'partial'|'paid'|'cancelled';
export interface ISupplierInvoice {
  order_number: any;
  supplier_name: any;
  id: string; invoice_number: string; source_order: ISourceOrderList; supplier: ISupplierProfile;
  amount_due: number; amount_paid: number; balance_due: number; payment_method: IPaymentPreference | null;
  payment_reference: string; status: TInvoiceStatus; status_display: string;
  issued_at: string; due_date: string | null; paid_at: string | null; notes: string;
  payments_list: ISupplierPayment[]; created_at: string; updated_at: string;
}
export interface ISupplierInvoicesResults { results: ISupplierInvoice[]; count: number; }

// ============ Delivery & Weighbridge ============
export type TApparentCondition = 'good'|'fair'|'poor';
export interface IDeliveryRecord {
  id: string; source_order: ISourceOrderList; source_order_id?: string;
  hub: IHub; hub_id?: string; received_by: IUser; received_at: string;
  driver_name: string; vehicle_number: string; apparent_condition: TApparentCondition;
  notes: string; created_at: string;
}
export interface IDeliveryRecordsResults { results: IDeliveryRecord[]; count: number; }

// UPDATED: removed weighed_by, moisture_level, quality_grade; added vehicle_number
export interface IWeighbridgeRecord {
  id: string; source_order: ISourceOrderList; source_order_id?: string;
  delivery: IDeliveryRecord; delivery_id?: string;
  // REMOVED: weighed_by, moisture_level, quality_grade
  // NEW: vehicle_number (simplified model)
  vehicle_number: string;
  weighed_at: string;
  gross_weight_kg: number; tare_weight_kg: number; net_weight_kg: number;
  quantity_variance_kg: number; notes: string; created_at: string;
}
export interface IWeighbridgeRecordsResults { results: IWeighbridgeRecord[]; count: number; }

// ============ Supplier Payment ============
export type TPaymentStatus = 'pending'|'processing'|'completed'|'failed'|'refunded';
export type TPaymentMethod = 'mobile_money'|'bank_transfer'|'cash'|'check';
export interface ISupplierPayment {
  id: string; payment_number: string; supplier_invoice: string; source_order: string;
  amount: number; method: TPaymentMethod; method_display: string; reference_number: string;
  status: TPaymentStatus; status_display: string; processed_by: IUser | null;
  created_at: string; completed_at: string | null; notes: string;
}
export interface ISupplierPaymentsResults { results: ISupplierPayment[]; count: number; }

// ============ Investor Allocation ============
export interface IInvestorAllocation {
  id: string; allocation_number: string; investor_account: string; investor_name: string;
  source_order: string; source_order_number: string; source_order_total_cost: number;
  amount_allocated: number; investor_margin: number; platform_fee: number;
  amount_returned: number; status: 'active'|'settled'|'force_settled'|'cancelled';
  expected_return_date: string | null;
  payout_type: 'margin' | 'interest';
  financing_percentage: number;
  emd_deduction_timing: 'on_assignment'|'on_weighbridge'|'on_supplier_payment';
  emd_deducted: boolean;
  allocated_at: string; settled_at: string | null; notes: string;
  created_by: string; created_at: string; updated_at: string;
}
export interface IInvestorAllocationsResults { results: IInvestorAllocation[]; count: number; }

export interface IInvestorProfitAgreement {
  payout_type: 'margin' | 'interest';
  fixed_interest_rate?: number | string;
  interest_period_days?: number;
}

// UPDATED: added emd_balance, emd_utilized
export interface IInvestorAccount {
  id: string; investor: IUser; available_balance: number;
  total_utilized: number; total_margin_earned: number;
  // NEW: EMD balance fields — primary source of truth for capital
  emd_balance: number;
  emd_utilized: number;
  profit_agreement?: IInvestorProfitAgreement;
}

// ============ Sale Lot ============
// UPDATED: added rejected_quantity_kg and 'rejected' status
export interface ISaleLot {
  id: string; lot_number: string; source_order: string; source_order_number: string;
  investor_allocation: string | null; investor_name: string | null;
  hub: string; hub_name: string; grain_type: string; grain_type_name: string;
  quality_grade: string | null; quality_grade_name: string | null;
  original_quantity_kg: number; available_quantity_kg: number; sold_quantity_kg: number;
  // NEW
  rejected_quantity_kg: number;
  total_sourcing_cost: number; cost_per_kg: number;
  status: 'available'|'partially_sold'|'sold'|'rejected'; created_at: string; updated_at: string;
}
export interface ISaleLotsResults { results: ISaleLot[]; count: number; }

// ============ NEW: Aggregator Trade Cost ============
export interface IAggregatorTradeCost {
  id: string;
  source_order: string;
  source_order_number: string;
  // Tonnage
  source_quantity_kg: number;
  arrived_quantity_kg: number;
  buyer_deduction_kg: number;
  buyer_deduction_reason: string;
  // Destination costs
  destination_weighbridge_cost: number;
  transit_insurance_cost: number;
  other_destination_costs: number;
  // Computed (read-only from backend)
  tonnage_lost_in_transit_kg: number;
  net_accepted_quantity_kg: number;
  total_additional_cost: number;
  transit_loss_pct: number;
  effective_cost_per_kg: number;
  notes: string;
  created_at: string;
  updated_at: string;
}
export interface IAggregatorTradeCostsResults { results: IAggregatorTradeCost[]; count: number; }

// ============ NEW: Rejected Lot ============
export type TRejectionReason = 'quality'|'moisture'|'contamination'|'weight_short'|'pest_damage'|'wrong_variety'|'other';
export type TRejectionStatus = 'pending'|'replacement_sourced'|'resolved'|'written_off';

export interface IRejectedLot {
  id: string;
  rejection_number: string;
  sale_lot: string;
  lot_number: string;
  investor_name: string;
  rejected_quantity_kg: number;
  rejection_reason: TRejectionReason;
  rejection_reason_display: string;
  rejection_details: string;
  rejection_date: string;
  disposal_cost: number;
  restocking_cost: number;
  status: TRejectionStatus;
  status_display: string;
  replacement_order: string | null;
  replacement_order_number: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}
export interface IRejectedLotsResults { results: IRejectedLot[]; count: number; }

// ============ Buyer Profile ============
export type TBuyerType = 'grain_company'|'trader'|'processor'|'exporter'|'retailer'|'other';

export interface IBuyerContactPreference {
  id: string;
  buyer: string;
  role: 'procurement'|'finance'|'operations'|'management'|'other';
  role_display: string;
  name: string;
  phone: string;
  email: string;
  is_primary: boolean;
  created_at: string;
}

export interface IBuyerProfile {
  id: string;
  business_name: string;
  buyer_type: TBuyerType;
  buyer_type_display: string;
  registration_number: string;
  contact_name: string;
  phone: string;
  email: string;
  physical_address: string;
  district: string;
  country: string;
  default_credit_terms_days: number;
  credit_limit: number;
  outstanding_balance: number;
  credit_available: number;
  preferred_hubs: string[];
  typical_grain_types: string[];
  is_verified: boolean;
  is_active: boolean;
  verified_by: string | null;
  verified_at: string | null;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_revenue?: number;
  contacts?: IBuyerContactPreference[];
}

export interface IBuyerProfileMinimal {
  id: string;
  business_name: string;
  buyer_type_display: string;
  phone: string;
  email: string;
  default_credit_terms_days: number;
  outstanding_balance: number;
  credit_available: number;
}

export interface IBuyerProfilesResults { results: IBuyerProfile[]; count: number; }

export interface IBuyerDashboard {
  total_orders: number;
  completed_orders: number;
  pending_payment: number;
  total_revenue: number;
  outstanding_balance: number;
  credit_available: number;
  recent_orders: IBuyerOrderList[];
}

export interface IBuyerCreditStatus {
  credit_limit: number;
  outstanding_balance: number;
  credit_available: number;
  credit_limit_enforced: boolean;
}

// ============ Proforma Invoice (PFI) ============
export type TProformaInvoiceStatus = 'draft'|'sent'|'accepted'|'rejected'|'expired';

export interface IProformaInvoice {
  id: string;
  pfi_number: string;
  buyer_order: string;
  order_number: string;
  buyer_name: string;
  created_by: string;
  created_by_name: string;
  // Grain / pricing
  grain_type: string;
  grain_type_name: string;
  quantity_kg: string;
  unit_price: string;
  sub_total: string;
  // Deposit
  required_deposit: string;
  paid_deposit: string;
  total_due: string;
  // Logistics
  salesperson: string | null;
  salesperson_name: string;
  ship_date: string;
  shipped_via: string;
  pick_from: string;
  // Narratives
  payment_terms_narrative: string;
  delivery_timeline_narrative: string;
  // Bank details
  bank_name: string;
  account_number: string;
  account_name: string;
  swift_code: string;
  sort_code: string;
  branch_code: string;
  // Signatory
  signatory_name: string;
  signatory_title: string;
  signatory_contact: string;
  // Status
  status: TProformaInvoiceStatus;
  status_display: string;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  expiry_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}
export interface IProformaInvoicesResults { results: IProformaInvoice[]; count: number; }

// ============ Buyer Order ============
export type TBuyerOrderStatus = 'quotation'|'draft'|'confirmed'|'dispatched'|'delivered'|'invoiced'|'completed'|'cancelled';
export type TPaymentType = 'cash'|'financed';

export interface IBuyerOrderLine {
  id: string; buyer_order: string; sale_lot: string; lot_number: string;
  grain_type: string; lot_available_kg: number; quantity_kg: number;
  sale_price_per_kg: number; line_total: number; cogs_per_kg: number;
  cogs_total: number; line_gross_profit: number; notes: string; created_at: string;
}

export interface ISaleExpense {
  id: string; buyer_order: string;
  category: 'logistics'|'storage'|'grading'|'handling'|'insurance'|'finance'|'other';
  description: string; amount: number; incurred_by: string | null;
  incurred_at: string; receipt_reference: string; notes: string; created_at: string;
}

export interface IBuyerOrder {
  id: string; order_number: string;
  // Flat buyer fields (ad-hoc / fallback)
  buyer_name: string; buyer_contact_name: string; buyer_phone: string;
  buyer_email: string; buyer_address: string;
  // FK to profile (preferred)
  buyer: string | null;
  buyer_detail: IBuyerProfileMinimal | null;
  hub: string; hub_name: string; created_by: string; credit_terms_days: number;
  // Payment type (cash buyer vs investor-financed)
  payment_type: TPaymentType;
  payment_type_display: string;
  /** Currency for all sale amounts on this order */
  currency: TCurrency;
  currency_display: string;
  // Pre-sourcing demand fields (set when status = quotation)
  grain_type: string | null;
  grain_type_name: string | null;
  quantity_requested_kg: number | null;
  /** Unit of measure derived from the product type */
  unit_of_measure: TUnitOfMeasure | null;
  unit_label: string | null;
  // PFI counts
  pfi_count: number;
  accepted_pfi: string | null;
  subtotal: number; total_cogs: number; total_selling_expenses: number; gross_profit: number;
  status: TBuyerOrderStatus; notes: string; invoice_status: string | null;
  invoice_balance_due: number | null; lines: IBuyerOrderLine[]; sale_expenses: ISaleExpense[];
  confirmed_at: string | null; dispatched_at: string | null;
  delivered_at: string | null; completed_at: string | null;
  created_at: string; updated_at: string;
  linked_source_order_numbers?: string[];
}

export interface IBuyerOrderList {
  id: string; order_number: string;
  buyer_name: string;
  buyer: string | null;
  buyer_detail: IBuyerProfileMinimal | null;
  hub: string; hub_name: string;
  payment_type: TPaymentType;
  payment_type_display: string;
  grain_type_name: string | null;
  pfi_count: number;
  subtotal: number; gross_profit: number; status: TBuyerOrderStatus;
  invoice_status: string | null; invoice_balance_due: number | null; created_at: string;
}
export interface IBuyerOrdersResults { results: IBuyerOrderList[]; count: number; }

// ============ Buyer Invoice ============
export type TBuyerInvoiceStatus = 'draft'|'issued'|'partial'|'paid'|'overdue'|'cancelled';

/** Per-lot grain line returned by BuyerInvoiceSerializer.order_lines */
export interface IBuyerInvoiceOrderLine {
  id: string;
  lot_number: string;
  grain_type: string;
  source_order_number: string | null;
  quantity_kg: string;
  sale_price_per_kg: string;
  line_total: string;
  cogs_per_kg: string;
  cogs_total: string;
  line_gross_profit: string;
  notes: string;
}

/** Itemised selling expense returned by BuyerInvoiceSerializer.sale_expenses */
export interface IBuyerInvoiceSaleExpense {
  id: string;
  category: string;
  category_display: string;
  description: string;
  amount: string;
  receipt_reference: string;
}

/** Buyer / company contact block returned by BuyerInvoiceSerializer.buyer_detail */
export interface IBuyerInvoiceBuyerDetail {
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  registration_number?: string;
  district?: string;
  country?: string;
  buyer_type?: string;
  credit_terms_days?: number;
}

export interface IBuyerInvoice {
  id: string;
  invoice_number: string;
  buyer_order: string;
  order_number: string;
  buyer_profile: string | null;
  buyer_profile_name: string | null;
  /** Full buyer detail block for invoice PDF / detail view */
  buyer_detail: IBuyerInvoiceBuyerDetail | null;
  buyer_name: string;
  hub: string;
  hub_name: string;
  // ── Payment amounts ──
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_terms_days: number;
  issued_at: string;
  due_date: string | null;
  status: TBuyerInvoiceStatus;
  status_display: string;
  paid_at: string | null;
  is_overdue: boolean;
  // ── Penalties ──
  penalty_rate: number;
  penalty_amount: number;
  days_overdue: number;
  // ── Penalty forgiveness ──
  penalty_forgiven: boolean;
  forgiven_by: string | null;
  forgiven_at: string | null;
  forgiveness_reason: string;
  // ── Cost breakdown (NEW — from backend serializer) ──
  /** Per-lot grain sale lines: qty × price, COGS breakdown */
  order_lines: IBuyerInvoiceOrderLine[];
  /** Total revenue = sum of line_total across all order lines */
  subtotal: number;
  /** Total cost of goods sold = sum of cogs_total across all lines */
  total_cogs: number;
  /** Sum of all SaleExpenses */
  total_selling_expenses: number;
  /** subtotal − total_cogs − total_selling_expenses */
  gross_profit: number;
  /** gross_profit / subtotal × 100 */
  gross_margin_pct: number;
  /** Itemised selling expenses */
  sale_expenses: IBuyerInvoiceSaleExpense[];
  notes: string;
  created_at: string;
  updated_at: string;
  credit_debit_notes: ICreditDebitNote[];
}
export interface IBuyerInvoicesResults { results: IBuyerInvoice[]; count: number; }

export interface ICreditDebitNote {
  id: string;
  note_number: string;
  note_type: "credit" | "debit";
  note_type_display: string;
  amount: string;
  reason: string;
  reference: string;
  status: "draft" | "issued" | "cancelled";
  status_display: string;
  issued_at: string | null;
  issued_by_name: string | null;
  notes: string;
  created_at: string;
}

// ============ Buyer Payment ============
export interface IBuyerPayment {
  id: string; payment_number: string; buyer_invoice: string; invoice_number: string;
  buyer_name: string; amount: number; method: 'bank_transfer'|'mobile_money'|'cash'|'cheque';
  reference_number: string; status: 'pending'|'confirmed'|'failed'|'reversed';
  received_by: string; payment_date: string; confirmed_at: string | null;
  notes: string; created_at: string; updated_at: string;
}
export interface IBuyerPaymentsResults { results: IBuyerPayment[]; count: number; }

// ============ Trade Settlement ============
export interface ITradeSettlement {
  id: string; settlement_number: string; buyer_order: string; order_number: string;
  buyer_invoice: string; invoice_number: string; buyer_revenue: number;
  total_cogs: number; total_selling_expenses: number; gross_profit: number;
  gross_margin_pct: number; investor_margin: number; platform_fee: number;
  investor_return: number; profit_threshold_pct: number; investor_share_pct: number;
  platform_share_pct: number; status: 'pending'|'processing'|'completed'|'failed';
  settled_at: string | null; settled_by: string | null; notes: string;
  created_at: string; updated_at: string;
}
export interface ITradeSettlementsResults { results: ITradeSettlement[]; count: number; }

export interface IHubPLSummary {
  total_buyer_revenue: number; total_cogs: number; total_selling_expenses: number;
  gross_profit: number; gross_margin_pct: number; total_investor_margin: number;
  total_platform_fee: number; settled_trades: number; pending_settlement: number;
}

// ============ Notification ============
export type TNotificationType =
  | 'source_order_created' | 'source_order_status' | 'invoice_generated'
  | 'payment_made' | 'trade_financed' | 'trade_completed'
  | 'capital_returned' | 'delivery_received' | 'weighbridge_completed'
  | 'penalty_forgiven' | 'pfi_sent' | 'pfi_accepted' | 'pfi_rejected'
  | 'period_return_due' | 'period_return_paid';

export interface INotification {
  id: string; user: IUser; notification_type: TNotificationType; type_display: string;
  title: string; message: string; related_object_type: string; related_object_id: string;
  is_read: boolean; created_at: string;
}
export interface INotificationsResults { results: INotification[]; count: number; }

// ============ Supplier Dashboard ============
export interface ISupplierDashboard {
  total_orders: number; pending_orders: number; completed_orders: number;
  total_supplied_kg: number; total_earned: number; pending_payment: number;
  recent_orders: ISourceOrderList[]; recent_invoices: ISupplierInvoice[]; unread_notifications: number;
}

// ============ Form Props ============
export interface ISupplierFormProps { handleClose: () => void; formType?: 'Save'|'Update'; initialValues?: any; callBack?: () => void; }
export interface ISourceOrderFormProps { handleClose: () => void; formType?: 'Save'|'Update'; initialValues?: any; callBack?: () => void; }
export interface IDeliveryFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  callBack?: () => void;
  formData: { sourceOrders: { value: string; label: string }[]; hubs: { value: string; label: string }[] };
  formDataLoading: boolean;
  searchHandlers: { handleOrderSearch: (query: string) => void };
}

// UPDATED: removed qualityGrades from WeighbridgeFormProps
export interface IWeighbridgeFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  deliveryId?: string;
  callBack?: () => void;
  // qualityGrades removed — weighbridge simplified
}
export interface IPaymentFormProps { handleClose: () => void; invoiceId?: string; callBack?: () => void; }
export interface IPaymentPreferenceFormProps { handleClose: () => void; formType?: 'Save'|'Update'; initialValues?: any; callBack?: () => void; }

// ============ Table Action Types ============
export type TSupplierTableAction = (supplier: ISupplierProfile) => void;
export type TSourceOrderTableAction = (order: ISourceOrderList) => void;
export type TInvoiceTableAction = (invoice: ISupplierInvoice) => void;
export type TDeliveryTableAction = (delivery: IDeliveryRecord) => void;
export type TWeighbridgeTableAction = (weighbridge: IWeighbridgeRecord) => void;
export type TPaymentTableAction = (payment: ISupplierPayment) => void;

// ============ Investor Receivable (My Returns → Receivables tab) ============
/**
 * Shape returned by GET sourcing/investor-allocations/receivables/
 * Contains both the live invoice data AND projected margin calculations
 * so investors can see probable returns before settlement.
 */
export interface IInvestorReceivable {
  // ✅ FIX: investor_name is now returned by backend
  investor_name: string;
  // ── Invoice ──
  buyer_invoice_id: string;
  invoice_number: string;
  buyer_name: string;
  buyer_order_number: string;
  grain_type: string;
  hub_name: string;
  invoice_amount_due: string;
  invoice_amount_paid: string;
  invoice_balance_due: string;
  invoice_status: string;
  invoice_issued_at: string;
  invoice_due_date: string | null;
  // ── Allocation ──
  allocation_number: string;
  source_order_number: string;
  amount_allocated: string;
  /** 0–1 share of total capital in this trade belonging to this investor */
  allocation_proportion: string;
  // ── Settled margin (non-zero only after TradeSettlement completes) ──
  investor_margin: string;
  allocation_status: 'active' | 'settled' | 'cancelled';
  // ── Projected / estimated margin (available before settlement) ──
  /** Investor's proportional share of the order's current gross profit */
  projected_gross_profit: string;
  /** Estimated investor margin after applying profit-sharing agreement */
  projected_investor_margin: string;
  /** amount_allocated + projected_investor_margin */
  projected_return: string;
  /** projected_investor_margin / amount_allocated × 100 */
  projected_margin_pct: string;
  profit_threshold_pct: string;
  investor_share_pct: string;
}

// ============ EMD Overview (Sourcing Dashboard) ============
export interface IEmdInvestorBalance {
  account_id: string;
  investor_id: string;
  investor_name: string;
  emd_balance: number;
  emd_utilized: number;
  total_deposited: number;
  available_balance: number;
  total_margin_earned: number;
  total_margin_paid: number;
}

export interface IEmdOverview {
  total_emd_balance: number;
  total_emd_utilized: number;
  total_emd_available: number;
  investor_count: number;
  investors: IEmdInvestorBalance[];
}