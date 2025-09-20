import { IFormField } from "../../utils/form_factory";
import * as Yup from "yup";

export const InstitutionsFormFields = (): IFormField[] => [
  {
    name: "name",
    initailValue: "",
    label: "Institution Name",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text",
    required: true
  },
  {
    name: "type",
    initailValue: "",
    label: "Institution Type",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    options: [
      { value: "investment_fund", label: "Investment Fund" },
      { value: "sacco", label: "SACCO" },
      { value: "cooperative", label: "Cooperative" },
      { value: "asset_management", label: "Asset Management" },
    ],
    required: true
  },
  {
    name: "description",
    initailValue: "",
    label: "Short Description",
    uiBreakpoints: { xs: 12 },
    uiType: "textarea",
    required: true
  },
  {
    name: "long_description",
    initailValue: "",
    label: "Detailed Description",
    uiBreakpoints: { xs: 12 },
    uiType: "textarea",
  },
  {
    name: "logo",
    initailValue: null,
    label: "Institution Logo",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "file",
  },
  {
    name: "banner_image",
    initailValue: null,
    label: "Banner Image",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "file",
  },
  {
    name: "location",
    initailValue: "",
    label: "Location",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text"
  },
  {
    name: "address",
    initailValue: "",
    label: "Full Address",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "textarea"
  },
  {
    name: "phone",
    initailValue: "",
    label: "Phone Number",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text"
  },
  {
    name: "email",
    initailValue: "",
    label: "Email Address",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "email"
  },
  {
    name: "website",
    initailValue: "",
    label: "Website URL",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text"
  },
  {
    name: "established_year",
    initailValue: "",
    label: "Established Year",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "number",
  },
  {
    name: "registration_number",
    initailValue: "",
    label: "Registration Number",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text"
  },
  {
    name: "license_type",
    initailValue: "",
    label: "License Type",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text"
  },
  {
    name: "license_number",
    initailValue: "",
    label: "License Number",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text"
  },
  // Removed social_media and key_personnel fields as they are now handled separately
  {
    name: "status",
    initailValue: "pending",
    label: "Status",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "pending", label: "Pending" },
    ]
  },
  {
    name: "verified",
    initailValue: false,
    label: "Verified Institution",
    type: "checkbox",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "checkbox"
  }
];

export const InstitutionsFormValidations = Yup.object().shape({
  name: Yup.string()
    .required("Institution name is required")
    .min(3, "Too short (minimum 3 characters)")
    .max(255, "Too long (maximum 255 characters)"),

  type: Yup.string()
    .required("Institution type is required")
    .oneOf([
      "investment_fund", 
      "sacco", 
      "cooperative", 
      "asset_management"
    ], "Invalid institution type"),

  description: Yup.string()
    .required("Description is required")
    .min(10, "Too short (minimum 10 characters)"),

  email: Yup.string()
    .email("Invalid email address"),
    
  established_year: Yup.number()
    .min(1800, "Invalid year")
    .max(new Date().getFullYear(), "Cannot be in the future")
    .nullable(),

  website: Yup.string().url("Invalid URL format"),

  // Removed JSON validation as these fields are now handled separately
});




// import { IFormField } from "../../utils/form_factory";
// import * as Yup from "yup";

// export const InstitutionsFormFields = (): IFormField[] => [
//   {
//     name: "name",
//     initailValue: "",
//     label: "Institution Name",
//     type: "text",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "text",
//     required: true
//   },
//   {
//     name: "type",
//     initailValue: "",
//     label: "Institution Type",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "select",
//     options: [
//       { value: "investment_fund", label: "Investment Fund" },
//       { value: "sacco", label: "SACCO" },
//       { value: "cooperative", label: "Cooperative" },
//       { value: "asset_management", label: "Asset Management" },
//     ],
//     required: true
//   },
//   {
//     name: "description",
//     initailValue: "",
//     label: "Short Description",
//     uiBreakpoints: { xs: 12 },
//     uiType: "textarea",
//     required: true
//   },
//   {
//     name: "long_description",
//     initailValue: "",
//     label: "Detailed Description",
//     uiBreakpoints: { xs: 12 },
//     uiType: "textarea",
//   },
//   {
//     name: "logo",
//     initailValue: null,
//     label: "Institution Logo",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "file",
//   },
//   {
//     name: "banner_image",
//     initailValue: null,
//     label: "Banner Image",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "file",
//   },
//   {
//     name: "location",
//     initailValue: "",
//     label: "Location",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "text"
//   },
//   {
//     name: "address",
//     initailValue: "",
//     label: "Full Address",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "textarea"
//   },
//   {
//     name: "phone",
//     initailValue: "",
//     label: "Phone Number",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "text"
//   },
//   {
//     name: "email",
//     initailValue: "",
//     label: "Email Address",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "email"
//   },
//   {
//     name: "website",
//     initailValue: "",
//     label: "Website URL",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "text"
//   },
//   {
//     name: "established_year",
//     initailValue: "",
//     label: "Established Year",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "number",
//   },
//   {
//     name: "registration_number",
//     initailValue: "",
//     label: "Registration Number",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "text"
//   },
//   {
//     name: "license_type",
//     initailValue: "",
//     label: "License Type",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "text"
//   },
//   {
//     name: "license_number",
//     initailValue: "",
//     label: "License Number",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "text"
//   },
//   {
//     name: "social_media",
//     initailValue: "",
//     label: "Social Media (JSON)",
//     uiBreakpoints: { xs: 12 },
//     uiType: "textarea",
//   },
//   {
//     name: "key_personnel",
//     initailValue: "",
//     label: "Key Personnel (JSON)",
//     uiBreakpoints: { xs: 12 },
//     uiType: "textarea",
//   },
//   {
//     name: "status",
//     initailValue: "pending",
//     label: "Status",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "select",
//     options: [
//       { value: "active", label: "Active" },
//       { value: "suspended", label: "Suspended" },
//       { value: "pending", label: "Pending" },
//     ]
//   },
//   {
//     name: "verified",
//     initailValue: false,
//     label: "Verified Institution",
//     type: "checkbox",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "checkbox"
//   }
// ];

