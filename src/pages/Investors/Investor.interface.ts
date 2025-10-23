import { TOption } from "../../@types/common";

// Interface for Investor (aligned with GrainUser model and UserSerializer)
export interface IInvestor {
    id: string; // UUID from GrainUser
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    role: string; // Expected to be 'investor' for investor users
}

// Interface for InvestorAccount (aligned with InvestorAccount model and InvestorAccountSerializer)
export interface IInvestorAccount {
    id: string; // UUID
    investor: IInvestor; // Nested user object
    total_deposited: string; // DecimalField as string (UGX)
    total_utilized: string; // DecimalField as string (UGX)
    available_balance: string; // DecimalField as string (UGX)
    total_margin_earned: string; // DecimalField as string (UGX)
    total_margin_paid: string; // DecimalField as string (UGX)
    total_interest_earned: string; // DecimalField as string (UGX)
    total_value: string; // From get_total_value method
    profit_agreement?: IProfitSharingAgreement; // From get_profit_agreement method
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Interface for InvestorDeposit (aligned with InvestorDeposit model and InvestorDepositSerializer)
export interface IInvestorDeposit {
    id: string; // UUID
    investor: IInvestor; // Nested user object from investor_account.investor
    investor_account_id: string; // UUID for write operations
    amount: string; // DecimalField as string (UGX)
    deposit_date: string; // ISO date string
    notes: string;
    created_at: string; // ISO date string
}

// Interface for InvestorWithdrawal (aligned with InvestorWithdrawal model and InvestorWithdrawalSerializer)
export interface IInvestorWithdrawal {
    id: string; // UUID
    investor: IInvestor; // Nested user object from investor_account.investor
    investor_account_id: string; // UUID for write operations
    amount: string; // DecimalField as string (UGX)
    withdrawal_date: string; // ISO date string
    status: 'pending' | 'approved' | 'rejected';
    notes: string;
    approved_by?: IInvestor; // Nullable, nested user object
    approved_at?: string; // Nullable, ISO date string
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Interface for ProfitSharingAgreement (aligned with ProfitSharingAgreement model and ProfitSharingAgreementSerializer)
export interface IProfitSharingAgreement {
    id: string; // UUID
    investor: IInvestor; // Nested user object from investor_account.investor
    investor_account_id: string; // UUID for write operations
    profit_threshold: string; // DecimalField as string (percentage)
    investor_share: string; // DecimalField as string (percentage)
    amsaf_share: string; // DecimalField as string (percentage)
    effective_date: string; // ISO date string
    notes: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Interface for Trade (aligned with Trade model and signals.py)
export interface ITrade {
    id: string; // UUID
    grn_number: string;
    hub: any; // Hub object (simplified as any; could be defined further if Hub model is provided)
    grain_type_details: any; // Could be a specific grain type interface if defined
    gross_tonnage: string; // DecimalField as string
    net_tonnage: string; // DecimalField as string
    buying_price: string; // DecimalField as string (UGX)
    selling_price: string; // DecimalField as string (UGX)
    other_expenses: string; // DecimalField as string (UGX)
    total_trade_cost: string; // DecimalField as string (UGX)
    supplier: IInvestor; // GrainUser reference
    payable_by_buyer: string; // DecimalField as string (UGX)
    buyer: IInvestor; // GrainUser reference
    margin: string; // DecimalField as string (UGX)
    payment_status: 'pending' | 'paid' | 'overdue';
    amount_paid: string; // DecimalField as string (UGX)
    payment_due_date: string; // ISO date string
    amount_due: string; // DecimalField as string (UGX)
    delivery_date: string; // ISO date string
    delivery_status: 'pending' | 'delivered';
    amsaf_fees: string; // DecimalField as string (UGX)
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Interface for TradeAllocation (aligned with TradeFinancing model and signals.py)
export interface ITradeAllocation {
    id: string; // UUID
    trade: ITrade; // Nested Trade object
    investor: IInvestor; // Nested user object from investor_account.investor
    allocated_amount: string; // DecimalField as string (UGX)
    margin_earned: string; // DecimalField as string (UGX)
    investor_margin: string; // DecimalField as string (UGX)
    amsaf_margin: string; // DecimalField as string (UGX)
    allocation_date: string; // ISO date string
    notes: string;
}

// Interface for Loan (aligned with TradeLoan model referenced in serializers.py)
export interface ILoan {
    id: string; // UUID
    trade: ITrade; // Nested Trade object
    investor: IInvestor; // Nested user object
    amount: string; // DecimalField as string (UGX)
    interest_rate: string; // DecimalField as string (percentage)
    disbursement_date: string; // ISO date string
    due_date: string; // ISO date string
    status: 'pending' | 'active' | 'repaid' | 'defaulted';
    amount_repaid: string; // DecimalField as string (UGX)
    notes: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Interface for InvestorDashboard (aligned with /dashboards endpoint response)
export interface IInvestorDashboard {
    accountId?: string; // UUID, optional as not in current endpoint response
    total_deposited: number; // DecimalField as number (UGX)
    total_utilized: number; // DecimalField as number (UGX)
    available_balance: number; // DecimalField as number (UGX)
    total_margin_earned: number; // DecimalField as number (UGX)
    total_margin_paid: number; // DecimalField as number (UGX)
    total_interest_earned: number; // DecimalField as number (UGX)
    balance_sheet: IBalanceSheet;
    receivables_aging: IReceivablesAging;
    profit_and_loss: IProfitAndLoss;
    monthly_returns: Record<string, number>; // Key is month (e.g., "Oct 2025"), value is ROI percentage as number
    trade_summary: ITradeSummary;
    financing_summary: IFinancingSummary;
    loan_summary: ILoanSummary;
}

// Interface for BalanceSheet (aligned with /dashboards endpoint balance_sheet)
export interface IBalanceSheet {
    cash_available: number; // DecimalField as number (UGX)
    funds_in_trades: number; // DecimalField as number (UGX)
    loans_outstanding: number; // DecimalField as number (UGX)
    total_assets: number; // DecimalField as number (UGX)
    total_earnings: number; // DecimalField as number (UGX)
    earnings_withdrawn: number; // DecimalField as number (UGX)
    net_earnings: number; // DecimalField as number (UGX)
}

// Interface for ReceivablesAging (aligned with /dashboards endpoint receivables_aging)
export interface IReceivablesAging {
    '0-3_days': number; // DecimalField as number (UGX)
    '4-7_days': number; // DecimalField as number (UGX)
    '8-14_days': number; // DecimalField as number (UGX)
    '15-30_days': number; // DecimalField as number (UGX)
    'above_30_days': number; // DecimalField as number (UGX)
    total: number; // DecimalField as number (UGX)
}

// Interface for ProfitAndLoss (aligned with /dashboards endpoint profit_and_loss)
export interface IProfitAndLoss {
    total_invested: number; // DecimalField as number (UGX)
    trade_profits: number; // DecimalField as number (UGX)
    loan_interest: number; // DecimalField as number (UGX)
    total_revenue: number; // DecimalField as number (UGX)
    profit_withdrawn: number; // DecimalField as number (UGX)
    net_profit: number; // DecimalField as number (UGX)
    overall_roi: number; // DecimalField as number (percentage)
}

// Interface for TradeSummary (aligned with /dashboards endpoint trade_summary)
export interface ITradeSummary {
    number_of_trades: number;
    total_value_invested: number; // DecimalField as number (UGX)
    average_investment: number; // DecimalField as number (UGX)
    active_trades: number;
}

// Interface for FinancingSummary (aligned with /dashboards endpoint financing_summary)
export interface IFinancingSummary {
    total_financings: number;
    active_financings: number;
    completed_financings: number;
    total_allocated: number; // DecimalField as number (UGX)
    total_earnings: number; // DecimalField as number (UGX)
}

// Interface for LoanSummary (aligned with /dashboards endpoint loan_summary)
export interface ILoanSummary {
    total_loans: number;
    active_loans: number;
    total_loaned: number; // DecimalField as number (UGX)
    total_outstanding: number; // DecimalField as number (UGX)
    total_interest_earned: number; // DecimalField as number (UGX)
    overdue_loans: number;
}

// Interface for InvestorAccountsResults (aligned with InvestorAccountViewSet response)
export interface IInvestorAccountsResults {
    results: IInvestorAccount[];
    count: number;
}

// Interface for InvestorDepositsResults (aligned with InvestorDepositViewSet response)
export interface IInvestorDepositsResults {
    results: IInvestorDeposit[];
    count: number;
}

// Interface for InvestorWithdrawalsResults (aligned with InvestorWithdrawalViewSet response)
export interface IInvestorWithdrawalsResults {
    results: IInvestorWithdrawal[];
    count: number;
}

// Interface for ProfitAgreementsResults (aligned with ProfitSharingAgreementViewSet response)
export interface IProfitAgreementsResults {
    results: IProfitSharingAgreement[];
    count: number;
}

// Interface for TradesResults (aligned with potential TradeViewSet response)
export interface ITradesResults {
    results: ITrade[];
    count: number;
}

// Interface for TradeAllocationsResults (aligned with potential TradeFinancingViewSet response)
export interface ITradeAllocationsResults {
    results: ITradeAllocation[];
    count: number;
}

// Interface for LoansResults (aligned with potential TradeLoanViewSet response)
export interface ILoansResults {
    results: ILoan[];
    count: number;
}

// Interface for InvestorAccountFormProps (aligned with InvestorAccountForm component)
export interface IInvestorFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: IInvestorAccount;
    callBack?: () => void;
    accountId?: string;
}

// Interface for DepositFormProps (aligned with DepositForm component)
export interface IDepositFormProps {
    handleClose: () => void;
    accountId: string;
    callBack?: () => void;
}

// Interface for WithdrawalFormProps (aligned with WithdrawalForm component)
export interface IWithdrawalFormProps {
    handleClose: () => void;
    accountId: string;
    callBack?: () => void;
}

// Interface for ProfitAgreementFormProps (aligned with ProfitAgreementForm component)
export interface IProfitAgreementFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: IProfitSharingAgreement;
    callBack?: () => void;
    accountId?: string;
}

// Interface for TradeFormProps (aligned with TradeForm component)
export interface ITradeFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: ITrade;
    callBack?: () => void;
}

// Interface for TradeAllocationFormProps (aligned with TradeAllocationForm component)
export interface ITradeAllocationFormProps {
    handleClose: () => void;
    tradeId?: string;
    callBack?: () => void;
}

// Interface for LoanFormProps (aligned with LoanForm component)
export interface ILoanFormProps {
    handleClose: () => void;
    tradeId?: string;
    callBack?: () => void;
}