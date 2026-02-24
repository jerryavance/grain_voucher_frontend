import { FC, useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
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
  // Track the previously seen source_order to avoid re-fetching on unrelated re-renders
  const prevOrderIdRef = useRef<string>("");

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
      quality_grade: "",
      notes: "",
    },
    validationSchema: WeighbridgeRecordFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    // FALSE — enableReinitialize: true would reset source_order to "" every time
    // formData.deliveries changes (after every loadDeliveries call), breaking the flow.
    enableReinitialize: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createWeighbridgeRecord(values);
        toast.success("Weighbridge record created successfully");
        weighbridgeForm.resetForm();
        prevOrderIdRef.current = "";
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

  // Watch values.source_order directly — this is reliable because Formik
  // always updates its values object when setFieldValue is called, regardless
  // of how FormFactory invokes it internally.
  useEffect(() => {
    const orderId = weighbridgeForm.values.source_order;
    if (orderId && orderId !== prevOrderIdRef.current) {
      prevOrderIdRef.current = orderId;
      // Clear stale delivery selection whenever the order changes
      weighbridgeForm.setFieldValue("delivery", "");
      onLoadDeliveries(orderId);
    }
    if (!orderId) {
      prevOrderIdRef.current = "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weighbridgeForm.values.source_order]);

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

          {weighbridgeForm.values.source_order && formData.deliveries.length === 0 && (
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

// ============================================================
// STANDALONE DELIVERY RECORD FORM
// Self-fetching wrapper — used by SourceOrderDetails where the
// parent should not have to manage formData / loading state.
// ============================================================

interface IStandaloneDeliveryFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  callBack?: () => void;
}

export const StandaloneDeliveryRecordForm: FC<IStandaloneDeliveryFormProps> = (props) => {
  const [sourceOrders, setSourceOrders] = useState<DropdownOption[]>([]);
  const [hubs, setHubs] = useState<DropdownOption[]>([]);
  const [formDataLoading, setFormDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SourcingService.getSourceOrders({ status: "delivered", page_size: 100 }),
      SourcingService.getHubs(),
    ])
      .then(([ordersResp, hubsResp]) => {
        setSourceOrders(
          (ordersResp.results || []).map((o: any) => ({
            value: o.id,
            label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
          }))
        );
        setHubs(
          (hubsResp.results || hubsResp || []).map((h: any) => ({
            value: h.id,
            label: h.name,
          }))
        );
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => setFormDataLoading(false));
  }, []);

  const handleOrderSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getSourceOrders({
          search: query,
          status: "delivered",
          page_size: 100,
        });
        setSourceOrders(
          (results.results || []).map((o: any) => ({
            value: o.id,
            label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
          }))
        );
      } catch { /* swallow search errors */ }
    }, 300),
    []
  );

  return (
    <DeliveryRecordForm
      {...props}
      formData={{ sourceOrders, hubs }}
      formDataLoading={formDataLoading}
      searchHandlers={{ handleOrderSearch }}
    />
  );
};

// ============================================================
// STANDALONE WEIGHBRIDGE RECORD FORM
// Self-fetching wrapper — used by SourceOrderDetails where the
// parent should not have to manage formData / loading state.
// ============================================================

interface IStandaloneWeighbridgeFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  deliveryId?: string;
  callBack?: () => void;
}

export const StandaloneWeighbridgeRecordForm: FC<IStandaloneWeighbridgeFormProps> = (props) => {
  const [sourceOrders, setSourceOrders] = useState<DropdownOption[]>([]);
  const [deliveries, setDeliveries] = useState<DropdownOption[]>([]);
  const [qualityGrades, setQualityGrades] = useState<DropdownOption[]>([]);
  const [formDataLoading, setFormDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SourcingService.getSourceOrders({ status: "delivered", page_size: 100 }),
      SourcingService.getQualityGrades(),
    ])
      .then(([ordersResp, gradesResp]) => {
        setSourceOrders(
          (ordersResp.results || []).map((o: any) => ({
            value: o.id,
            label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
          }))
        );
        setQualityGrades(
          (gradesResp.results || gradesResp || []).map((g: any) => ({
            value: g.id,
            label: g.name,
          }))
        );
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => setFormDataLoading(false));
  }, []);

  const loadDeliveries = async (orderId: string): Promise<void> => {
    try {
      const results = await SourcingService.getDeliveryRecords({
        source_order: orderId,
        page_size: 100,
      });
      setDeliveries(
        (results.results || []).map((d: any) => ({
          value: d.id,
          label: `Delivery on ${new Date(d.received_at).toLocaleDateString()} — ${d.driver_name} (${d.vehicle_number})`,
        }))
      );
    } catch {
      toast.error("Failed to load deliveries for selected order");
    }
  };

  const handleOrderSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getSourceOrders({
          search: query,
          status: "delivered",
          page_size: 100,
        });
        setSourceOrders(
          (results.results || []).map((o: any) => ({
            value: o.id,
            label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
          }))
        );
      } catch { /* swallow search errors */ }
    }, 300),
    []
  );

  return (
    <WeighbridgeRecordForm
      {...props}
      formData={{ sourceOrders, deliveries, qualityGrades }}
      formDataLoading={formDataLoading}
      searchHandlers={{ handleOrderSearch }}
      onLoadDeliveries={loadDeliveries}
    />
  );
};