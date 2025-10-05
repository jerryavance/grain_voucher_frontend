import { IFormField } from "../../../utils/form_factory";
import { TJournalEntryFormProps } from "./JournalEntries.interface";

const ENTRY_TYPE_CHOICES = [
  { value: "sale", label: "Sale" },
  { value: "payment", label: "Payment Received" },
  { value: "purchase", label: "Purchase/COGS" },
  { value: "expense", label: "Expense" },
  { value: "adjustment", label: "Adjustment" },
  { value: "commission", label: "Commission Expense" },
  { value: "deposit", label: "Farmer Deposit" },
  { value: "redemption", label: "Voucher Redemption" },
];

export const JournalEntryFormFields = (props: TJournalEntryFormProps): IFormField[] => {
  const { trades, invoices, payments } = props;

  return [
    {
      name: "entry_type",
      initailValue: "adjustment",
      label: "Entry Type",
      type: "select",
      uiType: "select",
      options: ENTRY_TYPE_CHOICES,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "date",
      initailValue: "",
      label: "Date",
      uiType: "date",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "debit_account",
      initailValue: "",
      label: "Debit Account",
      type: "text",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "credit_account",
      initailValue: "",
      label: "Credit Account",
      type: "text",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "amount",
      initailValue: 0,
      label: "Amount",
      type: "number",
      uiType: "number",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "related_trade_id",
      initailValue: "",
      label: "Related Trade",
      type: "select",
      uiType: "select",
      options: trades,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: "related_invoice_id",
      initailValue: "",
      label: "Related Invoice",
      type: "select",
      uiType: "select",
      options: invoices,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: "related_payment_id",
      initailValue: "",
      label: "Related Payment",
      type: "select",
      uiType: "select",
      options: payments,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: "description",
      initailValue: "",
      label: "Description",
      type: "text",
      uiType: "text",
      uiBreakpoints: { xs: 12 },
      required: true,
    },
    {
      name: "notes",
      initailValue: "",
      label: "Notes",
      type: "textarea",
      uiType: "textarea",
      uiBreakpoints: { xs: 12 },
    },
  ];
};