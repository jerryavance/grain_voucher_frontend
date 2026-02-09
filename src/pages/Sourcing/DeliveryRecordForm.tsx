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

