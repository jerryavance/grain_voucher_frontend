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
import { InvoiceFormFields } from "./InvoicesFormFields";
import { InvoiceService } from "./Invoices.service";
import { InvoiceFormValidations } from "./InvoicesFormValidations";
import { IInvoiceFormProps, TInvoiceFormProps } from "./Invoices.interface";
// Hypothetical services for options
import { CRMService } from "../../CRM/CRM.service"; // Adjust path
import { TradeService } from "../../Trade/Trade.service"; // Adjust path

const InvoiceForm: FC<IInvoiceFormProps> = ({ handleClose, formType = "Save", initialValues, callBack }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<TInvoiceFormProps["accounts"]>([]);
  const [trades, setTrades] = useState<TInvoiceFormProps["trades"]>([]);

  useEffect(() => {
    // Fetch options
    CRMService.getAccounts({}).then((resp) =>
      setAccounts(resp.results.map((a: any) => ({ value: a.id, label: a.name })))
    );
    TradeService.getTrades({}).then((resp) =>
      setTrades(resp.results.map((t: any) => ({ value: t.id, label: t.trade_number })))
    );
  }, []);

  const formFields = InvoiceFormFields({
      accounts, trades,
      // grainTypes: []
  });

  const newInvoiceForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: InvoiceFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      newInvoiceForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await InvoiceService.updateInvoice(values, initialValues.id);
        toast.success("Invoice updated successfully");
      } else {
        await InvoiceService.createInvoice(values);
        toast.success("Invoice created successfully");
      }
      newInvoiceForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        newInvoiceForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    newInvoiceForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    newInvoiceForm.handleSubmit();
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
          formType === "Update" ? "Update Invoice" : "Create Invoice"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog title={formType === "Save" ? "New Invoice" : "Edit Invoice"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newInvoiceForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={newInvoiceForm}
            formFields={formFields}
            validationSchema={InvoiceFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default InvoiceForm;