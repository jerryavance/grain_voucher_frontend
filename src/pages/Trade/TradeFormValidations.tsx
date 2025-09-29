import * as Yup from "yup";

export const TradeFormValidations = () => Yup.object().shape({
  buyer_id: Yup.string().required("Buyer is required"),
  grain_type_id: Yup.string().required("Grain Type is required"),
  quantity_mt: Yup.number()
    .min(0.01, "Quantity must be at least 0.01 MT")
    .required("Quantity is required"),
  grade: Yup.string()
    .min(1, "Grade must be at least 1 character")
    .required("Grade is required"),
  price_per_mt: Yup.number()
    .min(0.01, "Price must be at least 0.01")
    .required("Price per MT is required"),
  hub_id: Yup.string().required("Hub is required"),
});