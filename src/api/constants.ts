import { TOption } from "../@types/common";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const MEDIA_BASE_URL = process.env.REACT_APP_MEDIA_BASE_URL;

export const APP_NAME = "Grain Hub";

export const TYPE_ADMIN = "admin";
export const TYPE_INVESTOR = "investor";
export const TYPE_BORROWER = "borrower";

export const STATUS_PENDING = "pending";
export const STATUS_ACCEPTED = "accepted";
export const STATUS_REJECTED = "rejected";


export const HEADER_MULTIPART =' multipart/form-data';

export const sourceOfFunds: TOption[] = [
  { value: "employment", label: "EMPLOYMENT" },
  { value: "business", label: "BUSINESS" },
  { value: "investment", label: "INVESTMENT" },
  { value: "savings", label: "SAVINGS" },
  { value: "other", label: "OTHER" },
];

export const riskTolerance: TOption[] = [
  { value: "low", label: "LOW" },
  { value: "medium", label: "MEDIUM" },
  { value: "high", label: "HIGH" },
];

export const investmentObjectives: TOption[] = [
  { value: "capital_preservation", label: "CAPITAL_PRESERVATION" },
  { value: "capital_growth", label: "CAPITAL_GROWTH" },
  { value: "other", label: "OTHER" },
  { value: "speculation", label: "SPECULATION" },
];

export const investmentKnowledge: TOption[] = [
  { value: "no_knowledge", label: "NO_KNOWLEDGE" },
  { value: "beginner", label: "BEGINNER" },
  { value: "intermediate", label: "INTERMEDIATE" },
  { value: "advanced", label: "ADVANCED" },
];

export const accountTypes: TOption[] = [
  { value: "individual", label: "INDIVIDUAL" },
  { value: "institution", label: "INSTITUTION" },
];

export const genderFields: TOption[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const YES_BOOLEAN = 1;
export const NO_BOOLEAN = 0;

export const BOOLEAN_OPTIONS: TOption[] = [
  { value: YES_BOOLEAN, label: "Yes" },
  { value: NO_BOOLEAN, label: "No" },
];

export const PARTICIPATION_STATUS_MATURED = "Matured";
export const PARTICIPATION_STATUS_ACTIVE = "active";
export const PARTICIPATION_STATUS_LIQUIDATED = "Liquidated";

export const PARTICIPANT_STATUSES = [
  { value: PARTICIPATION_STATUS_ACTIVE, label: "Active" },
  { value: PARTICIPATION_STATUS_MATURED, label: "Matured" },
  { value: PARTICIPATION_STATUS_LIQUIDATED, label: "Liquidated" },
];

export const INVESTMENT_STATUS_ACTIVE = "Active";
export const INVESTMENT_STATUS_PENDING = "Pending";
export const INVESTMENT_STATUS_COMPLETED = "completed";
export const INVESTMENT_STATUS_CANCELLED = "cancelled";

export const INVESTMENT_STATUSES = [
  { value: INVESTMENT_STATUS_ACTIVE, label: "Active" },
  { value: INVESTMENT_STATUS_PENDING, label: "Pending" },
  { value: INVESTMENT_STATUS_COMPLETED, label: "Completed" },
  { value: INVESTMENT_STATUS_CANCELLED, label: "Cancelled" },
];


export const TRANSACTION_STATUS_PENDING = "pending";
export const TRANSACTION_STATUS_COMPLETED = "completed";
export const TRANSACTION_STATUS_FAILED = "failed";
export const TRANSACTION_STATUS_CANCELLED = "cancelled";

export const TRANSACTION_STATUSES = [
  { value: TRANSACTION_STATUS_PENDING, label: "pending" },
  { value: TRANSACTION_STATUS_COMPLETED, label: "completed" },
  { value: TRANSACTION_STATUS_FAILED, label: "failed" },
  { value: TRANSACTION_STATUS_CANCELLED, label: "cancelled" },
];


export const TRANSACTION_TYPE_DEPOSIT = "Deposit";
export const TRANSACTION_TYPE_WITHDRAWAL = "Withdrawal";
export const TRANSACTION_TYPE_TRANSFER = "Transfer";

export const TRANSACTION_TYPES = [
  { value: TRANSACTION_TYPE_DEPOSIT, label: "Deposit" },
  { value: TRANSACTION_TYPE_WITHDRAWAL, label: "Withdrawal" },
  { value: TRANSACTION_TYPE_TRANSFER, label: "Transfer" },
];


export const INITIAL_PAGE_SIZE = 10

// Currency
export const CURRENCY_OPTIONS: TOption[] = [
  { value: "UGX", label: "UGX" },
  { value: "USD", label: "USD" },
];


// User Types
export const USER_ROLE_OPTIONS: TOption[] = [
  { value: "farmer", label: "Farmer" },
  { value: "agent", label: "Agent" },
  { value: "hub_admin", label: "Hub Admin" },
  { value: "investor", label: "Investor" },
  { value: "bdm", label: "Business Development Manager" },
  { value: "client", label: "Client" },
  { value: "finance", label: "Finance" },
];

export const ROLE_HUB_ADMIN = 'hub_admin';
export const ROLE_AGENT = 'agent';
export const ROLE_FARMER = 'farmer';
export const ROLE_INVESTOR = 'investor';
export const ROLE_SUPER_ADMIN = 'super_admin';
export const ROLE_BDM = 'bdm'
export const ROLE_CLIENT = 'client'
export const ROLE_FINANCE = 'finance'

// Account Types
export const ACCOUNT_TYPE_OPTIONS: TOption[] = [
  { value: "individual", label: "Individual" },
  { value: "group", label: "Group" },
];

// Account Status
export const ACCOUNT_STATUS_OPTIONS: TOption[] = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "closed", label: "Closed" },
];

