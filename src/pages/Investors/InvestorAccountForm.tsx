import React, { FC, useRef, useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, IFormField } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { InvestorAccountFormFields } from "./InvestorFormFields";
import { InvestorService } from "./Investor.service";
import { UserService } from "../Users/User.service";
import { InvestorAccountValidation } from "./InvestorFormValidations";
import { IInvestorFormProps } from "./Investor.interface";

const InvestorAccountForm: FC<IInvestorFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInvestors, setLoadingInvestors] = useState<boolean>(true);
  const [investorOptions, setInvestorOptions] = useState<{ label: string; value: string }[]>([]);
  const [formFields, setFormFields] = useState<IFormField[]>(InvestorAccountFormFields());

  const accountForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: InvestorAccountValidation,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    fetchInvestors();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      accountForm.setValues({
        investor_id: initialValues.investor?.id || '',
      });
    }
  }, [initialValues, formType]);

  const fetchInvestors = async () => {
    setLoadingInvestors(true);
    try {
      const response = await UserService.getUsers({ role: "investor" });
      
      if (!response || !response.results) {
        throw new Error("Invalid response from server");
      }

      const investorOptions = response.results.map((investor: any) => ({
        label: `${investor.first_name} ${investor.last_name} (${investor.phone_number})`,
        value: investor.id,
      }));
      
      setInvestorOptions(investorOptions);
      setFormFields(InvestorAccountFormFields(investorOptions));
      setLoadingInvestors(false);
    } catch (error: any) {
      console.error("Error fetching investors:", error);
      toast.error("Failed to load investors");
      setLoadingInvestors(false);
      handleClose();
    }
  };

  const handleSubmit = async (values: any) => {
    if (!values.investor_id) {
      toast.error("Please select an investor");
      return;
    }

    setLoading(true);
    try {
      if (formType === "Update" && initialValues?.id) {
        await InvestorService.updateInvestorAccount(values, initialValues.id);
        toast.success("Investor account updated successfully");
      } else {
        await InvestorService.createInvestorAccount(values);
        toast.success("Investor account created successfully");
      }
      
      accountForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      console.error("Error saving account:", error);
      if (error.response?.data) {
        accountForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    accountForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    accountForm.handleSubmit();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading || loadingInvestors}>
          Close
        </Button>
        <Button 
          onClick={handleButtonClick} 
          type="button"
          variant="contained"
          disabled={loading || loadingInvestors}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Loading...
              </Span>
            </>
          ) : (
            formType === "Update" ? "Update Account" : "Create Account"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Investor Account" : "Edit Investor Account"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      {loadingInvestors ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <ProgressIndicator size={40} />
        </Box>
      ) : (
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(accountForm.values);
          }}
        >
          <Box sx={{ width: "100%" }}>
            <FormFactory
              others={{ sx: { marginBottom: "0rem" } }}
              formikInstance={accountForm}
              formFields={formFields}
              validationSchema={InvestorAccountValidation}
            />
          </Box>
        </form>
      )}
    </ModalDialog>
  );
};

export default InvestorAccountForm;