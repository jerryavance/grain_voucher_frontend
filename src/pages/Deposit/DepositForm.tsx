import React, { FC, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { HubFormFields, HubFormValidations } from "./DepositFormFields";
import { toast } from "react-hot-toast";
import uniqueId from "../../utils/generateId";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import { DepositService } from "./Deposit.service";

interface DepositFormProps {
  callBack: () => void;
  formType?: "Save" | "Update";
  handleClose: () => void;
  initialValues?: any;
  formData: {
    users: { value: string; label: string }[];
    farmers: { value: string; label: string }[];
    hubs: { value: string; label: string }[];
    agents: { value: string; label: string }[];
    grainTypes: { value: string; label: string }[];
    qualityGrades: { value: string; label: string }[];
  };
  formDataLoading: boolean;
  searchHandlers: {
    handleGrainTypeSearch: (query: string) => void;
    handleQualityGradeSearch: (query: string) => void;
    handleUserSearch: (query: string) => void;
    handleFarmerSearch: (query: string) => void;
    handleHubSearch: (query: string) => void;
    handleAgentSearch: (query: string) => void;
  };
}

const DepositForm: FC<DepositFormProps> = ({
  callBack,
  formType = "Save",
  handleClose,
  initialValues,
  formData,
  formDataLoading,
  searchHandlers,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  // build form fields
  const formFields = HubFormFields(
    formData.users,
    formData.farmers,
    formData.hubs,
    formData.agents,
    formData.grainTypes,
    formData.qualityGrades,
    searchHandlers.handleGrainTypeSearch,
    searchHandlers.handleQualityGradeSearch,
    searchHandlers.handleUserSearch,
    searchHandlers.handleFarmerSearch,
    searchHandlers.handleHubSearch,
    searchHandlers.handleAgentSearch
  );

  const depositForm = useFormik({
    initialValues: getInitialValues(formFields),
    enableReinitialize: true,
    validationSchema: HubFormValidations,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      const patchedValues = patchInitialValues(formFields)(initialValues || {});
      depositForm.setValues(patchedValues);
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Save") {
        await DepositService.createDeposit(values);
        toast.success("Deposit created successfully");
      } else {
        await DepositService.updateDeposit(initialValues.id, values);
        toast.success("Deposit updated successfully");
      }
      handleReset();
      callBack && callBack();
      setLoading(false);
    } catch (error: any) {
      if (error.response?.data) {
        depositForm.setErrors(error.response.data);
      } else {
        toast.error("Something went wrong");
      }
      setLoading(false);
    }
  };

  const handleReset = () => {
    depositForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset}>Close</Button>
      <Button
        disabled={!depositForm.isValid}
        type="submit"
        variant="contained"
        form="deposit"
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />{" "}
            <Span style={{ marginLeft: "0.5rem" }} color="primary">
              Loading...
            </Span>
          </>
        ) : (
          formType
        )}
      </Button>
    </>
  );

  if (formDataLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        Loading form data...
      </div>
    );
  }

  return (
    <ModalDialog
      title={formType === "Save" ? "New Deposit" : "Edit Deposit"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={depositForm.handleSubmit}
        encType="multipart/form-data"
        id="deposit"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={depositForm}
            formFields={formFields}
            validationSchema={HubFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default DepositForm;
