import { IFormField } from "../../utils/form_factory";

export const InvestorAccountFormFields = (investorOptions: { label: string; value: string }[] = []): IFormField[] => {
  return [
    {
      name: "investor_id",
      initailValue: "",
      label: "Investor",
      type: "select",
      uiType: "select",
      options: investorOptions,
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: true,
    },
  ];
};

export const DepositFormFields = (investorAccountOptions: { label: string; value: string }[] = []): IFormField[] => [
  {
    name: 'investor_account_id',
    initailValue: '',
    label: 'Investor Account',
    type: 'select',
    uiType: 'select',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    required: true,
    options: investorAccountOptions,
  },
  {
    name: 'amount',
    initailValue: '',
    label: 'Deposit Amount (UGX)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    required: true,
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    rows: 3,
  },
];

export const WithdrawalFormFields = (investorAccountOptions: { label: string; value: string }[] = []): IFormField[] => [
  {
    name: 'investor_account_id',
    initailValue: '',
    label: 'Investor Account',
    type: 'select',
    uiType: 'select',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    required: true,
    options: investorAccountOptions,
  },
  {
    name: 'amount',
    initailValue: '',
    label: 'Withdrawal Amount (UGX)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    required: true,
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    rows: 3,
  },
];

export const ProfitAgreementFormFields = (investorAccountOptions: { label: string; value: string }[] = []): IFormField[] => [
  {
    name: 'investor_account_id',
    initailValue: '',
    label: 'Investor Account',
    type: 'select',
    uiType: 'select',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    required: true,
    options: investorAccountOptions,
  },
  {
    name: 'profit_threshold',
    initailValue: '2.00',
    label: 'Profit Threshold (%)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    required: true,
  },
  {
    name: 'investor_share',
    initailValue: '75.00',
    label: 'Investor Share (%)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    required: true,
  },
  {
    name: 'amsaf_share',
    initailValue: '25.00',
    label: 'AMSAF Share (%)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    required: true,
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    rows: 3,
  },
];