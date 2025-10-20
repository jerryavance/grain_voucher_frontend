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
import { LoanFormFields } from "./InvestorFormFields";
import { InvestorService } from "./Investor.service";
import { LoanValidation } from "./InvestorFormValidations";
import { ILoanFormProps } from "./Investor.interface";

const LoanForm: FC<ILoanFormProps> = ({
  handleClose,
  tradeId,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formFields = LoanFormFields();

  const loanForm = useFormik({
    initialValues: { ...getInitialValues(formFields), trade_id: tradeId || '' },
    validationSchema: LoanValidation,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await InvestorService.createLoan(values);
      toast.success("Loan created successfully");
      loanForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        loanForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loanForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    loanForm.handleSubmit();
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
            "Create Loan"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="New Loan"
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(loanForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={loanForm}
            formFields={formFields}
            validationSchema={LoanValidation}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default LoanForm;