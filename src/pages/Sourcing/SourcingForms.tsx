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
// DELIVERY RECORD FORM
// ============================================================

export const DeliveryRecordForm: FC<IDeliveryFormProps> = ({
  handleClose,
  sourceOrderId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sourceOrders, setSourceOrders] = useState<TOption[]>([]);
  const [hubs, setHubs] = useState<TOption[]>([]);

  useEffect(() => {
    fetchSourceOrders();
    fetchHubs();
  }, []);

  const fetchSourceOrders = async (search = '') => {
    try {
      const response = await SourcingService.getSourceOrders({ 
        search, 
        status: 'in_transit' 
      });
      const options = response.results.map((order: any) => ({
        value: order.id,
        label: `${order.order_number} - ${order.supplier_name}`,
      }));
      setSourceOrders(options);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchHubs = async () => {
    try {
      const response = await fetch('/api/hubs/hubs/');
      const data = await response.json();
      const options = data.results.map((hub: any) => ({
        value: hub.id,
        label: hub.name,
      }));
      setHubs(options);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  const formFields = DeliveryRecordFormFields(
    sourceOrders,
    hubs,
    (value: string) => fetchSourceOrders(value)
  );

  const deliveryForm = useFormik({
    initialValues: sourceOrderId 
      ? { ...getInitialValues(formFields), source_order_id: sourceOrderId }
      : getInitialValues(formFields),
    validationSchema: DeliveryRecordFormValidations,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createDeliveryRecord(values);
        toast.success("Delivery record created successfully");
        deliveryForm.resetForm();
        callBack && callBack();
        handleClose();
      } catch (error: any) {
        if (error.response?.data) {
          deliveryForm.setErrors(error.response.data);
        }
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <ModalDialog
      title="Record Delivery"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Close</Button>
          <Button onClick={() => deliveryForm.handleSubmit()} variant="contained" disabled={loading}>
            {loading ? <><ProgressIndicator color="inherit" size={20} /> <Span sx={{ ml: 1 }}>Loading...</Span></> : "Record Delivery"}
          </Button>
        </>
      )}
    >
      <form ref={formRef} onSubmit={deliveryForm.handleSubmit}>
        <FormFactory
          formikInstance={deliveryForm}
          formFields={formFields}
          validationSchema={DeliveryRecordFormValidations}
        />
      </form>
    </ModalDialog>
  );
};

// ============================================================
// WEIGHBRIDGE RECORD FORM
// ============================================================

export const WeighbridgeRecordForm: FC<IWeighbridgeFormProps> = ({
  handleClose,
  sourceOrderId,
  deliveryId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sourceOrders, setSourceOrders] = useState<TOption[]>([]);
  const [deliveries, setDeliveries] = useState<TOption[]>([]);
  const [qualityGrades, setQualityGrades] = useState<TOption[]>([]);
  const [netWeight, setNetWeight] = useState<number>(0);

  useEffect(() => {
    fetchSourceOrders();
    fetchQualityGrades();
  }, []);

  useEffect(() => {
    if (sourceOrderId) {
      fetchDeliveries(sourceOrderId);
    }
  }, [sourceOrderId]);

  const fetchSourceOrders = async (search = '') => {
    try {
      const response = await SourcingService.getSourceOrders({ 
        search, 
        status: 'delivered' 
      });
      const options = response.results.map((order: any) => ({
        value: order.id,
        label: `${order.order_number} - ${order.supplier_name}`,
      }));
      setSourceOrders(options);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchDeliveries = async (orderId: string) => {
    try {
      const response = await SourcingService.getDeliveryRecords({ source_order: orderId });
      const options = response.results.map((delivery: any) => ({
        value: delivery.id,
        label: `Delivery at ${delivery.hub.name}`,
      }));
      setDeliveries(options);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const fetchQualityGrades = async () => {
    try {
      const response = await fetch('/api/vouchers/quality-grades/');
      const data = await response.json();
      const options = data.results.map((grade: any) => ({
        value: grade.id,
        label: grade.name,
      }));
      setQualityGrades(options);
    } catch (error) {
      console.error("Error fetching quality grades:", error);
    }
  };

  const formFields = WeighbridgeRecordFormFields(
    sourceOrders,
    deliveries,
    qualityGrades,
    (value: string) => fetchSourceOrders(value)
  );

  const weighbridgeForm = useFormik({
    initialValues: {
      ...getInitialValues(formFields),
      ...(sourceOrderId && { source_order_id: sourceOrderId }),
      ...(deliveryId && { delivery_id: deliveryId }),
    },
    validationSchema: WeighbridgeRecordFormValidations,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createWeighbridgeRecord(values);
        toast.success("Weighbridge record created successfully");
        weighbridgeForm.resetForm();
        callBack && callBack();
        handleClose();
      } catch (error: any) {
        if (error.response?.data) {
          weighbridgeForm.setErrors(error.response.data);
        }
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  // Calculate net weight
  useEffect(() => {
    const gross = weighbridgeForm.values.gross_weight_kg || 0;
    const tare = weighbridgeForm.values.tare_weight_kg || 0;
    setNetWeight(gross - tare);
  }, [weighbridgeForm.values.gross_weight_kg, weighbridgeForm.values.tare_weight_kg]);

  // Fetch deliveries when order changes
  useEffect(() => {
    if (weighbridgeForm.values.source_order_id) {
      fetchDeliveries(weighbridgeForm.values.source_order_id);
    }
  }, [weighbridgeForm.values.source_order_id]);

  return (
    <ModalDialog
      title="Weighbridge Record"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Close</Button>
          <Button onClick={() => weighbridgeForm.handleSubmit()} variant="contained" disabled={loading}>
            {loading ? <><ProgressIndicator color="inherit" size={20} /> <Span sx={{ ml: 1 }}>Loading...</Span></> : "Create Record"}
          </Button>
        </>
      )}
    >
      <form ref={formRef} onSubmit={weighbridgeForm.handleSubmit}>
        <FormFactory
          formikInstance={weighbridgeForm}
          formFields={formFields}
          validationSchema={WeighbridgeRecordFormValidations}
        />
        
        {netWeight > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Calculated Net Weight: <strong>{netWeight.toFixed(2)} kg</strong>
          </Alert>
        )}
      </form>
    </ModalDialog>
  );
};

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