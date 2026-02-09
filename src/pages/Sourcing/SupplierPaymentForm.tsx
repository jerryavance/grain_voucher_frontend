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
// SUPPLIER PAYMENT FORM
// ============================================================

export const SupplierPaymentForm: FC<IPaymentFormProps> = ({
  handleClose,
  invoiceId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<TOption[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(0);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await SourcingService.getSupplierInvoices({ 
        status__in: 'pending,partial' 
      });
      const options = response.results.map((invoice: any) => ({
        value: invoice.id,
        label: `${invoice.invoice_number} - Balance: ${invoice.balance_due.toLocaleString()} UGX`,
        balance: invoice.balance_due,
      }));
      setInvoices(options);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const formFields = SupplierPaymentFormFields(invoices);

  const paymentForm = useFormik({
    initialValues: invoiceId 
      ? { ...getInitialValues(formFields), supplier_invoice: invoiceId }
      : getInitialValues(formFields),
    validationSchema: SupplierPaymentFormValidations,
    validate: (values) => {
      const errors: Record<string, any> = {};
      if (values.amount && values.amount > maxAmount) {
        errors.amount = `Amount cannot exceed maximum allowed: ${maxAmount.toLocaleString()} UGX`;
      }
      return errors;
    },
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createSupplierPayment(values);
        toast.success("Payment created successfully");
        paymentForm.resetForm();
        callBack && callBack();
        handleClose();
      } catch (error: any) {
        if (error.response?.data) {
          paymentForm.setErrors(error.response.data);
        }
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  // Update max amount when invoice changes
  useEffect(() => {
    if (paymentForm.values.supplier_invoice) {
      const invoice = invoices.find(inv => inv.value === paymentForm.values.supplier_invoice);
      if (invoice) {
        setMaxAmount((invoice as any).balance);
      }
    }
  }, [paymentForm.values.supplier_invoice, invoices]);

  return (
    <ModalDialog
      title="Record Payment"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Close</Button>
          <Button onClick={() => paymentForm.handleSubmit()} variant="contained" disabled={loading}>
            {loading ? <><ProgressIndicator color="inherit" size={20} /> <Span sx={{ ml: 1 }}>Loading...</Span></> : "Record Payment"}
          </Button>
        </>
      )}
    >
      <form ref={formRef} onSubmit={paymentForm.handleSubmit}>
        {maxAmount > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Maximum payment amount: <strong>{maxAmount.toLocaleString()} UGX</strong>
          </Alert>
        )}
        
        <FormFactory
          formikInstance={paymentForm}
          formFields={formFields}
          validationSchema={SupplierPaymentFormValidations}
        />
      </form>
    </ModalDialog>
  );
};