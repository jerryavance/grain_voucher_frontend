import * as Yup from "yup";

export const SourceOrderFormValidations = Yup.object().shape({
  supplier_id: Yup.string()
    .required("Supplier is required"),
  
  hub_id: Yup.string()
    .required("Hub/Destination is required"),
  
  grain_type_id: Yup.string()
    .required("Grain type is required"),
  
  quantity_kg: Yup.number()
    .min(1, "Quantity must be at least 1kg")
    .max(1000000, "Quantity cannot exceed 1,000,000kg")
    .required("Quantity is required"),
  
  offered_price_per_kg: Yup.number()
    .min(0.01, "Price must be greater than 0")
    .max(100000, "Price per kg seems unusually high")
    .required("Price per kg is required"),
  
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
  
  payment_method_id: Yup.string()
    .nullable(),
  
  logistics_type: Yup.string()
    .oneOf(['bennu_truck', 'supplier_driver', 'third_party', ''], 'Invalid logistics type'),
  
  driver_name: Yup.string()
    .max(255, "Driver name too long"),
  
  driver_phone: Yup.string()
    .matches(/^(\+256|0)?[0-9]{9,12}$/, "Invalid phone number format")
    .nullable(),
  
  expected_delivery_date: Yup.date()
    .min(new Date(), "Delivery date cannot be in the past")
    .nullable(),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

export const DeliveryRecordFormValidations = Yup.object().shape({
  source_order_id: Yup.string()
    .required("Source order is required"),
  
  hub_id: Yup.string()
    .required("Hub is required"),
  
  received_at: Yup.date()
    .max(new Date(), "Received date cannot be in the future")
    .required("Received date is required"),
  
  driver_name: Yup.string()
    .max(255, "Driver name too long")
    .required("Driver name is required"),
  
  vehicle_number: Yup.string()
    .max(50, "Vehicle number too long")
    .required("Vehicle number is required"),
  
  apparent_condition: Yup.string()
    .oneOf(['good', 'fair', 'poor'], 'Invalid condition')
    .required("Apparent condition is required"),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

export const WeighbridgeRecordFormValidations = Yup.object().shape({
  source_order_id: Yup.string()
    .required("Source order is required"),
  
  delivery_id: Yup.string()
    .required("Delivery record is required"),
  
  gross_weight_kg: Yup.number()
    .min(0.01, "Gross weight must be greater than 0")
    .max(100000, "Gross weight seems unusually high")
    .required("Gross weight is required"),
  
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
    .min(0, "Moisture level cannot be negative")
    .max(100, "Moisture level cannot exceed 100%")
    .required("Moisture level is required"),
  
  quality_grade_id: Yup.string()
    .required("Quality grade is required"),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

export const SupplierPaymentFormValidations = Yup.object().shape({
  supplier_invoice: Yup.string()
    .required("Supplier invoice is required"),
  
  amount: Yup.number()
    .min(0.01, "Amount must be greater than 0")
    .required("Amount is required")
    .test('not-exceed-balance', 'Amount cannot exceed invoice balance', function(value) {
      const { max_amount } = this.options.context || {};
      if (!value || !max_amount) return true;
      return value <= max_amount;
    }),
  
  method: Yup.string()
    .oneOf(['mobile_money', 'bank_transfer', 'cash', 'check'], 'Invalid payment method')
    .required("Payment method is required"),
  
  reference_number: Yup.string()
    .max(255, "Reference number too long")
    .required("Payment reference is required"),
  
  status: Yup.string()
    .oneOf(['pending', 'processing', 'completed', 'failed', 'refunded'], 'Invalid status')
    .default('pending'),
  
  notes: Yup.string()
    .max(1000, "Notes cannot exceed 1000 characters"),
});

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
  }),
  
  is_default: Yup.boolean()
    .default(false),
  
  is_active: Yup.boolean()
    .default(true),
});

export const SupplierProfileFormValidations = Yup.object().shape({
  user_id: Yup.string()
    .required("User is required"),
  
  hub_id: Yup.string()
    .nullable(),
  
  business_name: Yup.string()
    .min(2, "Business name must be at least 2 characters")
    .max(255, "Business name too long")
    .required("Business name is required"),
  
  farm_location: Yup.string()
    .max(500, "Farm location description too long"),
  
  typical_grain_type_ids: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one grain type")
    .required("At least one grain type is required"),
});