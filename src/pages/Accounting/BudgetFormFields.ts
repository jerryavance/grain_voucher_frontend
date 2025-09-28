import { IFormField } from "../../utils/form_factory";

export const BudgetFormFields = (hubs: any[], grainTypes: any[]): IFormField[] => {
  return [
    {
      name: 'period',
      initailValue: '',
      label: 'Budget Period',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'hub_id',
      initailValue: '',
      label: 'Hub (Optional)',
      type: 'select',
      uiType: 'select',
      options: hubs.map(hub => ({
        label: hub.name,
        value: hub.id
      })),
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: 'grain_type_id',
      initailValue: '',
      label: 'Grain Type (Optional)',
      type: 'select',
      uiType: 'select',
      options: grainTypes.map(grainType => ({
        label: grainType.name,
        value: grainType.id
      })),
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: 'budgeted_amount',
      initailValue: '',
      label: 'Budgeted Amount',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
  ];
};