import { FC, useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { Box, Button, Alert, TextField, Typography, Card, CardContent, Chip, Divider } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
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
  AggregatorTradeCostFormFields,
  RejectedLotFormFields,
} from "./SourcingFormFields";
import {
  DeliveryRecordFormValidations,
  WeighbridgeRecordFormValidations,
  SupplierPaymentFormValidations,
} from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import { IAggregatorTradeCost, IRejectedLot } from "./Sourcing.interface";
import { formatCurrency, formatWeight, formatPercentage } from "./SourcingConstants";

interface DropdownOption {
  value: string;
  label: string;
}

interface DeliveryFormData {
  sourceOrders: DropdownOption[];
  hubs: DropdownOption[];
}

// UPDATED: removed qualityGrades
interface WeighbridgeFormData {
  sourceOrders: DropdownOption[];
  deliveries: DropdownOption[];
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
  searchHandlers: { handleOrderSearch: (query: string) => void };
}

export const DeliveryRecordForm: FC<IDeliveryFormProps> = ({
  handleClose, sourceOrderId, callBack, formData, formDataLoading, searchHandlers,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formFields = DeliveryRecordFormFields(
    formData.sourceOrders, formData.hubs, searchHandlers.handleOrderSearch
  );

  const deliveryForm = useFormik({
    initialValues: sourceOrderId
      ? { ...getInitialValues(formFields), source_order: sourceOrderId }
      : getInitialValues(formFields),
    validationSchema: DeliveryRecordFormValidations,
    validateOnChange: false, validateOnMount: false, validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createDeliveryRecord(values);
        toast.success("Delivery record created successfully");
        deliveryForm.resetForm(); callBack?.(); handleClose();
      } catch (error: any) {
        if (error.response?.data) deliveryForm.setErrors(error.response.data);
        toast.error(error.message || "An error occurred");
      } finally { setLoading(false); }
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
// UPDATED: removed qualityGrades, added vehicle_number auto-fill
// ============================================================
interface IWeighbridgeFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  deliveryId?: string;
  callBack?: () => void;
  // UPDATED: no qualityGrades
  formData: WeighbridgeFormData;
  formDataLoading: boolean;
  searchHandlers: { handleOrderSearch: (query: string) => void };
  onLoadDeliveries: (orderId: string) => Promise<void>;
}

export const WeighbridgeRecordForm: FC<IWeighbridgeFormProps> = ({
  handleClose, sourceOrderId, deliveryId, callBack,
  formData, formDataLoading, searchHandlers, onLoadDeliveries,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [netWeight, setNetWeight] = useState<number>(0);
  const prevOrderIdRef = useRef<string>("");

  // UPDATED: no qualityGrades param
  const formFields = WeighbridgeRecordFormFields(
    formData.sourceOrders,
    formData.deliveries,
    searchHandlers.handleOrderSearch
  );

  const weighbridgeForm = useFormik({
    // UPDATED: removed moisture_level, quality_grade; added vehicle_number
    initialValues: {
      source_order: sourceOrderId || "",
      delivery: deliveryId || "",
      vehicle_number: "",
      gross_weight_kg: "",
      tare_weight_kg: 0,
      notes: "",
    },
    validationSchema: WeighbridgeRecordFormValidations,
    validateOnChange: false, validateOnMount: false, validateOnBlur: false,
    enableReinitialize: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createWeighbridgeRecord(values);
        toast.success("Weighbridge record created successfully");
        weighbridgeForm.resetForm();
        prevOrderIdRef.current = "";
        callBack?.(); handleClose();
      } catch (error: any) {
        if (error.response?.data) weighbridgeForm.setErrors(error.response.data);
        toast.error(error.message || "An error occurred");
      } finally { setLoading(false); }
    },
  });

  // When source_order changes, reload deliveries & clear stale selection
  useEffect(() => {
    const orderId = weighbridgeForm.values.source_order;
    if (orderId && orderId !== prevOrderIdRef.current) {
      prevOrderIdRef.current = orderId;
      weighbridgeForm.setFieldValue("delivery", "");
      weighbridgeForm.setFieldValue("vehicle_number", "");
      onLoadDeliveries(orderId);
    }
    if (!orderId) prevOrderIdRef.current = "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weighbridgeForm.values.source_order]);

  // Auto-fill vehicle_number when a delivery is selected
  // The delivery label pattern is: "Delivery on DD/MM/YYYY — Driver Name (VEHICLE_NUMBER)"
  useEffect(() => {
    const deliveryId = weighbridgeForm.values.delivery;
    if (!deliveryId) return;
    const selected = formData.deliveries.find(d => d.value === deliveryId);
    if (selected) {
      const match = selected.label.match(/\(([^)]+)\)\s*$/);
      if (match) {
        weighbridgeForm.setFieldValue("vehicle_number", match[1]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weighbridgeForm.values.delivery]);

  // Net weight calculation
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
  handleClose, invoiceId, callBack, formData, formDataLoading, maxAmount,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formFields = SupplierPaymentFormFields(formData.invoices);

  const paymentForm = useFormik({
    initialValues: invoiceId
      ? { ...getInitialValues(formFields), supplier_invoice: invoiceId }
      : getInitialValues(formFields),
    validationSchema: SupplierPaymentFormValidations,
    validateOnChange: false, validateOnMount: false, validateOnBlur: false,
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
        paymentForm.resetForm(); callBack?.(); handleClose();
      } catch (error: any) {
        if (error.response?.data) paymentForm.setErrors(error.response.data);
        toast.error(error.message || "An error occurred");
      } finally { setLoading(false); }
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
        setSourceOrders((ordersResp.results || []).map((o: any) => ({
          value: o.id,
          label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
        })));
        setHubs((hubsResp.results || hubsResp || []).map((h: any) => ({ value: h.id, label: h.name })));
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => setFormDataLoading(false));
  }, []);

  const handleOrderSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getSourceOrders({ search: query, status: "delivered", page_size: 100 });
        setSourceOrders((results.results || []).map((o: any) => ({
          value: o.id,
          label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
        })));
      } catch { /* swallow */ }
    }, 300), []
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
// UPDATED: no qualityGrades
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
  const [formDataLoading, setFormDataLoading] = useState(true);

  useEffect(() => {
    SourcingService.getSourceOrders({ status: "delivered", page_size: 100 })
      .then(ordersResp => {
        setSourceOrders((ordersResp.results || []).map((o: any) => ({
          value: o.id,
          label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
        })));
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => setFormDataLoading(false));
  }, []);

  const loadDeliveries = async (orderId: string): Promise<void> => {
    try {
      const results = await SourcingService.getDeliveryRecords({ source_order: orderId, page_size: 100 });
      setDeliveries((results.results || []).map((d: any) => ({
        value: d.id,
        label: `Delivery on ${new Date(d.received_at).toLocaleDateString()} — ${d.driver_name} (${d.vehicle_number})`,
      })));
    } catch {
      toast.error("Failed to load deliveries for selected order");
    }
  };

  const handleOrderSearch = useCallback(
    debounce(async (query: string) => {
      try {
        const results = await SourcingService.getSourceOrders({ search: query, status: "delivered", page_size: 100 });
        setSourceOrders((results.results || []).map((o: any) => ({
          value: o.id,
          label: `${o.order_number} — ${o.supplier_name ?? o.supplier?.business_name ?? "Unknown"}`,
        })));
      } catch { /* swallow */ }
    }, 300), []
  );

  return (
    <WeighbridgeRecordForm
      {...props}
      // UPDATED: no qualityGrades
      formData={{ sourceOrders, deliveries }}
      formDataLoading={formDataLoading}
      searchHandlers={{ handleOrderSearch }}
      onLoadDeliveries={loadDeliveries}
    />
  );
};

// ============================================================
// NEW: AGGREGATOR TRADE COST FORM
// Used inline in SourceOrderDetails and as standalone dialog
// ============================================================

interface IAggregatorCostFormProps {
  open: boolean;
  sourceOrderId: string;
  sourceOrderNumber?: string;
  existingRecord?: IAggregatorTradeCost | null;
  handleClose: () => void;
  callBack?: () => void;
}

export const AggregatorTradeCostForm: FC<IAggregatorCostFormProps> = ({
  open, sourceOrderId, sourceOrderNumber, existingRecord, handleClose, callBack,
}) => {
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(existingRecord);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      source_order: sourceOrderId,
      source_quantity_kg: existingRecord?.source_quantity_kg ?? "",
      arrived_quantity_kg: existingRecord?.arrived_quantity_kg ?? "",
      buyer_deduction_kg: existingRecord?.buyer_deduction_kg ?? 0,
      buyer_deduction_reason: existingRecord?.buyer_deduction_reason ?? "",
      destination_weighbridge_cost: existingRecord?.destination_weighbridge_cost ?? 0,
      transit_insurance_cost: existingRecord?.transit_insurance_cost ?? 0,
      other_destination_costs: existingRecord?.other_destination_costs ?? 0,
      notes: existingRecord?.notes ?? "",
    },
    validationSchema: Yup.object({
      source_quantity_kg: Yup.number().positive("Must be positive").required("Source quantity required"),
      arrived_quantity_kg: Yup.number().positive("Must be positive").required("Arrived quantity required"),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          source_quantity_kg: Number(values.source_quantity_kg),
          arrived_quantity_kg: Number(values.arrived_quantity_kg),
          buyer_deduction_kg: Number(values.buyer_deduction_kg),
          destination_weighbridge_cost: Number(values.destination_weighbridge_cost),
          transit_insurance_cost: Number(values.transit_insurance_cost),
          other_destination_costs: Number(values.other_destination_costs),
        };
        if (isEdit && existingRecord) {
          await SourcingService.updateAggregatorTradeCost(existingRecord.id, payload);
          toast.success("Aggregator costs updated");
        } else {
          await SourcingService.createAggregatorTradeCost(payload);
          toast.success("Aggregator costs recorded");
        }
        callBack?.();
        handleClose();
      } catch (e: any) {
        const msg = e?.response?.data?.non_field_errors?.[0]
          || e?.response?.data?.source_order?.[0]
          || e?.response?.data?.detail
          || "Failed to save aggregator costs";
        toast.error(msg);
      } finally { setLoading(false); }
    },
  });

  // Live computed preview values
  const sourceQty = Number(form.values.source_quantity_kg) || 0;
  const arrivedQty = Number(form.values.arrived_quantity_kg) || 0;
  const buyerDeduction = Number(form.values.buyer_deduction_kg) || 0;
  const transitLoss = sourceQty - arrivedQty;
  const transitLossPct = sourceQty > 0 ? (transitLoss / sourceQty) * 100 : 0;
  const netAccepted = arrivedQty - buyerDeduction;
  const totalAddCosts =
    (Number(form.values.destination_weighbridge_cost) || 0) +
    (Number(form.values.transit_insurance_cost) || 0) +
    (Number(form.values.other_destination_costs) || 0);

  if (!open) return null;

  return (
    <ModalDialog
      title={isEdit ? "Edit Aggregator Costs" : "Record Aggregator Costs"}
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={() => form.handleSubmit()} disabled={loading}>
            {loading ? <ProgressIndicator color="inherit" size={20} /> : isEdit ? "Update" : "Save Costs"}
          </Button>
        </>
      )}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sourceOrderNumber && (
          <Alert severity="info">Recording costs for order: <strong>{sourceOrderNumber}</strong></Alert>
        )}

        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, mt: 1 }}>
          TONNAGE
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Source Quantity (kg) *" type="number" fullWidth
            value={form.values.source_quantity_kg}
            onChange={e => form.setFieldValue("source_quantity_kg", e.target.value)}
            error={Boolean(form.touched.source_quantity_kg && form.errors.source_quantity_kg)}
            helperText={form.touched.source_quantity_kg && form.errors.source_quantity_kg as string}
          />
          <TextField
            label="Arrived Quantity (kg) *" type="number" fullWidth
            value={form.values.arrived_quantity_kg}
            onChange={e => form.setFieldValue("arrived_quantity_kg", e.target.value)}
            error={Boolean(form.touched.arrived_quantity_kg && form.errors.arrived_quantity_kg)}
            helperText={form.touched.arrived_quantity_kg && form.errors.arrived_quantity_kg as string}
          />
          <TextField
            label="Buyer Deduction (kg)" type="number" fullWidth
            value={form.values.buyer_deduction_kg}
            onChange={e => form.setFieldValue("buyer_deduction_kg", e.target.value)}
          />
          <TextField
            label="Deduction Reason" fullWidth
            value={form.values.buyer_deduction_reason}
            onChange={e => form.setFieldValue("buyer_deduction_reason", e.target.value)}
          />
        </Box>

        {/* Live tonnage preview */}
        {(sourceQty > 0 || arrivedQty > 0) && (
          <Card variant="outlined" sx={{ bgcolor: "background.default" }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.primary" display="block" gutterBottom>Live Tonnage Preview</Typography>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption">Transit Loss</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: transitLoss > 0 ? "error.main" : "success.main" }}>
                    {transitLoss >= 0 ? `-${formatWeight(transitLoss)}` : `+${formatWeight(Math.abs(transitLoss))}`}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption">Loss %</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: transitLossPct > 2 ? "error.main" : "success.main" }}>
                    {transitLossPct.toFixed(2)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption">Net Accepted</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                    {formatWeight(netAccepted)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Divider />
        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700 }}>
          DESTINATION COSTS
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
          <TextField
            label="Weighbridge Cost (UGX)" type="number" fullWidth
            value={form.values.destination_weighbridge_cost}
            onChange={e => form.setFieldValue("destination_weighbridge_cost", e.target.value)}
          />
          <TextField
            label="Transit Insurance (UGX)" type="number" fullWidth
            value={form.values.transit_insurance_cost}
            onChange={e => form.setFieldValue("transit_insurance_cost", e.target.value)}
          />
          <TextField
            label="Other Costs (UGX)" type="number" fullWidth
            value={form.values.other_destination_costs}
            onChange={e => form.setFieldValue("other_destination_costs", e.target.value)}
          />
        </Box>

        {totalAddCosts > 0 && (
          <Alert severity="info">
            Total Additional Destination Costs: <strong>{formatCurrency(totalAddCosts)}</strong>
          </Alert>
        )}

        <TextField
          label="Notes" multiline rows={2} fullWidth
          value={form.values.notes}
          onChange={e => form.setFieldValue("notes", e.target.value)}
        />
      </Box>
    </ModalDialog>
  );
};

