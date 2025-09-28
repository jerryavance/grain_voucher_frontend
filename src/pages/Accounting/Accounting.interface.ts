import { TOption } from "../../@types/common";

// Base interfaces
export interface IAccount {
  id: string;
  name: string;
  company?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

export interface ITrade {
  id: string;
  trade_number?: string;
  quantity?: number;
  price?: number;
  status?: string;
}

export interface IHub {
  id: string;
  name: string;
  location?: string;
}

export interface IGrainType {
  id: string;
  name: string;
  category?: string;
}

// Invoice interfaces
export interface IInvoice {
  id: string;
  trade?: ITrade;
  account: IAccount;
  amount: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface IInvoicesResults {
  results: IInvoice[];
  count: number;
}

export interface IInvoiceFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

// Journal Entry interfaces
export interface IJournalEntry {
  id: string;
  description: string;
  debit_account: string;
  credit_account: string;
  amount: string;
  date: string;
  related_trade?: ITrade;
  created_at: string;
}

export interface IJournalEntriesResults {
  results: IJournalEntry[];
  count: number;
}

export interface IJournalEntryFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

// Budget interfaces
export interface IBudget {
  id: string;
  period: string;
  hub?: IHub;
  grain_type?: IGrainType;
  budgeted_amount: string;
  actual_amount: string;
  variance: string;
  created_at: string;
  updated_at: string;
}

export interface IBudgetsResults {
  results: IBudget[];
  count: number;
}

export interface IBudgetFormProps {
  handleClose: () => void;
  formType?: 'Save' | 'Update';
  initialValues?: any;
  callBack?: () => void;
}

// Aging report interface
export interface IAgingReport {
  overdue: number;
  due_soon: number;
}

// Table action types
export type TInvoiceTableActions = (invoice: IInvoice) => void;
export type TJournalEntryTableActions = (entry: IJournalEntry) => void;
export type TBudgetTableActions = (budget: IBudget) => void;

// Tab types
export type AccountingTabType = 'invoices' | 'journal-entries' | 'budgets' | 'aging';

export interface IAccountingTabsProps {
  activeTab: AccountingTabType;
  setActiveTab: (tab: AccountingTabType) => void;
}