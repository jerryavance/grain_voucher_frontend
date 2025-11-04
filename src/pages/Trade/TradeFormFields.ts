// TradeFormFields.ts - UPDATED with clearer invoice information
import { IFormField } from "../../utils/form_factory";
import { TOption } from "../../@types/common";

export const PAYMENT_TERMS_OPTIONS = [
  { 
    label: 'Cash on Delivery (Invoice: Immediate)', 
    value: 'cash_on_delivery',
    days: 0,
    invoiceType: 'immediate',
    invoiceSchedule: 'Generated immediately on GRN submission',
    description: 'Payment due immediately on delivery. Invoice created instantly when GRN is submitted.'
  },
  { 
    label: '24 Hours (Invoice: Immediate)', 
    value: '24_hours',
    days: 1,
    invoiceType: 'immediate',
    invoiceSchedule: 'Generated immediately on GRN submission',
    description: 'Payment due in 1 day. Invoice created instantly when GRN is submitted.'
  },
  { 
    label: '7 Days (Invoice: Immediate)', 
    value: '7_days',
    days: 7,
    invoiceType: 'immediate',
    invoiceSchedule: 'Generated immediately on GRN submission',
    description: 'Payment due in 7 days. Invoice created instantly when GRN is submitted.'
  },
  { 
    label: '14 Days (Invoice: Twice Weekly - Wed & Sun)', 
    value: '14_days',
    days: 14,
    invoiceType: 'twice_weekly',
    invoiceSchedule: 'Consolidated twice weekly (Mon-Wed, Thu-Sun periods)',
    description: 'Payment due in 14 days. Invoices consolidated and generated Wed 6PM & Sun 6PM.'
  },
  { 
    label: '30 Days (Invoice: Weekly - Every Saturday)', 
    value: '30_days',
    days: 30,
    invoiceType: 'weekly',
    invoiceSchedule: 'Consolidated weekly (Sun-Sat period)',
    description: 'Payment due in 30 days. Invoices consolidated and generated every Saturday at 6PM.'
  },
  { 
    label: 'Custom Terms (Invoice: Monthly)', 
    value: 'custom',
    days: null,
    invoiceType: 'custom',
    invoiceSchedule: 'Consolidated monthly (End of month)',
    description: 'Custom payment terms. Invoices consolidated and generated at end of each month.'
  },
];

export const STATUS_OPTIONS: TOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending Allocation', value: 'pending_allocation' },
  { label: 'Allocated', value: 'allocated' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
];

interface ITradeFormFieldsProps {
  hubs: TOption[];
  grainTypes: TOption[];
  qualityGrades: TOption[];
  buyers: TOption[];
  suppliers: TOption[];
  isUpdate?: boolean;
}

