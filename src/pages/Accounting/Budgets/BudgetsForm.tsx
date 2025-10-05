import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import { Span } from "../../../components/Typography";
import FormFactory from "../../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../../utils/form_factory";
import uniqueId from "../../../utils/generateId";
import { BudgetFormFields } from "./BudgetsFormFields";
import { BudgetService } from "./Budgets.service";
import { BudgetFormValidations } from "./BudgetsFormValidations";
import { IBudgetFormProps, TBudgetFormProps } from "./Budgets.interface";
// Hypothetical services
import { HubService } from "../../Hub/Hub.service";
import { GrainTypeService } from "../../GrainType/GrainType.service"; // Adjust path

const BudgetForm: FC<IBudgetFormProps> = ({ handleClose, formType = "Save", initialValues, callBack }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hubs, setHubs] = useState<TBudgetFormProps["hubs"]>([]);
  const [grainTypes, setGrainTypes] = useState<TBudgetFormProps["grainTypes"]>([]);

  useEffect(() => {
    HubService.getHubs({}).then((resp) => setHubs(resp.results.map((h: any) => ({ value: h.id, label: h.name }))));
    GrainTypeService.getGrainTypes({}).then((resp) => setGrainTypes(resp.results.map((g: any) => ({ value: g.id, label: g.name }))));
  }, []);

  const formFields = BudgetFormFields({ hubs, grainTypes });

  const newBudgetForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: BudgetFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      newBudgetForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await BudgetService.updateBudget(values, initialValues.id);
        toast.success("Budget updated successfully");
      } else {
        await BudgetService.createBudget(values);
        toast.success("Budget created successfully");
      }
      newBudgetForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        newBudgetForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    newBudgetForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    newBudgetForm.handleSubmit();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button onClick={handleButtonClick} type="button" variant="contained" disabled={loading}>
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} /> <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
          </>
        ) : (
          formType === "Update" ? "Update Budget" : "Create Budget"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog title={formType === "Save" ? "New Budget" : "Edit Budget"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newBudgetForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={newBudgetForm}
            formFields={formFields}
            validationSchema={BudgetFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default BudgetForm;