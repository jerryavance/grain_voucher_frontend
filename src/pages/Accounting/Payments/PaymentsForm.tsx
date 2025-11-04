import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Grid, Chip, Divider, Alert } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import { Span } from "../../../components/Typography";
import FormFactory from "../../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../../utils/form_factory";
import uniqueId from "../../../utils/generateId";
import { PaymentFormFields } from "./PaymentsFormFields";
import { PaymentService } from "./Payments.service";
import { PaymentFormValidations } from "./PaymentsFormValidations";
import { IPaymentFormProps, TPaymentFormProps } from "./Payments.interface";
import { InvoiceService } from "../Invoices/Invoices.service";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";

const PaymentForm: FC<IPaymentFormProps> = ({ handleClose, formType = "Save", initialValues, callBack }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    InvoiceService.getInvoices({}).then((resp) => {
      setInvoices(resp.results);
    });
  }, []);

  // Create enhanced invoice options for dropdown
  const invoiceOptions = invoices.map((invoice) => ({
    value: invoice.id,
    label: `${invoice.invoice_number} - ${invoice.account_name} (UGX ${invoice.amount_due.toLocaleString()})`,
  }));

  const formFields = PaymentFormFields({ invoices: invoiceOptions, accounts: [] });

  const newPaymentForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: PaymentFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      newPaymentForm.setValues(patchInitialValues(formFields)(initialValues || {}));
      // Find and set the selected invoice for display
      if (initialValues.invoice_id) {
        const invoice = invoices.find((inv) => inv.id === initialValues.invoice_id);
        setSelectedInvoice(invoice);
      }
    }
  }, [initialValues, formType, invoices]);

  // Handle invoice selection
  useEffect(() => {
    const invoiceId = newPaymentForm.values.invoice;
    if (invoiceId) {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      setSelectedInvoice(invoice);
      
      // Auto-fill payment amount with amount_due if not in edit mode
      if (invoice && formType === "Save") {
        newPaymentForm.setFieldValue("amount", invoice.amount_due);
      }
    } else {
      setSelectedInvoice(null);
    }
  }, [newPaymentForm.values.invoice, invoices]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await PaymentService.updatePayment(values, initialValues.id);
        toast.success("Payment updated successfully");
      } else {
        await PaymentService.createPayment(values);
        toast.success("Payment created successfully");
      }
      newPaymentForm.resetForm();
      setSelectedInvoice(null);
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        newPaymentForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    newPaymentForm.resetForm();
    setSelectedInvoice(null);
    handleClose();
  };

  const handleButtonClick = () => {
    newPaymentForm.handleSubmit();
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
          formType === "Update" ? "Update Payment" : "Create Payment"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog 
      title={formType === "Save" ? "New Payment" : "Edit Payment"} 
      onClose={handleReset} 
      id={uniqueId()} 
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newPaymentForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          {/* Invoice Selection */}
          <FormFactory
            others={{ sx: { marginBottom: "1rem" } }}
            formikInstance={newPaymentForm}
            formFields={formFields.slice(0, 1)} // Just the invoice field
            validationSchema={PaymentFormValidations()}
          />

          {/* Invoice Details Card */}
          {selectedInvoice && (
            <Card variant="outlined" sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Invoice Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Account Name
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedInvoice.account_name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Invoice Number
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedInvoice.invoice_number}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Issue Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDateToDDMMYYYY(selectedInvoice.issue_date)}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDateToDDMMYYYY(selectedInvoice.due_date)}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      UGX {selectedInvoice.total_amount.toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount Paid
                    </Typography>
                    <Typography variant="body1">
                      UGX {selectedInvoice.amount_paid.toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount Due
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="error.main">
                      UGX {selectedInvoice.amount_due.toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label={selectedInvoice.status_display} 
                        size="small" 
                        color={selectedInvoice.status === "issued" ? "success" : "default"}
                      />
                      <Chip 
                        label={selectedInvoice.payment_status_display} 
                        size="small" 
                        color={selectedInvoice.payment_status === "paid" ? "success" : "warning"}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Grid>

                  {selectedInvoice.days_overdue > 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        This invoice is <strong>{selectedInvoice.days_overdue} days overdue</strong>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Payment Form Fields */}
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={newPaymentForm}
            formFields={formFields.slice(1)} // All fields except invoice
            validationSchema={PaymentFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default PaymentForm;



// import React, { FC, useEffect, useRef, useState } from "react";
// import { Box, Button } from "@mui/material";
// import { useFormik } from "formik";
// import ModalDialog from "../../../components/UI/Modal/ModalDialog";
// import ProgressIndicator from "../../../components/UI/ProgressIndicator";
// import { Span } from "../../../components/Typography";
// import FormFactory from "../../../components/UI/FormFactory";
// import { toast } from "react-hot-toast";
// import { getInitialValues, patchInitialValues } from "../../../utils/form_factory";
// import uniqueId from "../../../utils/generateId";
// import { PaymentFormFields } from "./PaymentsFormFields";
// import { PaymentService } from "./Payments.service";
// import { PaymentFormValidations } from "./PaymentsFormValidations";
// import { IPaymentFormProps, TPaymentFormProps } from "./Payments.interface";
// import { InvoiceService } from "../Invoices/Invoices.service";

// const PaymentForm: FC<IPaymentFormProps> = ({ handleClose, formType = "Save", initialValues, callBack }) => {
//   const formRef = useRef<HTMLFormElement | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [invoices, setInvoices] = useState<TPaymentFormProps["invoices"]>([]);

//   useEffect(() => {
//     InvoiceService.getInvoices({}).then((resp) =>
//       setInvoices(resp.results.map((i: any) => ({ value: i.id, label: i.invoice_number })))
//     );
//   }, []);

//   const formFields = PaymentFormFields({ invoices, accounts: [] }); // Accounts auto-set from invoice

//   const newPaymentForm = useFormik({
//     initialValues: getInitialValues(formFields),
//     validationSchema: PaymentFormValidations(),
//     validateOnChange: false,
//     validateOnMount: false,
//     validateOnBlur: false,
//     enableReinitialize: true,
//     onSubmit: (values: any) => handleSubmit(values),
//   });

//   useEffect(() => {
//     if (formType === "Update" && initialValues) {
//       newPaymentForm.setValues(patchInitialValues(formFields)(initialValues || {}));
//     }
//   }, [initialValues, formType]);

//   const handleSubmit = async (values: any) => {
//     setLoading(true);
//     try {
//       if (formType === "Update") {
//         await PaymentService.updatePayment(values, initialValues.id);
//         toast.success("Payment updated successfully");
//       } else {
//         await PaymentService.createPayment(values);
//         toast.success("Payment created successfully");
//       }
//       newPaymentForm.resetForm();
//       callBack && callBack();
//       handleClose();
//     } catch (error: any) {
//       if (error.response?.data) {
//         newPaymentForm.setErrors(error.response.data);
//       }
//       toast.error(error.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     newPaymentForm.resetForm();
//     handleClose();
//   };

//   const handleButtonClick = () => {
//     newPaymentForm.handleSubmit();
//   };

//   const ActionBtns: FC = () => (
//     <>
//       <Button onClick={handleReset} disabled={loading}>
//         Close
//       </Button>
//       <Button onClick={handleButtonClick} type="button" variant="contained" disabled={loading}>
//         {loading ? (
//           <>
//             <ProgressIndicator color="inherit" size={20} /> <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
//           </>
//         ) : (
//           formType === "Update" ? "Update Payment" : "Create Payment"
//         )}
//       </Button>
//     </>
//   );

//   return (
//     <ModalDialog title={formType === "Save" ? "New Payment" : "Edit Payment"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
//       <form
//         ref={formRef}
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSubmit(newPaymentForm.values);
//         }}
//         encType="multipart/form-data"
//       >
//         <Box sx={{ width: "100%" }}>
//           <FormFactory
//             others={{ sx: { marginBottom: "0rem" } }}
//             formikInstance={newPaymentForm}
//             formFields={formFields}
//             validationSchema={PaymentFormValidations()}
//           />
//         </Box>
//       </form>
//     </ModalDialog>
//   );
// };

// export default PaymentForm;