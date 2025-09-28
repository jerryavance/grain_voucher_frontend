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
import { BudgetFormFields } from "./BudgetFormFields";
import { AccountingService } from "./Accounting.service";
import { BudgetFormValidations } from "./AccountingValidations";
import { IBudgetFormProps } from "./Accounting.interface";

const BudgetForm: FC<IBudgetFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hubs, setHubs] = useState<any[]>([]);
  const [grainTypes, setGrainTypes] = useState<any[]>([]);

  const formFields = BudgetFormFields(hubs, grainTypes);

  const budgetForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: BudgetFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    fetchHubs();
    fetchGrainTypes();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      budgetForm.setValues(
        patchInitialValues(formFields)(initialValues || {})
      );
    }
  }, [initialValues, formType]);

  const fetchHubs = async () => {
    try {
      const response = await fetch('/api/hubs/hubs/');
      const data = await response.json();
      setHubs(data.results || []);
    } catch (error) {
      console.error("Error fetching hubs:", error);
      setHubs([]);
    }
  };

  const fetchGrainTypes = async () => {
    try {
      const response = await fetch('/api/vouchers/grain-types/');
      const data = await response.json();
      setGrainTypes(data.results || []);
    } catch (error) {
      console.error("Error fetching grain types:", error);
      setGrainTypes([]);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await AccountingService.updateBudget(values, initialValues.id);
        toast.success("Budget updated successfully");
      } else {
        await AccountingService.createBudget(values);
        toast.success("Budget created successfully");
      }
      
      budgetForm.resetForm();
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        budgetForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    budgetForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    budgetForm.handleSubmit();
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
            formType === "Update" ? "Update Budget" : "Create Budget"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Budget" : "Edit Budget"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(budgetForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={budgetForm}
            formFields={formFields}
            validationSchema={BudgetFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default BudgetForm;