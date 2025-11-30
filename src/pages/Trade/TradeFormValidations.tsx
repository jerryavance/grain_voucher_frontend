import * as Yup from "yup";

export const TradeFormValidations = (step: number) => {
  // Step 0: Basic Information
  const step0Schema = Yup.object().shape({
    buyer_id: Yup.string().required("Buyer is required"),
    supplier_id: Yup.string().required("Supplier is required"),
    hub_id: Yup.string().required("Hub is required"),
    grain_type_id: Yup.string().required("Grain type is required"),
    quality_grade_id: Yup.string().required("Quality grade is required"),
  });

  // Step 1: Quantities & Weight
  const step1Schema = Yup.object().shape({
    gross_tonnage: Yup.number()
      .required("Gross tonnage is required")
      .positive("Must be positive")
      .test("is-decimal", "Invalid decimal", (value) =>
        value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true
      ),
    net_tonnage: Yup.number()
      .required("Net tonnage is required")
      .positive("Must be positive")
      .max(
        Yup.ref("gross_tonnage"),
        "Net tonnage cannot exceed gross tonnage"
      )
      .test("is-decimal", "Invalid decimal", (value) =>
        value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true
      ),
    quantity_bags: Yup.number()
      .nullable()
      .positive("Must be positive")
      .integer("Must be a whole number"),
    bag_weight_kg: Yup.number()
      .positive("Must be positive")
      .test("is-decimal", "Invalid decimal", (value) =>
        value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true
      ),
    quantity_kg: Yup.number()
      .positive("Must be positive")
      .test("is-decimal", "Invalid decimal", (value) =>
        value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true
      ),
  });

  // Step 2: Pricing
  const step2Schema = Yup.object().shape({
    buying_price: Yup.number()
      .required("Buying price is required")
      .positive("Must be positive")
      .test("is-decimal", "Invalid decimal", (value) =>
        value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true
      ),
    selling_price: Yup.number()
      .required("Selling price is required")
      .positive("Must be positive")
      .moreThan(
        Yup.ref("buying_price"),
        "Selling price must be greater than buying price"
      )
      .test("is-decimal", "Invalid decimal", (value) =>
        value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true
      ),
  });

  // Step 3: Costs
  const step3Schema = Yup.object().shape({
    aflatoxin_qa_cost: Yup.number().min(0, "Cannot be negative"),
    weighbridge_cost: Yup.number().min(0, "Cannot be negative"),
    offloading_cost: Yup.number().min(0, "Cannot be negative"),
    loading_cost: Yup.number().min(0, "Cannot be negative"),
    transport_cost_per_kg: Yup.number().min(0, "Cannot be negative"),
    financing_fee_percentage: Yup.number()
      .min(0, "Cannot be negative")
      .max(100, "Cannot exceed 100%"),
    financing_days: Yup.number()
      .min(0, "Cannot be negative")
      .integer("Must be a whole number"),
    git_insurance_percentage: Yup.number()
      .min(0, "Cannot be negative")
      .max(100, "Cannot exceed 100%"),
    deduction_percentage: Yup.number()
      .min(0, "Cannot be negative")
      .max(100, "Cannot exceed 100%"),
    other_expenses: Yup.number().min(0, "Cannot be negative"),
    bennu_fees: Yup.number().min(0, "Cannot be negative"),
    bennu_fees_payer: Yup.string().oneOf(
      ["buyer", "seller", "split"],
      "Invalid option"
    ),
  });

  // Step 4: Delivery & Payment
  const step4Schema = Yup.object().shape({
    delivery_date: Yup.date()
      .required("Delivery date is required")
      .min(new Date(), "Delivery date cannot be in the past"),
    delivery_location: Yup.string().required("Delivery location is required"),
    delivery_distance_km: Yup.number()
      .nullable()
      .min(0, "Cannot be negative"),
    payment_terms: Yup.string().required("Payment terms are required"),
    payment_terms_days: Yup.number()
      .required("Payment terms days is required")
      .min(0, "Cannot be negative")
      .integer("Must be a whole number"),
    credit_terms_days: Yup.number()
      .min(0, "Cannot be negative")
      .integer("Must be a whole number"),
  });

  // Step 5: Additional Options
  const step5Schema = Yup.object().shape({
    requires_financing: Yup.boolean(),
    requires_voucher_allocation: Yup.boolean(),
    remarks: Yup.string().max(1000, "Remarks too long"),
    internal_notes: Yup.string().max(1000, "Notes too long"),
  });

  // Full schema (all steps combined)
  const fullSchema = step0Schema
    .concat(step1Schema)
    .concat(step2Schema)
    .concat(step3Schema)
    .concat(step4Schema)
    .concat(step5Schema);

  // Return schema based on step
  switch (step) {
    case 0:
      return step0Schema;
    case 1:
      return step1Schema;
    case 2:
      return step2Schema;
    case 3:
      return step3Schema;
    case 4:
      return step4Schema;
    case 5:
      return step5Schema;
    default:
      return fullSchema;
  }
};