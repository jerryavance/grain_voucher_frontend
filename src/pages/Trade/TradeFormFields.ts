// TradeFormFields.ts
import { IFormField } from "../../utils/form_factory";
import { TOption } from "../../@types/common";

export const PAYMENT_TERMS_OPTIONS: TOption[] = [
  { label: 'Cash on Delivery', value: 'cash_on_delivery' },
  { label: '24 Hours', value: '24_hours' },
  { label: '7 Days', value: '7_days' },
  { label: '14 Days', value: '14_days' },
  { label: '30 Days', value: '30_days' },
  { label: 'Custom Terms', value: 'custom' },
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
  isUpdate?: boolean;
}

export const TradeFormFields = (props: ITradeFormFieldsProps): IFormField[] => {
  const { hubs, grainTypes, qualityGrades, buyers, isUpdate = false } = props;

  const fields: IFormField[] = [
    // Basic Information Section
    {
      name: 'buyer_id',
      initailValue: '',
      label: 'Buyer',
      type: 'select',
      uiType: 'select',
      options: buyers,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'hub_id',
      initailValue: '',
      label: 'Hub/Warehouse',
      type: 'select',
      uiType: 'select',
      options: hubs,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'grain_type_id',
      initailValue: '',
      label: 'Grain Type',
      type: 'select',
      uiType: 'select',
      options: grainTypes,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'quality_grade_id',
      initailValue: '',
      label: 'Quality Grade',
      type: 'select',
      uiType: 'select',
      options: qualityGrades,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },

    // Quantity Section
    {
      name: 'quantity_kg',
      initailValue: '',
      label: 'Quantity (KG)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
      required: true,
    },
    {
      name: 'quantity_bags',
      initailValue: '',
      label: 'Number of Bags',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
    },
    {
      name: 'bag_weight_kg',
      initailValue: '100.00',
      label: 'Bag Weight (KG)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
    },

    // Pricing Section
    {
      name: 'purchase_price_per_kg',
      initailValue: '',
      label: 'Purchase Price per KG',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'buyer_price_per_kg',
      initailValue: '',
      label: 'Selling Price per KG',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },

    // Direct Costs Section
    {
      name: 'aflatoxin_qa_cost',
      initailValue: '0.00',
      label: 'Aflatoxin/QA Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'weighbridge_cost',
      initailValue: '0.00',
      label: 'Weighbridge Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'loading_cost',
      initailValue: '0.00',
      label: 'Loading Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'offloading_cost',
      initailValue: '0.00',
      label: 'Offloading Cost',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'transport_cost_per_kg',
      initailValue: '0.00',
      label: 'Transport Cost per KG',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'other_costs',
      initailValue: '0.00',
      label: 'Other Costs',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },

    // Percentage-based Costs
    {
      name: 'financing_fee_percentage',
      initailValue: '0.00',
      label: 'Financing Fee (%)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'financing_days',
      initailValue: '0',
      label: 'Financing Days',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'git_insurance_percentage',
      initailValue: '0.30',
      label: 'GIT Insurance (%)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'deduction_percentage',
      initailValue: '0.00',
      label: 'Deductions (%)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },

    // Logistics & Delivery
    {
      name: 'delivery_location',
      initailValue: '',
      label: 'Delivery Location',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: true,
    },
    {
      name: 'delivery_distance_km',
      initailValue: '',
      label: 'Delivery Distance (KM)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'expected_delivery_date',
      initailValue: '',
      label: 'Expected Delivery Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },

    // Transport Details
    {
      name: 'vehicle_number',
      initailValue: '',
      label: 'Vehicle Number',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'driver_name',
      initailValue: '',
      label: 'Driver Name',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'driver_phone',
      initailValue: '',
      label: 'Driver Phone',
      type: 'tel',
      uiType: 'phone',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'driver_id',
      initailValue: '',
      label: 'Driver ID Number',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },

    // Payment Terms
    {
      name: 'payment_terms',
      initailValue: '24_hours',
      label: 'Payment Terms',
      type: 'select',
      uiType: 'select',
      options: PAYMENT_TERMS_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      required: true,
    },
    {
      name: 'payment_terms_days',
      initailValue: '1',
      label: 'Payment Terms (Days)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      name: 'credit_terms_days',
      initailValue: '0',
      label: 'Credit Terms (Days)',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },

    // Notes
    {
      name: 'remarks',
      initailValue: '',
      label: 'Remarks',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      name: 'internal_notes',
      initailValue: '',
      label: 'Internal Notes',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      name: 'contract_notes',
      initailValue: '',
      label: 'Contract Terms & Conditions',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
  ];

  return fields;
};