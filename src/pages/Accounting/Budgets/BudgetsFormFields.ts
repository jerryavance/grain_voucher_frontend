import { IFormField } from "../../../utils/form_factory";
import { TBudgetFormProps } from "./Budgets.interface";

export const BudgetFormFields = (props: TBudgetFormProps): IFormField[] => {
  const { hubs, grainTypes } = props;

  return [
    {
      name: "period",
      initailValue: "",
      label: "Period",
      uiType: "date",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: "hub_id",
      initailValue: "",
      label: "Hub",
      type: "select",
      uiType: "select",
      options: hubs,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: "grain_type_id",
      initailValue: "",
      label: "Grain Type",
      type: "select",
      uiType: "select",
      options: grainTypes,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: "budgeted_amount",
      initailValue: 0,
      label: "Budgeted Amount",
      type: "number",
      uiType: "number",
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
  ];
};