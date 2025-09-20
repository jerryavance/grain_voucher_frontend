import { IFormField } from "../../../utils/form_factory";

export const FilterFormFields = (): IFormField[] => [
  {
    name: 'start_date',
    initailValue: '',
    label: 'Start Date',
    uiBreakpoints: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
    uiType: 'date',
    dateFormat: 'YYYY-MM-DD'
  },
  {
    name: 'end_date',
    initailValue: '',
    label: 'End Date',
    uiBreakpoints: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
    uiType: 'date',
    dateFormat: 'YYYY-MM-DD'
  },
];