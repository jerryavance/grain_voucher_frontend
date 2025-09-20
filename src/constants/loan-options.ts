export const LOAN_PURPOSE = [
    { label: 'Home Improvement', value: 'home_improvement' },
    { label: 'Education', value: 'education' },
    { label: 'Medical Expenses', value: 'medical_expenses' },
    { label: 'Debt Consolidation', value: 'debt_consolidation' },
    { label: 'Business Expansion', value: 'business_expansion' },
    { label: 'Vehicle Purchase', value: 'vehicle_purchase' },
    { label: 'Agricultural Investment', value: 'agricultural_investment' },
    { label: 'Emergency Expenses', value: 'emergency_expenses' },
    { label: 'wedding or Event Expenses', value: 'wedding_or_event_expenses' },
    { label: 'Vacation or Travel', value: 'vacation_or_travel' },
    { label: 'Rent or mortgage', value: 'rent_or_mortgage_payment' },
    { label: 'Technology or Electronics Purchase', value: 'technology_or_electronics_purchase' },
    { label: 'Investment', value: 'investment' },
    { label: 'Business StartUp Capital', value: 'business_start_up_capital' },
    { label: 'Other', value: 'other' },
];

export const CURRENCY_CODES = [
    { label: 'USD', value: 'USD' },
    { label: 'UGX', value: 'UGX' },
];

export const LOAN_DURATION = [
    { label: '1 Day', value: '1' },
    { label: '7 Days', value: '7' },
    { label: '14 Days', value: '14' },
    { label: '30 Days', value: '30' },
    { label: '60 Days', value: '60' },
    { label: '90 Days', value: '90' },
]
export const PAYMENT_METHOD = [
    { label: 'Mobile Money', value: 'mobile_money' },
    { label: 'Bank Account', value: 'bank_account' },
    { label: 'Cash at agent', value: 'cash_at_agent' },
];

export const DURATION_UNITS = [
    { label: 'Days', value: 'Days' },
    { label: 'Weeks', value: 'Weeks' },
    { label: 'Months', value: 'Months' },
    { label: 'Years', value: 'Years' },
];

export const REPAYMENT_FREQUENCIES = [
    { label: '30 Minutes', value: 'thirty_minutes' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annually', value: 'annually' },
];

export const STATUS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Repaid', value: 'repaid' },
    { label: 'Funded', value: 'funded' },
    { label: 'Defaulted', value: 'defaulted' },
    { label: 'Rejected', value: 'rejected' },
];

export const LOAN_STATUS_ACTIVE = "active";
export const LOAN_STATUS_PENDING = "pending";
export const LOAN_STATUS_REPAID = "repaid";
export const LOAN_STATUS_FUNDED = "funded";
export const LOAN_STATUS_DEFAULTED = "defaulted";
export const LOAN_STATUS_REJECTED = "rejected";
export const LOAN_STATUS = [
    LOAN_STATUS_ACTIVE,
    LOAN_STATUS_PENDING,
    LOAN_STATUS_REPAID,
    LOAN_STATUS_FUNDED,
    LOAN_STATUS_DEFAULTED,
    LOAN_STATUS_REJECTED,
];
export const LOAN_STATUS_COLORS: { [key: string]: string } = {
    [LOAN_STATUS_ACTIVE]: "success",
    [LOAN_STATUS_PENDING]: "warning",   
    [LOAN_STATUS_REPAID]: "primary",
    [LOAN_STATUS_FUNDED]: "info",
    [LOAN_STATUS_DEFAULTED]: "error",
    [LOAN_STATUS_REJECTED]: "error",        
};