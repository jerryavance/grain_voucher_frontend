// ============================================================
// DELIVERY RECORD FORM - FIXED VERSION
// Key fix: Load options before initializing form
// ============================================================

import { FC, useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { DeliveryRecordFormFields } from "./SourcingFormFields";
import { DeliveryRecordFormValidations } from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import { IDeliveryFormProps } from "./Sourcing.interface";
import { TOption } from "../../@types/common";
import { Box } from "@mui/material";

export const DeliveryRecordForm: FC<IDeliveryFormProps> = ({
  handleClose,
  sourceOrderId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true); // ✅ NEW
  
  const [sourceOrders, setSourceOrders] = useState<TOption[]>([]);
  const [hubs, setHubs] = useState<TOption[]>([]);

  // ✅ FIX: Load all options on mount
  useEffect(() => {
    loadAllOptions();
  }, []);

  async function loadAllOptions() {
    setOptionsLoading(true);
    await Promise.all([
      loadSourceOrders(),
      loadHubs()
    ]);
    setOptionsLoading(false);
  }

  async function loadSourceOrders(search?: string) {
    try {
      const data = await SourcingService.getSourceOrders({ 
        search, 
        status: 'in_transit',
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

  async function loadHubs(search?: string) {
    try {
      const data = await SourcingService.getHubs(search);
      setHubs(
        data.results.map((hub: any) => ({
          label: hub.name,
          value: hub.id,
        }))
      );
    } catch (error) {
      console.error("Error loading hubs:", error);
    }
  }

  function handleOrderSearch(value: any) {
    loadSourceOrders(value);
  }

  // ✅ Generate formFields WITH loaded options
  const formFields = DeliveryRecordFormFields(
    sourceOrders,
    hubs,
    handleOrderSearch
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
        if (error.response?.data) {
          deliveryForm.setErrors(error.response.data);
        }
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleClose} disabled={loading || optionsLoading}>
          Close
        </Button>
        <Button 
          onClick={() => deliveryForm.handleSubmit()} 
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
            "Record Delivery"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="Record Delivery"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      {optionsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <ProgressIndicator />
        </Box>
      ) : (
        <form ref={formRef} onSubmit={deliveryForm.handleSubmit}>
          <FormFactory
            formikInstance={deliveryForm}
            formFields={formFields}
            validationSchema={DeliveryRecordFormValidations}
          />
        </form>
      )}
    </ModalDialog>
  );
};