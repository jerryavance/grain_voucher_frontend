import * as Yup from "yup";

export const GeneralFormValidations = Yup.object().shape({
  investment_name: Yup.string().required("Investment Name is required"),
  investment_type: Yup.string().required("Investment Type is required"),
  investment_description: Yup.string().nullable(),
  investment_code: Yup.string().max(15, "Investment Code must be at most 15 characters"),
  total_investment_amount: Yup.number()
    .positive("Total Investment Amount must be positive")
    .required("Total Investment Amount is required"),
  available_units: Yup.number()
    .integer("Available Units must be a whole number")
    .positive("Available Units must be positive")
    .required("Available Units is required"),
  unit_price: Yup.number()
    .positive("Unit Price must be positive")
    .required("Unit Price is required"),
  minimum_investment_amount: Yup.number()
    .positive("Minimum Investment Amount must be positive")
    .required("Minimum Investment Amount is required"),
  maximum_investment_amount: Yup.number()
    .positive("Maximum Investment Amount must be positive")
    .required("Maximum Investment Amount is required"),
  interest_rate: Yup.number()
    .min(0, "Interest Rate must be at least 0%")
    .max(100, "Interest Rate must be at most 100%")
    .required("Interest Rate is required"),
  interest_type: Yup.string().required("Interest Type is required"),
  investment_duration_value: Yup.number()
    .integer("Investment Duration must be a whole number")
    .positive("Investment Duration must be positive")
    .required("Investment Duration is required"),
  investment_duration_unit: Yup.string().required("Duration Unit is required"),
  repayment_frequency: Yup.string().required("Repayment Frequency is required"),
  start_date: Yup.date().required("Start Date is required"),
  end_date: Yup.date()
    .min(Yup.ref("start_date"), "End Date must be after Start Date")
    .required("End Date is required"),
});

export const SettingsFormValidations = Yup.object().shape({
  risk_level: Yup.string().required("Risk Level is required"),
  guarantee_principal: Yup.boolean(),
  collateral_type: Yup.string().required("Collateral Type is required"),
  collateral_value: Yup.number()
    .positive("Collateral Value must be positive")
    .required("Collateral Value is required"),
  platform_fee: Yup.number()
    .min(0, "Platform Fee must be at least 0%")
    .max(100, "Platform Fee must be at most 100%")
    .required("Platform Fee is required"),
  early_termination_fee: Yup.number(),
  withdrawal_before_maturity: Yup.boolean(),
  transferability_of_units : Yup.boolean(),
  currency: Yup.string().required("Currency is required"),
  eligible_investor_type: Yup.string().required("Eligible Investor Type is required"),
  investment_visibility: Yup.string().required("Investment Visibility is required"),
});

export const OtherFormValidations = Yup.object().shape({
  borrower_type: Yup.string().required("Borrower Type is required"),
  isin_number: Yup.string().nullable(),
  issuer_name: Yup.string().required("Issuer Name is required"),
  issuer_country: Yup.string().required("Issuer Country is required"),
  issuer_website: Yup.string().nullable(),
  issuer_email: Yup.string().nullable(),
  issuer_phone_number: Yup.string().nullable(),
  issuer_address: Yup.string().nullable(),
  issuer_description: Yup.string().nullable(),
  issuer_registration_number: Yup.string().nullable(),
  issuer_tax_number: Yup.string().nullable(),
  issuer_logo: Yup.mixed().test("fileType", "Invalid file format, only images are allowed", value => {
    if (!value) return true; // Skip validation if no file is uploaded
    return value && ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(value.type);
  }),
  credit_rating: Yup.string().nullable(),
  esg_rating: Yup.string().nullable(),
  loan_purpose: Yup.string().required("Loan Purpose is required"),
  investment_image: Yup.mixed().test("fileType", "Invalid file format, only images are allowed", value => {
    if (!value) return true; // Skip validation if no file is uploaded
    return value && ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(value.type);
  }),
  terms_and_conditions: Yup.string().required("Terms and Conditions are required"),
  kyc_required: Yup.boolean(),
});



// import * as Yup from "yup";

// export const GeneralInfoValidations = Yup.object().shape({
//     name: Yup.string().required("Tournament Name is required"),
//     code: Yup.string().max(9, "Code must be 9 characters"),
//     email: Yup.string().email("Invalid email").required("Email is required"),
//     address_line: Yup.string().nullable(),
//     country: Yup.string().required("Country is required"),
//     convenor_name: Yup.string().required("Convenor name is required"),
//     primary_phone_number: Yup.string().required("Primary phone number is required"),
//     secondary_phone_number: Yup.string(),
//     start_date: Yup.string().required("Start date is required"),
//     end_date: Yup.string().required("End date is required"),
//     host_institution: Yup.string().nullable(),  
// });

// export const SettingsFormValidations = Yup.object().shape({
//     tournament_currency: Yup.string().required("Tournament currency is required"),
//     registration_fee: Yup.number().required("Registration fee is required"),
//     type: Yup.string().required("Tournament type is required"),
//     debate_level: Yup.string().required("Debate level is required"),
//     debate_format: Yup.string().required("Debate format is required"),
//     participants_age: Yup.string().required("Participants age is required"),
//     number_of_rounds: Yup.number().min(1, "Number of rounds should not be less than 1").required("Number of rounds is required"),
//     number_of_teams_in_outround: Yup.number().min(4, "Number of teams in outrounds should not be less than 4").required("Number of teams in outrounds is required"),
// });

// export const AttachmentFormValidations = Yup.object().shape({
//     file: Yup.mixed().test('fileType', 'Invalid file format, only images are allowed', value => {
//       if (!value) return true; // Skip validation if no file is uploaded
//       return value && ['file/jpeg', 'file/png', 'file/jpg', 'file/gif'].includes(value.type);
//   }),
// });

// export const OtherFormValidations = Yup.object().shape({
//     notes: Yup.string().nullable(),
// });