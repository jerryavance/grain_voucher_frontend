import * as Yup from "yup";

export const GeneralFormValidations = Yup.object().shape({
  borrower: Yup.string().required("Borrower is required"),
  amount: Yup.number()
    .required("Amount is required")
    .min(1, "Amount must be greater than 0"),
  purpose: Yup.string().required("Loan Purpose is required"),
  
});

export const SettingsFormValidations = Yup.object().shape({
  loan_duration: Yup.string().required("Loan Duration is required"),
  payment_method: Yup.string().required("Payment Method is required"),
  repayment_frequency: Yup.string().required("Repayment Frequency is required"),
  status: Yup.string().required("Status is required"),
});

export const OtherFormValidations = Yup.object().shape({
  currency: Yup.string().required("Currency is required"),
  kyc_required: Yup.boolean(),
});