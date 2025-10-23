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