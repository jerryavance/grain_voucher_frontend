// ============================================================
// ALL REMAINING SOURCING FORMS
// DeliveryRecordForm, WeighbridgeRecordForm, SupplierPaymentForm, PaymentPreferenceForm
// ============================================================

import { FC, useEffect, useRef, useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import {
  DeliveryRecordFormFields,
  WeighbridgeRecordFormFields,
  SupplierPaymentFormFields,
  PaymentPreferenceFormFields,
} from "./SourcingFormFields";
import {
  DeliveryRecordFormValidations,
  WeighbridgeRecordFormValidations,
  SupplierPaymentFormValidations,
  PaymentPreferenceFormValidations,
} from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import {
  IDeliveryFormProps,
  IWeighbridgeFormProps,
  IPaymentFormProps,
  IPaymentPreferenceFormProps,
} from "./Sourcing.interface";
import { TOption } from "../../@types/common";

// ============================================================
// PAYMENT PREFERENCE FORM
// ============================================================

export const PaymentPreferenceForm: FC<IPaymentPreferenceFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const formFields = PaymentPreferenceFormFields(selectedMethod);

  const preferenceForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: PaymentPreferenceFormValidations,
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

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      preferenceForm.setValues(patchInitialValues(formFields)(initialValues));
      setSelectedMethod(initialValues.method);
    }
  }, [initialValues, formType]);

  useEffect(() => {
    setSelectedMethod(preferenceForm.values.method);
  }, [preferenceForm.values.method]);

  return (
    <ModalDialog
      title={formType === "Save" ? "Add Payment Preference" : "Edit Payment Preference"}
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Close</Button>
          <Button onClick={() => preferenceForm.handleSubmit()} variant="contained" disabled={loading}>
            {loading ? <><ProgressIndicator color="inherit" size={20} /> <Span sx={{ ml: 1 }}>Loading...</Span></> : (formType === "Update" ? "Update" : "Add")}
          </Button>
        </>
      )}
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