import * as Yup from "yup";
import { IFormField } from "../../utils/form_factory";

export const PriceFeedFormFields = (
  hubOptions: { value: string; label: string }[],
  handleHubSearch: (query: string) => void,
  grainOptions: { value: string; label: string }[],
  handleGrainSearch: (query: string) => void
): IFormField[] => [
  {
    name: "hub_id",
    initailValue: "",
    label: "Hub",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    selector: {
      value: (option) => option.value,
      label: (option) => option.label,
    },
    options: hubOptions,
    handleSearch: handleHubSearch,
    isClearable: true,
  },
  {
    name: "grain_type_id",
    initailValue: "",
    label: "Grain Type",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    selector: {
      value: (option) => option.value,
      label: (option) => option.label,
    },
    options: grainOptions,
    handleSearch: handleGrainSearch,
    isClearable: true,
  },
  {
    name: "price_per_kg",
    initailValue: "",
    label: "Price (Per Kg)",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "text",
  },
  {
    name: "effective_date",
    initailValue: "",
    label: "Effective Date",
    type: "date",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "date",
  },
];

export const PriceFeedFormValidations = Yup.object().shape({
  hub_id: Yup.string(),
  grain_type_id: Yup.string().required("Grain type is required"),
  price_per_kg: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be positive"),
  effective_date: Yup.date().required("Effective date is required"),
});
