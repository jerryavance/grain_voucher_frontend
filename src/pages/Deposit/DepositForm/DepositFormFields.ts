import { IFormField } from "../../../utils/form_factory";

export const GeneralFormFields = (
  farmers: { value: string; label: string }[],
  // hubs: { value: string; label: string }[],
  // agents: { value: string; label: string }[],
  handleFarmerSearch: (query: string) => void,
  // handleHubSearch: (query: string) => void,
  // handleAgentSearch: (query: string) => void
): IFormField[] => [
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
  // {
  //   name: "hub",
  //   initailValue: "",
  //   label: "Hub",
  //   type: "text",
  //   uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  //   uiType: "select",
  //   options: hubs,
  //   handleSearch: handleHubSearch,
  // },
  // {
  //   name: "agent",
  //   initailValue: "",
  //   label: "Agent (Optional)",
  //   type: "text",
  //   uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  //   uiType: "select",
  //   options: agents,
  //   handleSearch: handleAgentSearch,
  //   required: false,
  // },
  // {
  //   name: "deposit_date",
  //   initailValue: new Date().toISOString().split('T')[0],
  //   label: "Deposit Date",
  //   type: "date",
  //   uiType: "date",
  //   uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
  // },
];

export const SettingsFormFields = (
  grainTypes: { value: string; label: string }[],
  qualityGrades: { value: string; label: string }[],
  handleGrainTypeSearch: (query: string) => void,
  handleQualityGradeSearch: (query: string) => void
): IFormField[] => [
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
];

export const OtherFormFields = (): IFormField[] => [
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