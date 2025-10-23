// PaymentRecordForm.tsx
import React, { FC } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeService } from "./Trade.service";
import { PaymentRecordValidations } from "./TradeFormValidations";
import { ITrade, IPaymentRecord } from "./Trade.interface";
import { IFormField } from "../../utils/form_factory";
import { TOption } from "../../@types/common";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface IPaymentRecordFormProps {
  trade: ITrade;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHOD_OPTIONS: TOption[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' },
];

const PaymentRecordForm: FC<IPaymentRecordFormProps> = ({
  trade,
  onClose,
  onSuccess,
}) => {
  const { showModal } = useModalContext();
  const [loading, setLoading] = React.useState(false);

  const PaymentRecordFormFields: IFormField[] = [
    {
      name: 'amount',
      initailValue: trade.amount_due || '',
      label: 'Payment Amount',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
      //helperText: `Amount due: ${formatCurrency(trade.amount_due)}`,
    },
    {
      name: 'payment_date',
      initailValue: new Date().toISOString().split('T')[0],
      label: 'Payment Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'payment_method',
      initailValue: '',
      label: 'Payment Method',
      type: 'select',
      uiType: 'select',
      options: PAYMENT_METHOD_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'reference_number',
      initailValue: '',
      label: 'Reference Number',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },
    {
      name: 'notes',
      initailValue: '',
      label: 'Notes',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },
  ];

  const paymentForm = useFormik({
    initialValues: getInitialValues(PaymentRecordFormFields),
    validationSchema: PaymentRecordValidations(),
    validateOnChange: false,
    onSubmit: async (values: IPaymentRecord) => {
      setLoading(true);
      try {
        await TradeService.recordPayment(trade.id, values);
        toast.success("Payment recorded successfully");
        
        paymentForm.resetForm();
        onSuccess();
      } catch (error: any) {
        if (error.response?.data) {
          paymentForm.setErrors(error.response.data);
          const firstError = Object.values(error.response.data)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error(error.message || "Failed to record payment");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={() => paymentForm.handleSubmit()}
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Recording...</Span>
          </>
        ) : (
          "Record Payment"
        )}
      </Button>
    </>
  );

  if (!showModal) return null;

  return (
    <ModalDialog
      title={`Record Payment for ${trade.trade_number}`}
      onClose={onClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          formikInstance={paymentForm}
          formFields={PaymentRecordFormFields}
          validationSchema={PaymentRecordValidations()}
        />
      </Box>
    </ModalDialog>
  );
};

export default PaymentRecordForm;