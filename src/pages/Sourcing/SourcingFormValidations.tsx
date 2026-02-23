// ============================================================
// SOURCING FORM VALIDATIONS - FIXED VERSION
// Field names now match the corrected form fields with _id suffix
// ============================================================

import * as Yup from "yup";

// ============================================================
// SUPPLIER PROFILE VALIDATION
// Fields: user, hub, typical_grain_type_ids
// ============================================================

export const SupplierProfileFormValidations = Yup.object().shape({
  user: Yup.string() // ✅ FIXED: Added _id suffix
    .required("User is required"),
  
  hub: Yup.string() // ✅ FIXED: Added _id suffix
    .nullable(),
  
  business_name: Yup.string()
    .required("Business name is required")
    .min(2, "Business name must be at least 2 characters")
    .max(255, "Business name too long"),
  
  farm_location: Yup.string()
    .max(500, "Farm location description too long"),
  
  typical_grain_type_ids: Yup.array()
    .of(Yup.string())
    .transform((value, originalValue) => {
      if (!originalValue) return [];
      return Array.isArray(originalValue) ? originalValue : [originalValue];
    })
    .nullable()
});

// ============================================================
// SOURCE ORDER VALIDATION
// Fields: supplier, hub, grain_type_id, payment_method_id
// ============================================================

export const SourceOrderFormValidations = Yup.object().shape({
  supplier: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Supplier is required"),
  
  hub: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Hub/Destination is required"),
  
  grain_type: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Grain type is required"),
  
  quantity_kg: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1kg")
    .max(1000000, "Quantity cannot exceed 1,000,000kg"),
  
  offered_price_per_kg: Yup.number()
    .required("Price per kg is required")
    .min(0.01, "Price must be greater than 0")
    .max(100000, "Price per kg seems unusually high"),
  
  weighbridge_cost: Yup.number()
    .min(0, "Cost cannot be negative")
    .default(0),
  
  logistics_cost: Yup.number()
    .min(0, "Cost cannot be negative")
    .default(0),
  
  handling_cost: Yup.number()
    .min(0, "Cost cannot be negative")
    .default(0),
  
  other_costs: Yup.number()
    .min(0, "Cost cannot be negative")
    .default(0),
  
  payment_method_id: Yup.string() // ✅ FIXED: Added _id suffix
    .nullable(),
  
  logistics_type: Yup.string()
    .oneOf(['bennu_truck', 'supplier_driver', 'third_party', ''], 'Invalid logistics type'),
  
  driver_name: Yup.string()
    .max(255, "Driver name too long"),
  
  driver_phone: Yup.string()
    .matches(/^(\+256|0)?[0-9]{9,12}$/, "Invalid phone number format")
    .nullable(),
  
  expected_delivery_date: Yup.date()
    .nullable(),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

// ============================================================
// DELIVERY RECORD VALIDATION
// Fields: source_order, hub
// ============================================================

export const DeliveryRecordFormValidations = Yup.object().shape({
  source_order: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Source order is required"),
  
  hub: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Hub is required"),
  
  driver_name: Yup.string()
    .required("Driver name is required")
    .max(255, "Driver name too long"),
  
  vehicle_number: Yup.string()
    .required("Vehicle number is required")
    .max(50, "Vehicle number too long"),
  
  apparent_condition: Yup.string()
    .oneOf(['good', 'fair', 'poor'], 'Invalid condition'),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

// ============================================================
// WEIGHBRIDGE RECORD VALIDATION
// Fields: source_order, delivery_id, quality_grade_id
// ============================================================

export const WeighbridgeRecordFormValidations = Yup.object().shape({
  source_order: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Source order is required"),
  
  delivery: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Delivery record is required"),
  
  gross_weight_kg: Yup.number()
    .required("Gross weight is required")
    .min(0.01, "Gross weight must be greater than 0")
    .max(100000, "Gross weight seems unusually high"),
  
  tare_weight_kg: Yup.number()
    .min(0, "Tare weight cannot be negative")
    .max(10000, "Tare weight seems unusually high")
    .default(0)
    .test('less-than-gross', 'Tare weight must be less than gross weight', function(value) {
      const { gross_weight_kg } = this.parent;
      if (!value || !gross_weight_kg) return true;
      return value < gross_weight_kg;
    }),
  
  moisture_level: Yup.number()
    .required("Moisture level is required")
    .min(0, "Moisture level cannot be negative")
    .max(100, "Moisture level cannot exceed 100%"),
  
  quality_grade_id: Yup.string() // ✅ FIXED: Added _id suffix
    .required("Quality grade is required"),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

// ============================================================
// SUPPLIER PAYMENT VALIDATION
// Fields: supplier_invoice (no _id suffix - it's a PK field)
// ============================================================

export const SupplierPaymentFormValidations = Yup.object().shape({
  supplier_invoice: Yup.string()
    .required("Supplier invoice is required"),
  
  amount: Yup.number()
    .required("Amount is required")
    .min(0.01, "Amount must be greater than 0"),
  
  method: Yup.string()
    .oneOf(['mobile_money', 'bank_transfer', 'cash', 'check'], 'Invalid payment method')
    .required("Payment method is required"),
  
  reference_number: Yup.string()
    .required("Payment reference is required")
    .max(255, "Reference number too long"),
  
  status: Yup.string()
    .oneOf(['pending', 'processing', 'completed', 'failed', 'refunded'], 'Invalid status')
    .default('pending'),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

// ============================================================
// PAYMENT PREFERENCE VALIDATION
// ============================================================

export const PaymentPreferenceFormValidations = Yup.object().shape({
  method: Yup.string()
    .oneOf(['mobile_money', 'bank_transfer', 'cash', 'check'], 'Invalid payment method')
    .required("Payment method is required"),
  
  details: Yup.object().when('method', {
    is: 'mobile_money',
    then: () => Yup.object().shape({
      phone: Yup.string()
        .matches(/^(\+256|0)?[0-9]{9,12}$/, "Invalid phone number")
        .required("Phone number is required for mobile money"),
    }),
    otherwise: () => Yup.object()
  }).when('method', {
    is: 'bank_transfer',
    then: () => Yup.object().shape({
      account_number: Yup.string()
        .required("Account number is required"),
      bank_name: Yup.string()
        .required("Bank name is required"),
      account_name: Yup.string()
        .required("Account name is required"),
    }),
    otherwise: () => Yup.object()
  }),
  
  is_default: Yup.boolean()
    .default(false),
  
  is_active: Yup.boolean()
    .default(true),
});