import * as Yup from "yup";

export const BrokerageFormValidations = () => Yup.object().shape({
  trade_id: Yup.string().required("Trade is required"),
  agent_id: Yup.string().required("Agent is required"),
  commission_type: Yup.string()
    .oneOf(['percentage', 'per_mt'], "Invalid commission type")
    .required("Commission type is required"),
  commission_value: Yup.number()
    .min(0.01, "Commission value must be at least 0.01")
    .required("Commission value is required"),
});