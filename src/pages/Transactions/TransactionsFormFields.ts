
import * as Yup from 'yup';
import { IFormField } from '../../utils/form_factory';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_DEPOSIT, TRANSACTION_TYPE_WITHDRAWAL } from '../../api/constants';


export const TransactionFormFields = ({transaction_type, participants}: {transaction_type: string, participants: any[]}): IFormField[] => [
    {
        name: 'transaction_type',
        initailValue: transaction_type,
        label: 'Transactions Type',
        type: 'select',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'select',
        options: TRANSACTION_TYPES
    },
    {
        name: 'amount',
        initailValue: '',
        label: 'Amount',
        type: 'number',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'input'
    },
    {
        name: 'status',
        initailValue: '',
        label: 'Status',
        type: 'select',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'select',
        options: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']
    },
    {
        name: "participant",
        initailValue: '',
        label:  transaction_type === TRANSACTION_TYPE_WITHDRAWAL? "Team": "Judge",
        type: 'select',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'select',
        options: (participants || [])
    },
    {
        name: 'reason',
        initailValue: '',
        label: 'Reason',
        type: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        uiType: 'textarea'
    },
]


export const TransactionFormValidations = Yup.object().shape({
    transaction_type: Yup.string().required('Judge marks is required'),
    amount: Yup.number().required('Amount is required'),
    status: Yup.string().required('Status is required'),
    participant: Yup.number().required('This field is required'),
    reason: Yup.string().required('This field is required'),
})