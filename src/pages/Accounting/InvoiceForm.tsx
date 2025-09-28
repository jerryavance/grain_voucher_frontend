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
import { AccountingService } from "./Accounting.service";
import { InvoiceFormValidations } from "./AccountingValidations";
import { IInvoiceFormProps } from "./Accounting.interface";

const InvoiceForm: FC<IInvoiceFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

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
    fetchAccounts();
    fetchTrades();
  }, []);

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
  }, [initialValues, formType]);

  const fetchAccounts = async () => {
    try {
      // Using your existing API pattern
      const response = await fetch('/api/crm/accounts/');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.results || []);
      } else {
        console.error("Failed to fetch accounts");
        setAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    }
  };

  const fetchTrades = async () => {
    try {
      // Using your existing API pattern
      const response = await fetch('/api/trade/trades/');
      if (response.ok) {
        const data = await response.json();
        setTrades(data.results || []);
      } else {
        console.error("Failed to fetch trades");
        setTrades([]);
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
      setTrades([]);
    }
  };

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
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        invoiceForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    invoiceForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    invoiceForm.handleSubmit();
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
            formType === "Update" ? "Update Invoice" : "Create Invoice"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Invoice" : "Edit Invoice"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(invoiceForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={invoiceForm}
            formFields={formFields}
            validationSchema={InvoiceFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default InvoiceForm;