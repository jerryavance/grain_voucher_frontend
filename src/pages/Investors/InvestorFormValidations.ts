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
  payout_type: Yup.string()
    .oneOf(["margin", "interest"], "Invalid payout type")
    .required("Payout type is required"),
  profit_threshold: Yup.number()
    .when("payout_type", {
      is: "margin",
      then: (schema) => schema.min(0).max(100).required("Profit threshold is required"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  investor_share: Yup.number()
    .when("payout_type", {
      is: "margin",
      then: (schema) => schema.min(0).max(100).required("Investor share is required"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  bennu_share: Yup.number()
    .when("payout_type", {
      is: "margin",
      then: (schema) => schema.min(0).max(100).required("BENNU share is required"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  fixed_interest_rate: Yup.number()
    .when("payout_type", {
      is: "interest",
      then: (schema) => schema.min(0.01, "Rate must be positive").max(100).required("Interest rate is required"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  interest_period_days: Yup.number()
    .when("payout_type", {
      is: "interest",
      then: (schema) => schema.min(1, "Must be at least 1 day").required("Period is required"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  notes: Yup.string(),
}).test('shares-sum', 'Investor and BENNU shares must sum to 100%', function(values) {
  if (values.payout_type !== "margin") return true;
  const { investor_share, bennu_share } = values;
  if (
    typeof investor_share === "number" &&
    typeof bennu_share === "number"
  ) {
    return investor_share + bennu_share === 100;
  }
  return true;
});