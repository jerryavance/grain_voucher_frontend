import { IFormField } from "../../utils/form_factory";
import * as Yup from "yup";

export const HubFormFields = (
  users: { value: string; label: string }[],
  farmers: { value: string; label: string }[],
  hubs: { value: string; label: string }[],
  agents: { value: string; label: string }[],
  grainTypes: { value: string; label: string }[],
  qualityGrades: { value: string; label: string }[],


  handleGrainTypeSearch: (query: string) => void,
  handleQualityGradeSearch: (query: string) => void,
  handleUserSearch: (query: string) => void,
  handleFarmerSearch: (query: string) => void,
  handleHubSearch: (query: string) => void,
  handleAgentSearch: (query: string) => void
): IFormField[] => [
  {
    name: "hub_admin",
    initailValue: "",   // string UUID, default to empty string
    label: "Hub Admin",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    selector: {
      value: (option) => option.hub_admin.id,  // Only store the id
      label: (option) => `${option.hub_admin.first_name} ${option.hub_admin.last_name} (${option.hub_admin.phone_number})`,
    },
    options: users,
    handleSearch: handleUserSearch,
    isClearable: true,   // 👈 allow removing admin
  },
  {
    name: "farmer_id",
    initailValue: "",
    label: "Farmer",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    options: farmers,
    handleSearch: handleFarmerSearch,
  },
  {
    name: "hub_id",
    initailValue: "",
    label: "Hub",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    options: hubs,
    handleSearch: handleHubSearch,
  },
  {
    name: "agent",
    initailValue: "",
    label: "Agent (Optional)",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    options: agents,
    handleSearch: handleAgentSearch,
    required: false,
  },
  {
    name: "deposit_date",
    initailValue: new Date().toISOString().split('T')[0],
    label: "Deposit Date",
    type: "date",
    uiType: "date",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  },
  {
    name: 'is_active',
    initailValue: true,
    label: 'Active',
    type: 'checkbox',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    uiType: 'checkbox'
  },
  {
    name: "grain_type",
    initailValue: "",
    label: "Grain Type",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: grainTypes,
    handleSearch: handleGrainTypeSearch,
  },
  {
    name: "quantity_kg",
    initailValue: 0,
    label: "Quantity (KG)",
    type: "number",
    uiType: "number",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  },
  {
    name: "moisture_level",
    initailValue: 0,
    label: "Moisture Level (%)",
    type: "number",
    uiType: "number",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  },
  {
    name: "quality_grade",
    initailValue: "",
    label: "Quality Grade",
    type: "text",
    uiType: "select",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    options: qualityGrades,
    handleSearch: handleQualityGradeSearch,
  },


  {
    name: "grn_number",
    initailValue: "",
    label: "GRN Number (Optional)",
    type: "text",
    uiType: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    required: false,
  },
  {
    name: "validated",
    initailValue: false,
    label: "Validated",
    type: "boolean",
    uiType: "switch",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  },
  {
    name: "notes",
    initailValue: "",
    label: "Notes",
    type: "text",
    uiType: "textarea",
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    required: false,
  },

];

export const HubFormValidations = Yup.object().shape({
  hub_admin: Yup.string().nullable(), // optional
  farmer_id: Yup.string().required("Farmer is required"),
  hub_id: Yup.string().required("Hub is required"),
  agent: Yup.string().nullable(), // optional
  deposit_date: Yup.date()
    .required("Deposit date is required")
    .max(new Date(), "Deposit date cannot be in the future"),
  is_active: Yup.boolean().required("Must specify active status"),

  grain_type: Yup.string().required("Grain type is required"),
  quantity_kg: Yup.number()
    .min(1, "Quantity must be at least 1 KG")
    .required("Quantity is required"),
  moisture_level: Yup.number()
    .min(0, "Moisture level cannot be negative")
    .max(100, "Moisture level must be between 0 and 100")
    .required("Moisture level is required"),
  quality_grade: Yup.string().required("Quality grade is required"),

  grn_number: Yup.string().nullable(), // optional
  validated: Yup.boolean(), // not required, defaults to false
  notes: Yup.string().max(500, "Notes must not exceed 500 characters").nullable(),
});
