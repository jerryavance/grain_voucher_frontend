
import { IFormField } from "../../utils/form_factory";

export const PayslipFormFields = (): IFormField[] => {
    return [
        {
            name: 'employee_id',
            initailValue: '',
            label: 'Select Employee',
            type: 'select',
            uiType: 'select',
            uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
            required: true,
            options: [], // Will be populated dynamically
        },
        {
            name: 'period',
            initailValue: '',
            label: 'Payroll Period',
            type: 'date',
            uiType: 'date',
            uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
            required: true,
        },
        {
            name: 'gross_earnings',
            initailValue: '',
            label: 'Gross Earnings (UGX)',
            type: 'number',
            uiType: 'number',
            uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
            required: true,
        },
        {
            name: 'deductions',
            initailValue: '',
            label: 'Total Deductions (UGX)',
            type: 'number',
            uiType: 'number',
            uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
            required: true,
        },
    ];
};