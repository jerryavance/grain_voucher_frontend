// BrokerageForm.tsx
import React, { FC, useEffect, useState } from "react";
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
import { BrokerageValidations } from "./TradeFormValidations";
import { IBrokerage } from "./Trade.interface";
import { IFormField } from "../../utils/form_factory";
import { TOption } from "../../@types/common";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface IBrokerageFormProps {
  tradeId: string;
  initialValues?: IBrokerage | null;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMISSION_TYPE_OPTIONS: TOption[] = [
  { label: 'Percentage of Trade Value', value: 'percentage' },
  { label: 'Per Metric Ton', value: 'per_mt' },
  { label: 'Per Kilogram', value: 'per_kg' },
  { label: 'Fixed Amount', value: 'fixed' },
];

const BrokerageForm: FC<IBrokerageFormProps> = ({
  tradeId,
  initialValues,
  onClose,
  onSuccess,
}) => {
  const { showModal } = useModalContext();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<TOption[]>([]);

  const BrokerageFormFields: IFormField[] = [
    {
      name: 'agent_id',
      initailValue: '',
      label: 'Agent/BDM',
      type: 'select',
      uiType: 'select',
      options: agents,
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    },
    {
      name: 'commission_type',
      initailValue: 'percentage',
      label: 'Commission Type',
      type: 'select',
      uiType: 'select',
      options: COMMISSION_TYPE_OPTIONS,
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
    },
    {
      name: 'commission_value',
      initailValue: '',
      label: 'Commission Value',
      type: 'number',
      uiType: 'number',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
      required: true,
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

  const brokerageForm = useFormik({
    initialValues: getInitialValues(BrokerageFormFields),
    validationSchema: BrokerageValidations(),
    validateOnChange: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = { ...values, trade_id: tradeId };
        
        if (initialValues) {
          await TradeService.updateBrokerage(initialValues.id, payload);
          toast.success("Brokerage updated successfully");
        } else {
          await TradeService.createBrokerage(payload);
          toast.success("Brokerage added successfully");
        }
        
        brokerageForm.resetForm();
        onSuccess();
      } catch (error: any) {
        if (error.response?.data) {
          brokerageForm.setErrors(error.response.data);
        }
        toast.error(error.message || "Failed to save brokerage");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (initialValues) {
      const values = {
        ...initialValues,
        agent_id: initialValues.agent?.id,
      };
      brokerageForm.setValues(patchInitialValues(BrokerageFormFields)(values));
    }
  }, [initialValues, agents]);

  const fetchAgents = async () => {
    try {
      const agentsData = await TradeService.getAgents();
      setAgents(
        agentsData.map((a: any) => ({
          label: `${a.first_name} ${a.last_name}`,
          value: a.id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={() => brokerageForm.handleSubmit()}
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
          "Add Brokerage"
        )}
      </Button>
    </>
  );

  if (!showModal) return null;

  return (
    <ModalDialog
      title={initialValues ? "Edit Brokerage" : "Add Brokerage"}
      onClose={onClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          formikInstance={brokerageForm}
          formFields={BrokerageFormFields}
          validationSchema={BrokerageValidations()}
        />
      </Box>
    </ModalDialog>
  );
};

export default BrokerageForm;