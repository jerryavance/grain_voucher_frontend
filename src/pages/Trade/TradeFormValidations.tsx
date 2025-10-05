// TradeFormValidations.tsx
import * as Yup from "yup";

export const TradeFormValidations = () => {
  return Yup.object().shape({
    buyer_id: Yup.string().required("Buyer is required"),
    hub_id: Yup.string().required("Hub/Warehouse is required"),
    grain_type_id: Yup.string().required("Grain type is required"),
    quality_grade_id: Yup.string().required("Quality grade is required"),
    
    // Quantity validations
    quantity_kg: Yup.number()
      .min(0.01, "Quantity must be greater than 0")
      .required("Quantity in KG is required"),
    quantity_bags: Yup.number()
      .min(0, "Number of bags cannot be negative")
      .nullable(),
    bag_weight_kg: Yup.number()
      .min(0.01, "Bag weight must be greater than 0")
      .default(100),
    
    // Pricing validations
    purchase_price_per_kg: Yup.number()
      .min(0.01, "Purchase price must be greater than 0")
      .required("Purchase price per KG is required"),
    buyer_price_per_kg: Yup.number()
      .min(0.01, "Selling price must be greater than 0")
      .required("Selling price per KG is required")
      .test(
        'is-greater-than-purchase',
        'Selling price must be greater than purchase price',
        function(value) {
          const { purchase_price_per_kg } = this.parent;
          if (!value || !purchase_price_per_kg) return true;
          return value > purchase_price_per_kg;
        }
      ),
    
    // Cost validations
    aflatoxin_qa_cost: Yup.number().min(0, "Cost cannot be negative").default(0),
    weighbridge_cost: Yup.number().min(0, "Cost cannot be negative").default(0),
    loading_cost: Yup.number().min(0, "Cost cannot be negative").default(0),
    offloading_cost: Yup.number().min(0, "Cost cannot be negative").default(0),
    transport_cost_per_kg: Yup.number().min(0, "Cost cannot be negative").default(0),
    other_costs: Yup.number().min(0, "Cost cannot be negative").default(0),
    
    // Percentage validations
    financing_fee_percentage: Yup.number()
      .min(0, "Percentage cannot be negative")
      .max(100, "Percentage cannot exceed 100")
      .default(0),
    financing_days: Yup.number()
      .min(0, "Days cannot be negative")
      .integer("Must be a whole number")
      .default(0),
    git_insurance_percentage: Yup.number()
      .min(0, "Percentage cannot be negative")
      .max(100, "Percentage cannot exceed 100")
      .default(0.30),
    deduction_percentage: Yup.number()
      .min(0, "Percentage cannot be negative")
      .max(100, "Percentage cannot exceed 100")
      .default(0),
    
    // Logistics validations
    delivery_location: Yup.string()
      .min(5, "Delivery location must be at least 5 characters")
      .required("Delivery location is required"),
    delivery_distance_km: Yup.number()
      .min(0, "Distance cannot be negative")
      .nullable(),
    expected_delivery_date: Yup.date()
      .min(new Date(), "Expected delivery date must be in the future")
      .nullable(),
    
    // Transport validations
    vehicle_number: Yup.string()
      .max(50, "Vehicle number cannot exceed 50 characters"),
    driver_name: Yup.string()
      .max(100, "Driver name cannot exceed 100 characters"),
    driver_phone: Yup.string()
      .matches(/^\+?[\d\s-()]+$/, "Invalid phone number format")
      .nullable(),
    driver_id: Yup.string()
      .max(50, "Driver ID cannot exceed 50 characters"),
    
    // Payment terms validations
    payment_terms: Yup.string().required("Payment terms are required"),
    payment_terms_days: Yup.number()
      .min(0, "Days cannot be negative")
      .integer("Must be a whole number")
      .default(1),
    credit_terms_days: Yup.number()
      .min(0, "Days cannot be negative")
      .integer("Must be a whole number")
      .default(0),
    
    // Notes validations
    remarks: Yup.string().max(1000, "Remarks cannot exceed 1000 characters"),
    internal_notes: Yup.string().max(2000, "Internal notes cannot exceed 2000 characters"),
    contract_notes: Yup.string().max(2000, "Contract notes cannot exceed 2000 characters"),
  });
};

