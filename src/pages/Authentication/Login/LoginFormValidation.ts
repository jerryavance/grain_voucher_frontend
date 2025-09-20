import * as Yup from "yup";

export const PhoneLoginFormValidation = (otpSent: boolean) => {
  const baseSchema = {
    phone_number: Yup.string()
      .transform((value) => {
        let cleaned = value.replace(/[^\d+]/g, '');
        if (!cleaned.startsWith('+256')) {
          cleaned = '+256' + cleaned.replace(/^\+?256|^0/, '');
        }
        return cleaned;
      })
      .matches(
        /^\+256(77|78|39)\d{7}$/,
        "Must be a valid MTN Uganda phone number starting with +256 followed by 77, 78, or 39 and 7 digits"
      )
      .required("Phone number is required"),
  };

  if (otpSent) {
    return Yup.object().shape({
      ...baseSchema,
      otp_code: Yup.string()
        .matches(/^\d{4}$/, "OTP must be 4 digits")
        .required("OTP code is required"),
    });
  }

  return Yup.object().shape(baseSchema);
};