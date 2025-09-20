import { TOption } from "../../../@types/common";
import { IUser } from "../../Users/Users.interface";
import { IParticipants } from "../InvestmentParticipants/Participants.interface";

export interface ITeam {
  id: string;
  type: string;
  user_details: any;
  name: string;
  first_member_details: IUser;
  second_member_details: IUser;
}
 

// Updated IInvestment Interface (Make sure this matches your backend model)
export interface IInvestment {
  id: string;
  investment_bank: string;
  investment_name: string;
  investment_type: string;
  investment_description: string;
  investment_code: string;
  total_investment_amount: string; // Or number if you handle formatting later
  available_units: string; // Or number
  unit_price: string; // Or number
  minimum_investment_amount: string; // Or number
  maximum_investment_amount: string; // Or number
  interest_rate: string; // Or number
  interest_type: string;
  investment_duration_value: string; // Or number
  investment_duration_unit: string;
  repayment_frequency: string;
  start_date: string;
  end_date: string;
  risk_level: string;
  guarantee_principal: string; // "true" or "false"
  collateral_type: string | null;
  collateral_value: string | null; // Or number
  platform_fee: string; // Or number
  early_termination_fee: string; // Or number
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
  issuer_logo: string | null; // Or File if you handle file URLs here
  credit_rating: string | null;
  esg_rating: string | null;
  loan_purpose: string;
  investment_image: string | null; // Or File
  terms_and_conditions: string;
  kyc_required: string; // "true" or "false"
  created_at?: string;
  updated_at?: string;
  status: string; // Add status field if not already present
  // participant_details?: { type: string }; // Add participant_details if not already present

  participant_details: IParticipants;
  // team_details?: ITeam;
  // champion_team?: ITeam,
  // champion_judge?: IUser;

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
  handleInstitutionSearch: (value: string) => void;
}

export interface ILeaveInvestmentProps {
  participantDetails?: IParticipants;
  investmentDetails: IInvestment,
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
