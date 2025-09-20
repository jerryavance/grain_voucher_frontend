import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { UserFormFields } from "./UserFormFields";
import { UserService } from "./User.service";
import { RegisterService } from "../Authentication/Register/Register.service";
import { UserFormValidations } from "./UserFormValidations";
import { IUserFormProps } from "./Users.interface";

const UserForm: FC<IUserFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);

  const formFields = UserFormFields(otpSent);

  const newUserForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: UserFormValidations(otpSent),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      newUserForm.setValues(
        patchInitialValues(formFields)(initialValues || {})
      );
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const profile = {
        gender: values?.gender,
        date_of_birth: values?.date_of_birth,
        country: values?.country,
      };
      values["profile"] = profile;

      if (formType === "Update") {
        await UserService.updateUser(values, initialValues.id);
        toast.success("User updated successfully");
        // For updates, always close the modal
        newUserForm.resetForm();
        callBack && callBack();
        handleClose();
      } else {
        // Registration flow
        if (!otpSent) {
          // Step 1: Request OTP
          await RegisterService.requestOtp(values.phone_number, "registration");
          toast.success("OTP sent successfully");
          setOtpSent(true);
          // Don't close modal, just set loading to false
        } else {
          // Step 2: Complete registration with OTP
          await RegisterService.Register(values);
          toast.success("User created successfully");
          // Registration complete, close modal
          newUserForm.resetForm();
          callBack && callBack();
          handleClose();
        }
      }
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      
      if (error.response?.data) {
        newUserForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    newUserForm.resetForm();
    setOtpSent(false);
    handleClose();
  };

  // Fixed button click handler - directly call formik's handleSubmit
  const handleButtonClick = () => {
    // Trigger form validation and submission
    newUserForm.handleSubmit();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading}>
          Close
        </Button>
        <Button 
          onClick={handleButtonClick} 
          type="button" // Changed from submit to button
          variant="contained"
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Loading...
              </Span>
            </>
          ) : (
            // Fixed button text logic
            formType === "Update" 
              ? "Update User"
              : otpSent 
                ? "Create Account" 
                : "Request OTP"
          )}
        </Button>
      </>
    );
  };

  // Add a back button for OTP step in registration
  const BackButton: FC = () => {
    if (formType === "Save" && otpSent) {
      return (
        <Button 
          onClick={() => setOtpSent(false)} 
          variant="text"
          disabled={loading}
          size="small"
        >
          ← Back to Phone Number
        </Button>
      );
    }
    return null;
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New User" : "Edit User"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newUserForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          {/* Show back button for OTP step */}
          <BackButton />
          
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={newUserForm}
            formFields={formFields}
            validationSchema={UserFormValidations(otpSent)}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default UserForm;