// KYC Status
export const KYC_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Transaction Types
export const TRANSACTION_TYPE_OPTIONS: TOption[] = [
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "investment", label: "Investment" },
  { value: "repayment", label: "Repayment" },
  { value: "interest", label: "Interest" },
  { value: "loan_funding", label: "Loan funding" },
  { value: "bond_purchase", label: "Bond purchase" },
  { value: "bond_coupon", label: "Bond coupon" },
  { value: "redeem", label: "Redeem" },
];

// Transaction Status
export const TRANSACTION_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

// Loan Status
export const LOAN_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "listed", label: "Listed" },
  { value: "funded", label: "Funded" },
  { value: "active", label: "Active" },
  { value: "repaid", label: "Repaid" },
  { value: "defaulted", label: "Defaulted" },
];

// Payment Methods
export const PAYMENT_METHOD_OPTIONS: TOption[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "mobile_money", label: "Mobile money" },
  { value: "credit_card", label: "Credit card" },
];

// Bond Status
export const BOND_STATUS_OPTIONS: TOption[] = [
  { value: "listed", label: "Listed" },
  { value: "funded", label: "Funded" },
  { value: "active", label: "Active" },
  { value: "matured", label: "Matured" },
];

// Repayment Status
export const REPAYMENT_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "late", label: "Late" },
];

