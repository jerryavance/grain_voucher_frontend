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
import { ISourceOrderFormProps } from "./Sourcing.interface";
import { TOption } from "../../@types/common";
import { calculateTotalCost, formatCurrency } from "./SourcingConstants";

const SourceOrderForm: FC<ISourceOrderFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Options state
  const [suppliers, setSuppliers] = useState<TOption[]>([]);
  const [hubs, setHubs] = useState<TOption[]>([]);
  const [grainTypes, setGrainTypes] = useState<TOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<TOption[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);

  // Fetch options on mount
  useEffect(() => {
    fetchSuppliers();
    fetchHubs();
    fetchGrainTypes();
  }, []);

  const fetchSuppliers = async (search = '') => {
    try {
      const response = await SourcingService.getSuppliers({ search, is_verified: true });
      const options = response.results.map((supplier: any) => ({
        value: supplier.id,
        label: `${supplier.business_name} (${supplier.user.phone_number})`,
      }));
      setSuppliers(options);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchHubs = async (search = '') => {
    try {
      const response = await fetch(`/api/hubs/hubs/?search=${search}`);
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

  const fetchGrainTypes = async (search = '') => {
    try {
      const response = await fetch(`/api/vouchers/grain-types/?search=${search}`);
      const data = await response.json();
      const options = data.results.map((grain: any) => ({
        value: grain.id,
        label: grain.name,
      }));
      setGrainTypes(options);
    } catch (error) {
      console.error("Error fetching grain types:", error);
    }
  };

  const fetchPaymentMethods = async (supplierId: string) => {
    if (!supplierId) return;
    
    try {
      const response = await SourcingService.getPaymentPreferences({ supplier: supplierId, is_active: true });
      const options = response.results.map((pm: any) => ({
        value: pm.id,
        label: `${pm.method_display}${pm.is_default ? ' (Default)' : ''}`,
      }));
      setPaymentMethods(options);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const formFields = SourceOrderFormFields(
    suppliers,
    hubs,
    grainTypes,
    paymentMethods,
    (value: string) => fetchSuppliers(value),
    (value: string) => fetchHubs(value),
    (value: string) => fetchGrainTypes(value)
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

  // Watch for changes to recalculate total cost
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

  // Fetch payment methods when supplier changes
  useEffect(() => {
    if (orderForm.values.supplier_id) {
      fetchPaymentMethods(orderForm.values.supplier_id);
    }
  }, [orderForm.values.supplier_id]);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      const mappedValues = {
        ...initialValues,
        supplier_id: initialValues.supplier?.id,
        hub_id: initialValues.hub?.id,
        grain_type_id: initialValues.grain_type?.id,
        payment_method_id: initialValues.payment_method?.id,
      };
      orderForm.setValues(patchInitialValues(formFields)(mappedValues));
    }
  }, [initialValues, formType]);

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
        <Button onClick={handleReset} disabled={loading}>
          Close
        </Button>
        <Button 
          onClick={handleButtonClick} 
          type="button"
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Loading...
              </Span>
            </>
          ) : (
            formType === "Update" ? "Update Order" : "Create Order"
          )}
        </Button>
      </>
    );
  };

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
          
          {/* Total Cost Display */}
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