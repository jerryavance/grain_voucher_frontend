// src/pages/Reports/utils/ReportFormFields.ts
import { IFormField } from "../../utils/form_factory";
import { TReportType } from "./Reports.interface";

const FORMAT_OPTIONS = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
  { label: 'CSV', value: 'csv' },
];

const TRADE_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending Allocation', value: 'pending_allocation' },
  { label: 'Ready for Delivery', value: 'ready_for_delivery' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Other', value: 'other' },
];

const VOUCHER_STATUS_OPTIONS = [
  { label: 'Pending Verification', value: 'pending_verification' },
  { label: 'Issued', value: 'issued' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Redeemed', value: 'redeemed' },
  { label: 'Expired', value: 'expired' },
];

const VERIFICATION_STATUS_OPTIONS = [
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
];

const BASE_FIELDS: IFormField[] = [
  {
    name: 'format',
    initailValue: 'pdf',
    label: 'Export Format',
    type: 'select',
    uiType: 'select',
    options: FORMAT_OPTIONS,
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
  },
  {
    name: 'start_date',
    initailValue: '',
    label: 'Start Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 6, md: 6 },
    required: false,
  },
  {
    name: 'end_date',
    initailValue: '',
    label: 'End Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 6, md: 6 },
    required: false,
  },
];

export const getReportFormFields = (reportType: TReportType): IFormField[] => {
  const fields = [...BASE_FIELDS];

  switch (reportType) {
    case 'supplier':
      fields.push(
        {
          name: 'supplier_id',
          initailValue: '',
          label: 'Specific Supplier (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'grain_type_id',
          initailValue: '',
          label: 'Grain Type (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'min_total_supplied',
          initailValue: '',
          label: 'Minimum Total Supplied (kg)',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;

    case 'trade':
      fields.push(
        {
          name: 'status',
          initailValue: [],
          label: 'Trade Status',
          type: 'multiselect',
          uiType: 'multiselect',
          options: TRADE_STATUS_OPTIONS,
          uiBreakpoints: { xs: 12, sm: 12, md: 12 },
          required: false,
        },
        {
          name: 'buyer_id',
          initailValue: '',
          label: 'Buyer ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'supplier_id',
          initailValue: '',
          label: 'Supplier ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'min_value',
          initailValue: '',
          label: 'Minimum Value',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'max_value',
          initailValue: '',
          label: 'Maximum Value',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;

    case 'invoice':
      fields.push(
        {
          name: 'payment_status',
          initailValue: [],
          label: 'Payment Status',
          type: 'multiselect',
          uiType: 'multiselect',
          options: PAYMENT_STATUS_OPTIONS,
          uiBreakpoints: { xs: 12, sm: 12, md: 12 },
          required: false,
        },
        {
          name: 'account_id',
          initailValue: '',
          label: 'Account ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'min_amount',
          initailValue: '',
          label: 'Minimum Amount',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'overdue_only',
          initailValue: false,
          label: 'Overdue Only',
          type: 'checkbox',
          uiType: 'checkbox',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;

    case 'payment':
      fields.push(
        {
          name: 'payment_method',
          initailValue: [],
          label: 'Payment Method',
          type: 'multiselect',
          uiType: 'multiselect',
          options: PAYMENT_METHOD_OPTIONS,
          uiBreakpoints: { xs: 12, sm: 12, md: 12 },
          required: false,
        },
        {
          name: 'account_id',
          initailValue: '',
          label: 'Account ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'min_amount',
          initailValue: '',
          label: 'Minimum Amount',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;

    case 'depositor':
      fields.push(
        {
          name: 'farmer_id',
          initailValue: '',
          label: 'Farmer ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'grain_type_id',
          initailValue: '',
          label: 'Grain Type ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'validated_only',
          initailValue: false,
          label: 'Validated Deposits Only',
          type: 'checkbox',
          uiType: 'checkbox',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'min_total_quantity',
          initailValue: '',
          label: 'Minimum Total Quantity (kg)',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;

    case 'voucher':
      fields.push(
        {
          name: 'status',
          initailValue: [],
          label: 'Voucher Status',
          type: 'multiselect',
          uiType: 'multiselect',
          options: VOUCHER_STATUS_OPTIONS,
          uiBreakpoints: { xs: 12, sm: 12, md: 12 },
          required: false,
        },
        {
          name: 'verification_status',
          initailValue: [],
          label: 'Verification Status',
          type: 'multiselect',
          uiType: 'multiselect',
          options: VERIFICATION_STATUS_OPTIONS,
          uiBreakpoints: { xs: 12, sm: 12, md: 12 },
          required: false,
        },
        {
          name: 'holder_id',
          initailValue: '',
          label: 'Holder ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'grain_type_id',
          initailValue: '',
          label: 'Grain Type ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;

    case 'inventory':
      fields.push(
        {
          name: 'grain_type_id',
          initailValue: '',
          label: 'Grain Type ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'min_quantity',
          initailValue: '',
          label: 'Minimum Quantity (kg)',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'low_stock_only',
          initailValue: false,
          label: 'Low Stock Only',
          type: 'checkbox',
          uiType: 'checkbox',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;

    case 'investor':
      fields.push(
        {
          name: 'investor_id',
          initailValue: '',
          label: 'Investor ID (Optional)',
          type: 'text',
          uiType: 'text',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'min_total_invested',
          initailValue: '',
          label: 'Minimum Total Invested',
          type: 'number',
          uiType: 'number',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        },
        {
          name: 'include_performance',
          initailValue: true,
          label: 'Include Performance Metrics',
          type: 'checkbox',
          uiType: 'checkbox',
          uiBreakpoints: { xs: 12, sm: 6, md: 6 },
          required: false,
        }
      );
      break;
  }

  // Add hub filter for all reports
  fields.push({
    name: 'hub_id',
    initailValue: '',
    label: 'Hub (Optional)',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 6, md: 6 },
    required: false,
  });

  return fields;
};