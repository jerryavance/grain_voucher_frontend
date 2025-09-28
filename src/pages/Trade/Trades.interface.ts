import { TOption } from "../../@types/common";
import { IHub } from "../Hub/Hub.interface";

export interface ITrade {
    id: string;
    buyer: { id: string; name: string };
    grain_type: { id: number; name: string };
    quantity_mt: number;
    grade: string;
    price_per_mt: number;
    total_amount: number;
    status: string;
    initiated_by: { id: string; first_name: string; last_name: string };
    hub: IHub;
    created_at: string;
    updated_at: string;
}

export interface ITradesResults {
    results: ITrade[];
    count: number;
}

export interface IBrokerage {
    id: string;
    trade: ITrade;
    agent: { id: string; first_name: string; last_name: string };
    commission_type: 'percentage' | 'per_mt';
    commission_value: number;
    amount: number;
    created_at: string;
}

export interface IBrokeragesResults {
    results: IBrokerage[];
    count: number;
}

export type TTradeTableActions = (trade: ITrade) => void;

export type TBrokerageTableActions = (brokerage: IBrokerage) => void;

export interface ITradeFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

export interface IBrokerageFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

export interface TTradeFormProps {
    buyers: TOption[];
    grainTypes: TOption[];
    hubs: TOption[];
}

export interface TBrokerageFormProps {
    trades: TOption[];
    agents: TOption[];
}