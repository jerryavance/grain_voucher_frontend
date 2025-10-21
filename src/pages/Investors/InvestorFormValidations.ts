import * as Yup from "yup";

export const InvestorAccountValidation = Yup.object().shape({
  investor_id: Yup.string().required("Investor is required"),
});

export const DepositValidation = Yup.object().shape({
  investor_account_id: Yup.string().required("Investor account is required"),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
  notes: Yup.string(),
});

export const WithdrawalValidation = Yup.object().shape({
  investor_account_id: Yup.string().required("Investor account is required"),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
  notes: Yup.string(),
});

export const ProfitAgreementValidation = Yup.object().shape({
  investor_account_id: Yup.string().required("Investor account is required"),
  profit_threshold: Yup.number()
    .min(0, "Profit threshold must be at least 0")
    .max(100, "Profit threshold cannot exceed 100%")
    .required("Profit threshold is required"),
  investor_share: Yup.number()
    .min(0, "Investor share must be at least 0")
    .max(100, "Investor share cannot exceed 100%")
    .required("Investor share is required"),
  amsaf_share: Yup.number()
    .min(0, "AMSAF share must be at least 0")
    .max(100, "AMSAF share cannot exceed 100%")
    .required("AMSAF share is required"),
  notes: Yup.string(),
}).test('shares-sum', 'Investor and AMSAF shares must sum to 100%', function(values) {
  const { investor_share, amsaf_share } = values;
  if (
    typeof investor_share === "number" &&
    typeof amsaf_share === "number"
  ) {
    return investor_share + amsaf_share === 100;
  }
  return true;
});

export const TradeValidation = Yup.object().shape({
  grn_number: Yup.string().required("GRN number is required"),
  hub_id: Yup.string().required("Hub is required"),
  grain_type: Yup.string().required("Grain type is required"),
  gross_tonnage: Yup.number()
    .positive("Gross tonnage must be positive")
    .required("Gross tonnage is required"),
  net_tonnage: Yup.number()
    .positive("Net tonnage must be positive")
    .required("Net tonnage is required")
    .test('less-than-gross', 'Net tonnage cannot exceed gross tonnage', function(value) {
      const { gross_tonnage } = this.parent;
      if (value && gross_tonnage) {
        return value <= gross_tonnage;
      }
      return true;
    }),
  buying_price: Yup.number()
    .positive("Buying price must be positive")
    .required("Buying price is required"),
  selling_price: Yup.number()
    .positive("Selling price must be positive")
    .required("Selling price is required"),
  other_expenses: Yup.number().min(0, "Other expenses cannot be negative"),
  total_trade_cost: Yup.number()
    .positive("Total trade cost must be positive")
    .required("Total trade cost is required"),
  supplier_id: Yup.string().required("Supplier is required"),
  buyer_id: Yup.string().required("Buyer is required"),
  payable_by_buyer: Yup.number()
    .positive("Payable by buyer must be positive")
    .required("Payable by buyer is required"),
  payment_status: Yup.string().required("Payment status is required"),
  amount_paid: Yup.number().min(0, "Amount paid cannot be negative"),
  payment_due_date: Yup.date().required("Payment due date is required"),
  amount_due: Yup.number()
    .positive("Amount due must be positive")
    .required("Amount due is required"),
  delivery_date: Yup.date().required("Delivery date is required"),
  delivery_status: Yup.string().required("Delivery status is required"),
  amsaf_fees: Yup.number().min(0, "AMSAF fees cannot be negative"),
});

export const TradeAllocationValidation = Yup.object().shape({
  trade_id: Yup.string().required("Trade is required"),
  investor_account_id: Yup.string().required("Investor account is required"),
  allocated_amount: Yup.number()
    .positive("Allocated amount must be positive")
    .required("Allocated amount is required"),
  notes: Yup.string(),
});

export const LoanValidation = Yup.object().shape({
  trade_id: Yup.string().required("Trade is required"),
  investor_account_id: Yup.string().required("Investor account is required"),
  amount: Yup.number()
    .positive("Loan amount must be positive")
    .required("Loan amount is required"),
  interest_rate: Yup.number()
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%"),
  due_date: Yup.date().required("Due date is required"),
  status: Yup.string().required("Status is required"),
  notes: Yup.string(),
});

export const LoanRepaymentValidation = Yup.object().shape({
  amount: Yup.number()
    .positive("Repayment amount must be positive")
    .required("Repayment amount is required"),
});