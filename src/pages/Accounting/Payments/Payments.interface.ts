import { TOption } from "../../../@types/common";
import { IInvoice } from "../Invoices/Invoices.interface";

export interface IPayment {
  id: string;
  payment_number: string;
  invoice: IInvoice;
  invoice_id: string;
  account: any;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_method_display: string;
  reference_number?: string;
  transaction_id?: string;
  status: string;
  status_display: string;
  notes?: string;
  internal_notes?: string;
  reconciled: boolean;
  reconciled_date?: string;
  reconciled_by: any;
  created_by: any;
  created_at: string;
  updated_at: string;
}

export interface IPaymentsResults {
  results: IPayment[];
  count: number;
}

export type TPaymentTableActions = (payment: IPayment) => void;

export interface IPaymentFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callBack?: () => void;
}

export interface TPaymentFormProps {
  invoices: TOption[];
  accounts: TOption[];
}