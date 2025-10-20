import { TOption } from "../../@types/common";

export interface IInvestorAccount {
    id: string;
    investor: IInvestor;
    total_deposited: string;
    total_utilized: string;
    available_balance: string;
    total_margin_earned: string;
    total_margin_paid: string;
    profit_agreement?: IProfitSharingAgreement;
    created_at: string;
    updated_at: string;
}

export interface IInvestor {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    role: string;
}

export interface IInvestorDeposit {
    id: string;
    investor: IInvestor;
    amount: string;
    deposit_date: string;
    notes: string;
    created_at: string;
}

export interface IInvestorWithdrawal {
    id: string;
    investor: IInvestor;
    amount: string;
    withdrawal_date: string;
    status: 'pending' | 'approved' | 'rejected';
    notes: string;
    approved_by?: IInvestor;
    approved_at?: string;
    created_at: string;
    updated_at: string;
}

export interface IProfitSharingAgreement {
    id: string;
    investor: IInvestor;
    profit_threshold: string;
    investor_share: string;
    amsaf_share: string;
    effective_date: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface ITrade {
    id: string;
    grn_number: string;
    hub: any;
    grain_type_details: any;
    gross_tonnage: string;
    net_tonnage: string;
    buying_price: string;
    selling_price: string;
    other_expenses: string;
    total_trade_cost: string;
    supplier: IInvestor;
    payable_by_buyer: string;
    buyer: IInvestor;
    margin: string;
    payment_status: 'pending' | 'paid' | 'overdue';
    amount_paid: string;
    payment_due_date: string;
    amount_due: string;
    delivery_date: string;
    delivery_status: 'pending' | 'delivered';
    amsaf_fees: string;
    created_at: string;
    updated_at: string;
}

export interface ITradeAllocation {
    id: string;
    trade: ITrade;
    investor: IInvestor;
    allocated_amount: string;
    margin_earned: string;
    investor_margin: string;
    amsaf_margin: string;
    allocation_date: string;
    notes: string;
}

export interface ILoan {
    id: string;
    trade: ITrade;
    investor: IInvestor;
    amount: string;
    interest_rate: string;
    disbursement_date: string;
    due_date: string;
    status: 'pending' | 'active' | 'repaid' | 'defaulted';
    amount_repaid: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface IInvestorDashboard {
    total_deposited: string;
    total_utilized: string;
    available_balance: string;
    total_margin_earned: string;
    total_margin_paid: string;
    balance_sheet: IBalanceSheet;
    receivables_aging: IReceivablesAging;
    profit_and_loss: IProfitAndLoss;
    monthly_returns: Record<string, string>;
    trade_summary: ITradeSummary;
}

export interface IBalanceSheet {
    cash: string;
    goods_in_transit: string;
    receivables: string;
    funds_borrowed: string;
    current_cash_remaining: string;
}

export interface IReceivablesAging {
    '0-3_days': string;
    '4-7_days': string;
    '8-14_days': string;
    '15-30_days': string;
    'above_30_days': string;
    total: string;
}

export interface IProfitAndLoss {
    revenue: {
        sales: string;
    };
    costs: {
        cost_of_grain: string;
        fees_and_commission: string;
        logistics: string;
    };
    net_profit: string;
    profit_paid: string;
    overall_return: string;
}

export interface ITradeSummary {
    number_of_trades: number;
    value_of_trades: string;
    average_price_sold: string;
    average_price_bought: string;
}

export interface IInvestorAccountsResults {
    results: IInvestorAccount[];
    count: number;
}

export interface IInvestorDepositsResults {
    results: IInvestorDeposit[];
    count: number;
}

export interface IInvestorWithdrawalsResults {
    results: IInvestorWithdrawal[];
    count: number;
}

export interface ITradesResults {
    results: ITrade[];
    count: number;
}

export interface ITradeAllocationsResults {
    results: ITradeAllocation[];
    count: number;
}

export interface ILoansResults {
    results: ILoan[];
    count: number;
}

export interface IInvestorFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
    accountId?: string;
}

export interface IDepositFormProps {
    handleClose: () => void;
    accountId: string;
    callBack?: () => void;
}

export interface IWithdrawalFormProps {
    handleClose: () => void;
    accountId: string;
    callBack?: () => void;
}

export interface ITradeFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

export interface ITradeAllocationFormProps {
    handleClose: () => void;
    tradeId?: string;
    callBack?: () => void;
}

export interface ILoanFormProps {
    handleClose: () => void;
    tradeId?: string;
    callBack?: () => void;
}