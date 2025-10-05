import * as Yup from "yup";

export const PaymentFormValidations = () => {
  return Yup.object().shape({
    invoice_id: Yup.string().required("Invoice is required"),
    amount: Yup.number().min(0.01, "Amount must be greater than 0").required(),
    payment_date: Yup.date().required("Payment date is required"),
    payment_method: Yup.string().required("Payment method is required"),
    status: Yup.string().required("Status is required"),
  });
};