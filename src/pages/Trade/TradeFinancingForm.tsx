// TradeFinancingForm.tsx
import React, { FC, useEffect, useState } from "react";
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
import { TradeFinancingValidations } from "./TradeFormValidations";
import { ITrade, ITradeFinancing } from "./Trade.interface";
import { IFormField } from "../../utils/form_factory";
import { TOption } from "../../@types/common";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface ITradeFinancingFormProps {
  trade: ITrade;
  onClose: () => void;
  onSuccess: () => void;
}

const TradeFinancingForm: FC<ITradeFinancingFormProps> = ({
  trade,
  onClose,
  onSuccess,
}) => {
  const { showModal } = useModalContext();
  const [loading, setLoading] = useState(false);
  const [investors, setInvestors] = useState<TOption[]>([]);

  const TradeFinancingFormFields: IFormField[] = [
    {
      name: 'investor_account_id',
      initailValue: '',
      label: 'Investor Account',
      type: 'select',
      uiType: 'select',
      options: investors,
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    },
    {
      name: 'allocated_amount',
      initailValue: trade.total_trade_cost || '',
      label: 'Allocated Amount',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
      //helperText: `Total trade cost: ${formatCurrency(trade.total_trade_cost)}`,
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

  const financingForm = useFormik({
    initialValues: getInitialValues(TradeFinancingFormFields),
    validationSchema: TradeFinancingValidations(),
    validateOnChange: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = { 
          ...values, 
          trade: trade.id 
        };
        
        await TradeService.createTradeFinancing(payload);
        toast.success("Financing allocated successfully");
        
        financingForm.resetForm();
        onSuccess();
      } catch (error: any) {
        if (error.response?.data) {
          financingForm.setErrors(error.response.data);
          const firstError = Object.values(error.response.data)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error(error.message || "Failed to allocate financing");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      const investorsData = await TradeService.getInvestors();
      setInvestors(
        investorsData.map((inv: any) => ({
          label: `${inv.investor.first_name} ${inv.investor.last_name} - ${formatCurrency(inv.available_balance)} available`,
          value: inv.id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch investors:", error);
      toast.error("Failed to load investors");
    }
  };

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
        onClick={() => financingForm.handleSubmit()}
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Allocating...</Span>
          </>
        ) : (
          "Allocate Financing"
        )}
      </Button>
    </>
  );

  if (!showModal) return null;

  return (
    <ModalDialog
      title={`Allocate Financing for ${trade.trade_number}`}
      onClose={onClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          formikInstance={financingForm}
          formFields={TradeFinancingFormFields}
          validationSchema={TradeFinancingValidations()}
        />
      </Box>
    </ModalDialog>
  );
};

export default TradeFinancingForm;