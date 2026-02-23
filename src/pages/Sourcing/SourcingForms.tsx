import { FC, useEffect, useRef, useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import {
  DeliveryRecordFormFields,
  WeighbridgeRecordFormFields,
  SupplierPaymentFormFields,
} from "./SourcingFormFields";
import {
  DeliveryRecordFormValidations,
  WeighbridgeRecordFormValidations,
  SupplierPaymentFormValidations,
} from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";

interface DropdownOption {
  value: string;
  label: string;
}

interface DeliveryFormData {
  sourceOrders: DropdownOption[];
  hubs: DropdownOption[];
}

interface WeighbridgeFormData {
  sourceOrders: DropdownOption[];
  deliveries: DropdownOption[];
  qualityGrades: DropdownOption[];
}

interface PaymentFormData {
  invoices: DropdownOption[];
}

// ============================================================
// DELIVERY RECORD FORM
// ============================================================

interface IDeliveryFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  callBack?: () => void;
  formData: DeliveryFormData;
  formDataLoading: boolean;
  searchHandlers: {
    handleOrderSearch: (query: string) => void;
  };
}

export const DeliveryRecordForm: FC<IDeliveryFormProps> = ({
  handleClose,
  sourceOrderId,
  callBack,
  formData,
  formDataLoading,
  searchHandlers,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formFields = DeliveryRecordFormFields(
    formData.sourceOrders,
    formData.hubs,
    searchHandlers.handleOrderSearch
  );

  const deliveryForm = useFormik({
    initialValues: sourceOrderId
      ? { ...getInitialValues(formFields), source_order: sourceOrderId }
      : getInitialValues(formFields),
    validationSchema: DeliveryRecordFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createDeliveryRecord(values);
        toast.success("Delivery record created successfully");
        deliveryForm.resetForm();
        callBack && callBack();
        handleClose();
      } catch (error: any) {
        if (error.response?.data) deliveryForm.setErrors(error.response.data);
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleClose} disabled={loading || formDataLoading}>Close</Button>
      <Button onClick={() => deliveryForm.handleSubmit()} variant="contained" disabled={loading || formDataLoading}>
        {loading || formDataLoading
          ? <><ProgressIndicator color="inherit" size={20} /><Span sx={{ ml: 1 }}>{formDataLoading ? "Loading..." : "Saving..."}</Span></>
          : "Record Delivery"}
      </Button>
    </>
  );

  return (
    <ModalDialog title="Record Delivery" onClose={handleClose} id={uniqueId()} ActionButtons={ActionBtns}>
      {formDataLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <ProgressIndicator /><Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      ) : (
        <form ref={formRef} onSubmit={deliveryForm.handleSubmit}>
          <FormFactory formikInstance={deliveryForm} formFields={formFields} validationSchema={DeliveryRecordFormValidations} />
        </form>
      )}
    </ModalDialog>
  );
};

// ============================================================
// WEIGHBRIDGE RECORD FORM
// ============================================================

interface IWeighbridgeFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  deliveryId?: string;
  callBack?: () => void;
  formData: WeighbridgeFormData;
  formDataLoading: boolean;
  searchHandlers: {
    handleOrderSearch: (query: string) => void;
  };
  onLoadDeliveries: (orderId: string) => Promise<void>;
}

