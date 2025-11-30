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
    bennu_share: Yup.number()
    .min(0, "BENNU share must be at least 0")
    .max(100, "BENNU share cannot exceed 100%")
    .required("BENNU share is required"),
  notes: Yup.string(),
}).test('shares-sum', 'Investor and BENNU shares must sum to 100%', function(values) {
  const { investor_share, bennu_share } = values;
  if (
    typeof investor_share === "number" &&
    typeof bennu_share === "number"
  ) {
    return investor_share + bennu_share === 100;
  }
  return true;
});