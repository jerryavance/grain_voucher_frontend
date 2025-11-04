// TradeForm.tsx - UPDATED with Invoice Information Display
import React, { FC, useEffect, useRef, useState } from "react";
import { 
  Box, 
  Button, 
  Alert, 
  Typography, 
  Paper,
  Divider 
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeFormFields, getInvoiceInfoFromPaymentTerms, PAYMENT_TERMS_OPTIONS } from "./TradeFormFields";
import { TradeService } from "./Trade.service";
import { TradeFormValidations } from "./TradeFormValidations";
import { ITradeFormProps } from "./Trade.interface";
import { TOption } from "../../@types/common";
import { toast } from "react-hot-toast";

const TradeForm: FC<ITradeFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [warning, setWarning] = useState<string>("");

  // State for dropdown options
  const [hubs, setHubs] = useState<TOption[]>([]);
  const [grainTypes, setGrainTypes] = useState<TOption[]>([]);
  const [qualityGrades, setQualityGrades] = useState<TOption[]>([]);
  const [buyers, setBuyers] = useState<TOption[]>([]);
  const [suppliers, setSuppliers] = useState<TOption[]>([]);

  // State for invoice info display
  const [invoiceInfo, setInvoiceInfo] = useState<any>(null);

  const formFields = TradeFormFields({
    hubs,
    grainTypes,
    qualityGrades,
    buyers,
    suppliers,
    isUpdate: formType === "Update",
  });

  const tradeForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: TradeFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      const patchedValues = {
        ...initialValues,
        buyer_id: initialValues.buyer?.id || initialValues.buyer_id,
        supplier_id: initialValues.supplier?.id || initialValues.supplier_id,
        hub_id: initialValues.hub?.id || initialValues.hub_id,
        grain_type_id: initialValues.grain_type?.id || initialValues.grain_type_id,
        quality_grade_id: initialValues.quality_grade?.id || initialValues.quality_grade_id,
      };
      tradeForm.setValues(patchInitialValues(formFields)(patchedValues));
    }
  }, [initialValues, formType, hubs, grainTypes, qualityGrades, buyers, suppliers]);

  // Watch for payment terms changes
  useEffect(() => {
    const paymentTerms = tradeForm.values.payment_terms;
    if (paymentTerms) {
      const info = getInvoiceInfoFromPaymentTerms(paymentTerms);
      setInvoiceInfo(info);
      
      // Auto-fill payment_terms_days
      if (info.days !== null) {
        tradeForm.setFieldValue('payment_terms_days', info.days);
      }
      
      // Auto-calculate payment due date if delivery date is set
      const deliveryDate = tradeForm.values.delivery_date;
      if (deliveryDate && info.days !== null) {
        const dueDate = new Date(deliveryDate);
        dueDate.setDate(dueDate.getDate() + info.days);
        tradeForm.setFieldValue('payment_due_date', dueDate.toISOString().split('T')[0]);
      }
    }
  }, [tradeForm.values.payment_terms, tradeForm.values.delivery_date]);

  const fetchDropdownData = async () => {
    try {
      const [hubsData, grainTypesData, qualityGradesData, buyersData, suppliersData] = await Promise.all([
        TradeService.getHubs(),
        TradeService.getGrainTypes(),
        TradeService.getQualityGrades(),
        TradeService.getBuyers(),
        TradeService.getSuppliers(),
      ]);

      setHubs(hubsData.map((h: any) => ({ label: h.name, value: h.id })));
      setGrainTypes(grainTypesData.map((g: any) => ({ label: g.name, value: g.id })));
      setQualityGrades(qualityGradesData.map((q: any) => ({ label: q.name, value: q.id })));
      setBuyers(buyersData.map((b: any) => ({ label: b.name, value: b.id })));
      setSuppliers(suppliersData.map((s: any) => ({ 
        label: `${s.first_name} ${s.last_name}`, 
        value: s.id 
      })));
    } catch (error: any) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load form data");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setWarning("");
    try {
      if (formType === "Update") {
        await TradeService.updateTrade(initialValues.id, values);
        toast.success("Trade updated successfully");
        tradeForm.resetForm();
        callBack && callBack();
        handleClose();
      } else {
        const response = await TradeService.createTrade(values);
        
        if (response.warning) {
          setWarning(response.warning);
          toast("Trade created - pending approval", {
            icon: "⚠️",
            duration: 5000,
          });
        } else {
          toast.success("Trade created successfully");
        }

        tradeForm.resetForm();
        callBack && callBack();
        
        setTimeout(() => {
          handleClose();
        }, warning ? 2000 : 500);
      }

      setLoading(false);
    } catch (error: any) {
      setLoading(false);

      if (error.response?.data) {
        const errors = error.response.data;
        tradeForm.setErrors(errors);
        
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else if (typeof firstError === 'string') {
          toast.error(firstError);
        }
      } else {
        toast.error(error.message || "An error occurred");
      }
    }
  };

  const handleReset = () => {
    tradeForm.resetForm();
    setWarning("");
    handleClose();
  };

  const handleButtonClick = () => {
    tradeForm.handleSubmit();
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
              <ProgressIndicator color="inherit" size={20} />
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                {formType === "Update" ? "Updating..." : "Creating..."}
              </Span>
            </>
          ) : formType === "Update" ? (
            "Update Trade"
          ) : (
            "Create Trade"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Trade" : "Edit Trade"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="lg"
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(tradeForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          {warning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {warning}
              <Typography variant="body2" sx={{ mt: 1 }}>
                The trade will be created in 'draft' status and will need approval before voucher allocation.
              </Typography>
            </Alert>
          )}

          {formType === "Save" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Trade Creation Flow:</strong> After creating the trade, it will go through approval → voucher allocation → delivery → GRN submission → Invoice generation.
                {tradeForm.values.requires_financing && " This trade requires investor financing before voucher allocation."}
              </Typography>
            </Alert>
          )}

          {/* Invoice Information Display */}
          {invoiceInfo && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.main'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <InfoIcon color="info" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="info.dark" gutterBottom>
                    📄 Invoice Generation Schedule
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Payment Terms:</strong> {invoiceInfo.label}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Invoice Type:</strong> {invoiceInfo.invoiceType === 'immediate' ? '✅ Immediate' : '📅 Consolidated'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Invoice Schedule:</strong> {invoiceInfo.invoiceSchedule}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoiceInfo.description}
                  </Typography>
                  
                  {invoiceInfo.invoiceType !== 'immediate' && (
                    <Alert severity="info" sx={{ mt: 2 }} icon={false}>
                      <Typography variant="caption">
                        <strong>Note:</strong> Multiple deliveries (GRNs) within the same period will be combined into one invoice for this customer.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Box>
            </Paper>
          )}

          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={tradeForm}
            formFields={formFields}
            validationSchema={TradeFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default TradeForm;