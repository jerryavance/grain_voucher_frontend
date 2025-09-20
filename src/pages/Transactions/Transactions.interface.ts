import { IUser } from "../Users/Users.interface";
import { IInvestment } from "../Investments/Investment.interface";

export interface ITransaction {
  id: number;
  transaction_type: string;
  amount: number;
  created_at: string;
  completed_at: string;
  reference: string;
  investment: number;
  investment_details: IInvestment;
  reason: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_by: IUser;
}

export interface showModalState {
  open: boolean;
  transaction: ITransaction | null;
  params?: any | null;
  action: string | null
}


export interface ITransactionResults {
    results: ITransaction[];
    count: number;
}


export interface ITransactionFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callback?: () => void;
  investmentDetails?: {
    id: string;
    [key: string]: any;
  };
  open: boolean;
}