import { TOption } from "../../../@types/common";

export interface IBudget {
  id: string;
  period: string;
  hub?: any;
  hub_id?: string;
  grain_type?: any;
  grain_type_id?: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
  is_over_budget: boolean;
  created_at: string;
  updated_at: string;
}

export interface IBudgetsResults {
  results: IBudget[];
  count: number;
}

export type TBudgetTableActions = (budget: IBudget) => void;

export interface IBudgetFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callBack?: () => void;
}

export interface TBudgetFormProps {
  hubs: TOption[];
  grainTypes: TOption[];
}