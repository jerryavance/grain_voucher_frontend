// src/pages/Reports/utils/ScheduleFormFields.ts
import { IFormField } from "../../utils/form_factory";

const REPORT_TYPE_OPTIONS = [
  { label: 'Supplier Report', value: 'supplier' },
  { label: 'Trade Report', value: 'trade' },
  { label: 'Invoice Report', value: 'invoice' },
  { label: 'Payment Report', value: 'payment' },
  { label: 'Depositor Report', value: 'depositor' },
  { label: 'Voucher Report', value: 'voucher' },
  { label: 'Inventory Report', value: 'inventory' },
  { label: 'Investor Report', value: 'investor' },
];

const FORMAT_OPTIONS = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
  { label: 'CSV', value: 'csv' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

const DAY_OF_WEEK_OPTIONS = [
  { label: 'Monday', value: 0 },
  { label: 'Tuesday', value: 1 },
  { label: 'Wednesday', value: 2 },
  { label: 'Thursday', value: 3 },
  { label: 'Friday', value: 4 },
  { label: 'Saturday', value: 5 },
  { label: 'Sunday', value: 6 },
];

export const ScheduleFormFields = (): IFormField[] => {
  return [
    {
      name: 'name',
      initailValue: '',
      label: 'Schedule Name',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    },
    {
      name: 'report_type',
      initailValue: '',
      label: 'Report Type',
      type: 'select',
      uiType: 'select',
      options: REPORT_TYPE_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: true,
    },
    {
      name: 'format',
      initailValue: 'pdf',
      label: 'Export Format',
      type: 'select',
      uiType: 'select',
      options: FORMAT_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: true,
    },
    {
      name: 'frequency',
      initailValue: '',
      label: 'Frequency',
      type: 'select',
      uiType: 'select',
      options: FREQUENCY_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: true,
    },
    {
      name: 'day_of_week',
      initailValue: '',
      label: 'Day of Week (for weekly)',
      type: 'select',
      uiType: 'select',
      options: DAY_OF_WEEK_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: false,
    },
    {
      name: 'day_of_month',
      initailValue: '',
      label: 'Day of Month (for monthly)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: false,
    },
    {
      name: 'time_of_day',
      initailValue: '09:00',
      label: 'Time of Day',
      type: 'time',
      uiType: 'time',
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: true,
    },
    {
      name: 'recipient_ids',
      initailValue: [],
      label: 'Recipients (User IDs)',
      type: 'text',
      uiType: 'multiselect',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
      options: [], // This should be populated with users from API
    },
    {
      name: 'hub_id',
      initailValue: '',
      label: 'Hub (Optional)',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: false,
    },
    {
      name: 'is_active',
      initailValue: true,
      label: 'Active',
      type: 'checkbox',
      uiType: 'checkbox',
      uiBreakpoints: { xs: 12, sm: 6, md: 6 },
      required: false,
    },
  ];
};