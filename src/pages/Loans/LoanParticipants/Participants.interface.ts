import { IUser } from "../../Users/Users.interface";

// export interface IParticipants {
//   id: string;
//   type: string;
//   type_display?: string;
//   user: string;
//   user_details: IUser;
//   status: string;

//   // Add the 'status' property with the appropriate type
//   count: number;
//   results: any[]; // Add the 'results' property with the appropriate type
  
// }


// Updated interface to match the API response structure
export interface IParticipants {
  id: string;
  investor: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string; // e.g., "investor"
    account_type: string; // e.g., "individual"
    wallet?: {
      id: string;
      balance: string;
      currency: string;
      wallet_number: string;
    };
  };
  units_purchased: number;
  amount_invested: string;
  interest_amount: string;
  expected_repayment: string;
  paid_amount: string;
  is_paid: boolean;
}

// Additional interface for the complete API response
export interface ILoanParticipantsResponse {
  loan: {
    id: string;
    loan_id: string;
    total_units: number;
    units_sold: number;
    units_available: number;
  };
  participants: IParticipants[];
}