import * as Yup from "yup";

export const InvoiceFormValidations = () => {
  return Yup.object().shape({
    trade_id: Yup.string().nullable(),
    account_id: Yup.string().required("Account is required if no trade"),
    issue_date: Yup.date().required("Issue date is required"),
    due_date: Yup.date()
      .required("Due date is required")
      .when("issue_date", (issue_date: any, schema: any) => {
        return schema.min(issue_date, "Due date must be after issue date");
      }),
    subtotal: Yup.number().min(0, "Subtotal must be >= 0").required(),
    tax_rate: Yup.number().min(0, "Tax rate must be >= 0"),
    discount_amount: Yup.number().min(0, "Discount must be >= 0"),
    status: Yup.string().required("Status is required"),
  });
};