import { IFormField } from "../../utils/form_factory";

export const EmployeeFormFields = (): IFormField[] => {
    return [
        {
            name: 'user_id',
            initailValue: '',
            label: 'Select User',
            type: 'select',
            uiType: 'select',
            uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
            required: true,
            options: [], // Will be populated dynamically
        },
        {
            name: 'contract_start',
            initailValue: '',
            label: 'Contract Start Date',
            type: 'date',
            uiType: 'date',
            uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
            required: true,
        },
        {
            name: 'salary',
            initailValue: '',
            label: 'Monthly Salary (UGX)',
            type: 'number',
            uiType: 'number',
            uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
            required: true,
        },
    ];
};
