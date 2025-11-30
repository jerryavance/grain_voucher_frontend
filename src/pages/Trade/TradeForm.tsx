import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
} from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeFormFields } from "./TradeFormFields";
import { TradeService } from "./Trade.service";
import { TradeFormValidations } from "./TradeFormValidations";
import { ITradeFormProps, TTradeFormProps } from "./Trade.interface";
import { TOption } from "../../@types/common";

const steps = [
  "Basic Information",
  "Quantities & Weight",
  "Pricing",
  "Costs & Fees",
  "Delivery & Payment",
  "Additional Options",
];

const TradeForm: FC<ITradeFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Lookup options
  const [buyers, setBuyers] = useState<TOption[]>([]);
  const [suppliers, setSuppliers] = useState<TOption[]>([]);
  const [grainTypes, setGrainTypes] = useState<TOption[]>([]);
  const [qualityGrades, setQualityGrades] = useState<TOption[]>([]);
  const [hubs, setHubs] = useState<TOption[]>([]);

  const formProps: TTradeFormProps = {
    buyers,
    suppliers,
    grainTypes,
    qualityGrades,
    hubs,
    handleBuyerSearch,
    handleSupplierSearch,
    handleGrainTypeSearch,
    handleQualityGradeSearch,
    handleHubSearch,
  };

  const allFormFields = TradeFormFields(formProps, -1); // Get all fields
  const currentStepFields = TradeFormFields(formProps, activeStep);

  const tradeForm = useFormik({
    initialValues: getInitialValues(allFormFields),
    validationSchema: TradeFormValidations(activeStep),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    // Load lookup data
    loadBuyers();
    loadSuppliers();
    loadGrainTypes();
    loadQualityGrades();
    loadHubs();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      tradeForm.setValues(patchInitialValues(allFormFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  // Lookup loaders
  async function loadBuyers(search?: string) {
    try {
      const data = await TradeService.getBuyers(search);
      setBuyers(
        data.results.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error loading buyers:", error);
    }
  }

  async function loadSuppliers(search?: string) {
    try {
      const data = await TradeService.getSuppliers(search);
      setSuppliers(
        data.results.map((item: any) => ({
          label: `${item.first_name} ${item.last_name}`,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  }

  async function loadGrainTypes(search?: string) {
    try {
      const data = await TradeService.getGrainTypes(search);
      setGrainTypes(
        data.results.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error loading grain types:", error);
    }
  }

  async function loadQualityGrades(search?: string) {
    try {
      const data = await TradeService.getQualityGrades(search);
      setQualityGrades(
        data.results.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error loading quality grades:", error);
    }
  }

  async function loadHubs(search?: string) {
    try {
      const data = await TradeService.getHubs(search);
      setHubs(
        data.results.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("Error loading hubs:", error);
    }
  }

  // Search handlers
  function handleBuyerSearch(value: any) {
    loadBuyers(value);
  }

  function handleSupplierSearch(value: any) {
    loadSuppliers(value);
  }

  function handleGrainTypeSearch(value: any) {
    loadGrainTypes(value);
  }

  function handleQualityGradeSearch(value: any) {
    loadQualityGrades(value);
  }

  function handleHubSearch(value: any) {
    loadHubs(value);
  }

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await TradeService.updateTrade(values, initialValues.id);
        toast.success("Trade updated successfully");
      } else {
        await TradeService.createTrade(values);
        toast.success("Trade created successfully");
      }

      tradeForm.resetForm();
      callBack && callBack();
      handleClose();
      setActiveStep(0);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        tradeForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    tradeForm.resetForm();
    setActiveStep(0);
    handleClose();
  };

  const handleNext = async () => {
    // Validate current step
    const errors = await tradeForm.validateForm();
    const currentFieldNames = currentStepFields.map((f) => f.name);
    const currentErrors = Object.keys(errors).filter((key) =>
      currentFieldNames.includes(key)
    );

    if (currentErrors.length > 0) {
      toast.error("Please fill in all required fields");
      tradeForm.setErrors(errors);
      return;
    }

    if (activeStep === steps.length - 1) {
      tradeForm.handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading}>
          Close
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
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
          ) : activeStep === steps.length - 1 ? (
            formType === "Update" ? "Update Trade" : "Create Trade"
          ) : (
            "Next"
          )}
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
      maxWidth="md"
    >
      <Box sx={{ width: "100%", mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Paper elevation={0} sx={{ p: 2, backgroundColor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          {steps[activeStep]}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {getStepDescription(activeStep)}
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(tradeForm.values);
          }}
        >
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={tradeForm}
            formFields={currentStepFields}
            validationSchema={TradeFormValidations(activeStep)}
          />
        </form>
      </Paper>
    </ModalDialog>
  );
};

function getStepDescription(step: number): string {
  const descriptions = [
    "Enter the buyer, supplier, hub, and grain details for this trade",
    "Specify the gross tonnage, net tonnage, and bag quantities",
    "Enter the buying and selling prices per kilogram",
    "Add all costs associated with this trade including transport, QA, and fees",
    "Set delivery date, location, and payment terms",
    "Configure financing and voucher allocation requirements",
  ];
  return descriptions[step] || "";
}

export default TradeForm;