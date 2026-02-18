// ============================================================
// SOURCING FORM FIELDS - FIXED VERSION
// Field names now have _id suffix to match backend serializers
// ============================================================

import { IFormField } from "../../utils/form_factory";
import { TOption } from "../../@types/common";

// ============================================================
// SUPPLIER PROFILE FORM FIELDS
// Backend expects: user, hub, typical_grain_type
// ============================================================

export const SupplierProfileFormFields = (
  users: TOption[],
  hubs: TOption[],
  grainTypes: TOption[],
  handleUserSearch?: (value: any) => void,
  handleHubSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'user', // ✅ FIXED: Added _id suffix
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
    name: 'hub', // ✅ FIXED: Added _id suffix
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
// Backend expects: supplier, hub, grain_type, payment_method_id
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
    name: 'supplier', // ✅ FIXED: Added _id suffix
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
    name: 'hub', // ✅ FIXED: Added _id suffix
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
    name: 'grain_type', // ✅ FIXED: Added _id suffix
    initailValue: '',
    label: 'Grain Type *',
    type: 'select',
    uiType: 'select',
    options: grainTypes,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
    handleSearch: handleGrainTypeSearch,
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
    name: 'payment_method_id', // ✅ FIXED: Added _id suffix
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
// Backend expects: source_order_id, hub
// ============================================================

export const DeliveryRecordFormFields = (
  sourceOrders: TOption[],
  hubs: TOption[],
  handleOrderSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'source_order_id', // ✅ FIXED: Added _id suffix
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
    name: 'hub', // ✅ FIXED: Added _id suffix
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
// Backend expects: source_order_id, delivery_id, quality_grade_id
// ============================================================

export const WeighbridgeRecordFormFields = (
  sourceOrders: TOption[],
  deliveries: TOption[],
  qualityGrades: TOption[],
  handleOrderSearch?: (value: any) => void
): IFormField[] => [
  {
    name: 'source_order_id', // ✅ FIXED: Added _id suffix
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
    name: 'delivery_id', // ✅ FIXED: Added _id suffix
    initailValue: '',
    label: 'Delivery Record *',
    type: 'select',
    uiType: 'select',
    options: deliveries,
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
    name: 'moisture_level',
    initailValue: '',
    label: 'Moisture Level (%) *',
    type: 'number',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'quality_grade_id', // ✅ FIXED: Added _id suffix
    initailValue: '',
    label: 'Quality Grade *',
    type: 'select',
    uiType: 'select',
    options: qualityGrades,
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
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
// Backend expects: supplier_invoice (direct PK field, no _id suffix)
// ============================================================

export const SupplierPaymentFormFields = (
  invoices: TOption[]
): IFormField[] => [
  {
    name: 'supplier_invoice', // ✅ CORRECT: No _id suffix (it's a PK field)
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
// PAYMENT PREFERENCE FORM FIELDS
// Backend expects: method, details (no _id fields)
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

  // Add method-specific fields
  if (method === 'mobile_money') {
    baseFields.push({
      name: 'details.phone',
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
        name: 'details.account_number',
        initailValue: '',
        label: 'Account Number *',
        type: 'text',
        uiType: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 12 },
        required: true,
      },
      {
        name: 'details.bank_name',
        initailValue: '',
        label: 'Bank Name *',
        type: 'text',
        uiType: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6 },
        required: true,
      },
      {
        name: 'details.account_name',
        initailValue: '',
        label: 'Account Name *',
        type: 'text',
        uiType: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6 },
        required: true,
      }
    );
  }

  // Add common fields at the end
  baseFields.push(
    {
      name: 'is_default',
      initailValue: false,
      label: 'Set as Default Payment Method',
      type: 'checkbox',
      uiType: 'checkbox',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'is_active',
      initailValue: true,
      label: 'Active',
      type: 'checkbox',
      uiType: 'checkbox',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    }
  );

  return baseFields;
};









// // ============================================================
// // SOURCING FORM FIELDS - FIXED VERSION
// // Field names now have _id suffix to match backend serializers
// // ============================================================

// import { IFormField } from "../../utils/form_factory";
// import { TOption } from "../../@types/common";

// // ============================================================
// // SUPPLIER PROFILE FORM FIELDS
// // Backend expects: user, hub, typical_grain_type
// // ============================================================

// export const SupplierProfileFormFields = (
//   users: TOption[],
//   hubs: TOption[],
//   grainTypes: TOption[],
//   handleUserSearch?: (value: any) => void,
//   handleHubSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'user', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'User Account *',
//     type: 'select',
//     uiType: 'select',
//     options: users,
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     required: true,
//     handleSearch: handleUserSearch,
//   },
//   {
//     name: 'business_name',
//     initailValue: '',
//     label: 'Business Name *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'hub', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Primary Hub',
//     type: 'select',
//     uiType: 'select',
//     options: hubs,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     handleSearch: handleHubSearch,
//   },
//   {
//     name: 'farm_location',
//     initailValue: '',
//     label: 'Farm Location',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 2,
//   },
//   {
//     name: 'typical_grain_type', // ✅ FIXED: Added _ids suffix for array
//     initailValue: [],
//     label: 'Grain Types Supplied',
//     type: 'select',
//     uiType: 'select-2',
//     options: grainTypes,
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//   }
// ];

// // ============================================================
// // SOURCE ORDER FORM FIELDS
// // Backend expects: supplier, hub, grain_type, payment_method_id
// // ============================================================

// export const SourceOrderFormFields = (
//   suppliers: TOption[],
//   hubs: TOption[],
//   grainTypes: TOption[],
//   paymentMethods: TOption[],
//   handleSupplierSearch?: (value: any) => void,
//   handleHubSearch?: (value: any) => void,
//   handleGrainTypeSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'supplier', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Supplier *',
//     type: 'select',
//     uiType: 'select',
//     options: suppliers,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleSupplierSearch,
//   },
//   {
//     name: 'hub', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Destination Hub *',
//     type: 'select',
//     uiType: 'select',
//     options: hubs,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleHubSearch,
//   },
//   {
//     name: 'grain_type', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Grain Type *',
//     type: 'select',
//     uiType: 'select',
//     options: grainTypes,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleGrainTypeSearch,
//   },
//   {
//     name: 'quantity_kg',
//     initailValue: '',
//     label: 'Quantity (kg) *',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'offered_price_per_kg',
//     initailValue: '',
//     label: 'Price per kg (UGX) *',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'weighbridge_cost',
//     initailValue: 0,
//     label: 'Weighbridge Cost (UGX)',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'logistics_cost',
//     initailValue: 0,
//     label: 'Logistics Cost (UGX)',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'handling_cost',
//     initailValue: 0,
//     label: 'Handling Cost (UGX)',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'other_costs',
//     initailValue: 0,
//     label: 'Other Costs (UGX)',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'payment_method_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Payment Method (Optional)',
//     type: 'select',
//     uiType: 'select',
//     options: paymentMethods,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'logistics_type',
//     initailValue: '',
//     label: 'Logistics Type',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'bennu_truck', label: 'Bennu Truck' },
//       { value: 'supplier_driver', label: 'Supplier Driver' },
//       { value: 'third_party', label: 'Third Party Logistics' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'driver_name',
//     initailValue: '',
//     label: 'Driver Name',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'driver_phone',
//     initailValue: '',
//     label: 'Driver Phone',
//     type: 'tel',
//     uiType: 'phone',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'expected_delivery_date',
//     initailValue: '',
//     label: 'Expected Delivery Date',
//     type: 'date',
//     uiType: 'date',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // DELIVERY RECORD FORM FIELDS
// // Backend expects: source_order_id, hub
// // ============================================================

// export const DeliveryRecordFormFields = (
//   sourceOrders: TOption[],
//   hubs: TOption[],
//   handleOrderSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'source_order_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Source Order *',
//     type: 'select',
//     uiType: 'select',
//     options: sourceOrders,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleOrderSearch,
//   },
//   {
//     name: 'hub', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Hub *',
//     type: 'select',
//     uiType: 'select',
//     options: hubs,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'driver_name',
//     initailValue: '',
//     label: 'Driver Name *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'vehicle_number',
//     initailValue: '',
//     label: 'Vehicle Number *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'apparent_condition',
//     initailValue: 'good',
//     label: 'Apparent Condition',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'good', label: 'Good' },
//       { value: 'fair', label: 'Fair' },
//       { value: 'poor', label: 'Poor' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // WEIGHBRIDGE RECORD FORM FIELDS
// // Backend expects: source_order_id, delivery_id, quality_grade_id
// // ============================================================

// export const WeighbridgeRecordFormFields = (
//   sourceOrders: TOption[],
//   deliveries: TOption[],
//   qualityGrades: TOption[],
//   handleOrderSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'source_order_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Source Order *',
//     type: 'select',
//     uiType: 'select',
//     options: sourceOrders,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleOrderSearch,
//   },
//   {
//     name: 'delivery_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Delivery Record *',
//     type: 'select',
//     uiType: 'select',
//     options: deliveries,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'gross_weight_kg',
//     initailValue: '',
//     label: 'Gross Weight (kg) *',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'tare_weight_kg',
//     initailValue: 0,
//     label: 'Tare Weight (kg)',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'moisture_level',
//     initailValue: '',
//     label: 'Moisture Level (%) *',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'quality_grade_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Quality Grade *',
//     type: 'select',
//     uiType: 'select',
//     options: qualityGrades,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // SUPPLIER PAYMENT FORM FIELDS
// // Backend expects: supplier_invoice (direct PK field, no _id suffix)
// // ============================================================

// export const SupplierPaymentFormFields = (
//   invoices: TOption[]
// ): IFormField[] => [
//   {
//     name: 'supplier_invoice', // ✅ CORRECT: No _id suffix (it's a PK field)
//     initailValue: '',
//     label: 'Supplier Invoice *',
//     type: 'select',
//     uiType: 'select',
//     options: invoices,
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     required: true,
//   },
//   {
//     name: 'amount',
//     initailValue: '',
//     label: 'Payment Amount (UGX) *',
//     type: 'number',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'method',
//     initailValue: '',
//     label: 'Payment Method *',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'mobile_money', label: 'Mobile Money' },
//       { value: 'bank_transfer', label: 'Bank Transfer' },
//       { value: 'cash', label: 'Cash' },
//       { value: 'check', label: 'Bank Check' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'reference_number',
//     initailValue: '',
//     label: 'Payment Reference Number *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     required: true,
//   },
//   {
//     name: 'status',
//     initailValue: 'pending',
//     label: 'Status',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'pending', label: 'Pending' },
//       { value: 'processing', label: 'Processing' },
//       { value: 'completed', label: 'Completed' },
//       { value: 'failed', label: 'Failed' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // PAYMENT PREFERENCE FORM FIELDS
// // Backend expects: method, details (no _id fields)
// // ============================================================

// export const PaymentPreferenceFormFields = (
//   method: string
// ): IFormField[] => {
//   const baseFields: IFormField[] = [
//     {
//       name: 'method',
//       initailValue: '',
//       label: 'Payment Method *',
//       type: 'select',
//       uiType: 'select',
//       options: [
//         { value: 'mobile_money', label: 'Mobile Money' },
//         { value: 'bank_transfer', label: 'Bank Transfer' },
//         { value: 'cash', label: 'Cash Pickup' },
//         { value: 'check', label: 'Bank Check' },
//       ],
//       uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//       required: true,
//     },
//   ];

//   // Add method-specific fields
//   if (method === 'mobile_money') {
//     baseFields.push({
//       name: 'details.phone',
//       initailValue: '',
//       label: 'Mobile Money Phone Number *',
//       type: 'tel',
//       uiType: 'phone',
//       uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//       required: true,
//     });
//   } else if (method === 'bank_transfer') {
//     baseFields.push(
//       {
//         name: 'details.account_number',
//         initailValue: '',
//         label: 'Account Number *',
//         type: 'text',
//         uiType: 'text',
//         uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//         required: true,
//       },
//       {
//         name: 'details.bank_name',
//         initailValue: '',
//         label: 'Bank Name *',
//         type: 'text',
//         uiType: 'text',
//         uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//         required: true,
//       },
//       {
//         name: 'details.account_name',
//         initailValue: '',
//         label: 'Account Name *',
//         type: 'text',
//         uiType: 'text',
//         uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//         required: true,
//       }
//     );
//   }

//   // Add common fields at the end
//   baseFields.push(
//     {
//       name: 'is_default',
//       initailValue: false,
//       label: 'Set as Default Payment Method',
//       type: 'checkbox',
//       uiType: 'checkbox',
//       uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     },
//     {
//       name: 'is_active',
//       initailValue: true,
//       label: 'Active',
//       type: 'checkbox',
//       uiType: 'checkbox',
//       uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     }
//   );

//   return baseFields;
// };










// // ============================================================
// // SOURCING FORM FIELDS - FIXED VERSION
// // Field names now have _id suffix to match backend serializers
// // ============================================================

// import { IFormField } from "../../utils/form_factory";
// import { TOption } from "../../@types/common";

// // ============================================================
// // SUPPLIER PROFILE FORM FIELDS
// // Backend expects: user, hub, typical_grain_type
// // ============================================================

// export const SupplierProfileFormFields = (
//   users: TOption[],
//   hubs: TOption[],
//   grainTypes: TOption[],
//   handleUserSearch?: (value: any) => void,
//   handleHubSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'user', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'User Account *',
//     type: 'select',
//     uiType: 'autocomplete',
//     options: users,
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     required: true,
//     handleSearch: handleUserSearch,
//   },
//   {
//     name: 'business_name',
//     initailValue: '',
//     label: 'Business Name *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'hub', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Primary Hub',
//     type: 'select',
//     uiType: 'autocomplete',
//     options: hubs,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     handleSearch: handleHubSearch,
//   },
//   {
//     name: 'farm_location',
//     initailValue: '',
//     label: 'Farm Location',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 2,
//   },
//   {
//     name: 'typical_grain_type', // ✅ FIXED: Added _ids suffix for array
//     initailValue: [],
//     label: 'Grain Types Supplied',
//     type: 'select',
//     uiType: 'multiselect',
//     options: grainTypes,
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//   }
// ];

// // ============================================================
// // SOURCE ORDER FORM FIELDS
// // Backend expects: supplier, hub, grain_type, payment_method_id
// // ============================================================

// export const SourceOrderFormFields = (
//   suppliers: TOption[],
//   hubs: TOption[],
//   grainTypes: TOption[],
//   paymentMethods: TOption[],
//   handleSupplierSearch?: (value: any) => void,
//   handleHubSearch?: (value: any) => void,
//   handleGrainTypeSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'supplier', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Supplier *',
//     type: 'select',
//     uiType: 'autocomplete',
//     options: suppliers,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleSupplierSearch,
//   },
//   {
//     name: 'hub', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Destination Hub *',
//     type: 'select',
//     uiType: 'autocomplete',
//     options: hubs,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleHubSearch,
//   },
//   {
//     name: 'grain_type', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Grain Type *',
//     type: 'select',
//     uiType: 'autocomplete',
//     options: grainTypes,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleGrainTypeSearch,
//   },
//   {
//     name: 'quantity_kg',
//     initailValue: '',
//     label: 'Quantity (kg) *',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'offered_price_per_kg',
//     initailValue: '',
//     label: 'Price per kg (UGX) *',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'weighbridge_cost',
//     initailValue: 0,
//     label: 'Weighbridge Cost (UGX)',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'logistics_cost',
//     initailValue: 0,
//     label: 'Logistics Cost (UGX)',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'handling_cost',
//     initailValue: 0,
//     label: 'Handling Cost (UGX)',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'other_costs',
//     initailValue: 0,
//     label: 'Other Costs (UGX)',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'payment_method_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Payment Method (Optional)',
//     type: 'select',
//     uiType: 'select',
//     options: paymentMethods,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'logistics_type',
//     initailValue: '',
//     label: 'Logistics Type',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'bennu_truck', label: 'Bennu Truck' },
//       { value: 'supplier_driver', label: 'Supplier Driver' },
//       { value: 'third_party', label: 'Third Party Logistics' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'driver_name',
//     initailValue: '',
//     label: 'Driver Name',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'driver_phone',
//     initailValue: '',
//     label: 'Driver Phone',
//     type: 'tel',
//     uiType: 'phone',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'expected_delivery_date',
//     initailValue: '',
//     label: 'Expected Delivery Date',
//     type: 'date',
//     uiType: 'date',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // DELIVERY RECORD FORM FIELDS
// // Backend expects: source_order_id, hub
// // ============================================================

// export const DeliveryRecordFormFields = (
//   sourceOrders: TOption[],
//   hubs: TOption[],
//   handleOrderSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'source_order_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Source Order *',
//     type: 'select',
//     uiType: 'autocomplete',
//     options: sourceOrders,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleOrderSearch,
//   },
//   {
//     name: 'hub', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Hub *',
//     type: 'select',
//     uiType: 'select',
//     options: hubs,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'driver_name',
//     initailValue: '',
//     label: 'Driver Name *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'vehicle_number',
//     initailValue: '',
//     label: 'Vehicle Number *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'apparent_condition',
//     initailValue: 'good',
//     label: 'Apparent Condition',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'good', label: 'Good' },
//       { value: 'fair', label: 'Fair' },
//       { value: 'poor', label: 'Poor' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // WEIGHBRIDGE RECORD FORM FIELDS
// // Backend expects: source_order_id, delivery_id, quality_grade_id
// // ============================================================

// export const WeighbridgeRecordFormFields = (
//   sourceOrders: TOption[],
//   deliveries: TOption[],
//   qualityGrades: TOption[],
//   handleOrderSearch?: (value: any) => void
// ): IFormField[] => [
//   {
//     name: 'source_order_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Source Order *',
//     type: 'select',
//     uiType: 'autocomplete',
//     options: sourceOrders,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//     handleSearch: handleOrderSearch,
//   },
//   {
//     name: 'delivery_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Delivery Record *',
//     type: 'select',
//     uiType: 'select',
//     options: deliveries,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'gross_weight_kg',
//     initailValue: '',
//     label: 'Gross Weight (kg) *',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'tare_weight_kg',
//     initailValue: 0,
//     label: 'Tare Weight (kg)',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'moisture_level',
//     initailValue: '',
//     label: 'Moisture Level (%) *',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'quality_grade_id', // ✅ FIXED: Added _id suffix
//     initailValue: '',
//     label: 'Quality Grade *',
//     type: 'select',
//     uiType: 'select',
//     options: qualityGrades,
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // SUPPLIER PAYMENT FORM FIELDS
// // Backend expects: supplier_invoice (direct PK field, no _id suffix)
// // ============================================================

// export const SupplierPaymentFormFields = (
//   invoices: TOption[]
// ): IFormField[] => [
//   {
//     name: 'supplier_invoice', // ✅ CORRECT: No _id suffix (it's a PK field)
//     initailValue: '',
//     label: 'Supplier Invoice *',
//     type: 'select',
//     uiType: 'select',
//     options: invoices,
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     required: true,
//   },
//   {
//     name: 'amount',
//     initailValue: '',
//     label: 'Payment Amount (UGX) *',
//     type: 'number',
//     uiType: 'number',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'method',
//     initailValue: '',
//     label: 'Payment Method *',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'mobile_money', label: 'Mobile Money' },
//       { value: 'bank_transfer', label: 'Bank Transfer' },
//       { value: 'cash', label: 'Cash' },
//       { value: 'check', label: 'Bank Check' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     required: true,
//   },
//   {
//     name: 'reference_number',
//     initailValue: '',
//     label: 'Payment Reference Number *',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     required: true,
//   },
//   {
//     name: 'status',
//     initailValue: 'pending',
//     label: 'Status',
//     type: 'select',
//     uiType: 'select',
//     options: [
//       { value: 'pending', label: 'Pending' },
//       { value: 'processing', label: 'Processing' },
//       { value: 'completed', label: 'Completed' },
//       { value: 'failed', label: 'Failed' },
//     ],
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     multiline: true,
//     rows: 3,
//   },
// ];

// // ============================================================
// // PAYMENT PREFERENCE FORM FIELDS
// // Backend expects: method, details (no _id fields)
// // ============================================================

// export const PaymentPreferenceFormFields = (
//   method: string
// ): IFormField[] => {
//   const baseFields: IFormField[] = [
//     {
//       name: 'method',
//       initailValue: '',
//       label: 'Payment Method *',
//       type: 'select',
//       uiType: 'select',
//       options: [
//         { value: 'mobile_money', label: 'Mobile Money' },
//         { value: 'bank_transfer', label: 'Bank Transfer' },
//         { value: 'cash', label: 'Cash Pickup' },
//         { value: 'check', label: 'Bank Check' },
//       ],
//       uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//       required: true,
//     },
//   ];

//   // Add method-specific fields
//   if (method === 'mobile_money') {
//     baseFields.push({
//       name: 'details.phone',
//       initailValue: '',
//       label: 'Mobile Money Phone Number *',
//       type: 'tel',
//       uiType: 'phone',
//       uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//       required: true,
//     });
//   } else if (method === 'bank_transfer') {
//     baseFields.push(
//       {
//         name: 'details.account_number',
//         initailValue: '',
//         label: 'Account Number *',
//         type: 'text',
//         uiType: 'text',
//         uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//         required: true,
//       },
//       {
//         name: 'details.bank_name',
//         initailValue: '',
//         label: 'Bank Name *',
//         type: 'text',
//         uiType: 'text',
//         uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//         required: true,
//       },
//       {
//         name: 'details.account_name',
//         initailValue: '',
//         label: 'Account Name *',
//         type: 'text',
//         uiType: 'text',
//         uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//         required: true,
//       }
//     );
//   }

//   // Add common fields at the end
//   baseFields.push(
//     {
//       name: 'is_default',
//       initailValue: false,
//       label: 'Set as Default Payment Method',
//       type: 'checkbox',
//       uiType: 'checkbox',
//       uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     },
//     {
//       name: 'is_active',
//       initailValue: true,
//       label: 'Active',
//       type: 'checkbox',
//       uiType: 'checkbox',
//       uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//     }
//   );

//   return baseFields;
// };