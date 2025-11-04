// GRNForm.tsx - UPDATED with Invoice Information
import React, { FC, useEffect, useState } from "react";
import { Box, Button, Alert, Typography, Paper, Divider } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeService } from "./Trade.service";
import { GRNValidations } from "./TradeFormValidations";
import { ITrade } from "./Trade.interface";
import { IFormField } from "../../utils/form_factory";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { getInvoiceInfoFromPaymentTerms } from "./TradeFormFields";

interface IGRNFormProps {
  trade: ITrade;
  onClose: () => void;
  onSuccess: () => void;
}

const GRNFormFields: IFormField[] = [
  {
    name: 'point_of_loading',
    initailValue: '',
    label: 'Point of Loading',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'loading_date',
    initailValue: '',
    label: 'Loading Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'delivery_date',
    initailValue: '',
    label: 'Delivery Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'delivered_to_name',
    initailValue: '',
    label: 'Delivered To (Name)',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'delivered_to_address',
    initailValue: '',
    label: 'Delivery Address',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12,md: 12 },
    required: true,
  },
  {
    name: 'delivered_to_contact',
    initailValue: '',
    label: 'Delivery Contact',
    type: 'tel',
    uiType: 'phone',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'vehicle_number',
    initailValue: '',
    label: 'Vehicle Number',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'driver_name',
    initailValue: '',
    label: 'Driver Name',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'driver_id_number',
    initailValue: '',
    label: 'Driver ID Number',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'driver_phone',
    initailValue: '',
    label: 'Driver Phone',
    type: 'tel',
    uiType: 'phone',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'quantity_bags',
    initailValue: '',
    label: 'Number of Bags',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'gross_weight_kg',
    initailValue: '',
    label: 'Gross Weight (kg)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    required: true,
  },
  {
    name: 'tare_weight_kg',
    initailValue: '',
    label: 'Tare Weight (kg)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
  },
  {
    name: 'net_weight_kg',
    initailValue: '',
    label: 'Net Weight (kg)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    required: true,
  },
  {
    name: 'warehouse_manager_name',
    initailValue: '',
    label: 'Warehouse Manager Name',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'warehouse_manager_date',
    initailValue: '',
    label: 'Manager Sign Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'received_by_name',
    initailValue: '',
    label: 'Received By (Name)',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'received_by_date',
    initailValue: '',
    label: 'Received Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'remarks',
    initailValue: '',
    label: 'Remarks',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
  },
];

