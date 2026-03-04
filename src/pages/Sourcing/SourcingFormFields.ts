// ============================================================
// SOURCING FORM FIELDS
// CHANGES:
//  - WeighbridgeRecordFormFields: removed moisture_level, quality_grade; added vehicle_number
//  - SourceOrderFormFields: added trade_type, loading_cost, offloading_cost
//  - NEW: AggregatorTradeCostFormFields
//  - NEW: RejectedLotFormFields
// ============================================================

import { IFormField } from "../../utils/form_factory";
import { TOption } from "../../@types/common";

// ============================================================
// SUPPLIER PROFILE FORM FIELDS
// ============================================================
export const SupplierProfileFormFields = (
  users: TOption[],
  hubs: TOption[],
  grainTypes: TOption[],
  handleUserSearch?: (value: any) => void,
  handleHubSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'user',
    initailValue: '',
    label: 'User Account *',
    type: 'select',
    uiType: 'select',
    options: users,
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
    handleSearch: handleUserSearch,
  },
  {
    name: 'business_name',
    initailValue: '',
    label: 'Business Name *',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'hub',
    initailValue: '',
    label: 'Primary Hub',
    type: 'select',
    uiType: 'select',
    options: hubs,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    handleSearch: handleHubSearch,
  },
  {
    name: 'farm_location',
    initailValue: '',
    label: 'Farm Location',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 2,
  },
  {
    name: 'typical_grain_type',
    initailValue: '',
    label: 'Grain Types Supplied',
    type: 'select',
    uiType: 'select',
    options: grainTypes,
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
  }
];

// ============================================================
// SOURCE ORDER FORM FIELDS
// UPDATED: added trade_type, loading_cost, offloading_cost
// ============================================================
export const SourceOrderFormFields = (
  suppliers: TOption[],
  hubs: TOption[],
  grainTypes: TOption[],
  paymentMethods: TOption[],
  handleSupplierSearch?: (value: any) => void,
  handleHubSearch?: (value: any) => void,
  handleGrainTypeSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'supplier',
    initailValue: '',
    label: 'Supplier *',
    type: 'select',
    uiType: 'select',
    options: suppliers,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
    handleSearch: handleSupplierSearch,
  },
  {
    name: 'hub',
    initailValue: '',
    label: 'Destination Hub *',
    type: 'select',
    uiType: 'select',
    options: hubs,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
    handleSearch: handleHubSearch,
  },
  {
    name: 'grain_type',
    initailValue: '',
    label: 'Grain Type *',
    type: 'select',
    uiType: 'select',
    options: grainTypes,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
    handleSearch: handleGrainTypeSearch,
  },
  // NEW: Trade type
  {
    name: 'trade_type',
    initailValue: 'direct',
    label: 'Trade Type *',
    type: 'select',
    uiType: 'select',
    options: [
      { value: 'direct', label: 'Direct Purchase' },
      { value: 'aggregator', label: 'Aggregator Trade' },
    ],
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'quantity_kg',
    initailValue: '',
    label: 'Quantity (kg) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'offered_price_per_kg',
    initailValue: '',
    label: 'Price per kg (UGX) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'weighbridge_cost',
    initailValue: 0,
    label: 'Weighbridge Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'logistics_cost',
    initailValue: 0,
    label: 'Logistics Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  // NEW: Loading cost
  {
    name: 'loading_cost',
    initailValue: 0,
    label: 'Loading Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  // NEW: Offloading cost
  {
    name: 'offloading_cost',
    initailValue: 0,
    label: 'Offloading Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'handling_cost',
    initailValue: 0,
    label: 'Handling Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'other_costs',
    initailValue: 0,
    label: 'Other Costs (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'payment_method_id',
    initailValue: '',
    label: 'Payment Method (Optional)',
    type: 'select',
    uiType: 'select',
    options: paymentMethods,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'logistics_type',
    initailValue: '',
    label: 'Logistics Type',
    type: 'select',
    uiType: 'select',
    options: [
      { value: 'bennu_truck', label: 'Bennu Truck' },
      { value: 'supplier_driver', label: 'Supplier Driver' },
      { value: 'third_party', label: 'Third Party Logistics' },
    ],
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
    name: 'expected_delivery_date',
    initailValue: '',
    label: 'Expected Delivery Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 3,
  },
];

// ============================================================
// DELIVERY RECORD FORM FIELDS
// ============================================================
export const DeliveryRecordFormFields = (
  sourceOrders: TOption[],
  hubs: TOption[],
  handleOrderSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'source_order',
    initailValue: '',
    label: 'Source Order *',
    type: 'select',
    uiType: 'select',
    options: sourceOrders,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
    handleSearch: handleOrderSearch,
  },
  {
    name: 'hub',
    initailValue: '',
    label: 'Hub *',
    type: 'select',
    uiType: 'select',
    options: hubs,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'driver_name',
    initailValue: '',
    label: 'Driver Name *',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'vehicle_number',
    initailValue: '',
    label: 'Vehicle Number *',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'apparent_condition',
    initailValue: 'good',
    label: 'Apparent Condition',
    type: 'select',
    uiType: 'select',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' },
    ],
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 3,
  },
];

