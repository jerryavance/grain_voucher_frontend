import * as Yup from "yup";

export const PasswordResetValidations = Yup.object().shape({
  old_password: Yup.string().required("Old Password is required"),
  new_password: Yup.string().required("New Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password"), null], "Confirm Password must match new Password")
    .required("Confirm Password is required"),
});
