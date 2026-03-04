import { FC, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Chip, Divider, Typography } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import StorefrontIcon from "@mui/icons-material/Storefront";
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

  // UPDATED: watches all 7 cost fields including loading_cost and offloading_cost
  useEffect(() => {
    const cost = calculateTotalCost(orderForm.values);
    setTotalCost(cost);
  }, [
    orderForm.values.quantity_kg,
    orderForm.values.offered_price_per_kg,
    orderForm.values.weighbridge_cost,
    orderForm.values.logistics_cost,
    orderForm.values.loading_cost,
    orderForm.values.offloading_cost,
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
        // NEW: ensure trade_type and cost fields are mapped
        trade_type: initialValues.trade_type || "direct",
        loading_cost: initialValues.loading_cost || 0,
        offloading_cost: initialValues.offloading_cost || 0,
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
      callBack?.(); handleClose();
    } catch (error: any) {
      if (error.response?.data) orderForm.setErrors(error.response.data);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    orderForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading || formDataLoading}>Close</Button>
      <Button
        onClick={() => orderForm.handleSubmit()}
        type="button"
        variant="contained"
        disabled={loading || formDataLoading}
      >
        {loading || formDataLoading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
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

  if (formDataLoading) {
    return (
      <ModalDialog
        title={formType === "Save" ? "New Source Order" : "Edit Source Order"}
        onClose={handleReset}
        id={uniqueId()}
        ActionButtons={ActionBtns}
        maxWidth="md"
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
          <ProgressIndicator />
          <Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      </ModalDialog>
    );
  }

  const isAggregator = orderForm.values.trade_type === "aggregator";
  const grainCost =
    (parseFloat(orderForm.values.quantity_kg) || 0) *
    (parseFloat(orderForm.values.offered_price_per_kg) || 0);

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
        onSubmit={e => { e.preventDefault(); handleSubmit(orderForm.values); }}
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={orderForm}
            formFields={formFields}
            validationSchema={SourceOrderFormValidations}
          />

          {/* Aggregator trade info banner */}
          {isAggregator && (
            <Alert
              severity="info"
              icon={<StorefrontIcon />}
              sx={{ mt: 2 }}
            >
              <strong>Aggregator Trade</strong> — After delivery, record the actual tonnage and destination costs
              (weighbridge, insurance, etc.) using the "Record Aggregator Costs" action on the order details page.
              The effective cost/kg will be computed automatically.
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Cost Summary */}
          <Box sx={{
            p: 2, bgcolor: "background.paper", borderRadius: 1,
            border: "1px solid", borderColor: "divider",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Typography variant="h6">Cost Summary</Typography>
              {isAggregator && (
                <Chip label="Aggregator Trade" size="small" color="info" variant="outlined" />
              )}
            </Box>

            {[
              ["Grain Cost", formatCurrency(grainCost)],
              ["Weighbridge Cost", formatCurrency(orderForm.values.weighbridge_cost || 0)],
              ["Logistics Cost", formatCurrency(orderForm.values.logistics_cost || 0)],
              // NEW: loading/offloading
              ["Loading Cost", formatCurrency(orderForm.values.loading_cost || 0)],
              ["Offloading Cost", formatCurrency(orderForm.values.offloading_cost || 0)],
              ["Handling Cost", formatCurrency(orderForm.values.handling_cost || 0)],
              ["Other Costs", formatCurrency(orderForm.values.other_costs || 0)],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Span sx={{ color: "text.secondary" }}>{label}:</Span>
                <Span>{value}</Span>
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Total Cost:</Typography>
              <Typography variant="h6" color="primary">{formatCurrency(totalCost)}</Typography>
            </Box>
          </Box>
        </Box>
      </form>
    </ModalDialog>
  );
};

export default SourceOrderForm;