// ============================================================
// NEW: REJECTED LOT FORM
// Used inline in SaleLots and as standalone dialog
// ============================================================

interface IRejectedLotFormProps {
  open: boolean;
  saleLotId?: string;
  handleClose: () => void;
  callBack?: () => void;
}

export const RejectedLotForm: FC<IRejectedLotFormProps> = ({
  open, saleLotId, handleClose, callBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [saleLots, setSaleLots] = useState<DropdownOption[]>([]);
  const [lotsLoading, setLotsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLotsLoading(true);
    SourcingService.getSaleLots({ page_size: 100 })
      .then(r => setSaleLots((r.results || []).map((l: any) => ({
        value: l.id,
        label: `${l.lot_number} — ${l.grain_type_name} — ${formatWeight(l.available_quantity_kg)} avail`,
      }))))
      .catch(() => toast.error("Failed to load sale lots"))
      .finally(() => setLotsLoading(false));
  }, [open]);

  const formFields = RejectedLotFormFields(saleLots);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      ...getInitialValues(formFields),
      ...(saleLotId ? { sale_lot: saleLotId } : {}),
    },
    validationSchema: Yup.object({
      sale_lot: Yup.string().required("Sale lot required"),
      rejected_quantity_kg: Yup.number().positive("Must be positive").required("Quantity required"),
      rejection_reason: Yup.string().required("Reason required"),
      rejection_details: Yup.string().required("Details required"),
      rejection_date: Yup.string().required("Date required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await SourcingService.createRejectedLot(values as any);
        toast.success("Rejection recorded successfully");
        form.resetForm(); callBack?.(); handleClose();
      } catch (e: any) {
        const msg = e?.response?.data?.non_field_errors?.[0]
          || e?.response?.data?.rejected_quantity_kg?.[0]
          || e?.response?.data?.detail
          || "Failed to record rejection";
        toast.error(msg);
      } finally { setLoading(false); }
    },
  });

  if (!open) return null;

  return (
    <ModalDialog
      title="Record Lot Rejection"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => form.handleSubmit()}
            disabled={loading || lotsLoading}
          >
            {loading ? <ProgressIndicator color="inherit" size={20} /> : "Record Rejection"}
          </Button>
        </>
      )}
    >
      {lotsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <ProgressIndicator /><Span sx={{ ml: 2 }}>Loading lots...</Span>
        </Box>
      ) : (
        <FormFactory
          formikInstance={form}
          formFields={formFields}
          validationSchema={Yup.object({
            sale_lot: Yup.string().required("Sale lot required"),
            rejected_quantity_kg: Yup.number().positive("Must be positive").required("Quantity required"),
            rejection_reason: Yup.string().required("Reason required"),
            rejection_details: Yup.string().required("Details required"),
            rejection_date: Yup.string().required("Date required"),
          })}
        />
      )}
    </ModalDialog>
  );
};