import { FC, useEffect, useRef, useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { SourceOrderFormFields } from "./SourcingFormFields";
import { SourceOrderFormValidations } from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import { calculateTotalCost, formatCurrency } from "./SourcingConstants";

interface ISourceOrderFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callBack?: () => void;
  formData: {
    suppliers: { value: string; label: string }[];
    hubs: { value: string; label: string }[];
    grainTypes: { value: string; label: string }[];
    paymentMethods: { value: string; label: string }[];
  };
  formDataLoading: boolean;
  searchHandlers: {
    handleSupplierSearch: (query: string) => void;
    handleHubSearch: (query: string) => void;
    handleGrainTypeSearch: (query: string) => void;
  };
  onLoadPaymentMethods: (supplierId: string) => Promise<void>;
}

const SourceOrderForm: FC<ISourceOrderFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
  formData,
  formDataLoading,
  searchHandlers,
  onLoadPaymentMethods,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number>(0);

  const formFields = SourceOrderFormFields(
    formData.suppliers,
    formData.hubs,
    formData.grainTypes,
    formData.paymentMethods,
    searchHandlers.handleSupplierSearch,
    searchHandlers.handleHubSearch,
    searchHandlers.handleGrainTypeSearch
  );

  const orderForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: SourceOrderFormValidations,
    validateOnChange: true,
    validateOnMount: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    const cost = calculateTotalCost(orderForm.values);
    setTotalCost(cost);
  }, [
    orderForm.values.quantity_kg,
    orderForm.values.offered_price_per_kg,
    orderForm.values.weighbridge_cost,
    orderForm.values.logistics_cost,
    orderForm.values.handling_cost,
    orderForm.values.other_costs,
  ]);

  useEffect(() => {
    if (orderForm.values.supplier_id) {
      onLoadPaymentMethods(orderForm.values.supplier_id);
    }
  }, [orderForm.values.supplier_id]);

  useEffect(() => {
    if (formType === "Update" && initialValues && !formDataLoading) {
      const mappedValues = {
        ...initialValues,
        supplier_id: initialValues.supplier?.id,
        hub_id: initialValues.hub?.id,
        grain_type_id: initialValues.grain_type?.id,
        payment_method_id: initialValues.payment_method?.id,
      };
      orderForm.setValues(patchInitialValues(formFields)(mappedValues));
    }
  }, [initialValues, formType, formDataLoading]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await SourcingService.updateSourceOrder(initialValues.id, values);
        toast.success("Source order updated successfully");
      } else {
        await SourcingService.createSourceOrder(values);
        toast.success("Source order created successfully");
      }
      
      orderForm.resetForm();
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      
      if (error.response?.data) {
        orderForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    orderForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    orderForm.handleSubmit();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading || formDataLoading}>
          Close
        </Button>
        <Button 
          onClick={handleButtonClick} 
          type="button"
          variant="contained"
          disabled={loading || formDataLoading}
        >
          {loading || formDataLoading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                {formDataLoading ? "Loading..." : "Saving..."}
              </Span>
            </>
          ) : (
            formType === "Update" ? "Update Order" : "Create Order"
          )}
        </Button>
      </>
    );
  };

  if (formDataLoading) {
    return (
      <ModalDialog
        title={formType === "Save" ? "New Source Order" : "Edit Source Order"}
        onClose={handleReset}
        id={uniqueId()}
        ActionButtons={ActionBtns}
        maxWidth="md"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <ProgressIndicator />
          <Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog
      title={formType === "Save" ? "New Source Order" : "Edit Source Order"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(orderForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={orderForm}
            formFields={formFields}
            validationSchema={SourceOrderFormValidations}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" gutterBottom>
              Cost Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Span>Grain Cost:</Span>
              <Span sx={{ fontWeight: 600 }}>
                {formatCurrency((orderForm.values.quantity_kg || 0) * (orderForm.values.offered_price_per_kg || 0))}
              </Span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Span>Weighbridge Cost:</Span>
              <Span>{formatCurrency(orderForm.values.weighbridge_cost || 0)}</Span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Span>Logistics Cost:</Span>
              <Span>{formatCurrency(orderForm.values.logistics_cost || 0)}</Span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Span>Handling Cost:</Span>
              <Span>{formatCurrency(orderForm.values.handling_cost || 0)}</Span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Span>Other Costs:</Span>
              <Span>{formatCurrency(orderForm.values.other_costs || 0)}</Span>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h6">Total Cost:</Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(totalCost)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </form>
    </ModalDialog>
  );
};

export default SourceOrderForm;