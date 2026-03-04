import React, { FC, useRef, useState, useEffect } from "react";
import { Box, Button, Alert } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { InvestorService } from "./Investor.service";
import { IMarginPayoutFormProps } from "./Investor.interface";

const validation = Yup.object().shape({
  investor_account_id: Yup.string().required("Investor account is required"),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
  notes: Yup.string(),
});

const MarginPayoutForm: FC<IMarginPayoutFormProps> = ({
  handleClose,
  callBack,
  accountId,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountOptions, setAccountOptions] = useState<{ label: string; value: string; margin: number }[]>([]);
  const [selectedMargin, setSelectedMargin] = useState<number>(0);

  const formFields = [
    {
      name: "investor_account_id",
      initailValue: accountId || "",
      label: "Investor Account",
      type: "select",
      uiType: "select",
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: true,
      options: accountOptions,
    },
    {
      name: "amount",
      initailValue: "",
      label: "Payout Amount (UGX)",
      type: "number",
      uiType: "number",
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: true,
    },
    {
      name: "notes",
      initailValue: "",
      label: "Notes / Reference",
      type: "text",
      uiType: "textarea",
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      rows: 3,
    },
  ];

  const form = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: validation,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  // Pre-fill accountId if provided
  useEffect(() => {
    if (accountId) {
      form.setFieldValue("investor_account_id", accountId);
    }
  }, [accountId]);

  // Update available margin when account selection changes
  useEffect(() => {
    const selected = accountOptions.find(
      (o) => o.value === form.values.investor_account_id
    );
    setSelectedMargin(selected?.margin ?? 0);
  }, [form.values.investor_account_id, accountOptions]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoadingAccounts(true);
    try {
      const response = await InvestorService.getInvestorAccounts({
        page: 1,
        page_size: 200,
      });
      const opts = (response.results || []).map((acc: any) => ({
        label: `${acc.investor.first_name} ${acc.investor.last_name} (${acc.investor.phone_number}) — Margin: UGX ${parseFloat(acc.total_margin_earned || 0).toLocaleString()}`,
        value: acc.id,
        margin:
          parseFloat(acc.total_margin_earned || 0) -
          parseFloat(acc.total_margin_paid || 0),
      }));
      setAccountOptions(opts);
    } catch (err: any) {
      toast.error("Failed to load accounts");
      handleClose();
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function handleSubmit(values: any) {
    setLoading(true);
    try {
      await InvestorService.createMarginPayout(values);
      toast.success("Margin payout request created. Awaiting approval.");
      form.resetForm();
      callBack?.();
      handleClose();
    } catch (err: any) {
      if (err.response?.data) form.setErrors(err.response.data);
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.amount?.[0] ||
          err.message ||
          "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

  const ActionBtns: FC = () => (
    <>
      <Button onClick={() => { form.resetForm(); handleClose(); }} disabled={loading || loadingAccounts}>
        Cancel
      </Button>
      <Button
        onClick={() => form.handleSubmit()}
        type="button"
        variant="contained"
        disabled={loading || loadingAccounts}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Creating…</Span>
          </>
        ) : (
          "Create Payout Request"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title="New Margin Payout Request"
      onClose={() => { form.resetForm(); handleClose(); }}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      {loadingAccounts ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <ProgressIndicator size={40} />
        </Box>
      ) : (
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {selectedMargin > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Available margin balance for this account:{" "}
              <strong>UGX {selectedMargin.toLocaleString()}</strong>
            </Alert>
          )}
          {selectedMargin === 0 && form.values.investor_account_id && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No unpaid margin balance found for this account.
            </Alert>
          )}
          <Box sx={{ width: "100%" }}>
            <FormFactory
              others={{ sx: { marginBottom: "0rem" } }}
              formikInstance={form}
              formFields={formFields.map((f) =>
                f.name === "investor_account_id"
                  ? { ...f, options: accountOptions }
                  : f
              )}
              validationSchema={validation}
            />
          </Box>
        </form>
      )}
    </ModalDialog>
  );
};

export default MarginPayoutForm;