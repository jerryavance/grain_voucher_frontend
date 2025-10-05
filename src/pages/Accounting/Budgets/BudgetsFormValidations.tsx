import * as Yup from "yup";

export const BudgetFormValidations = () => {
  return Yup.object().shape({
    period: Yup.date().required("Period is required"),
    budgeted_amount: Yup.number().min(0, "Budgeted amount must be >= 0").required(),
  });
};