import React, { FC, useRef, useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { DepositFormFields } from "./InvestorFormFields";
import { InvestorService } from "./Investor.service";
import { DepositValidation } from "./InvestorFormValidations";
import { IDepositFormProps } from "./Investor.interface";

const DepositForm: FC<IDepositFormProps> = ({
  handleClose,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
  const [accountOptions, setAccountOptions] = useState<{ label: string; value: string }[]>([]);
  const [formFields, setFormFields] = useState(DepositFormFields());

  const depositForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: DepositValidation,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    fetchInvestorAccounts();
  }, []);

  const fetchInvestorAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await InvestorService.getInvestorAccounts({ page: 1, page_size: 100 });
      if (!response || !response.results) {
        throw new Error("Invalid response from server");
      }
      const accountOptions = response.results.map((account: any) => ({
        label: `${account.investor.first_name} ${account.investor.last_name} (Phone: ${account.investor.phone_number})`,
        value: account.id,
      }));
      setAccountOptions(accountOptions);
      setFormFields(DepositFormFields(accountOptions));
      setLoadingAccounts(false);
    } catch (error: any) {
      console.error("Error fetching investor accounts:", error);
      toast.error("Failed to load investor accounts");
      setLoadingAccounts(false);
      handleClose();
    }
  };

  const handleSubmit = async (values: any) => {
    if (!values.investor_account_id) {
      toast.error("Please select an investor account");
      return;
    }
    setLoading(true);
    try {
      await InvestorService.createInvestorDeposit(values);
      toast.success("Deposit created successfully");
      depositForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        depositForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    depositForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    depositForm.handleSubmit();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading || loadingAccounts}>
          Close
        </Button>
        <Button 
          onClick={handleButtonClick} 
          type="button"
          variant="contained"
          disabled={loading || loadingAccounts}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Loading...
              </Span>
            </>
          ) : (
            "Create Deposit"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="New Deposit"
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      {loadingAccounts ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <ProgressIndicator size={40} />
        </Box>
      ) : (
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(depositForm.values);
          }}
        >
          <Box sx={{ width: "100%" }}>
            <FormFactory
              others={{ sx: { marginBottom: "0rem" } }}
              formikInstance={depositForm}
              formFields={formFields}
              validationSchema={DepositValidation}
            />
          </Box>
        </form>
      )}
    </ModalDialog>
  );
};

export default DepositForm;