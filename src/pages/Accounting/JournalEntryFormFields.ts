import { IFormField } from "../../utils/form_factory";

export const JournalEntryFormFields = (trades: any[]): IFormField[] => {
  return [
    {
      name: 'description',
      initailValue: '',
      label: 'Description',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: true,
    },
    {
      name: 'debit_account',
      initailValue: '',
      label: 'Debit Account',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'credit_account',
      initailValue: '',
      label: 'Credit Account',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
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
      name: 'date',
      initailValue: new Date().toISOString().split('T')[0],
      label: 'Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'related_trade_id',
      initailValue: '',
      label: 'Related Trade (Optional)',
      type: 'select',
      uiType: 'select',
      options: trades.map(trade => ({
        label: trade.trade_number || `Trade ${trade.id}`,
        value: trade.id
      })),
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: false,
    },
  ];
};