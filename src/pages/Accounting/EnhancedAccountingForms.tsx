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
import { InvoiceFormFields } from "./InvoiceFormFields";
import { JournalEntryFormFields } from "./JournalEntryFormFields";
import { BudgetFormFields } from "./BudgetFormFields";
import { AccountingService } from "./Accounting.service";
import { 
  InvoiceFormValidations, 
  JournalEntryFormValidations, 
  BudgetFormValidations 
} from "./AccountingValidations";
import { 
  IInvoiceFormProps, 
  IJournalEntryFormProps, 
  IBudgetFormProps 
} from "./Accounting.interface";
import { 
  useAccounts, 
  useTrades, 
  useHubs, 
  useGrainTypes 
} from "./useAccountingData";

// Enhanced Invoice Form with data hooks
export const EnhancedInvoiceForm: FC<IInvoiceFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { accounts } = useAccounts();
  const { trades } = useTrades();

  const formFields = InvoiceFormFields(accounts, trades);

  const invoiceForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: InvoiceFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      const processedValues = {
        ...initialValues,
        account_id: initialValues.account?.id || '',
        trade_id: initialValues.trade?.id || '',
      };
      invoiceForm.setValues(
        patchInitialValues(formFields)(processedValues)
      );
    }
  }, [initialValues, formType, formFields]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await AccountingService.updateInvoice(values, initialValues.id);
        toast.success("Invoice updated successfully");
      } else {
        await AccountingService.createInvoice(values);
        toast.success("Invoice created successfully");
      }
      
      invoiceForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        invoiceForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    invoiceForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => invoiceForm.handleSubmit()} 
        type="button"
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }} color="primary">
              Loading...
            </Span>
          </>
        ) : (
          formType === "Update" ? "Update Invoice" : "Create Invoice"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "New Invoice" : "Edit Invoice"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          others={{ sx: { marginBottom: "0rem" } }}
          formikInstance={invoiceForm}
          formFields={formFields}
          validationSchema={InvoiceFormValidations}
        />
      </Box>
    </ModalDialog>
  );
};

// Enhanced Journal Entry Form with data hooks
export const EnhancedJournalEntryForm: FC<IJournalEntryFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { trades } = useTrades();

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
    if (formType === "Update" && initialValues) {
      const processedValues = {
        ...initialValues,
        related_trade_id: initialValues.related_trade?.id || '',
      };
      journalEntryForm.setValues(
        patchInitialValues(formFields)(processedValues)
      );
    }
  }, [initialValues, formType, formFields]);

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
    } catch (error: any) {
      if (error.response?.data) {
        journalEntryForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    journalEntryForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => journalEntryForm.handleSubmit()} 
        type="button"
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
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

  return (
    <ModalDialog
      title={formType === "Save" ? "New Journal Entry" : "Edit Journal Entry"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          others={{ sx: { marginBottom: "0rem" } }}
          formikInstance={journalEntryForm}
          formFields={formFields}
          validationSchema={JournalEntryFormValidations}
        />
      </Box>
    </ModalDialog>
  );
};

// Enhanced Budget Form with data hooks
export const EnhancedBudgetForm: FC<IBudgetFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { hubs } = useHubs();
  const { grainTypes } = useGrainTypes();

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
    if (formType === "Update" && initialValues) {
      const processedValues = {
        ...initialValues,
        hub_id: initialValues.hub?.id || '',
        grain_type_id: initialValues.grain_type?.id || '',
      };
      budgetForm.setValues(
        patchInitialValues(formFields)(processedValues)
      );
    }
  }, [initialValues, formType, formFields]);

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
    } catch (error: any) {
      if (error.response?.data) {
        budgetForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    budgetForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => budgetForm.handleSubmit()} 
        type="button"
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
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

  return (
    <ModalDialog
      title={formType === "Save" ? "New Budget" : "Edit Budget"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          others={{ sx: { marginBottom: "0rem" } }}
          formikInstance={budgetForm}
          formFields={formFields}
          validationSchema={BudgetFormValidations}
        />
      </Box>
    </ModalDialog>
  );
};