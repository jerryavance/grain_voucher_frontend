import { TOption } from "../../@types/common";

// Interface for Investor (aligned with GrainUser model and UserSerializer)
export interface IInvestor {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    role: string;
}

// Interface for InvestorAccount (aligned with InvestorAccount model - includes new EMD fields)
export interface IInvestorAccount {
    id: string;
    investor: IInvestor;
    // Legacy balance fields (kept for backward compatibility)
    total_deposited: string;
    total_utilized: string;
    available_balance: string;
    total_margin_earned: string;
    total_margin_paid: string;
    total_interest_earned: string;
    total_value: string;
    // New EMD fields (added in backend change #1)
    emd_balance: string;        // Liquid capital available to back new trades
    emd_utilized: string;       // Capital locked in active allocations
    profit_agreement?: IProfitSharingAgreement;
    created_at: string;
    updated_at: string;
}

// Interface for InvestorDeposit
export interface IInvestorDeposit {
    id: string;
    investor: IInvestor;
    investor_account_id: string;
    amount: string;
    deposit_date: string;
    notes: string;
    created_at: string;
}

// Interface for InvestorWithdrawal
export interface IInvestorWithdrawal {
    id: string;
    investor: IInvestor;
    investor_account_id: string;
    amount: string;
    withdrawal_date: string;
    status: 'pending' | 'approved' | 'rejected';
    notes: string;
    approved_by?: IInvestor;
    approved_at?: string;
    created_at: string;
    updated_at: string;
}

// Interface for ProfitSharingAgreement
export interface IProfitSharingAgreement {
    id: string;
    investor: IInvestor;
    investor_account_id: string;
    profit_threshold: string;
    investor_share: string;
    bennu_share: string;
    effective_date: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

// Interface for MarginPayout (new model - backend change #2)
export interface IMarginPayout {
    id: string;
    investor: IInvestor;
    investor_account: string;
    investor_account_id: string;
    trade_financing?: string;
    amount: string;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    notes: string;
    approved_by?: IInvestor;
    approved_at?: string;
    paid_at?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
}

// Interface for Trade
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
    bennu_fees: string;
    created_at: string;
    updated_at: string;
}

// Interface for TradeAllocation (TradeFinancing model)
export interface ITradeAllocation {
    id: string;
    trade: ITrade;
    investor: IInvestor;
    allocated_amount: string;
    margin_earned: string;
    investor_margin: string;
    bennu_margin: string;
    allocation_date: string;
    notes: string;
}

// Interface for Loan
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

// ── Dashboard interfaces (aligned with actual API response) ──────────────────

export interface IEmdSummary {
    emd_balance: number;
    emd_utilized: number;
    total_emd_committed: number;
    total_deposited: number;
    unpaid_margin: number;
    pending_payout_requests: number;
}

// Updated: field names match actual API response
export interface IBalanceSheet {
    emd_available: number;       // was: cash_available
    emd_in_trades: number;       // was: funds_in_trades
    loans_outstanding: number;
    total_assets: number;
    total_earnings: number;
    earnings_withdrawn: number;
    net_earnings: number;
}

export interface IReceivablesAging {
    '0-3_days': number;
    '4-7_days': number;
    '8-14_days': number;
    '15-30_days': number;
    'above_30_days': number;
    total: number;
}

export interface IProfitAndLoss {
    total_invested: number;
    trade_profits: number;
    loan_interest: number;
    total_revenue: number;
    profit_withdrawn: number;
    net_profit: number;
    overall_roi: number;
}

export interface ITradeSummary {
    number_of_trades: number;
    total_value_invested: number;
    average_investment: number;
    active_trades: number;
}

export interface IFinancingSummary {
    total_financings: number;
    active_financings: number;
    completed_financings: number;
    total_allocated: number;
    total_earnings: number;
}

export interface ILoanSummary {
    total_loans: number;
    active_loans: number;
    total_loaned: number;
    total_outstanding: number;
    total_interest_earned: number;
    overdue_loans: number;
}

// Main dashboard interface — aligned with actual API response shape
export interface IInvestorDashboard {
    id: string;
    // Top-level balance fields
    emd_balance: string;
    emd_utilized: string;
    total_deposited: string;
    total_utilized: string;
    available_balance: string;
    total_margin_earned: string;
    total_margin_paid: string;
    total_interest_earned: string;
    // Nested summaries
    emd_summary: IEmdSummary;
    balance_sheet: IBalanceSheet;
    receivables_aging: IReceivablesAging;
    profit_and_loss: IProfitAndLoss;
    monthly_returns: Record<string, number>;
    trade_summary: ITradeSummary;
    financing_summary: IFinancingSummary;
    loan_summary: ILoanSummary;
    payout_history: IMarginPayout[];
}

// ── Paginated result interfaces ──────────────────────────────────────────────

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

export interface IProfitAgreementsResults {
    results: IProfitSharingAgreement[];
    count: number;
}

export interface IMarginPayoutsResults {
    results: IMarginPayout[];
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

// ── Form prop interfaces ─────────────────────────────────────────────────────

export interface IInvestorFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: IInvestorAccount;
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

export interface IProfitAgreementFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: IProfitSharingAgreement;
    callBack?: () => void;
    accountId?: string;
}

export interface IMarginPayoutFormProps {
    handleClose: () => void;
    callBack?: () => void;
    accountId?: string;
}

export interface ITradeFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: ITrade;
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