export const WeighbridgeRecordForm: FC<IWeighbridgeFormProps> = ({
  handleClose,
  sourceOrderId,
  deliveryId,
  callBack,
  formData,
  formDataLoading,
  searchHandlers,
  onLoadDeliveries,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [netWeight, setNetWeight] = useState<number>(0);

  // selectedOrderId lives in plain React state — completely isolated from Formik.
  // This is the ONLY reliable trigger for loading deliveries because:
  //   - It cannot be reset by enableReinitialize (Formik doesn't know about it)
  //   - It cannot be affected by formData prop changes
  //   - The useEffect below watches it directly with no interference
  const [selectedOrderId, setSelectedOrderId] = useState<string>(sourceOrderId || "");

  const formFields = WeighbridgeRecordFormFields(
    formData.sourceOrders,
    formData.deliveries,
    formData.qualityGrades,
    searchHandlers.handleOrderSearch
  );

  const weighbridgeForm = useFormik({
    initialValues: {
      source_order: sourceOrderId || "",
      delivery: deliveryId || "",
      gross_weight_kg: "",
      tare_weight_kg: 0,
      moisture_level: "",
      quality_grade_id: "",
      notes: "",
    },
    validationSchema: WeighbridgeRecordFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    // FALSE — we set all values manually. enableReinitialize: true would reset
    // source_order to "" every time formData.deliveries changes (i.e. after every
    // successful loadDeliveries call), making it impossible to ever load deliveries.
    enableReinitialize: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createWeighbridgeRecord(values);
        toast.success("Weighbridge record created successfully");
        weighbridgeForm.resetForm();
        setSelectedOrderId("");
        callBack && callBack();
        handleClose();
      } catch (error: any) {
        if (error.response?.data) weighbridgeForm.setErrors(error.response.data);
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  // Intercept FormFactory's field changes by wrapping setFieldValue.
  // When source_order is set by FormFactory (user picks an order from the select),
  // we catch it here, update our local selectedOrderId state, and also let Formik
  // update its own value normally. This is the bridge between FormFactory's
  // internal Formik calls and our delivery-loading logic.
  const originalSetFieldValue = weighbridgeForm.setFieldValue.bind(weighbridgeForm);
  weighbridgeForm.setFieldValue = (field: string, value: any, shouldValidate?: boolean) => {
    if (field === "source_order") {
      setSelectedOrderId(value || "");
    }
    return originalSetFieldValue(field, value, shouldValidate);
  };

  // This effect fires ONLY when selectedOrderId changes — a plain string in
  // React state. Nothing Formik or formData does can reset this.
  useEffect(() => {
    if (selectedOrderId) {
      // Clear delivery selection when order changes
      weighbridgeForm.setFieldValue("delivery", "");
      onLoadDeliveries(selectedOrderId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderId]);

  // Net weight
  useEffect(() => {
    const gross = Number(weighbridgeForm.values.gross_weight_kg) || 0;
    const tare = Number(weighbridgeForm.values.tare_weight_kg) || 0;
    setNetWeight(gross - tare);
  }, [weighbridgeForm.values.gross_weight_kg, weighbridgeForm.values.tare_weight_kg]);

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleClose} disabled={loading || formDataLoading}>Close</Button>
      <Button onClick={() => weighbridgeForm.handleSubmit()} variant="contained" disabled={loading || formDataLoading}>
        {loading || formDataLoading
          ? <><ProgressIndicator color="inherit" size={20} /><Span sx={{ ml: 1 }}>{formDataLoading ? "Loading..." : "Saving..."}</Span></>
          : "Create Record"}
      </Button>
    </>
  );

  return (
    <ModalDialog title="Weighbridge Record" onClose={handleClose} id={uniqueId()} ActionButtons={ActionBtns}>
      {formDataLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <ProgressIndicator /><Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      ) : (
        <form ref={formRef} onSubmit={weighbridgeForm.handleSubmit}>
          <FormFactory
            formikInstance={weighbridgeForm}
            formFields={formFields}
            validationSchema={WeighbridgeRecordFormValidations}
          />

          {selectedOrderId && formData.deliveries.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No delivery records found for this order. Please create a delivery record first.
            </Alert>
          )}

          {netWeight > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Calculated Net Weight: <strong>{netWeight.toFixed(2)} kg</strong>
            </Alert>
          )}
        </form>
      )}
    </ModalDialog>
  );
};

// ============================================================
// SUPPLIER PAYMENT FORM
// ============================================================

interface IPaymentFormProps {
  handleClose: () => void;
  invoiceId?: string;
  callBack?: () => void;
  formData: PaymentFormData;
  formDataLoading: boolean;
  maxAmount: number;
}

export const SupplierPaymentForm: FC<IPaymentFormProps> = ({
  handleClose,
  invoiceId,
  callBack,
  formData,
  formDataLoading,
  maxAmount,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formFields = SupplierPaymentFormFields(formData.invoices);

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
        if (error.response?.data) paymentForm.setErrors(error.response.data);
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleClose} disabled={loading || formDataLoading}>Close</Button>
      <Button onClick={() => paymentForm.handleSubmit()} variant="contained" disabled={loading || formDataLoading}>
        {loading || formDataLoading
          ? <><ProgressIndicator color="inherit" size={20} /><Span sx={{ ml: 1 }}>{formDataLoading ? "Loading..." : "Saving..."}</Span></>
          : "Record Payment"}
      </Button>
    </>
  );

  return (
    <ModalDialog title="Record Payment" onClose={handleClose} id={uniqueId()} ActionButtons={ActionBtns}>
      {formDataLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <ProgressIndicator /><Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      ) : (
        <form ref={formRef} onSubmit={paymentForm.handleSubmit}>
          {maxAmount > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Maximum payment amount: <strong>{maxAmount.toLocaleString()} UGX</strong>
            </Alert>
          )}
          <FormFactory formikInstance={paymentForm} formFields={formFields} validationSchema={SupplierPaymentFormValidations} />
        </form>
      )}
    </ModalDialog>
  );
};