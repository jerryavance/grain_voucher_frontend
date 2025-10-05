// TradeCostForm.tsx
import React, { FC, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeService } from "./Trade.service";
import { TradeCostValidations } from "./TradeFormValidations";
import { ITradeCost } from "./Trade.interface";
import { IFormField } from "../../utils/form_factory";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface ITradeCostFormProps {
  tradeId: string;
  initialValues?: ITradeCost | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TradeCostFormFields: IFormField[] = [
  {
    name: 'cost_type',
    initailValue: '',
    label: 'Cost Type',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
  },
  {
    name: 'description',
    initailValue: '',
    label: 'Description',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
  },
  {
    name: 'amount',
    initailValue: 0.0,
    label: 'Amount',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'is_per_unit',
    initailValue: false,
    label: 'Is Per Unit (per kg)',
    type: 'checkbox',
    uiType: 'checkbox',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
];

const TradeCostForm: FC<ITradeCostFormProps> = ({
  tradeId,
  initialValues,
  onClose,
  onSuccess,
}) => {
  const { showModal } = useModalContext();
  const [loading, setLoading] = React.useState(false);

  const costForm = useFormik({
    initialValues: getInitialValues(TradeCostFormFields),
    validationSchema: TradeCostValidations(),
    validateOnChange: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = { ...values, trade_id: tradeId };
        
        if (initialValues) {
          await TradeService.updateTradeCost(initialValues.id, payload);
          toast.success("Cost updated successfully");
        } else {
          await TradeService.createTradeCost(payload);
          toast.success("Cost added successfully");
        }
        
        costForm.resetForm();
        onSuccess();
      } catch (error: any) {
        if (error.response?.data) {
          costForm.setErrors(error.response.data);
        }
        toast.error(error.message || "Failed to save cost");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (initialValues) {
      costForm.setValues(patchInitialValues(TradeCostFormFields)(initialValues));
    }
  }, [initialValues]);

  const ActionBtns: FC = () => (
    <>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={() => costForm.handleSubmit()}
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Saving...</Span>
          </>
        ) : initialValues ? (
          "Update"
        ) : (
          "Add Cost"
        )}
      </Button>
    </>
  );

  if (!showModal) return null;

  return (
    <ModalDialog
      title={initialValues ? "Edit Cost" : "Add Trade Cost"}
      onClose={onClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          formikInstance={costForm}
          formFields={TradeCostFormFields}
          validationSchema={TradeCostValidations()}
        />
      </Box>
    </ModalDialog>
  );
};

export default TradeCostForm;