// ============================================================
// WEIGHBRIDGE RECORD FORM FIELDS
// UPDATED: removed moisture_level, quality_grade; added vehicle_number
// Quality/moisture moved to Quality Management module
// ============================================================
export const WeighbridgeRecordFormFields = (
  sourceOrders: TOption[],
  deliveries: TOption[],
  handleOrderSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'source_order',
    initailValue: '',
    label: 'Source Order *',
    type: 'select',
    uiType: 'select',
    options: sourceOrders,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
    handleSearch: handleOrderSearch,
  },
  {
    name: 'delivery',
    initailValue: '',
    label: 'Delivery Record *',
    type: 'select',
    uiType: 'select',
    options: deliveries,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  // NEW: vehicle_number (auto-filled from delivery label, editable)
  {
    name: 'vehicle_number',
    initailValue: '',
    label: 'Vehicle Number *',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'gross_weight_kg',
    initailValue: '',
    label: 'Gross Weight (kg) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'tare_weight_kg',
    initailValue: 0,
    label: 'Tare Weight (kg)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 3,
  },
];

// ============================================================
// SUPPLIER PAYMENT FORM FIELDS
// ============================================================
export const SupplierPaymentFormFields = (
  invoices: TOption[]
): IFormField[] => [
  {
    name: 'supplier_invoice',
    initailValue: '',
    label: 'Supplier Invoice *',
    type: 'select',
    uiType: 'select',
    options: invoices,
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
  },
  {
    name: 'amount',
    initailValue: '',
    label: 'Payment Amount (UGX) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'method',
    initailValue: '',
    label: 'Payment Method *',
    type: 'select',
    uiType: 'select',
    options: [
      { value: 'mobile_money', label: 'Mobile Money' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash' },
      { value: 'check', label: 'Bank Check' },
    ],
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'reference_number',
    initailValue: '',
    label: 'Payment Reference Number *',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
  },
  {
    name: 'status',
    initailValue: 'pending',
    label: 'Status',
    type: 'select',
    uiType: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' },
    ],
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 3,
  },
];

// ============================================================
// PAYMENT PREFERENCE FORM FIELDS (keep as-is)
// ============================================================
export const PaymentPreferenceFormFields = (
  method: string
): IFormField[] => {
  const baseFields: IFormField[] = [
    {
      name: 'method',
      initailValue: '',
      label: 'Payment Method *',
      type: 'select',
      uiType: 'select',
      options: [
        { value: 'mobile_money', label: 'Mobile Money' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'cash', label: 'Cash Pickup' },
        { value: 'check', label: 'Bank Check' },
      ],
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    },
  ];

  if (method === 'mobile_money') {
    baseFields.push({
      name: 'phone',
      initailValue: '',
      label: 'Mobile Money Phone Number *',
      type: 'tel',
      uiType: 'phone',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    });
  } else if (method === 'bank_transfer') {
    baseFields.push(
      {
        name: 'account_number',
        initailValue: '',
        label: 'Account Number *',
        type: 'text',
        uiType: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6 },
        required: true,
      },
      {
        name: 'bank_name',
        initailValue: '',
        label: 'Bank Name *',
        type: 'text',
        uiType: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6 },
        required: true,
      },
      {
        name: 'account_name',
        initailValue: '',
        label: 'Account Name',
        type: 'text',
        uiType: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      }
    );
  }

  return baseFields;
};

// ============================================================
// NEW: AGGREGATOR TRADE COST FORM FIELDS
// Used when recording post-delivery aggregator tonnage/costs
// ============================================================
export const AggregatorTradeCostFormFields = (
  sourceOrders: TOption[],
  handleOrderSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'source_order',
    initailValue: '',
    label: 'Source Order (Aggregator) *',
    type: 'select',
    uiType: 'select',
    options: sourceOrders,
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
    handleSearch: handleOrderSearch,
  },
  {
    name: 'source_quantity_kg',
    initailValue: '',
    label: 'Source Quantity (kg) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'arrived_quantity_kg',
    initailValue: '',
    label: 'Arrived Quantity (kg) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'buyer_deduction_kg',
    initailValue: 0,
    label: 'Buyer Deduction (kg)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'buyer_deduction_reason',
    initailValue: '',
    label: 'Buyer Deduction Reason',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'destination_weighbridge_cost',
    initailValue: 0,
    label: 'Destination Weighbridge Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
  },
  {
    name: 'transit_insurance_cost',
    initailValue: 0,
    label: 'Transit Insurance Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
  },
  {
    name: 'other_destination_costs',
    initailValue: 0,
    label: 'Other Destination Costs (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 3,
  },
];

// ============================================================
// NEW: REJECTED LOT FORM FIELDS
// ============================================================
export const RejectedLotFormFields = (
  saleLots: TOption[]
): IFormField[] => [
  {
    name: 'sale_lot',
    initailValue: '',
    label: 'Sale Lot *',
    type: 'select',
    uiType: 'select',
    options: saleLots,
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
  },
  {
    name: 'rejected_quantity_kg',
    initailValue: '',
    label: 'Rejected Quantity (kg) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'rejection_reason',
    initailValue: 'quality',
    label: 'Rejection Reason *',
    type: 'select',
    uiType: 'select',
    options: [
      { value: 'quality', label: 'Quality Issues' },
      { value: 'moisture', label: 'High Moisture' },
      { value: 'contamination', label: 'Contamination' },
      { value: 'weight_short', label: 'Weight Shortage' },
      { value: 'pest_damage', label: 'Pest Damage' },
      { value: 'wrong_variety', label: 'Wrong Variety' },
      { value: 'other', label: 'Other' },
    ],
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'rejection_details',
    initailValue: '',
    label: 'Rejection Details *',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 2,
    required: true,
  },
  {
    name: 'rejection_date',
    initailValue: new Date().toISOString().split('T')[0],
    label: 'Rejection Date *',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'disposal_cost',
    initailValue: 0,
    label: 'Disposal Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'restocking_cost',
    initailValue: 0,
    label: 'Restocking Cost (UGX)',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'notes',
    initailValue: '',
    label: 'Notes',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    multiline: true,
    rows: 3,
  },
];