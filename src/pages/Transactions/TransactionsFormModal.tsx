import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import FormFactory from "../../components/UI/FormFactory";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import { ITransactionFormProps } from "./Transactions.interface";
import {
  getInitialValues,
  patchInitialValues,
} from "../../utils/form_factory";
import { TransactionService } from "./Transactions.service";
import uniqueId from "../../utils/generateId";
import {
  TransactionFormFields,
  TransactionFormValidations,
} from "./TransactionsFormFields";
import { TRANSACTION_STATUS_COMPLETED, TRANSACTION_STATUS_PENDING, TRANSACTION_STATUSES, TRANSACTION_TYPE_DEPOSIT, TRANSACTION_TYPE_WITHDRAWAL, TRANSACTION_TYPES } from "../../api/constants";
import { InvestmentService } from "../Investments/Investment.service";
import { beautifyName } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";


const TransactionFormModal: FC<ITransactionFormProps> = (props) => {
  const {
    handleClose,
    formType = "Save",
    initialValues,
    callback,
    investmentDetails,
    open,
  } = props;

  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [participants, setParticipants] = useState<any>();
  const [filters, setFilters] = useState<any>({});

  const {user} = useAuth();

  const formFields = TransactionFormFields({
    transaction_type: TRANSACTION_TYPE_WITHDRAWAL,
    participants: participants|| [],
  });

  const form = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: TransactionFormValidations,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      form.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType, formFields, form]);

  
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    const payload = {
      ...values,
      investment: investmentDetails?.id,
      participants: [
        { 'participant_id': values?.participant, 'participant_type': values?.type === TRANSACTION_TYPE_DEPOSIT? TRANSACTION_TYPE_DEPOSIT: TRANSACTION_TYPE_WITHDRAWAL },
        { 'participant_id': values?.type === TRANSACTION_TYPE_DEPOSIT? values?.participant: user?.id, 'participant_type': values?.type === TRANSACTION_TYPE_DEPOSIT? TRANSACTION_TYPE_WITHDRAWAL: TRANSACTION_TYPE_DEPOSIT }
      ]
    };

    try {
      if (formType === "Update") {
        await TransactionService.updateTransaction(investmentDetails?.id as string, initialValues.id,  payload );
      } else {
        await TransactionService.createTransaction(payload);
      }
      toast.success(
        formType === "Save"
          ? "Transaction created successfully"
          : "Transaction updated successfully"
      );
      handleReset();
      callback && callback();
      setSubmitting(false);
    } catch (error: any) {
      if (error.response?.data) {
        form.setErrors(error.response.data);
      }
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset}>Close</Button>
        <Button
          disabled={!form.isValid}
          onClick={handleButtonClick}
          type="submit"
          variant="contained"
        >
          {submitting ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Submitting...
              </Span>
            </>
          ) : (
            formType
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title="Transaction"
      open={open}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={form.handleSubmit}>
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={form}
            formFields={formFields}
            validationSchema={TransactionFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default TransactionFormModal;