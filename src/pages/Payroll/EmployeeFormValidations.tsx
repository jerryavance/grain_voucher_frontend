import * as Yup from "yup";

export const EmployeeFormValidations = () => {
  return Yup.object().shape({
    user_id: Yup.string().required("User selection is required"),
    contract_start: Yup.date()
      .required("Contract start date is required")
      .max(new Date(), "Contract start date cannot be in the future"),
    salary: Yup.number()
      .required("Salary is required")
      .positive("Salary must be a positive number")
      .min(1, "Salary must be greater than 0")
      .max(999999999.99, "Salary cannot exceed 999,999,999.99"),
  });
};