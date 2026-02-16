// ============================================================
// PAYMENT PREFERENCE FORM - Complete Implementation
// Handles supplier payment method preferences with dynamic fields
// ============================================================

import { FC, useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { PaymentPreferenceFormFields } from "./SourcingFormFields";
import { PaymentPreferenceFormValidations } from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import { IPaymentPreferenceFormProps } from "./Sourcing.interface";

export const PaymentPreferenceForm: FC<IPaymentPreferenceFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // ============================================================
  // FORM SETUP - Fields change based on payment method
  // ============================================================
  
  const formFields = PaymentPreferenceFormFields(selectedMethod);

  const preferenceForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: PaymentPreferenceFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        if (formType === "Update" && initialValues) {
          await SourcingService.updatePaymentPreference(initialValues.id, values);
          toast.success("Payment preference updated successfully");
        } else {
          await SourcingService.createPaymentPreference(values);
          toast.success("Payment preference created successfully");
        }
        
        preferenceForm.resetForm();
        callBack && callBack();
        handleClose();
      } catch (error: any) {
        if (error.response?.data) {
          preferenceForm.setErrors(error.response.data);
        }
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  // ============================================================
  // LOAD INITIAL VALUES FOR UPDATE
  // ============================================================
  
  useEffect(() => {
    if (formType === "Update" && initialValues) {
      preferenceForm.setValues(patchInitialValues(formFields)(initialValues));
      setSelectedMethod(initialValues.method);
    }
  }, [initialValues, formType]);

  // ============================================================
  // UPDATE SELECTED METHOD WHEN FORM VALUE CHANGES
  // ============================================================
  
  useEffect(() => {
    setSelectedMethod(preferenceForm.values.method);
  }, [preferenceForm.values.method]);

  // ============================================================
  // ACTION BUTTONS
  // ============================================================
  
  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button 
          onClick={() => preferenceForm.handleSubmit()} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span sx={{ ml: 1 }}>Loading...</Span>
            </>
          ) : (
            formType === "Update" ? "Update" : "Add"
          )}
        </Button>
      </>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <ModalDialog
      title={formType === "Save" ? "Add Payment Preference" : "Edit Payment Preference"}
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={preferenceForm.handleSubmit}>
        <FormFactory
          formikInstance={preferenceForm}
          formFields={formFields}
          validationSchema={PaymentPreferenceFormValidations}
        />
      </form>
    </ModalDialog>
  );
};