import { IFormField } from "../../utils/form_factory";

export const InvoiceFormFields = (accounts: any[], trades: any[]): IFormField[] => {
  return [
    {
      name: 'account_id',
      initailValue: '',
      label: 'Account',
      type: 'select',
      uiType: 'select',
      options: accounts.map(account => ({
        label: account.name,
        value: account.id
      })),
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'trade_id',
      initailValue: '',
      label: 'Trade (Optional)',
      type: 'select',
      uiType: 'select',
      options: trades.map(trade => ({
        label: trade.trade_number || `Trade ${trade.id}`,
        value: trade.id
      })),
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: false,
    },
    {
      name: 'amount',
      initailValue: '',
      label: 'Amount',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'due_date',
      initailValue: '',
      label: 'Due Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'status',
      initailValue: 'draft',
      label: 'Status',
      type: 'select',
      uiType: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
      ],
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
  ];
};