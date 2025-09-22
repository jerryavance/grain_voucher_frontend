import * as Yup from "yup";

export const UserFormValidations = (otpSent: boolean) => {
  const baseSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .matches(/^[A-Za-z\s-]+$/, "First name can only contain letters, spaces, and hyphens")
      .required("First name is required"),
    last_name: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .matches(/^[A-Za-z\s-]+$/, "Last name can only contain letters, spaces, and hyphens")
      .required("Last name is required"),
    phone_number: Yup.string()
      .transform((value) => {
        if (!value) return value;
        let cleaned = value.replace(/[^\d+]/g, "");
        if (!cleaned.startsWith("+256")) {
          cleaned = "+256" + cleaned.replace(/^\+?256|^0/, "");
        }
        return cleaned;
      })
      .matches(
        /^\+256\d{9}$/,
        "Must be a valid Ugandan phone number starting with +256 and followed by 9 digits"
      )
      .required("Phone number is required"),
    role: Yup.string().required("Account type is required"),
    accept_terms: Yup.boolean()
      .oneOf([true], "You must accept the terms and conditions")
      .required("You must accept the terms and conditions"),
  });

  if (otpSent) {
    return baseSchema.shape({
      otp_code: Yup.string()
        .matches(/^\d{4}$/, "OTP must be 4 digits")
        .required("OTP code is required"),
    });
  }

  return baseSchema;
};