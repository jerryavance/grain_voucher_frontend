import { TOption } from "../../@types/common";
import { IHub } from "../Hub/Hub.interface";
import { IUser } from "../Users/Users.interface";

// ============ Grain Type & Quality Grade ============
export interface IGrainType {
  id: string;
  name: string;
  description?: string;
}

export interface IQualityGrade {
  id: string;
  name: string;
  min_moisture: number;
  max_moisture: number;
  description?: string;
}

// ============ Payment Preference ============
export interface IPaymentPreference {
  id: string;
  supplier: string;
  method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
  method_display: string;
  details: {
    phone?: string;
    account_number?: string;
    bank_name?: string;
    account_name?: string;
    [key: string]: any;
  };
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ Supplier Profile ============
export interface ISupplierProfile {
  id: string;
  user: IUser;
  user_id?: string;
  hub: IHub | null;
  hub_id?: string;
  business_name: string;
  farm_location: string;
  typical_grain_types: IGrainType[];
  typical_grain_type_ids?: string[];
  is_verified: boolean;
  verified_by: IUser | null;
  verified_at: string | null;
  payment_preferences: IPaymentPreference[];
  total_orders: number;
  total_supplied_kg: number;
  created_at: string;
  updated_at: string;
}

export interface ISuppliersResults {
  results: ISupplierProfile[];
  count: number;
}

// ============ Source Order ============
export type TSourceOrderStatus = 
  | 'draft' 
  | 'open' 
  | 'accepted' 
  | 'in_transit' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type TLogisticsType = 
  | 'bennu_truck' 
  | 'supplier_driver' 
  | 'third_party';

export interface ISourceOrder {
  id: string;
  order_number: string;
  supplier: ISupplierProfile;
  supplier_id?: string;
  hub: IHub;
  hub_id?: string;
  created_by: IUser;
  grain_type: IGrainType;
  grain_type_id?: string;
  quantity_kg: number;
  offered_price_per_kg: number;
  grain_cost: number;
  weighbridge_cost: number;
  logistics_cost: number;
  handling_cost: number;
  other_costs: number;
  total_cost: number;
  payment_method: IPaymentPreference | null;
  payment_method_id?: string;
  logistics_type: TLogisticsType | '';
  logistics_type_display: string;
  driver_name: string;
  driver_phone: string;
  expected_delivery_date: string | null;
  status: TSourceOrderStatus;
  status_display: string;
  created_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  notes: string;
  has_delivery: boolean;
  has_weighbridge: boolean;
  has_invoice: boolean;
}

export interface ISourceOrderList {
  id: string;
  order_number: string;
  supplier: string;
  supplier_name: string;
  supplier_phone: string;
  hub: string;
  hub_name: string;
  grain_type: string;
  grain_type_name: string;
  quantity_kg: number;
  offered_price_per_kg: number;
  total_cost: number;
  status: TSourceOrderStatus;
  status_display: string;
  created_by_name: string;
  expected_delivery_date: string | null;
  created_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
}

export interface ISourceOrdersResults {
  results: ISourceOrderList[];
  count: number;
}

// ============ Supplier Invoice ============
export type TInvoiceStatus = 'pending' | 'partial' | 'paid' | 'cancelled';

export interface ISupplierInvoice {
  id: string;
  invoice_number: string;
  source_order: ISourceOrderList;
  supplier: ISupplierProfile;
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_method: IPaymentPreference | null;
  payment_reference: string;
  status: TInvoiceStatus;
  status_display: string;
  issued_at: string;
  due_date: string | null;
  paid_at: string | null;
  notes: string;
  payments_list: ISupplierPayment[];
  created_at: string;
  updated_at: string;
}

export interface ISupplierInvoicesResults {
  results: ISupplierInvoice[];
  count: number;
}

// ============ Delivery Record ============
export type TApparentCondition = 'good' | 'fair' | 'poor';

export interface IDeliveryRecord {
  id: string;
  source_order: ISourceOrderList;
  source_order_id?: string;
  hub: IHub;
  hub_id?: string;
  received_by: IUser;
  received_at: string;
  driver_name: string;
  vehicle_number: string;
  apparent_condition: TApparentCondition;
  notes: string;
  created_at: string;
}

export interface IDeliveryRecordsResults {
  results: IDeliveryRecord[];
  count: number;
}

// ============ Weighbridge Record ============
export interface IWeighbridgeRecord {
  id: string;
  source_order: ISourceOrderList;
  source_order_id?: string;
  delivery: IDeliveryRecord;
  delivery_id?: string;
  weighed_by: IUser;
  weighed_at: string;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  moisture_level: number;
  quality_grade: IQualityGrade;
  quality_grade_id?: string;
  quantity_variance_kg: number;
  notes: string;
  created_at: string;
}

export interface IWeighbridgeRecordsResults {
  results: IWeighbridgeRecord[];
  count: number;
}

// ============ Supplier Payment ============
export type TPaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

export type TPaymentMethod = 
  | 'mobile_money' 
  | 'bank_transfer' 
  | 'cash' 
  | 'check';

export interface ISupplierPayment {
  id: string;
  payment_number: string;
  supplier_invoice: string;
  source_order: string;
  amount: number;
  method: TPaymentMethod;
  method_display: string;
  reference_number: string;
  status: TPaymentStatus;
  status_display: string;
  processed_by: IUser | null;
  created_at: string;
  completed_at: string | null;
  notes: string;
}

export interface ISupplierPaymentsResults {
  results: ISupplierPayment[];
  count: number;
}

// ============ Notification ============
export type TNotificationType = 
  | 'source_order_created'
  | 'source_order_status'
  | 'invoice_generated'
  | 'payment_made'
  | 'payment_proof'
  | 'trade_financed'
  | 'trade_completed'
  | 'capital_returned'
  | 'delivery_received'
  | 'weighbridge_completed';

export interface INotification {
  id: string;
  user: IUser;
  notification_type: TNotificationType;
  type_display: string;
  title: string;
  message: string;
  related_object_type: string;
  related_object_id: string;
  is_read: boolean;
  created_at: string;
}

export interface INotificationsResults {
  results: INotification[];
  count: number;
}

// ============ Supplier Dashboard ============
export interface ISupplierDashboard {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_supplied_kg: number;
  total_earned: number;
  pending_payment: number;
  recent_orders: ISourceOrderList[];
  recent_invoices: ISupplierInvoice[];
  unread_notifications: number;
}

// ============ Form Props ============
export interface ISupplierFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

export interface ISourceOrderFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

export interface IDeliveryFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  callBack?: () => void;
}

export interface IWeighbridgeFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  deliveryId?: string;
  callBack?: () => void;
}

export interface IPaymentFormProps {
  handleClose: () => void;
  invoiceId?: string;
  callBack?: () => void;
}

export interface IPaymentPreferenceFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

// ============ Table Action Types ============
export type TSupplierTableAction = (supplier: ISupplierProfile) => void;
export type TSourceOrderTableAction = (order: ISourceOrderList) => void;
export type TInvoiceTableAction = (invoice: ISupplierInvoice) => void;
export type TDeliveryTableAction = (delivery: IDeliveryRecord) => void;
export type TWeighbridgeTableAction = (weighbridge: IWeighbridgeRecord) => void;
export type TPaymentTableAction = (payment: ISupplierPayment) => void;