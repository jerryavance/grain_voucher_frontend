import React, { FC, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeAllocationFormFields } from "./InvestorFormFields";
import { InvestorService } from "./Investor.service";
import { TradeAllocationValidation } from "./InvestorFormValidations";
import { ITradeAllocationFormProps } from "./Investor.interface";

const TradeAllocationForm: FC<ITradeAllocationFormProps> = ({
  handleClose,
  tradeId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formFields = TradeAllocationFormFields();

  const allocationForm = useFormik({
    initialValues: { ...getInitialValues(formFields), trade_id: tradeId || '' },
    validationSchema: TradeAllocationValidation,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await InvestorService.createTradeAllocation(values);
      toast.success("Trade allocation created successfully");
      allocationForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        allocationForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    allocationForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    allocationForm.handleSubmit();
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
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Loading...
              </Span>
            </>
          ) : (
            "Create Allocation"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="New Trade Allocation"
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(allocationForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={allocationForm}
            formFields={formFields}
            validationSchema={TradeAllocationValidation}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default TradeAllocationForm;