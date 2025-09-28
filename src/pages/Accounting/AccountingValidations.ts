import * as Yup from "yup";

export const InvoiceFormValidations = Yup.object().shape({
  account_id: Yup.string().required("Account is required"),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
  due_date: Yup.date()
    .min(new Date(), "Due date cannot be in the past")
    .required("Due date is required"),
  status: Yup.string()
    .oneOf(['draft', 'sent', 'paid', 'overdue'], "Invalid status")
    .required("Status is required"),
  trade_id: Yup.string().nullable(),
});

export const JournalEntryFormValidations = Yup.object().shape({
  description: Yup.string()
    .min(3, "Description must be at least 3 characters")
    .max(255, "Description must not exceed 255 characters")
    .required("Description is required"),
  debit_account: Yup.string()
    .max(50, "Debit account must not exceed 50 characters")
    .required("Debit account is required"),
  credit_account: Yup.string()
    .max(50, "Credit account must not exceed 50 characters")
    .required("Credit account is required"),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
  date: Yup.date().required("Date is required"),
  related_trade_id: Yup.string().nullable(),
});

export const BudgetFormValidations = Yup.object().shape({
  period: Yup.date().required("Budget period is required"),
  budgeted_amount: Yup.number()
    .positive("Budgeted amount must be positive")
    .required("Budgeted amount is required"),
  hub_id: Yup.string().nullable(),
  grain_type_id: Yup.string().nullable(),
});