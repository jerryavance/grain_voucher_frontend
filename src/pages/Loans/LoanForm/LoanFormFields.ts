import { IFormField } from "../../../utils/form_factory";
import { LOAN_PURPOSE, CURRENCY_CODES, LOAN_DURATION, PAYMENT_METHOD, DURATION_UNITS, REPAYMENT_FREQUENCIES, STATUS } from "../../../constants/loan-options";
import { es } from "date-fns/locale";
import { IGeneralFormProps } from "../Loan.interface";


export const GeneralFormFields = (
  LOAN_PURPOSE: any[],
  users: { value: string; label: string }[],
  handleUserSearch: (query: string) => void
): IFormField[] => [

  {
    name: "borrower",
    initailValue: "",
    label: "Borrower",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    options: users,
    handleSearch: handleUserSearch
  },
  {
    name: "amount",
    initailValue: 0,
    label: "Amount",
    type: "number",
    uiType: "number",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  },
  {
    name: "purpose",
    initailValue: "",
    label: "Loan Purpose",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: LOAN_PURPOSE,
  },
];

export const SettingsFormFields = (
  LOAN_DURATION: any[],
  PAYMENT_METHOD: any[],
  REPAYMENT_FREQUENCIES: any[],
  STATUS: any[],
): IFormField[] => [
  {
    name: "loan_duration",
    initailValue: "",
    label: "Loan Duration",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: LOAN_DURATION,
  },
  {
    name: "payment_method",
    initailValue: "",
    label: "Payment Method",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: PAYMENT_METHOD,
  },
  {
    name: "repayment_frequency",
    initailValue: "",
    label: "Repayment Frequency",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: REPAYMENT_FREQUENCIES,
  },
  {
    name: "status",
    initailValue: "",
    label: "Status",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: STATUS,
  }
];


export const OtherFormFields = (
  CURRENCY_CODES: any[]
): IFormField[] => [
  {
    name: "currency",
    initailValue: "",
    label: "Currency",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: CURRENCY_CODES,
  },
  {
    name: "kyc_required",
    initailValue: false,
    label: "KYC Required",
    type: "boolean",
    uiType: "switch",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  },
];