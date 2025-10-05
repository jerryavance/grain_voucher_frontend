import { TOption } from "../../../@types/common";

export interface IInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit: string;
  subtotal: number;
  grain_type?: any;
  quality_grade?: string;
  created_at: string;
}

export interface IInvoice {
  id: string;
  invoice_number: string;
  trade?: any;
  trade_id?: string;
  account: any;
  account_id?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  created_by: any;
  sent_date?: string;
  last_reminder_sent?: string;
  days_overdue?: number;
  line_items?: IInvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface IInvoicesResults {
  results: IInvoice[];
  count: number;
}

export type TInvoiceTableActions = (invoice: IInvoice) => void;

export interface IInvoiceFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callBack?: () => void;
}

export interface TInvoiceFormProps {
  accounts: TOption[];
  trades: TOption[];
  grainTypes: TOption[];
}