export const TradeFormFields = (props: ITradeFormFieldsProps): IFormField[] => {
  const { hubs, grainTypes, qualityGrades, buyers, suppliers, isUpdate = false } = props;

  const fields: IFormField[] = [
    // Basic Information Section
    {
      name: 'buyer_id',
      initailValue: '',
      label: 'Buyer',
      type: 'select',
      uiType: 'select',
      options: buyers,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'supplier_id',
      initailValue: '',
      label: 'Primary Supplier/Farmer',
      type: 'select',
      uiType: 'select',
      options: suppliers,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'hub_id',
      initailValue: '',
      label: 'Hub/Warehouse',
      type: 'select',
      uiType: 'select',
      options: hubs,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'grain_type_id',
      initailValue: '',
      label: 'Grain Type',
      type: 'select',
      uiType: 'select',
      options: grainTypes,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'quality_grade_id',
      initailValue: '',
      label: 'Quality Grade',
      type: 'select',
      uiType: 'select',
      options: qualityGrades,
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    },

    // Quantity Section
    {
      name: 'gross_tonnage',
      initailValue: '',
      label: 'Gross Tonnage (MT)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
      required: true,
    },
    {
      name: 'net_tonnage',
      initailValue: '',
      label: 'Net Tonnage (MT)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
      required: true,
    },
    {
      name: 'quantity_bags',
      initailValue: '',
      label: 'Number of Bags',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    },
    {
      name: 'bag_weight_kg',
      initailValue: '100.00',
      label: 'Bag Weight (KG)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },

    // Pricing Section
    {
      name: 'buying_price',
      initailValue: '',
      label: 'Buying Price per KG (from supplier)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'selling_price',
      initailValue: '',
      label: 'Selling Price per KG (to buyer)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },

    // Direct Costs Section
    {
      name: 'aflatoxin_qa_cost',
      initailValue: '0.00',
      label: 'Aflatoxin/QA Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'weighbridge_cost',
      initailValue: '0.00',
      label: 'Weighbridge Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'loading_cost',
      initailValue: '0.00',
      label: 'Loading Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'offloading_cost',
      initailValue: '0.00',
      label: 'Offloading Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'transport_cost_per_kg',
      initailValue: '0.00',
      label: 'Transport Cost per KG',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'other_expenses',
      initailValue: '0.00',
      label: 'Other Expenses',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'amsaf_fees',
      initailValue: '0.00',
      label: 'AMSAF Fees',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },

    // Percentage-based Costs
    {
      name: 'financing_fee_percentage',
      initailValue: '0.00',
      label: 'Financing Fee (%)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'financing_days',
      initailValue: '0',
      label: 'Financing Days',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'git_insurance_percentage',
      initailValue: '0.30',
      label: 'GIT Insurance (%)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'deduction_percentage',
      initailValue: '0.00',
      label: 'Deductions (%)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },

    // Investor Financing
    {
      name: 'requires_financing',
      initailValue: false,
      label: 'Requires Investor Financing',
      type: 'checkbox',
      uiType: 'checkbox',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },

    // Logistics & Delivery
    {
      name: 'delivery_location',
      initailValue: '',
      label: 'Delivery Location',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    },
    {
      name: 'delivery_distance_km',
      initailValue: '',
      label: 'Delivery Distance (KM)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'delivery_date',
      initailValue: '',
      label: 'Delivery Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'expected_delivery_date',
      initailValue: '',
      label: 'Expected Delivery Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },

    // Transport Details
    {
      name: 'vehicle_number',
      initailValue: '',
      label: 'Vehicle Number',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'driver_name',
      initailValue: '',
      label: 'Driver Name',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'driver_phone',
      initailValue: '',
      label: 'Driver Phone',
      type: 'tel',
      uiType: 'phone',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'driver_id',
      initailValue: '',
      label: 'Driver ID Number',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },

    // Payment Terms - THIS IS THE KEY SECTION
    {
      name: 'payment_terms',
      initailValue: '24_hours',
      label: 'Payment Terms & Invoice Schedule (This determines when and how invoices will be generated after delivery)',
      type: 'select',
      uiType: 'select',
      options: PAYMENT_TERMS_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
      // helperText: 'This determines when and how invoices will be generated after delivery'
    },
    {
      name: 'payment_terms_days',
      initailValue: '1',
      label: 'Payment Terms (Days) (Auto-filled based on payment terms selected)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      // helperText: 'Auto-filled based on payment terms selected'
    },
    {
      name: 'payment_due_date',
      initailValue: '',
      label: 'Payment Due Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'credit_terms_days',
      initailValue: '0',
      label: 'Credit Terms (Days)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },

    // Notes
    {
      name: 'remarks',
      initailValue: '',
      label: 'Remarks',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },
    {
      name: 'internal_notes',
      initailValue: '',
      label: 'Internal Notes',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },
    {
      name: 'contract_notes',
      initailValue: '',
      label: 'Contract Terms & Conditions',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },
  ];

  return fields;
};

// Helper function to get invoice info from payment terms
export const getInvoiceInfoFromPaymentTerms = (paymentTermsValue: string) => {
  const option = PAYMENT_TERMS_OPTIONS.find(opt => opt.value === paymentTermsValue);
  return option || PAYMENT_TERMS_OPTIONS[1]; // Default to 24_hours
};