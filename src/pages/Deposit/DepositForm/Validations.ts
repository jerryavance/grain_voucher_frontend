import * as Yup from "yup";

export const GeneralFormValidations = Yup.object().shape({
  farmer_id: Yup.string().required("Farmer is required"),
  // hub: Yup.string().required("Hub is required"),
  // agent: Yup.string().nullable(), // Optional field
  // deposit_date: Yup.date()
  //   .required("Deposit date is required")
  //   .max(new Date(), "Deposit date cannot be in the future"),
});

export const SettingsFormValidations = Yup.object().shape({
  grain_type: Yup.string().required("Grain type is required"),
  quantity_kg: Yup.number()
    .required("Quantity is required")
    .min(0.01, "Quantity must be greater than 0")
    .max(999999.99, "Quantity is too large"),
  moisture_level: Yup.number()
    .required("Moisture level is required")
    .min(0, "Moisture level cannot be negative")
    .max(100, "Moisture level cannot exceed 100%"),
  quality_grade: Yup.string().required("Quality grade is required"),
});

export const OtherFormValidations = Yup.object().shape({
  grn_number: Yup.string()
    .max(50, "GRN number must be 50 characters or less")
    .nullable(), // Optional field
  validated: Yup.boolean(),
  notes: Yup.string().nullable(), // Optional field
});