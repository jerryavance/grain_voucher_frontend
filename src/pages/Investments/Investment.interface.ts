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

export interface IInvestment {
  id: string;
  amount: string;
  interest: string;
  purpose: string;
  investment_bank_details?: { id: string; name: string };
  investment_name: string;
  investment_type: string;
  investment_description: string;
  investment_code: string;
  total_investment_amount: string;
  available_units: string;
  unit_price: string;
  minimum_investment_amount: string;
  maximum_investment_amount: string;
  interest_rate: string;
  interest_type: string;
  investment_duration_value: string;
  investment_duration_unit: string;
  repayment_frequency: string;
  start_date: string;
  end_date: string;
  risk_level: string;
  guarantee_principal: string; // "true" or "false"
  collateral_type: string | null;
  collateral_value: string | null;
  platform_fee: string;
  early_termination_fee: string;
  withdrawal_before_maturity: string; // "true" or "false"
  transferability_of_units: string; // "true" or "false"
  currency: string;
  eligible_investor_type: string;
  investment_visibility: string;
  borrower_type: string;
  isin_number: string | null;
  issuer_name: string;
  issuer_country: string;
  issuer_website: string;
  issuer_email: string;
  issuer_phone_number: string;
  issuer_address: string;
  issuer_description: string;
  issuer_registration_number: string;
  issuer_tax_number: string;
  issuer_logo: File | null; // For file uploads
  credit_rating: string | null;
  esg_rating: string | null;
  loan_purpose: string;
  investment_image: File | null; // For file uploads
  terms_and_conditions: string;
  kyc_required: string; // "true" or "false"
  created_at?: string; // Optional, auto-generated
  updated_at?: string; // Optional, auto-generated

  // participant_details: any;
  // team_details?: ITeam;
  // status: string;

  participant_details?: {
    type?: string;
  };

  user?: {
    id?: string;
    first_name?: string;
    last_name?: string; 
    email?: string;
    phone_number?: string;
    user_type?: string;
    account_type?: string;
    is_superuser?: boolean;
    is_staff?: boolean;
  };
}

export interface IInvestmentRoundProps {
  InvestmentDetails: IInvestment | null | undefined;
}

export interface IInvestmentRound {
  id: string;
}

export interface IInvestmentRoundResults {
  results: IInvestmentRound[];
  count: number;
}

export interface IParticipantRoundResults {
  results: IParticipants[];
  count: number;
}

export interface ITeamsResults {
  results: ITeam[];
  count: number;
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

export interface ILeaveInvestmentProps {
  participantDetails?: IParticipants;
  handleRefreshInvestmentData?: () => void;
  handleRefreshParticipantData?: () => void;
}

export interface IBuyInvestmentProps {
  handleRefreshInvestmentData?: () => void;
  handleRefreshParticipantData?: () => void;
}

export interface IInvestmentteamsProps {
  InvestmentDetails: IInvestment | null | undefined;
}

export interface ITeamRequest {
  id: number;
  name: string;
  status: string;
  first_member_details?: IUser;
  second_member_details?: IUser;
  created_by: number;
}

export interface IFetchTeamRequestsOptions {
  filters?: any;
  resultHandler?: (data: any[]) => void;
  setLoading?: (loading: boolean) => void;
}
