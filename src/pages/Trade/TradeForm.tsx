// TradeForm.tsx
import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeFormFields } from "./TradeFormFields";
import { TradeService } from "./Trade.service";
import { TradeFormValidations } from "./TradeFormValidations";
import { ITradeFormProps } from "./Trade.interface";
import { TOption } from "../../@types/common";
import { toast } from "react-hot-toast";

const TradeForm: FC<ITradeFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [warning, setWarning] = useState<string>("");

  // State for dropdown options
  const [hubs, setHubs] = useState<TOption[]>([]);
  const [grainTypes, setGrainTypes] = useState<TOption[]>([]);
  const [qualityGrades, setQualityGrades] = useState<TOption[]>([]);
  const [buyers, setBuyers] = useState<TOption[]>([]);

  const formFields = TradeFormFields({
    hubs,
    grainTypes,
    qualityGrades,
    buyers,
    isUpdate: formType === "Update",
  });

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
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      tradeForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType, hubs, grainTypes, qualityGrades, buyers]);

  const fetchDropdownData = async () => {
    try {
      const [hubsData, grainTypesData, qualityGradesData, buyersData] = await Promise.all([
        TradeService.getHubs(),
        TradeService.getGrainTypes(),
        TradeService.getQualityGrades(),
        TradeService.getBuyers(),
      ]);

      setHubs(
        hubsData.map((h: any) => ({ label: h.name, value: h.id }))
      );
      setGrainTypes(
        grainTypesData.map((g: any) => ({ label: g.name, value: g.id }))
      );
      setQualityGrades(
        qualityGradesData.map((q: any) => ({ label: q.name, value: q.id }))
      );
      setBuyers(
        buyersData.map((b: any) => ({ label: b.name, value: b.id }))
      );
    } catch (error: any) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load form data");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setWarning("");
    try {
      if (formType === "Update") {
        await TradeService.updateTrade(initialValues.id, values);
        toast.success("Trade updated successfully");
      } else {
        const response = await TradeService.createTrade(values);
        
        // Check for inventory warning
        if (response.warning) {
          setWarning(response.warning);
          toast("Trade created with pending allocation", {
            icon: "⚠️",
            style: {
              background: "#fff3cd",
              color: "#856404",
            },
          });
          
        } else {
          toast.success("Trade created successfully");
        }
      }

      tradeForm.resetForm();
      callBack && callBack();
      
      // Only close if no warning or if updating
      if (!warning || formType === "Update") {
        handleClose();
      }
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);

      if (error.response?.data) {
        tradeForm.setErrors(error.response.data);
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    tradeForm.resetForm();
    setWarning("");
    handleClose();
  };

  const handleButtonClick = () => {
    tradeForm.handleSubmit();
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
          ) : formType === "Update" ? (
            "Update Trade"
          ) : (
            "Create Trade"
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
      maxWidth="lg"
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(tradeForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          {warning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {warning}
            </Alert>
          )}

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