// Document Types
export const DOCUMENT_TYPE_OPTIONS: TOption[] = [
  { value: "national_id", label: "National id" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Drivers license" },
];

// Action Types
export const ACTION_TYPE_OPTIONS: TOption[] = [
  { value: "user_created", label: "User created" },
  { value: "user_updated", label: "User updated" },
  { value: "user_deleted", label: "User deleted" },
  { value: "user_login", label: "User login" },
  { value: "user_logout", label: "User logout" },
  { value: "wallet_created", label: "Wallet created" },
  { value: "wallet_top_up", label: "Wallet top up" },
  { value: "wallet_withdrawal", label: "Wallet withdrawal" },
  { value: "investment_created", label: "Investment created" },
  { value: "investment_updated", label: "Investment updated" },
  { value: "investment_cancelled", label: "Investment cancelled" },
  { value: "loan_applied", label: "Loan applied" },
  { value: "loan_approved", label: "Loan approved" },
  { value: "loan_rejected", label: "Loan rejected" },
  { value: "loan_disbursed", label: "Loan disbursed" },
  { value: "loan_repaid", label: "Loan repaid" },
  { value: "bond_created", label: "Bond created" },
  { value: "bond_updated", label: "Bond updated" },
  { value: "bond_matured", label: "Bond matured" },
  { value: "kyc_submitted", label: "KYC submitted" },
  { value: "kyc_approved", label: "KYC approved" },
  { value: "kyc_rejected", label: "KYC rejected" },
  { value: "user_password_reset", label: "User password reset" },
];

// Investment Types
export const INVESTMENT_TYPE_OPTIONS: TOption[] = [
  { value: "business_loan", label: "Business loan" },
  { value: "government_bond", label: "Government bond" },
];

// Investment Status
export const INVESTMENT_STATUS_OPTIONS: TOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "listed", label: "Listed" },
  { value: "partially_funded", label: "Partially funded" },
  { value: "fully_funded", label: "Fully funded" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

// Repayment Frequencies
export const REPAYMENT_FREQUENCY_OPTIONS: TOption[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "bi_weekly", label: "Bi weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "bi_monthly", label: "Bi monthly" },
  { value: "yearly", label: "Yearly" },
];

// Business Types
export const BUSINESS_TYPE_OPTIONS: TOption[] = [
  { value: "sole_proprietorship", label: "Sole proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "corporation", label: "Corporation" },
  { value: "limited_liability_company", label: "Limited liability company" },
  { value: "cooperative", label: "Cooperative" },
];

// Investment Objectives
export const INVESTMENT_OBJECTIVE_OPTIONS: TOption[] = [
  { value: "capital_growth", label: "Capital growth" },
  { value: "capital_preservation", label: "Capital preservation" },
  { value: "speculation", label: "Speculation" },
  { value: "other", label: "Other" },
];

export const countries: TOption[] = [
  { label: "Åland Islands", value: "AX" },
  { label: "Afghanistan", value: "AF" },
  { label: "Albania", value: "AL" },
  { label: "Algeria", value: "DZ" },
  { label: "American Samoa", value: "AS" },
  { label: "Andorra", value: "AD" },
  { label: "Angola", value: "AO" },
  { label: "Anguilla", value: "AI" },
  { label: "Antarctica", value: "AQ" },
  { label: "Antigua and Barbuda", value: "AG" },
  { label: "Argentina", value: "AR" },
  { label: "Armenia", value: "AM" },
  { label: "Aruba", value: "AW" },
  { label: "Australia", value: "AU" },
  { label: "Austria", value: "AT" },
  { label: "Azerbaijan", value: "AZ" },
  { label: "Bahamas (the)", value: "BS" },
  { label: "Bahrain", value: "BH" },
  { label: "Bangladesh", value: "BD" },
  { label: "Barbados", value: "BB" },
  { label: "Belarus", value: "BY" },
  { label: "Belgium", value: "BE" },
  { label: "Belize", value: "BZ" },
  { label: "Benin", value: "BJ" },
  { label: "Bermuda", value: "BM" },
  { label: "Bhutan", value: "BT" },
  { label: "Bolivia (Plurinational State of)", value: "BO" },
  { label: "Bonaire, Sint Eustatius and Saba", value: "BQ" },
  { label: "Bosnia and Herzegovina", value: "BA" },
  { label: "Botswana", value: "BW" },
  { label: "Bouvet Island", value: "BV" },
  { label: "Brazil", value: "BR" },
  { label: "British Indian Ocean Territory (the)", value: "IO" },
  { label: "Brunei Darussalam", value: "BN" },
  { label: "Bulgaria", value: "BG" },
  { label: "Burkina Faso", value: "BF" },
  { label: "Burundi", value: "BI" },
  { label: "Cabo Verde", value: "CV" },
  { label: "Cambodia", value: "KH" },
  { label: "Cameroon", value: "CM" },
  { label: "Canada", value: "CA" },
  { label: "Cayman Islands (the)", value: "KY" },
  { label: "Central African Republic (the)", value: "CF" },
  { label: "Chad", value: "TD" },
  { label: "Chile", value: "CL" },
  { label: "China", value: "CN" },
  { label: "Christmas Island", value: "CX" },
  { label: "Cocos (Keeling) Islands (the)", value: "CC" },
  { label: "Colombia", value: "CO" },
  { label: "Comoros (the)", value: "KM" },
  { label: "Congo (the Democratic Republic of the)", value: "CD" },
  { label: "Congo (the)", value: "CG" },
  { label: "Cook Islands (the)", value: "CK" },
  { label: "Costa Rica", value: "CR" },
  { label: "Croatia", value: "HR" },
  { label: "Cuba", value: "CU" },
  { label: "Curaçao", value: "CW" },
  { label: "Cyprus", value: "CY" },
  { label: "Czechia", value: "CZ" },
  { label: "Côte d'Ivoire", value: "CI" },
  { label: "Denmark", value: "DK" },
  { label: "Djibouti", value: "DJ" },
  { label: "Dominica", value: "DM" },
  { label: "Dominican Republic (the)", value: "DO" },
  { label: "Ecuador", value: "EC" },
  { label: "Egypt", value: "EG" },
  { label: "El Salvador", value: "SV" },
  { label: "Equatorial Guinea", value: "GQ" },
  { label: "Eritrea", value: "ER" },
  { label: "Estonia", value: "EE" },
  { label: "Eswatini", value: "SZ" },
  { label: "Ethiopia", value: "ET" },
  { label: "Falkland Islands (the) [Malvinas]", value: "FK" },
  { label: "Faroe Islands (the)", value: "FO" },
  { label: "Fiji", value: "FJ" },
  { label: "Finland", value: "FI" },
  { label: "France", value: "FR" },
  { label: "French Guiana", value: "GF" },
  { label: "French Polynesia", value: "PF" },
  { label: "French Southern Territories (the)", value: "TF" },
  { label: "Gabon", value: "GA" },
  { label: "Gambia (the)", value: "GM" },
  { label: "Georgia", value: "GE" },
  { label: "Germany", value: "DE" },
  { label: "Ghana", value: "GH" },
  { label: "Gibraltar", value: "GI" },
  { label: "Greece", value: "GR" },
  { label: "Greenland", value: "GL" },
  { label: "Grenada", value: "GD" },
  { label: "Guadeloupe", value: "GP" },
  { label: "Guam", value: "GU" },
  { label: "Guatemala", value: "GT" },
  { label: "Guernsey", value: "GG" },
  { label: "Guinea", value: "GN" },
  { label: "Guinea-Bissau", value: "GW" },
  { label: "Guyana", value: "GY" },
  { label: "Haiti", value: "HT" },
  { label: "Heard Island and McDonald Islands", value: "HM" },
  { label: "Holy See (the)", value: "VA" },
  { label: "Honduras", value: "HN" },
  { label: "Hong Kong", value: "HK" },
  { label: "Hungary", value: "HU" },
  { label: "Iceland", value: "IS" },
  { label: "India", value: "IN" },
  { label: "Indonesia", value: "ID" },
  { label: "Iran (Islamic Republic of)", value: "IR" },
  { label: "Iraq", value: "IQ" },
  { label: "Ireland", value: "IE" },
  { label: "Isle of Man", value: "IM" },
  { label: "Israel", value: "IL" },
  { label: "Italy", value: "IT" },
  { label: "Jamaica", value: "JM" },
  { label: "Japan", value: "JP" },
  { label: "Jersey", value: "JE" },
  { label: "Jordan", value: "JO" },
  { label: "Kazakhstan", value: "KZ" },
  { label: "Kenya", value: "KE" },
  { label: "Kiribati", value: "KI" },
  { label: "Korea (the Democratic People's Republic of)", value: "KP" },
  { label: "Korea (the Republic of)", value: "KR" },
  { label: "Kuwait", value: "KW" },
  { label: "Kyrgyzstan", value: "KG" },
  { label: "Lao People's Democratic Republic (the)", value: "LA" },
  { label: "Latvia", value: "LV" },
  { label: "Lebanon", value: "LB" },
  { label: "Lesotho", value: "LS" },
  { label: "Liberia", value: "LR" },
  { label: "Libya", value: "LY" },
  { label: "Liechtenstein", value: "LI" },
  { label: "Lithuania", value: "LT" },
  { label: "Luxembourg", value: "LU" },
  { label: "Macao", value: "MO" },
  { label: "Madagascar", value: "MG" },
  { label: "Malawi", value: "MW" },
  { label: "Malaysia", value: "MY" },
  { label: "Maldives", value: "MV" },
  { label: "Mali", value: "ML" },
  { label: "Malta", value: "MT" },
  { label: "Marshall Islands (the)", value: "MH" },
  { label: "Martinique", value: "MQ" },
  { label: "Mauritania", value: "MR" },
  { label: "Mauritius", value: "MU" },
  { label: "Mayotte", value: "YT" },
  { label: "Mexico", value: "MX" },
  { label: "Micronesia (Federated States of)", value: "FM" },
  { label: "Moldova (the Republic of)", value: "MD" },
  { label: "Monaco", value: "MC" },
  { label: "Mongolia", value: "MN" },
  { label: "Montenegro", value: "ME" },
  { label: "Montserrat", value: "MS" },
  { label: "Morocco", value: "MA" },
  { label: "Mozambique", value: "MZ" },
  { label: "Myanmar", value: "MM" },
  { label: "Namibia", value: "NA" },
  { label: "Nauru", value: "NR" },
  { label: "Nepal", value: "NP" },
  { label: "Netherlands (the)", value: "NL" },
  { label: "New Caledonia", value: "NC" },
  { label: "New Zealand", value: "NZ" },
  { label: "Nicaragua", value: "NI" },
  { label: "Niger (the)", value: "NE" },
  { label: "Nigeria", value: "NG" },
  { label: "Niue", value: "NU" },
  { label: "Norfolk Island", value: "NF" },
  { label: "Northern Mariana Islands (the)", value: "MP" },
  { label: "Norway", value: "NO" },
  { label: "Oman", value: "OM" },
  { label: "Pakistan", value: "PK" },
  { label: "Palau", value: "PW" },
  { label: "Palestine, State of", value: "PS" },
  { label: "Panama", value: "PA" },
  { label: "Papua New Guinea", value: "PG" },
  { label: "Paraguay", value: "PY" },
  { label: "Peru", value: "PE" },
  { label: "Philippines (the)", value: "PH" },
  { label: "Pitcairn", value: "PN" },
  { label: "Poland", value: "PL" },
  { label: "Portugal", value: "PT" },
  { label: "Puerto Rico", value: "PR" },
  { label: "Qatar", value: "QA" },
  { label: "Republic of North Macedonia", value: "MK" },
  { label: "Romania", value: "RO" },
  { label: "Russian Federation (the)", value: "RU" },
  { label: "Rwanda", value: "RW" },
  { label: "Réunion", value: "RE" },
  { label: "Saint Barthélemy", value: "BL" },
  { label: "Saint Helena, Ascension and Tristan da Cunha", value: "SH" },
  { label: "Saint Kitts and Nevis", value: "KN" },
  { label: "Saint Lucia", value: "LC" },
  { label: "Saint Martin (French part)", value: "MF" },
  { label: "Saint Pierre and Miquelon", value: "PM" },
  { label: "Saint Vincent and the Grenadines", value: "VC" },
  { label: "Samoa", value: "WS" },
  { label: "San Marino", value: "SM" },
  { label: "Sao Tome and Principe", value: "ST" },
  { label: "Saudi Arabia", value: "SA" },
  { label: "Senegal", value: "SN" },
  { label: "Serbia", value: "RS" },
  { label: "Seychelles", value: "SC" },
  { label: "Sierra Leone", value: "SL" },
  { label: "Singapore", value: "SG" },
  { label: "Sint Maarten (Dutch part)", value: "SX" },
  { label: "Slovakia", value: "SK" },
  { label: "Slovenia", value: "SI" },
  { label: "Solomon Islands", value: "SB" },
  { label: "Somalia", value: "SO" },
  { label: "South Africa", value: "ZA" },
  { label: "South Georgia and the South Sandwich Islands", value: "GS" },
  { label: "South Sudan", value: "SS" },
  { label: "Spain", value: "ES" },
  { label: "Sri Lanka", value: "LK" },
  { label: "Sudan (the)", value: "SD" },
  { label: "Surilabel", value: "SR" },
  { label: "Svalbard and Jan Mayen", value: "SJ" },
  { label: "Sweden", value: "SE" },
  { label: "Switzerland", value: "CH" },
  { label: "Syrian Arab Republic", value: "SY" },
  { label: "Taiwan (Province of China)", value: "TW" },
  { label: "Tajikistan", value: "TJ" },
  { label: "Tanzania, United Republic of", value: "TZ" },
  { label: "Thailand", value: "TH" },
  { label: "Timor-Leste", value: "TL" },
  { label: "Togo", value: "TG" },
  { label: "Tokelau", value: "TK" },
  { label: "Tonga", value: "TO" },
  { label: "Trinidad and Tobago", value: "TT" },
  { label: "Tunisia", value: "TN" },
  { label: "Turkey", value: "TR" },
  { label: "Turkmenistan", value: "TM" },
  { label: "Turks and Caicos Islands (the)", value: "TC" },
  { label: "Tuvalu", value: "TV" },
  { label: "Uganda", value: "UG" },
  { label: "Ukraine", value: "UA" },
  { label: "United Arab Emirates (the)", value: "AE" },
  {
    label: "United Kingdom of Great Britain and Northern Ireland (the)",
    value: "GB",
  },
  { label: "United States Minor Outlying Islands (the)", value: "UM" },
  { label: "United States of America (the)", value: "US" },
  { label: "Uruguay", value: "UY" },
  { label: "Uzbekistan", value: "UZ" },
  { label: "Vanuatu", value: "VU" },
  { label: "Venezuela (Bolivarian Republic of)", value: "VE" },
  { label: "Viet Nam", value: "VN" },
  { label: "Virgin Islands (British)", value: "VG" },
  { label: "Virgin Islands (U.S.)", value: "VI" },
  { label: "Wallis and Futuna", value: "WF" },
  { label: "Western Sahara", value: "EH" },
  { label: "Yemen", value: "YE" },
  { label: "Zambia", value: "ZM" },
  { label: "Zimbabwe", value: "ZW" },
];

// DETAILS VIEWS
export const PROFILE = "profile";
export const DETAILS = "details";
export const PARTICIPANTS = "participants";
export const USER_RANKINGS = "user_rankings";
export const TEAM_REQUESTS = "team_requests";;


// Account constants
export const ACCOUNT_PROFILE = "my profile";
export const ACCOUNT_PAST_INVESTMENTS = "past-investments";
export const ACCOUNT_CHANGE_PASSWORD = "change-password";
