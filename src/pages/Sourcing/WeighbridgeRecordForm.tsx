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