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
import { JournalEntryFormFields } from "./JournalEntryFormFields";
import { AccountingService } from "./Accounting.service";
import { JournalEntryFormValidations } from "./AccountingValidations";
import { IJournalEntryFormProps } from "./Accounting.interface";

const JournalEntryForm: FC<IJournalEntryFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [trades, setTrades] = useState<any[]>([]);

  const formFields = JournalEntryFormFields(trades);

  const journalEntryForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: JournalEntryFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      journalEntryForm.setValues(
        patchInitialValues(formFields)(initialValues || {})
      );
    }
  }, [initialValues, formType]);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trade/trades/');
      const data = await response.json();
      setTrades(data.results || []);
    } catch (error) {
      console.error("Error fetching trades:", error);
      setTrades([]);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await AccountingService.updateJournalEntry(values, initialValues.id);
        toast.success("Journal entry updated successfully");
      } else {
        await AccountingService.createJournalEntry(values);
        toast.success("Journal entry created successfully");
      }
      
      journalEntryForm.resetForm();
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        journalEntryForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    journalEntryForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    journalEntryForm.handleSubmit();
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
            formType === "Update" ? "Update Entry" : "Create Entry"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Journal Entry" : "Edit Journal Entry"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(journalEntryForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={journalEntryForm}
            formFields={formFields}
            validationSchema={JournalEntryFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default JournalEntryForm;