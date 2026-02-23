// ============================================================
// WEIGHBRIDGE RECORD FORM - FIXED VERSION
// Key fix: Load options before initializing form
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
import { IWeighbridgeFormProps } from "./Sourcing.interface";
import { TOption } from "../../@types/common";

export const WeighbridgeRecordForm: FC<IWeighbridgeFormProps> = ({
  handleClose,
  sourceOrderId,
  deliveryId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true); // ✅ NEW
  
  const [sourceOrders, setSourceOrders] = useState<TOption[]>([]);
  const [deliveries, setDeliveries] = useState<TOption[]>([]);
  const [qualityGrades, setQualityGrades] = useState<TOption[]>([]);
  const [netWeight, setNetWeight] = useState<number>(0);

  // ✅ FIX: Load all options on mount
  useEffect(() => {
    loadAllOptions();
  }, []);

  async function loadAllOptions() {
    setOptionsLoading(true);
    await Promise.all([
      loadSourceOrders(),
      loadQualityGrades(),
      ...(sourceOrderId ? [loadDeliveries(sourceOrderId)] : [])
    ]);
    setOptionsLoading(false);
  }

  async function loadSourceOrders(search?: string) {
    try {
      const data = await SourcingService.getSourceOrders({ 
        search, 
        status: 'delivered',
        page_size: 50
      });
      setSourceOrders(
        data.results.map((order: any) => ({
          label: `${order.order_number} - ${order.supplier_name}`,
          value: order.id,
        }))
      );
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }

  async function loadDeliveries(orderId: string) {
    try {
      const data = await SourcingService.getDeliveryRecords({ 
        source_order: orderId,
        page_size: 50
      });
      setDeliveries(
        data.results.map((delivery: any) => ({
          label: `Delivery at ${delivery.hub.name} - ${new Date(delivery.received_at).toLocaleDateString()}`,
          value: delivery.id,
        }))
      );
    } catch (error) {
      console.error("Error loading deliveries:", error);
    }
  }

  async function loadQualityGrades(search?: string) {
    try {
      const data = await SourcingService.getQualityGrades(search);
      setQualityGrades(
        data.results.map((grade: any) => ({
          label: grade.name,
          value: grade.id,
        }))
      );
    } catch (error) {
      console.error("Error loading quality grades:", error);
    }
  }

  function handleOrderSearch(value: any) {
    loadSourceOrders(value);
  }

  // ✅ Generate formFields WITH loaded options
  const formFields = WeighbridgeRecordFormFields(
    sourceOrders,
    deliveries,
    qualityGrades,
    handleOrderSearch
  );

  const weighbridgeForm = useFormik({
    initialValues: {
      ...getInitialValues(formFields),
      ...(sourceOrderId && { source_order: sourceOrderId }),
      ...(deliveryId && { delivery_id: deliveryId }),
    },
    validationSchema: WeighbridgeRecordFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
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
    if (weighbridgeForm.values.source_order) {
      loadDeliveries(weighbridgeForm.values.source_order);
    }
  }, [weighbridgeForm.values.source_order]);

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleClose} disabled={loading || optionsLoading}>
          Close
        </Button>
        <Button 
          onClick={() => weighbridgeForm.handleSubmit()} 
          variant="contained" 
          disabled={loading || optionsLoading}
        >
          {loading || optionsLoading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span sx={{ ml: 1 }}>
                {optionsLoading ? "Loading..." : "Saving..."}
              </Span>
            </>
          ) : (
            "Create Record"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="Weighbridge Record"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      {optionsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
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