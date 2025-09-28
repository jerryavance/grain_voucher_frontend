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
import { TradeFormFields } from "./TradeFormFields";
import { TradeService, AccountService, GrainTypeService, HubService } from "./Trade.service";
import { TradeFormValidations } from "./TradeFormValidations";
import { ITradeFormProps } from "./Trades.interface";

const TradeForm: FC<ITradeFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [grainTypes, setGrainTypes] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const buyersData = await AccountService.getAccounts({ type: 'customer' });
        setBuyers(buyersData.map((b: any) => ({ value: b.id, label: b.name })));
        
        const grainTypesData = await GrainTypeService.getGrainTypes();
        setGrainTypes(grainTypesData.map((g: any) => ({ value: g.id, label: g.name })));
        
        const hubsData = await HubService.getHubs();
        setHubs(hubsData.map((h: any) => ({ value: h.id, label: h.name })));
      } catch (error) {
        toast.error("Failed to load form options");
      }
    };
    fetchOptions();
  }, []);

  const formFields = TradeFormFields({ buyers, grainTypes, hubs });

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
    if (formType === "Update" && initialValues) {
      tradeForm.setValues(
        patchInitialValues(formFields)({
          ...initialValues,
          buyer_id: initialValues.buyer?.id,
          grain_type_id: initialValues.grain_type?.id,
          hub_id: initialValues.hub?.id,
        })
      );
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await TradeService.updateTrade(values, initialValues.id);
        toast.success("Trade updated successfully");
        tradeForm.resetForm();
        callBack && callBack();
        handleClose();
      } else {
        await TradeService.createTrade(values);
        toast.success("Trade created successfully");
        tradeForm.resetForm();
        callBack && callBack();
        handleClose();
      }
    } catch (error: any) {
      if (error.response?.data) {
        tradeForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    tradeForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading}>
          Close
        </Button>
        <Button
          onClick={() => tradeForm.handleSubmit()}
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
          ) : formType === "Update" ? "Update Trade" : "Create Trade"}
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
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(tradeForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
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