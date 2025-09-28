// CRMFormValidations.ts
import * as Yup from "yup";

// Lead Form Validation
export const LeadFormValidations = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .required("Lead name is required"),
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .optional(),
  source: Yup.string()
    .required("Lead source is required"),
  status: Yup.string()
    .oneOf(['new', 'qualified', 'lost'], "Invalid status")
    .required("Status is required"),
  assigned_to_id: Yup.string()
    .optional(),
});

// Account Form Validation
export const AccountFormValidations = Yup.object().shape({
  name: Yup.string()
    .min(2, "Account name must be at least 2 characters")
    .max(255, "Account name must not exceed 255 characters")
    .required("Account name is required"),
  type: Yup.string()
    .oneOf(['customer', 'supplier', 'investor'], "Invalid account type")
    .required("Account type is required"),
  credit_terms_days: Yup.number()
    .min(0, "Credit terms must be a positive number")
    .max(365, "Credit terms cannot exceed 365 days")
    .required("Credit terms are required"),
  hub_id: Yup.string()
    .optional(),
});

// Contact Form Validation
export const ContactFormValidations = Yup.object().shape({
  name: Yup.string()
    .min(2, "Contact name must be at least 2 characters")
    .max(255, "Contact name must not exceed 255 characters")
    .required("Contact name is required"),
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .optional(),
  role: Yup.string()
    .max(50, "Role must not exceed 50 characters")
    .optional(),
  account_id: Yup.string()
    .required("Account is required"),
  user_id: Yup.string()
    .optional(),
});

// Opportunity Form Validation
export const OpportunityFormValidations = Yup.object().shape({
  name: Yup.string()
    .min(2, "Opportunity name must be at least 2 characters")
    .max(255, "Opportunity name must not exceed 255 characters")
    .required("Opportunity name is required"),
  account_id: Yup.string()
    .required("Account is required"),
  expected_volume_mt: Yup.number()
    .min(0.01, "Volume must be greater than 0")
    .max(999999999.99, "Volume is too large")
    .required("Expected volume is required"),
  expected_price_per_mt: Yup.number()
    .min(0.01, "Price must be greater than 0")
    .max(999999999.99, "Price is too large")
    .required("Expected price is required"),
  stage: Yup.string()
    .oneOf(['prospect', 'quote', 'won', 'lost'], "Invalid stage")
    .required("Stage is required"),
  assigned_to_id: Yup.string()
    .required("BDM assignment is required"),
});

// Contract Form Validation
export const ContractFormValidations = Yup.object().shape({
  opportunity_id: Yup.string()
    .required("Opportunity is required"),
  terms: Yup.string()
    .min(10, "Terms must be at least 10 characters")
    .required("Contract terms are required"),
  status: Yup.string()
    .oneOf(['draft', 'signed', 'executed'], "Invalid status")
    .required("Status is required"),
  signed_at: Yup.date()
    .optional()
    .when('status', {
      is: (status: string) => status === 'signed' || status === 'executed',
      then: (schema) => schema.required("Signed date is required when contract is signed"),
    }),
});