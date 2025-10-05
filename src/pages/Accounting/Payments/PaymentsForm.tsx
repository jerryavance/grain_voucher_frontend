import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import { Span } from "../../../components/Typography";
import FormFactory from "../../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../../utils/form_factory";
import uniqueId from "../../../utils/generateId";
import { PaymentFormFields } from "./PaymentsFormFields";
import { PaymentService } from "./Payments.service";
import { PaymentFormValidations } from "./PaymentsFormValidations";
import { IPaymentFormProps, TPaymentFormProps } from "./Payments.interface";
import { InvoiceService } from "../Invoices/Invoices.service";

const PaymentForm: FC<IPaymentFormProps> = ({ handleClose, formType = "Save", initialValues, callBack }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<TPaymentFormProps["invoices"]>([]);

  useEffect(() => {
    InvoiceService.getInvoices({}).then((resp) =>
      setInvoices(resp.results.map((i: any) => ({ value: i.id, label: i.invoice_number })))
    );
  }, []);

  const formFields = PaymentFormFields({ invoices, accounts: [] }); // Accounts auto-set from invoice

  const newPaymentForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: PaymentFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      newPaymentForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await PaymentService.updatePayment(values, initialValues.id);
        toast.success("Payment updated successfully");
      } else {
        await PaymentService.createPayment(values);
        toast.success("Payment created successfully");
      }
      newPaymentForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        newPaymentForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    newPaymentForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    newPaymentForm.handleSubmit();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button onClick={handleButtonClick} type="button" variant="contained" disabled={loading}>
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} /> <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
          </>
        ) : (
          formType === "Update" ? "Update Payment" : "Create Payment"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog title={formType === "Save" ? "New Payment" : "Edit Payment"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newPaymentForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={newPaymentForm}
            formFields={formFields}
            validationSchema={PaymentFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default PaymentForm;