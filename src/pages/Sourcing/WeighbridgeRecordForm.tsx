// ============================================================
// WEIGHBRIDGE RECORD FORM
// UPDATED: removed quality_grade, moisture_level; added vehicle_number
// vehicle_number auto-filled from selected delivery label
// ============================================================

import { FC, useEffect, useRef, useState } from "react";
import { Button, Alert, Box } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { WeighbridgeRecordFormFields } from "./SourcingFormFields";
import { WeighbridgeRecordFormValidations } from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import { TOption } from "../../@types/common";

// UPDATED: IWeighbridgeFormProps — no formData/searchHandlers/onLoadDeliveries (self-fetching)
interface IWeighbridgeFormProps {
  handleClose: () => void;
  sourceOrderId?: string;
  deliveryId?: string;
  callBack?: () => void;
}

export const WeighbridgeRecordForm: FC<IWeighbridgeFormProps> = ({
  handleClose,
  sourceOrderId,
  deliveryId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);

  const [sourceOrders, setSourceOrders] = useState<TOption[]>([]);
  const [deliveries, setDeliveries] = useState<TOption[]>([]);
  const [netWeight, setNetWeight] = useState<number>(0);

  useEffect(() => {
    loadAllOptions();
  }, []);

  async function loadAllOptions() {
    setOptionsLoading(true);
    await Promise.all([
      loadSourceOrders(),
      ...(sourceOrderId ? [loadDeliveries(sourceOrderId)] : [])
    ]);
    setOptionsLoading(false);
  }

  async function loadSourceOrders(search?: string) {
    try {
      const data = await SourcingService.getSourceOrders({ search, status: "delivered", page_size: 50 });
      setSourceOrders(data.results.map((order: any) => ({
        label: `${order.order_number} - ${order.supplier_name}`,
        value: order.id,
      })));
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }

  async function loadDeliveries(orderId: string) {
    try {
      const data = await SourcingService.getDeliveryRecords({ source_order: orderId, page_size: 50 });
      setDeliveries(data.results.map((delivery: any) => ({
        label: `Delivery on ${new Date(delivery.received_at).toLocaleDateString()} — ${delivery.driver_name} (${delivery.vehicle_number})`,
        value: delivery.id,
      })));
    } catch (error) {
      console.error("Error loading deliveries:", error);
    }
  }

  function handleOrderSearch(value: any) {
    loadSourceOrders(value);
  }

  // UPDATED: no qualityGrades param
  const formFields = WeighbridgeRecordFormFields(sourceOrders, deliveries, handleOrderSearch);

  const weighbridgeForm = useFormik({
    // UPDATED: no moisture_level, quality_grade; added vehicle_number
    initialValues: {
      ...getInitialValues(formFields),
      ...(sourceOrderId && { source_order: sourceOrderId }),
      ...(deliveryId && { delivery: deliveryId }),
      vehicle_number: "",
    },
    validationSchema: WeighbridgeRecordFormValidations,
    validateOnChange: false, validateOnMount: false, validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        await SourcingService.createWeighbridgeRecord(values);
        toast.success("Weighbridge record created successfully");
        weighbridgeForm.resetForm();
        callBack?.(); handleClose();
      } catch (error: any) {
        if (error.response?.data) weighbridgeForm.setErrors(error.response.data);
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  // Net weight calculation
  useEffect(() => {
    const gross = weighbridgeForm.values.gross_weight_kg || 0;
    const tare = weighbridgeForm.values.tare_weight_kg || 0;
    setNetWeight(gross - tare);
  }, [weighbridgeForm.values.gross_weight_kg, weighbridgeForm.values.tare_weight_kg]);

  // Reload deliveries when order changes
  useEffect(() => {
    if (weighbridgeForm.values.source_order) {
      weighbridgeForm.setFieldValue("delivery", "");
      weighbridgeForm.setFieldValue("vehicle_number", "");
      setDeliveries([]);
      loadDeliveries(weighbridgeForm.values.source_order);
    } else {
      setDeliveries([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weighbridgeForm.values.source_order]);

  // Auto-fill vehicle_number from delivery label when delivery selected
  // Label format: "Delivery on DD/MM/YYYY — Driver Name (VEHICLE_NUMBER)"
  useEffect(() => {
    const selectedDelivery = weighbridgeForm.values.delivery;
    if (!selectedDelivery) return;
    const found = deliveries.find(d => d.value === selectedDelivery);
    if (found) {
      const match = found.label.match(/\(([^)]+)\)\s*$/);
      if (match) {
        weighbridgeForm.setFieldValue("vehicle_number", match[1]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weighbridgeForm.values.delivery]);

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleClose} disabled={loading || optionsLoading}>Close</Button>
      <Button
        onClick={() => weighbridgeForm.handleSubmit()}
        variant="contained"
        disabled={loading || optionsLoading}
      >
        {loading || optionsLoading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span sx={{ ml: 1 }}>{optionsLoading ? "Loading..." : "Saving..."}</Span>
          </>
        ) : (
          "Create Record"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog title="Weighbridge Record" onClose={handleClose} id={uniqueId()} ActionButtons={ActionBtns}>
      {optionsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <ProgressIndicator />
        </Box>
      ) : (
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
      )}
    </ModalDialog>
  );
};