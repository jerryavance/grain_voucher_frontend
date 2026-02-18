// ============================================================
// PAYMENT PREFERENCE FORM - Fixed Implementation
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
  const [paymentPreferences, setPaymentPreferences] = useState<any[]>([]);


  // selectedMethod is the single source of truth for which fields to show.
  // It is only set explicitly — never derived from formik state changes —
  // so it cannot trigger a formik reinitialise that wipes the form.
  const [selectedMethod, setSelectedMethod] = useState<string>(
    initialValues?.method ?? ""
  );

  // Build form fields once per selectedMethod change (user explicitly picked one).
  // We do NOT tie this to formik values to avoid the circular reset.
  const formFields = PaymentPreferenceFormFields(selectedMethod);

  // Initialise formik once with stable initial values.
  // enableReinitialize is intentionally OFF — it was causing formik to reset
  // every time formFields changed (i.e. every time the user picked a method).
  const preferenceForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: PaymentPreferenceFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: false,
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

  // Patch values when editing an existing preference (runs once on mount).
  useEffect(() => {
    if (formType === "Update" && initialValues) {
      preferenceForm.setValues(patchInitialValues(formFields)(initialValues));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the user picks a method from the dropdown:
  //   1. Update selectedMethod so the right detail fields appear.
  //   2. Keep the method value in formik but clear any stale detail fields
  //      so the user starts fresh for the new method type.
  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    preferenceForm.setValues({
      ...getInitialValues(PaymentPreferenceFormFields(method)),
      method,
      is_default: preferenceForm.values.is_default ?? false,
      is_active: preferenceForm.values.is_active ?? true,
    });
  };

  // Intercept formik's onChange for the "method" field so we can run our
  // custom handler. All other field changes pass through normally.
  const handleFieldChange = (e: React.ChangeEvent<any>) => {
    if (e.target.name === "method") {
      handleMethodChange(e.target.value);
    } else {
      preferenceForm.handleChange(e);
    }
  };

  const ActionBtns: FC = () => (
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
            <ProgressIndicator color="inherit" size={20} />
            <Span sx={{ ml: 1 }}>Saving...</Span>
          </>
        ) : (
          formType === "Update" ? "Update" : "Add"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "Add Payment Preference" : "Edit Payment Preference"}
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={preferenceForm.handleSubmit}>
        <FormFactory
          formikInstance={{
            ...preferenceForm,
            handleChange: handleFieldChange,
          }}
          formFields={formFields}
          validationSchema={PaymentPreferenceFormValidations}
        />
      </form>
    </ModalDialog>
  );
};