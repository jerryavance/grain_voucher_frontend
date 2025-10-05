import { TOption } from "../../../@types/common";
import { IInvoice } from "../Invoices/Invoices.interface";
import { IPayment } from "../Payments/Payments.interface";

export interface IJournalEntry {
  id: string;
  entry_number: string;
  entry_type: string;
  entry_type_display: string;
  date: string;
  entry_date: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  related_trade?: any;
  related_trade_id?: string;
  related_invoice?: IInvoice;
  related_invoice_id?: string;
  related_payment?: IPayment;
  related_payment_id?: string;
  description: string;
  notes?: string;
  created_by: any;
  is_reversed: boolean;
  reversed_by?: any;
  reversed_by_entry?: any;
  created_at: string;
}

export interface IJournalEntriesResults {
  results: IJournalEntry[];
  count: number;
}

export type TJournalEntryTableActions = (entry: IJournalEntry) => void;

export interface IJournalEntryFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callBack?: () => void;
}

export interface TJournalEntryFormProps {
  trades: TOption[];
  invoices: TOption[];
  payments: TOption[];
}