const GRNForm: FC<IGRNFormProps> = ({ trade, onClose, onSuccess }) => {
  const { showModal } = useModalContext();
  const [loading, setLoading] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState<any>(null);
  const [estimatedInvoiceDate, setEstimatedInvoiceDate] = useState<string>("");

  const grnForm = useFormik({
    initialValues: getInitialValues(GRNFormFields),
    validationSchema: GRNValidations(),
    validateOnChange: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          trade: trade.id,
        };
        
        await TradeService.createGRN(payload);
        toast.success("GRN created successfully! Invoice will be generated automatically.");
        
        grnForm.resetForm();
        onSuccess();
      } catch (error: any) {
        if (error.response?.data) {
          grnForm.setErrors(error.response.data);
        }
        toast.error(error.message || "Failed to create GRN");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // Pre-fill form with trade data
    if (trade) {
      grnForm.setValues({
        ...grnForm.values,
        point_of_loading: trade.hub?.name || '',
        delivered_to_name: trade.buyer?.name || '',
        delivered_to_address: trade.delivery_location || '',
        vehicle_number: trade.vehicle_number || '',
        driver_name: trade.driver_name || '',
        driver_phone: trade.driver_phone || '',
        driver_id_number: trade.driver_id || '',
        quantity_bags: trade.quantity_bags || '',
        gross_weight_kg: trade.gross_weight_kg || '',
        tare_weight_kg: trade.tare_weight_kg || '',
        net_weight_kg: trade.net_weight_kg || trade.quantity_kg || '',
      });
    }
  }, [trade]);

  useEffect(() => {
    // Get invoice information based on trade payment terms
    if (trade.payment_terms) {
      const info = getInvoiceInfoFromPaymentTerms(trade.payment_terms);
      setInvoiceInfo(info);
      
      // Calculate estimated invoice date based on delivery date
      const deliveryDate = grnForm.values.delivery_date;
      if (deliveryDate) {
        calculateEstimatedInvoiceDate(deliveryDate, info);
      }
    }
  }, [trade.payment_terms, grnForm.values.delivery_date]);

  const calculateEstimatedInvoiceDate = (deliveryDateStr: string, info: any) => {
    const deliveryDate = new Date(deliveryDateStr);
    const dayOfWeek = deliveryDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    let estimatedDate = "";
    
    switch (info.invoiceType) {
      case 'immediate':
        estimatedDate = "Immediately after GRN submission";
        break;
        
      case 'twice_weekly':
        // Mon-Wed period ends Wednesday, Thu-Sun period ends Sunday
        if (dayOfWeek >= 1 && dayOfWeek <= 3) {
          // Mon-Wed: Invoice on Wednesday
          const daysUntilWed = 3 - dayOfWeek;
          const invoiceDate = new Date(deliveryDate);
          invoiceDate.setDate(invoiceDate.getDate() + daysUntilWed);
          estimatedDate = `${invoiceDate.toLocaleDateString()} at 6:00 PM (Wednesday)`;
        } else {
          // Thu-Sun: Invoice on Sunday
          const daysUntilSun = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
          const invoiceDate = new Date(deliveryDate);
          invoiceDate.setDate(invoiceDate.getDate() + daysUntilSun);
          estimatedDate = `${invoiceDate.toLocaleDateString()} at 6:00 PM (Sunday)`;
        }
        break;
        
      case 'weekly':
        // Weekly: Invoice on Saturday
        const daysUntilSat = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
        const invoiceDate = new Date(deliveryDate);
        invoiceDate.setDate(invoiceDate.getDate() + daysUntilSat);
        estimatedDate = `${invoiceDate.toLocaleDateString()} at 6:00 PM (Saturday)`;
        break;
        
      case 'custom':
        // Monthly: Last day of month
        const lastDay = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth() + 1, 0);
        estimatedDate = `${lastDay.toLocaleDateString()} at 6:00 PM (End of Month)`;
        break;
        
      default:
        estimatedDate = "Based on payment terms";
    }
    
    setEstimatedInvoiceDate(estimatedDate);
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={() => grnForm.handleSubmit()}
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Creating...</Span>
          </>
        ) : (
          "Create GRN & Generate Invoice"
        )}
      </Button>
    </>
  );

  if (!showModal) return null;

  return (
    <ModalDialog
      title="Create Goods Received Note"
      onClose={onClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <Box sx={{ width: "100%" }}>
        {/* Critical Information Alert */}
        <Alert severity="info" icon={<ReceiptIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>📄 Invoice Generation</strong>
          </Typography>
          <Typography variant="body2">
            Submitting this GRN will automatically trigger invoice creation according to the trade's payment terms.
          </Typography>
        </Alert>

        {/* Invoice Schedule Information */}
        {invoiceInfo && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2,
              bgcolor: 'success.lighter',
              border: '1px solid',
              borderColor: 'success.main'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <InfoIcon color="success" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="success.dark" gutterBottom>
                  Invoice Details for Trade #{trade.trade_number}
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Customer:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {trade.buyer?.name || trade.buyer_name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Payment Terms:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {invoiceInfo.label} ({invoiceInfo.days} days)
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Invoice Type:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {invoiceInfo.invoiceType === 'immediate' ? (
                        <span>✅ Immediate - Generated instantly</span>
                      ) : (
                        <span>📅 Consolidated - Combined with other deliveries</span>
                      )}
                    </Typography>
                  </Box>
                  
                  {estimatedInvoiceDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Estimated Invoice Generation:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {estimatedInvoiceDate}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      What happens next:
                    </Typography>
                    <Typography variant="body2">
                      {invoiceInfo.invoiceType === 'immediate' ? (
                        <>
                          1. GRN is created immediately<br/>
                          2. Invoice is generated automatically<br/>
                          3. Customer can be notified<br/>
                          4. Payment due in {invoiceInfo.days} {invoiceInfo.days === 1 ? 'day' : 'days'}
                        </>
                      ) : (
                        <>
                          1. GRN is created immediately<br/>
                          2. Added to draft invoice for this period<br/>
                          3. Invoice finalized on {estimatedInvoiceDate}<br/>
                          4. Multiple deliveries consolidated into one invoice<br/>
                          5. Payment due {invoiceInfo.days} days after invoice date
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Warning for consolidated invoices */}
        {invoiceInfo && invoiceInfo.invoiceType !== 'immediate' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This delivery will be added to a consolidated invoice. 
              If there are multiple deliveries to <strong>{trade.buyer?.name || trade.buyer_name}</strong> in this period, 
              they will all be combined into one invoice.
            </Typography>
          </Alert>
        )}

        <FormFactory
          formikInstance={grnForm}
          formFields={GRNFormFields}
          validationSchema={GRNValidations()}
        />
      </Box>
    </ModalDialog>
  );
};

export default GRNForm;