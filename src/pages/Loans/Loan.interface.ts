import { TOption } from "../../@types/common";
import { IUser } from "../Users/Users.interface";

export interface ITeam {
  id: string;
  type: string;
  user_details: any;
  name: string;
  first_member_details: IUser;
  second_member_details: IUser;
}

export interface ILoan {
  id: string;
  loan_id: string;
  user?: { 
    id: string; 
    first_name: string 
    last_name: string;
    email: string;
    phone_number: string;
    user_type: string;
    account_type: string;
  };
  amount?: number;
  purpose?: string;
  loan_duration?: string;
  payment_method?: string;
  repayment_frequency?: string;
  status?: string;
  currency?: string;
  risk_tier?: string;
  is_approved?: boolean;
  is_fully_funded?: boolean;
  is_fully_paid?: boolean;
  min_amount?: number;
  max_amount?: number;
  interest_type?: string;
  min_date?: string;
  max_date?: string;
  interest_rate?: number;
  interest_amount?: number;
  remaining_balance?: number;
  approved_at: Date;
  units_sold: number;
  total_units: number;
  units_available: number;
  approve_by?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    user_type?: string;
    account_type?: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface IGeneralFormProps {
  institutions: TOption[];
}

export interface IParticipants {
  id: string;
  type: string;
  user: string;
  user_details: IUser;
}

export interface ILeaveLoanProps {
  participantDetails?: IParticipants;
  loanDetails: ILoan,
  handleRefreshLoanData?: () => void;
  handleRefreshParticipantData?: () => void;
}

export interface IFundLoanProps {
  handleRefreshLoanData?: () => void;
  handleRefreshParticipantData?: () => void;
}

export interface ILoanteamsProps {
  LoanDetails: ILoan | null | undefined;
}