export const TradeStatusUpdateValidations = () => {
  return Yup.object().shape({
    status: Yup.string().required("Status is required"),
    notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
    actual_delivery_date: Yup.date().nullable(),
    vehicle_number: Yup.string().max(50, "Vehicle number cannot exceed 50 characters"),
    driver_name: Yup.string().max(100, "Driver name cannot exceed 100 characters"),
  });
};

export const TradeApprovalValidations = () => {
  return Yup.object().shape({
    action: Yup.string()
      .oneOf(['approve', 'reject'], "Invalid action")
      .required("Action is required"),
    notes: Yup.string()
      .when('action', {
        is: 'reject',
        then: (schema) => schema.required("Rejection reason is required"),
        otherwise: (schema) => schema.max(500, "Notes cannot exceed 500 characters"),
      }),
  });
};

export const TradeCostValidations = () => {
  return Yup.object().shape({
    cost_type: Yup.string()
      .min(2, "Cost type must be at least 2 characters")
      .max(100, "Cost type cannot exceed 100 characters")
      .required("Cost type is required"),
    description: Yup.string().max(500, "Description cannot exceed 500 characters"),
    amount: Yup.number()
      .min(0.01, "Amount must be greater than 0")
      .required("Amount is required"),
    is_per_unit: Yup.boolean().default(false),
  });
};

export const BrokerageValidations = () => {
  return Yup.object().shape({
    agent_id: Yup.string().required("Agent is required"),
    commission_type: Yup.string()
      .oneOf(['percentage', 'per_mt', 'per_kg', 'fixed'], "Invalid commission type")
      .required("Commission type is required"),
    commission_value: Yup.number()
      .min(0.01, "Commission value must be greater than 0")
      .required("Commission value is required")
      .when('commission_type', {
        is: 'percentage',
        then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
      }),
    notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
  });
};

export const GRNValidations = () => {
  return Yup.object().shape({
    point_of_loading: Yup.string()
      .min(3, "Point of loading must be at least 3 characters")
      .max(200, "Point of loading cannot exceed 200 characters")
      .required("Point of loading is required"),
    loading_date: Yup.date()
      .max(new Date(), "Loading date cannot be in the future")
      .required("Loading date is required"),
    delivery_date: Yup.date()
      .min(Yup.ref('loading_date'), "Delivery date must be after loading date")
      .required("Delivery date is required"),
    delivered_to_name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(200, "Name cannot exceed 200 characters")
      .required("Delivered to name is required"),
    delivered_to_address: Yup.string()
      .min(5, "Address must be at least 5 characters")
      .required("Delivery address is required"),
    delivered_to_contact: Yup.string()
      .matches(/^\+?[\d\s-()]+$/, "Invalid contact format")
      .required("Contact is required"),
    vehicle_number: Yup.string()
      .max(50, "Vehicle number cannot exceed 50 characters")
      .required("Vehicle number is required"),
    driver_name: Yup.string()
      .max(100, "Driver name cannot exceed 100 characters")
      .required("Driver name is required"),
    driver_id_number: Yup.string()
      .max(50, "Driver ID cannot exceed 50 characters")
      .required("Driver ID is required"),
    driver_phone: Yup.string()
      .matches(/^\+?[\d\s-()]+$/, "Invalid phone number format")
      .required("Driver phone is required"),
    gross_weight_kg: Yup.number()
      .min(0.01, "Gross weight must be greater than 0")
      .required("Gross weight is required"),
    tare_weight_kg: Yup.number()
      .min(0, "Tare weight cannot be negative")
      .nullable(),
    net_weight_kg: Yup.number()
      .min(0.01, "Net weight must be greater than 0")
      .required("Net weight is required")
      .test(
        'is-valid-net-weight',
        'Net weight must be less than or equal to gross weight',
        function(value) {
          const { gross_weight_kg } = this.parent;
          if (!value || !gross_weight_kg) return true;
          return value <= gross_weight_kg;
        }
      ),
    warehouse_manager_name: Yup.string()
      .max(100, "Name cannot exceed 100 characters")
      .required("Warehouse manager name is required"),
    warehouse_manager_date: Yup.date().required("Date is required"),
    received_by_name: Yup.string()
      .max(100, "Name cannot exceed 100 characters")
      .required("Received by name is required"),
    received_by_date: Yup.date().required("Date is required"),
    remarks: Yup.string().max(1000, "Remarks cannot exceed 1000 characters"),
  });
};