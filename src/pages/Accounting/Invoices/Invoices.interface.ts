import { TOption } from "../../../@types/common";

export interface IInvoiceLineItem {
  id: string;
  grn: string;
  grn_id?: string;
  grn_number?: string;
  trade?: any;
  trade_number?: string;
  description: string;
  grain_type: string;
  quality_grade: string;
  supplier_name: string;
  quantity_kg: number;
  unit_price: number;
  delivery_date: string;
  due_date: string;
  subtotal: number;
  total_amount: number;
  created_at: string;
}

export interface IInvoice {
  id: string;
  invoice_number: string;
  account: any;
  account_id?: string;
  
  // Dates
  issue_date: string;
  due_date: string;
  invoicing_frequency: string;
  invoicing_frequency_display?: string;
  period_start?: string;
  period_end?: string;
  
  // Amounts
  subtotal: number;
  amsaf_fees: number;
  logistics_cost: number;
  weighbridge_cost: number;
  other_charges: number;
  total_add_on_charges?: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  
  // Status
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  
  // Bank details
  beneficiary_bank?: string;
  beneficiary_name?: string;
  beneficiary_account?: string;
  beneficiary_branch?: string;
  
  // Terms and notes
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  
  // Tracking
  created_by?: any;
  sent_date?: string;
  last_reminder_sent?: string;
  is_auto_generated?: boolean;
  scheduled_generation_date?: string;
  
  // Calculated
  days_overdue?: number;
  grn_count?: number;
  trade_ids?: string[];
  line_items?: IInvoiceLineItem[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface IInvoicesResults {
  results: IInvoice[];
  count: number;
}

export interface IUninvoicedGRN {
  id: string;
  grn_number: string;
  delivery_date: string;
  net_weight_kg: number;
  trade: {
    id: string;
    trade_number: string;
    grain_type: any;
    buyer: any;
    selling_price: number;
  };
}

export interface IInvoiceSummary {
  summary: {
    total_invoices: number;
    total_amount: number;
    total_paid: number;
    total_due: number;
    avg_invoice_value: number;
  };
  by_status: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  by_payment_status: Array<{
    payment_status: string;
    count: number;
    total: number;
  }>;
}

export interface IAgingReport {
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  over_90_days: number;
  total: number;
}

export type TInvoiceTableActions = (invoice: IInvoice) => void;

export interface IInvoiceFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callBack?: () => void;
}

export interface IManualInvoiceFormProps {
  handleClose: () => void;
  callBack?: () => void;
}

export interface TInvoiceFormProps {
  accounts: TOption[];
  trades: TOption[];
  // grainTypes: TOption[];
  // invoicingFrequencies: TOption[];
}












// import { TOption } from "../../../@types/common";

// export interface IInvoiceLineItem {
//   id: string;
//   description: string;
//   quantity: number;
//   unit_price: number;
//   unit: string;
//   subtotal: number;
//   amount: number;
//   grain_type?: any;
//   quality_grade?: string;
//   created_at: string;
// }

// export interface IInvoice {
//   id: string;
//   invoice_number: string;
//   trade?: any;
//   trade_id?: string;
//   account: any;
//   account_id?: string;
//   issue_date: string;
//   due_date: string;
//   subtotal: number;
//   tax_rate: number;
//   tax_amount: number;
//   discount_amount: number;
//   amount: number;
//   total_amount: number;
//   amount_paid: number;
//   amount_due: number;
//   status: string;
//   status_display: string;
//   payment_status: string;
//   payment_status_display: string;
//   payment_terms?: string;
//   notes?: string;
//   internal_notes?: string;
//   created_by: any;
//   sent_date?: string;
//   last_reminder_sent?: string;
//   days_overdue?: number;
//   line_items?: IInvoiceLineItem[];
//   created_at: string;
//   updated_at: string;
// }

// export interface IInvoicesResults {
//   results: IInvoice[];
//   count: number;
// }

// export type TInvoiceTableActions = (invoice: IInvoice) => void;

// export interface IInvoiceFormProps {
//   handleClose: () => void;
//   formType?: "Save" | "Update";
//   initialValues?: any;
//   callBack?: () => void;
// }

// export interface TInvoiceFormProps {
//   accounts: TOption[];
//   trades: TOption[];
//   grainTypes: TOption[];
// }