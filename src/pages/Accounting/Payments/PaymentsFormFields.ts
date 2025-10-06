import { IFormField } from "../../../utils/form_factory";
import { TPaymentFormProps } from "./Payments.interface";

// Constants for choices
const PAYMENT_METHOD_CHOICES = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  // Add more from backend
];

const STATUS_CHOICES = [
  { value: "pending", label: "Pending" },
  { value: "processed", label: "Processed" },
  // Add more
];

export const PaymentFormFields = (props: TPaymentFormProps): IFormField[] => {
  const { invoices, accounts } = props;

  return [
    {
      name: "invoice",
      initailValue: "",
      label: "Invoice",
      type: "select",
      uiType: "select",
      options: invoices,
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
      name: "payment_date",
      initailValue: "",
      label: "Payment Date",
      uiType: "date",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "payment_method",
      initailValue: "",
      label: "Payment Method",
      type: "select",
      uiType: "select",
      options: PAYMENT_METHOD_CHOICES,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "reference_number",
      initailValue: "",
      label: "Reference Number",
      type: "text",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: "status",
      initailValue: "pending",
      label: "Status",
      type: "select",
      uiType: "select",
      options: STATUS_CHOICES,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
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