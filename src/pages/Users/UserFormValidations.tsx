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
        /^\+256(77|78|39)\d{7}$/,
        "Must be a valid MTN Uganda phone number starting with +256 followed by 77, 78, or 39 and 7 digits"
      )
      .required("Phone number is required"),
    role: Yup.string().required("Account type is required"), // Changed from 'type' to 'role'
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