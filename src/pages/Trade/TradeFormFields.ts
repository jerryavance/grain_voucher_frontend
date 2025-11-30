import { IFormField } from "../../utils/form_factory";
import { TTradeFormProps } from "./Trade.interface";

export const TradeFormFields = (props: TTradeFormProps, step: number): IFormField[] => {
  const {
    buyers,
    suppliers,
    grainTypes,
    qualityGrades,
    hubs,
    handleBuyerSearch,
    handleSupplierSearch,
    handleGrainTypeSearch,
    handleQualityGradeSearch,
    handleHubSearch,
  } = props;

  // Step 1: Basic Information
  const step1Fields: IFormField[] = [
    {
      name: "buyer_id",
      initailValue: "",
      label: "Buyer *",
      type: "select",
      uiType: "select",
      options: buyers,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
      handleSearch: handleBuyerSearch,
    },
    {
      name: "supplier_id",
      initailValue: "",
      label: "Supplier/Farmer *",
      type: "select",
      uiType: "select",
      options: suppliers,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
      handleSearch: handleSupplierSearch,
    },
    {
      name: "hub_id",
      initailValue: "",
      label: "Hub/Warehouse *",
      type: "select",
      uiType: "select",
      options: hubs,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
      handleSearch: handleHubSearch,
    },
    {
      name: "grain_type_id",
      initailValue: "",
      label: "Grain Type *",
      type: "select",
      uiType: "select",
      options: grainTypes,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
      handleSearch: handleGrainTypeSearch,
    },
    {
      name: "quality_grade_id",
      initailValue: "",
      label: "Quality Grade *",
      type: "select",
      uiType: "select",
      options: qualityGrades,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
      handleSearch: handleQualityGradeSearch,
    },
  ];

  // Step 2: Quantities & Weight
  const step2Fields: IFormField[] = [
    {
      name: "gross_tonnage",
      initailValue: "",
      label: "Gross Tonnage (MT) *",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
      required: true,
    },
    {
      name: "net_tonnage",
      initailValue: "",
      label: "Net Tonnage (MT) *",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
      required: true,
    },
    {
      name: "quantity_bags",
      initailValue: "",
      label: "Number of Bags",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    },
    {
      name: "bag_weight_kg",
      initailValue: "100",
      label: "Bag Weight (kg)",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    },
    {
      name: "quantity_kg",
      initailValue: "100",
      label: "Bag Weight (kg)",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    },
  ];

  // Step 3: Pricing
  const step3Fields: IFormField[] = [
    {
      name: "buying_price",
      initailValue: "",
      label: "Buying Price (per kg) *",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: "selling_price",
      initailValue: "",
      label: "Selling Price (per kg) *",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
  ];

  // Step 4: Costs
  const step4Fields: IFormField[] = [
    {
      name: "aflatoxin_qa_cost",
      initailValue: "0",
      label: "Aflatoxin/QA Cost",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "weighbridge_cost",
      initailValue: "0",
      label: "Weighbridge Cost",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "offloading_cost",
      initailValue: "0",
      label: "Offloading Cost",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "loading_cost",
      initailValue: "0",
      label: "Loading Cost",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "transport_cost_per_kg",
      initailValue: "0",
      label: "Transport Cost (per kg)",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "financing_fee_percentage",
      initailValue: "0",
      label: "Financing Fee %",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    },
    {
      name: "financing_days",
      initailValue: "0",
      label: "Financing Days",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    },
    {
      name: "git_insurance_percentage",
      initailValue: "0.30",
      label: "GIT Insurance %",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    },
    {
      name: "deduction_percentage",
      initailValue: "0",
      label: "Deduction %",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "other_expenses",
      initailValue: "0",
      label: "Other Expenses",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "bennu_fees",
      initailValue: "0",
      label: "Bennu Fees",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "bennu_fees_payer",
      initailValue: "buyer",
      label: "Bennu Fees Payer",
      type: "select",
      uiType: "select",
      options: [
        { label: "Buyer", value: "buyer" },
        { label: "Seller", value: "seller" },
        { label: "Split 50/50", value: "split" },
      ],
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
  ];

  // Step 5: Delivery & Payment
  const step5Fields: IFormField[] = [
    {
      name: "delivery_date",
      initailValue: "",
      label: "Delivery Date *",
      uiType: "date",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: "delivery_location",
      initailValue: "",
      label: "Delivery Location *",
      type: "text",
      uiType: "textarea",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
      rows: 2,
    },
    {
      name: "delivery_distance_km",
      initailValue: "",
      label: "Delivery Distance (km)",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "payment_terms",
      initailValue: "24_hours",
      label: "Payment Terms",
      type: "select",
      uiType: "select",
      options: [
        { label: "Cash on Delivery", value: "cash_on_delivery" },
        { label: "24 Hours", value: "24_hours" },
        { label: "7 Days", value: "7_days" },
        { label: "14 Days", value: "14_days" },
        { label: "30 Days", value: "30_days" },
        { label: "Custom Terms", value: "custom" },
      ],
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "payment_terms_days",
      initailValue: "1",
      label: "Payment Terms (Days)",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "credit_terms_days",
      initailValue: "0",
      label: "Credit Terms (Days)",
      type: "number",
      uiType: "text",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
  ];

  // Step 6: Additional Options
  const step6Fields: IFormField[] = [
    {
      name: "requires_financing",
      initailValue: false,
      label: "Requires Investor Financing",
      type: "checkbox",
      uiType: "checkbox",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "requires_voucher_allocation",
      initailValue: false,
      label: "Requires Voucher Allocation",
      type: "checkbox",
      uiType: "checkbox",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: "remarks",
      initailValue: "",
      label: "Remarks",
      type: "text",
      uiType: "textarea",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      rows: 3,
    },
    {
      name: "internal_notes",
      initailValue: "",
      label: "Internal Notes",
      type: "text",
      uiType: "textarea",
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      rows: 3,
    },
  ];

  // Return fields based on step
  switch (step) {
    case 0:
      return step1Fields;
    case 1:
      return step2Fields;
    case 2:
      return step3Fields;
    case 3:
      return step4Fields;
    case 4:
      return step5Fields;
    case 5:
      return step6Fields;
    default:
      return [...step1Fields, ...step2Fields, ...step3Fields, ...step4Fields, ...step5Fields, ...step6Fields];
  }
};