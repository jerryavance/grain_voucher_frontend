import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { BrokerageFormFields } from "./BrokerageFormFields";
import { TradeService, UserService } from "./Trade.service";
import { BrokerageFormValidations } from "./BrokerageFormValidations";
import { IBrokerageFormProps } from "./Trades.interface";

const BrokerageForm: FC<IBrokerageFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [trades, setTrades] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const tradesData = await TradeService.getTrades({});
        setTrades(tradesData.results.map((t: any) => ({ value: t.id, label: `Trade ${t.id}` })));
        
        const agentsData = await UserService.getUsers({ role__in: ['bdm', 'agent'] });
        setAgents(agentsData.map((a: any) => ({ value: a.id, label: `${a.first_name} ${a.last_name}` })));
      } catch (error) {
        toast.error("Failed to load form options");
      }
    };
    fetchOptions();
  }, []);

  const formFields = BrokerageFormFields({ trades, agents });

  const brokerageForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: BrokerageFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      brokerageForm.setValues(
        patchInitialValues(formFields)({
          ...initialValues,
          trade_id: initialValues.trade?.id,
          agent_id: initialValues.agent?.id,
        })
      );
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await TradeService.updateBrokerage(values, initialValues.id);
        toast.success("Brokerage updated successfully");
        brokerageForm.resetForm();
        callBack && callBack();
        handleClose();
      } else {
        await TradeService.createBrokerage(values);
        toast.success("Brokerage created successfully");
        brokerageForm.resetForm();
        callBack && callBack();
        handleClose();
      }
    } catch (error: any) {
      if (error.response?.data) {
        brokerageForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    brokerageForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading}>
          Close
        </Button>
        <Button
          onClick={() => brokerageForm.handleSubmit()}
          type="button"
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Loading...
              </Span>
            </>
          ) : formType === "Update" ? "Update Brokerage" : "Create Brokerage"}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Brokerage" : "Edit Brokerage"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(brokerageForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={brokerageForm}
            formFields={formFields}
            validationSchema={BrokerageFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default BrokerageForm;