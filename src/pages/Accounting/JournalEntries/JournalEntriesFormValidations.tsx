import * as Yup from "yup";

export const JournalEntryFormValidations = () => {
  return Yup.object().shape({
    entry_type: Yup.string().required("Entry type is required"),
    date: Yup.date().required("Date is required"),
    debit_account: Yup.string().required("Debit account is required"),
    credit_account: Yup.string().required("Credit account is required"),
    amount: Yup.number().min(0.01, "Amount must be greater than 0").required(),
    description: Yup.string().required("Description is required"),
  });
};