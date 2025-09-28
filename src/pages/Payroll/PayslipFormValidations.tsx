import * as Yup from "yup";
export const PayslipFormValidations = () => {
    return Yup.object().shape({
      employee_id: Yup.string().required("Employee selection is required"),
      period: Yup.date()
        .required("Payroll period is required")
        .max(new Date(), "Payroll period cannot be in the future"),
      gross_earnings: Yup.number()
        .required("Gross earnings is required")
        .positive("Gross earnings must be a positive number")
        .min(0, "Gross earnings cannot be negative")
        .max(999999999.99, "Gross earnings cannot exceed 999,999,999.99"),
      deductions: Yup.number()
        .required("Deductions is required")
        .min(0, "Deductions cannot be negative")
        .max(999999999.99, "Deductions cannot exceed 999,999,999.99")
        .test(
          'deductions-not-greater-than-earnings',
          'Deductions cannot be greater than gross earnings',
          function(value) {
            const { gross_earnings } = this.parent;
            if (gross_earnings && value) {
              return parseFloat(value.toString()) <= parseFloat(gross_earnings.toString());
            }
            return true;
          }
        ),
    });
  };
  