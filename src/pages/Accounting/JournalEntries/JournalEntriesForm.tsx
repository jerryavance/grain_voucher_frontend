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
import { JournalEntryFormFields } from "./JournalEntriesFormFields";
import { JournalEntryService } from "./JournalEntries.service";
import { JournalEntryFormValidations } from "./JournalEntriesFormValidations";
import { IJournalEntryFormProps, TJournalEntryFormProps } from "./JournalEntries.interface";
import { TradeService } from "../../Trade/Trade.service"; // Adjust path
import { InvoiceService } from "../Invoices/Invoices.service";
import { PaymentService } from "../Payments/Payments.service";

const JournalEntryForm: FC<IJournalEntryFormProps> = ({ handleClose, formType = "Save", initialValues, callBack }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [trades, setTrades] = useState<TJournalEntryFormProps["trades"]>([]);
  const [invoices, setInvoices] = useState<TJournalEntryFormProps["invoices"]>([]);
  const [payments, setPayments] = useState<TJournalEntryFormProps["payments"]>([]);

  useEffect(() => {
    TradeService.getTrades({}).then((resp) => setTrades(resp.results.map((t: any) => ({ value: t.id, label: t.trade_number }))));
    InvoiceService.getInvoices({}).then((resp) => setInvoices(resp.results.map((i: any) => ({ value: i.id, label: i.invoice_number }))));
    PaymentService.getPayments({}).then((resp) => setPayments(resp.results.map((p: any) => ({ value: p.id, label: p.payment_number }))));
  }, []);

  const formFields = JournalEntryFormFields({ trades, invoices, payments });

  const newJournalEntryForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: JournalEntryFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      newJournalEntryForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await JournalEntryService.updateJournalEntry(values, initialValues.id);
        toast.success("Journal entry updated successfully");
      } else {
        await JournalEntryService.createJournalEntry(values);
        toast.success("Journal entry created successfully");
      }
      newJournalEntryForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        newJournalEntryForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    newJournalEntryForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    newJournalEntryForm.handleSubmit();
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
          formType === "Update" ? "Update Entry" : "Create Entry"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog title={formType === "Save" ? "New Journal Entry" : "Edit Journal Entry"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newJournalEntryForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={newJournalEntryForm}
            formFields={formFields}
            validationSchema={JournalEntryFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default JournalEntryForm;