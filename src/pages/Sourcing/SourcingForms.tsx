// ============================================================
// SOURCING FORMS - COMPLETE FIXED VERSION
// DeliveryRecordForm, WeighbridgeRecordForm, SupplierPaymentForm
// All forms receive data as props from parent components
// ============================================================

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

// ============================================================
// INTERFACES
// ============================================================

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
      ? { ...getInitialValues(formFields), source_order_id: sourceOrderId }
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
        <Button onClick={handleClose} disabled={loading || formDataLoading}>
          Close
        </Button>
        <Button 
          onClick={() => deliveryForm.handleSubmit()} 
          variant="contained" 
          disabled={loading || formDataLoading}
        >
          {loading || formDataLoading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span sx={{ ml: 1 }}>
                {formDataLoading ? "Loading..." : "Saving..."}
              </Span>
            </>
          ) : (
            "Record Delivery"
          )}
        </Button>
      </>
    );
  };

  if (formDataLoading) {
    return (
      <ModalDialog
        title="Record Delivery"
        onClose={handleClose}
        id={uniqueId()}
        ActionButtons={ActionBtns}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <ProgressIndicator />
          <Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog
      title="Record Delivery"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
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

  const formFields = WeighbridgeRecordFormFields(
    formData.sourceOrders,
    formData.deliveries,
    formData.qualityGrades,
    searchHandlers.handleOrderSearch
  );

  const weighbridgeForm = useFormik({
    initialValues: {
      ...getInitialValues(formFields),
      ...(sourceOrderId && { source_order_id: sourceOrderId }),
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
    if (weighbridgeForm.values.source_order_id) {
      onLoadDeliveries(weighbridgeForm.values.source_order_id);
    }
  }, [weighbridgeForm.values.source_order_id]);

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleClose} disabled={loading || formDataLoading}>
          Close
        </Button>
        <Button 
          onClick={() => weighbridgeForm.handleSubmit()} 
          variant="contained" 
          disabled={loading || formDataLoading}
        >
          {loading || formDataLoading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span sx={{ ml: 1 }}>
                {formDataLoading ? "Loading..." : "Saving..."}
              </Span>
            </>
          ) : (
            "Create Record"
          )}
        </Button>
      </>
    );
  };

  if (formDataLoading) {
    return (
      <ModalDialog
        title="Weighbridge Record"
        onClose={handleClose}
        id={uniqueId()}
        ActionButtons={ActionBtns}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <ProgressIndicator />
          <Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog
      title="Weighbridge Record"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
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
        if (error.response?.data) {
          paymentForm.setErrors(error.response.data);
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
        <Button onClick={handleClose} disabled={loading || formDataLoading}>
          Close
        </Button>
        <Button 
          onClick={() => paymentForm.handleSubmit()} 
          variant="contained" 
          disabled={loading || formDataLoading}
        >
          {loading || formDataLoading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span sx={{ ml: 1 }}>
                {formDataLoading ? "Loading..." : "Saving..."}
              </Span>
            </>
          ) : (
            "Record Payment"
          )}
        </Button>
      </>
    );
  };

  if (formDataLoading) {
    return (
      <ModalDialog
        title="Record Payment"
        onClose={handleClose}
        id={uniqueId()}
        ActionButtons={ActionBtns}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <ProgressIndicator />
          <Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      </ModalDialog>
    );
  }

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