// export const InstitutionsFormValidations = Yup.object().shape({
//   name: Yup.string()
//     .required("Institution name is required")
//     .min(3, "Too short (minimum 3 characters)")
//     .max(255, "Too long (maximum 255 characters)"),

//   type: Yup.string()
//     .required("Institution type is required")
//     .oneOf([
//       "investment_fund", 
//       "sacco", 
//       "cooperative", 
//       "asset_management"
//     ], "Invalid institution type"),

//   description: Yup.string()
//     .required("Description is required")
//     .min(10, "Too short (minimum 10 characters)"),

//   email: Yup.string()
//     .email("Invalid email address"),
    
//   established_year: Yup.number()
//     .min(1800, "Invalid year")
//     .max(new Date().getFullYear(), "Cannot be in the future")
//     .nullable(),

//   website: Yup.string().url("Invalid URL format"),

//   social_media: Yup.string().test(
//     "is-json",
//     "Invalid JSON format",
//     (value) => {
//       if (!value) return true;
//       try {
//         JSON.parse(value);
//         return true;
//       } catch (e) {
//         return false;
//       }
//     }
//   ),

//   key_personnel: Yup.string().test(
//     "is-json-array",
//     "Invalid JSON array format",
//     (value) => {
//       if (!value) return true;
//       try {
//         const parsed = JSON.parse(value);
//         return Array.isArray(parsed);
//       } catch (e) {
//         return false;
//       }
//     }
//   )
// });




// import { IFormField } from "../../utils/form_factory";
// import { CURRENCY_CODES } from "../../constants/currency-codes";
// import * as Yup from "yup";

// export const InstitutionsFormFields = (
//   institutionss: { value: string; label: string }[],
//   handleInstitutionsSearch: (query: string) => void
// ): IFormField[] => [
//   {
//     name: "supported_institutionss",
//     initailValue: "",
//     label: "Supported Institutionss",
//     type: "text",
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: "select",
//     options: institutionss,
//     handleSearch: handleInstitutionsSearch,
//   },
//   {
//     name: 'account_name',
//     initailValue: '',
//     label: 'Account Name',
//     type: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: 'text',
//   },
//   {
//     name: 'account_number',
//     initailValue: '',
//     label: 'Account Number',
//     type: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: 'text',
//   },
//   {
//     name: 'Institutions_name',
//     initailValue: '',
//     label: 'Institutions Name',
//     type: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: 'text',
//   },
//   {
//     name: 'Institutions_identification_code',
//     initailValue: '',
//     label: 'Institutions Identification Code (SWIFT)',
//     type: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: 'text',
//   },
//   {
//     name: 'currency',
//     initailValue: '',
//     label: 'Currency',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
//     uiType: 'select',
//     options: CURRENCY_CODES,
//   },
//   {
//     name: 'is_active',
//     initailValue: true,
//     label: 'Active',
//     type: 'checkbox',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
//     uiType: 'checkbox'
//   }
// ];

// export const InstitutionsFormValidations = Yup.object().shape({
//   supported_institutionss: Yup.string().required('Please select a supported Institutions'),
  
//   account_name: Yup.string()
//     .min(1, 'Too short')
//     .max(255, 'Too long')
//     .required('Account name is required'),

//   account_number: Yup.string()
//     .min(1, 'Too short')
//     .max(50, 'Too long')
//     .required('Account number is required'),

//   Institutions_name: Yup.string()
//     .min(1, 'Too short')
//     .max(255, 'Too long')
//     .required('Institutions name is required'),

//   Institutions_identification_code: Yup.string()
//     .max(50, 'Too long')
//     .required('Institutions identification code is required'),

//   currency: Yup.string().required('Currency is required'),

//   transfer_type: Yup.string().required('Transfer type is required'),

//   is_active: Yup.boolean().required(),
// });