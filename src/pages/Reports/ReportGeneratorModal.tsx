// src/pages/Reports/components/ReportGeneratorModal.tsx
import React, { FC, useState } from "react";
import { Box, Button, Grid, Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import uniqueId from "../../utils/generateId";
import { ReportsService } from "./Reports.service";
import { IReportFormProps, TReportType } from "./Reports.interface";
import { getReportFormFields } from "./ReportFormFields";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const REPORT_TYPES = [
  { value: 'supplier', label: 'Supplier Report', icon: <AgricultureIcon />, description: 'Track supplier performance and transactions' },
  { value: 'trade', label: 'Trade Report', icon: <TrendingUpIcon />, description: 'Detailed trade transaction records' },
  { value: 'invoice', label: 'Invoice Report', icon: <ReceiptIcon />, description: 'Invoice status and aging analysis' },
  { value: 'payment', label: 'Payment Report', icon: <PaymentIcon />, description: 'Payment tracking and reconciliation' },
  { value: 'depositor', label: 'Depositor Report', icon: <AgricultureIcon />, description: 'Farmer deposit records' },
  { value: 'voucher', label: 'Voucher Report', icon: <ConfirmationNumberIcon />, description: 'Voucher issuance and redemption' },
  { value: 'inventory', label: 'Inventory Report', icon: <InventoryIcon />, description: 'Stock levels and availability' },
  { value: 'investor', label: 'Investor Report', icon: <AccountBalanceIcon />, description: 'Investment performance and returns' },
];

const ReportGeneratorModal: FC<Omit<IReportFormProps, 'reportType'>> = ({
  handleClose,
  callBack,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReportType, setSelectedReportType] = useState<TReportType>('supplier');
  const [step, setStep] = useState<1 | 2>(1);

  const formFields = getReportFormFields(selectedReportType);

  const reportForm = useFormik({
    initialValues: {
      format: 'pdf',
      start_date: '',
      end_date: '',
      ...Object.fromEntries(
        formFields.map(field => [field.name, field.initailValue || ''])
      ),
    },
    validationSchema: Yup.object().shape({
      format: Yup.string().required("Format is required"),
      start_date: Yup.date().nullable(),
      end_date: Yup.date().nullable()
        .when('start_date', (start_date: any, schema: any) => {
          return start_date
            ? schema.min(start_date, 'End date must be after start date')
            : schema;
        }),
    }),
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let response;
      const serviceMap: Record<TReportType, (payload: any) => Promise<any>> = {
        supplier: ReportsService.generateSupplierReport,
        trade: ReportsService.generateTradeReport,
        invoice: ReportsService.generateInvoiceReport,
        payment: ReportsService.generatePaymentReport,
        depositor: ReportsService.generateDepositorReport,
        voucher: ReportsService.generateVoucherReport,
        inventory: ReportsService.generateInventoryReport,
        investor: ReportsService.generateInvestorReport,
      };

      response = await serviceMap[selectedReportType](values);
      
      toast.success("Report generation started. You'll be notified when it's ready.");
      reportForm.resetForm();
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        reportForm.setErrors(error.response.data);
      }
      toast.error(error.message || "Failed to generate report");
    }
  };

  const handleReset = () => {
    reportForm.resetForm();
    setStep(1);
    setSelectedReportType('supplier');
    handleClose();
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading}>
          Cancel
        </Button>
        {step === 2 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button 
          onClick={step === 1 
            ? handleNext 
            : (e) => {
                e?.preventDefault?.();
                reportForm.handleSubmit();
              }
          }
          type={step === 1 ? "button" : "submit"}
          variant="contained"
          disabled={loading || (step === 1 && !selectedReportType)}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Generating...
              </Span>
            </>
          ) : (
            step === 1 ? "Next" : "Generate Report"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="Generate Report"
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      {step === 1 ? (
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Report Type
          </Typography>
          <Grid container spacing={2}>
            {REPORT_TYPES.map((type) => (
              <Grid item xs={12} sm={6} key={type.value}>
                <Card 
                  sx={{
                    cursor: 'pointer',
                    border: 2,
                    borderColor: selectedReportType === type.value ? 'primary.main' : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: 2,
                    },
                    transition: 'all 0.3s',
                  }}
                  onClick={() => setSelectedReportType(type.value as TReportType)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ color: 'primary.main', mr: 1 }}>
                        {type.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {type.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <form onSubmit={reportForm.handleSubmit}>
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Configure {REPORT_TYPES.find(t => t.value === selectedReportType)?.label}
            </Typography>
            
            <FormFactory
              formikInstance={reportForm}
              formFields={formFields}
              validationSchema={Yup.object()}
            />
          </Box>
        </form>
      )}
    </ModalDialog>
  );
};

export default ReportGeneratorModal;