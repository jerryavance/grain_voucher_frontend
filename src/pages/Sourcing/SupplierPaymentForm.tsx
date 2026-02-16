// ============================================================
// SUPPLIER PAYMENT FORM - Complete Implementation
// Handles payment recording for supplier invoices with validation
// ============================================================

import { FC, useEffect, useRef, useState } from "react";
import { Button, Alert } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { SupplierPaymentFormFields } from "./SourcingFormFields";
import { SupplierPaymentFormValidations } from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import { IPaymentFormProps } from "./Sourcing.interface";
import { TOption } from "../../@types/common";

export const SupplierPaymentForm: FC<IPaymentFormProps> = ({
  handleClose,
  invoiceId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Options state
  const [invoices, setInvoices] = useState<TOption[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(0);

  // ============================================================
  // FETCH INVOICES ON MOUNT
  // ============================================================
  
  useEffect(() => {
    loadInvoices();
  }, []);

  // ============================================================
  // LOOKUP LOADERS - Following Trade Service Pattern
  // ============================================================
  
  async function loadInvoices() {
    try {
      const data = await SourcingService.getSupplierInvoices({ 
        status__in: 'pending,partial',
        page_size: 50
      });
      setInvoices(
        data.results.map((invoice: any) => ({
          label: `${invoice.invoice_number} - Balance: ${invoice.balance_due.toLocaleString()} UGX`,
          value: invoice.id,
          balance: invoice.balance_due,
        }))
      );
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  }

  // ============================================================
  // FORM SETUP
  // ============================================================
  
  const formFields = SupplierPaymentFormFields(invoices);

  const paymentForm = useFormik({
    initialValues: invoiceId 
      ? { ...getInitialValues(formFields), supplier_invoice: invoiceId }
      : getInitialValues(formFields),
    validationSchema: SupplierPaymentFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    validate: (values) => {
      const errors: Record<string, any> = {};
      if (values.amount && maxAmount > 0 && values.amount > maxAmount) {
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

  // ============================================================
  // UPDATE MAX AMOUNT WHEN INVOICE CHANGES
  // ============================================================
  
  useEffect(() => {
    if (paymentForm.values.supplier_invoice) {
      const invoice = invoices.find(inv => inv.value === paymentForm.values.supplier_invoice);
      if (invoice) {
        setMaxAmount((invoice as any).balance);
      }
    }
  }, [paymentForm.values.supplier_invoice, invoices]);

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
          onClick={() => paymentForm.handleSubmit()} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span sx={{ ml: 1 }}>Loading...</Span>
            </>
          ) : (
            "Record Payment"
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
      title="Record Payment"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
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