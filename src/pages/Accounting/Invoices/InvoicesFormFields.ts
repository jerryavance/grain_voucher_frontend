import { IFormField } from "../../../utils/form_factory";
import { TInvoiceFormProps } from "./Invoices.interface";

// Constants for choices (from backend)
const STATUS_CHOICES = [
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "sent", label: "Sent to Customer" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid in Full" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
  { value: "written_off", label: "Written Off" },
];

export const InvoiceFormFields = (props: TInvoiceFormProps): IFormField[] => {
  const { accounts, trades } = props;

  return [
    {
      name: "trade_id",
      initailValue: "",
      label: "Trade",
      type: "select",
      uiType: "select",
      options: trades,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: "account_id",
      initailValue: "",
      label: "Account",
      type: "select",
      uiType: "select",
      options: accounts,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: "issue_date",
      initailValue: "",
      label: "Issue Date",
      uiType: "date",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "due_date",
      initailValue: "",
      label: "Due Date",
      uiType: "date",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "subtotal",
      initailValue: 0,
      label: "Subtotal",
      type: "number",
      uiType: "number",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
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
      name: "tax_rate",
      initailValue: 0,
      label: "Tax Rate (%)",
      type: "number",
      uiType: "number",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: "discount_amount",
      initailValue: 0,
      label: "Discount Amount",
      type: "number",
      uiType: "number",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: "status",
      initailValue: "draft",
      label: "Status",
      type: "select",
      uiType: "select",
      options: STATUS_CHOICES,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: "payment_terms",
      initailValue: "",
      label: "Payment Terms",
      type: "textarea",
      uiType: "textarea",
      uiBreakpoints: { xs: 12 },
    },
    {
      name: "notes",
      initailValue: "",
      label: "Notes",
      type: "textarea",
      uiType: "textarea",
      uiBreakpoints: { xs: 12 },
    },
    {
      name: "internal_notes",
      initailValue: "",
      label: "Internal Notes",
      type: "textarea",
      uiType: "textarea",
      uiBreakpoints: { xs: 12 },
    },
    // Note: Line items would require a dynamic array field or custom component
  ];
};