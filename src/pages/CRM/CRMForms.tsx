// CRMForms.tsx
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
import { CRMService } from "./CRM.service";
import { 
  LeadFormFields, 
  AccountFormFields, 
  ContactFormFields, 
  OpportunityFormFields, 
  ContractFormFields 
} from "./CRMFormFields";
import { 
  LeadFormValidations, 
  AccountFormValidations, 
  ContactFormValidations, 
  OpportunityFormValidations, 
  ContractFormValidations 
} from "./CRMFormValidations";
import { ICRMFormProps, ILead, IAccount, IContact, IOpportunity, IContract } from "./CRM.interface";

// Lead Form Component
export const LeadForm: FC<ICRMFormProps<ILead>> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [bdmOptions, setBdmOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchBDMUsers();
  }, []);

  const fetchBDMUsers = async () => {
    try {
      const response = await CRMService.getBDMUsers();
      const options = response.results?.map((user: any) => ({
        label: `${user.first_name} ${user.last_name}`,
        value: user.id,
      })) || [];
      setBdmOptions(options);
    } catch (error) {
      console.error("Error fetching BDM users:", error);
    }
  };

  const formFields = LeadFormFields(bdmOptions);

  const leadForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: LeadFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      leadForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await CRMService.updateLead(values, initialValues?.id!);
        toast.success("Lead updated successfully");
      } else {
        await CRMService.createLead(values);
        toast.success("Lead created successfully");
      }
      leadForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        leadForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    leadForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => leadForm.handleSubmit()} 
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
          </>
        ) : (
          formType === "Update" ? "Update Lead" : "Create Lead"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "New Lead" : "Edit Lead"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={leadForm.handleSubmit}>
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={leadForm}
            formFields={formFields}
            validationSchema={LeadFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

// Account Form Component
export const AccountForm: FC<ICRMFormProps<IAccount>> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hubOptions, setHubOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      const response = await CRMService.getHubs();
      const options = response.results?.map((hub: any) => ({
        label: hub.name,
        value: hub.id,
      })) || [];
      setHubOptions(options);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  const formFields = AccountFormFields(hubOptions);

  const accountForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: AccountFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      accountForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await CRMService.updateAccount(values, initialValues?.id!);
        toast.success("Account updated successfully");
      } else {
        await CRMService.createAccount(values);
        toast.success("Account created successfully");
      }
      accountForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        accountForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    accountForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => accountForm.handleSubmit()} 
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
          </>
        ) : (
          formType === "Update" ? "Update Account" : "Create Account"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "New Account" : "Edit Account"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={accountForm.handleSubmit}>
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={accountForm}
            formFields={formFields}
            validationSchema={AccountFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

// Contact Form Component
export const ContactForm: FC<ICRMFormProps<IContact>> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchAccounts();
    fetchClientUsers();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await CRMService.getAccounts({});
      const options = response.results?.map((account: any) => ({
        label: account.name,
        value: account.id,
      })) || [];
      setAccountOptions(options);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchClientUsers = async () => {
    try {
      const response = await CRMService.getBDMUsers(); // Modify to get client users user.role = 'client'
      const options = response.results?.filter((user: any) => user.role === 'client').map((user: any) => ({
        label: `${user.first_name} ${user.last_name}`,
        value: user.id,
      })) || [];
      setUserOptions(options);
    } catch (error) {
      console.error("Error fetching client users:", error);
    }
  };

  const formFields = ContactFormFields(accountOptions, userOptions);

  const contactForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: ContactFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      contactForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await CRMService.updateContact(values, initialValues?.id!);
        toast.success("Contact updated successfully");
      } else {
        await CRMService.createContact(values);
        toast.success("Contact created successfully");
      }
      contactForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        contactForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    contactForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => contactForm.handleSubmit()} 
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
          </>
        ) : (
          formType === "Update" ? "Update Contact" : "Create Contact"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "New Contact" : "Edit Contact"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={contactForm.handleSubmit}>
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={contactForm}
            formFields={formFields}
            validationSchema={ContactFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

// Opportunity Form Component
export const OpportunityForm: FC<ICRMFormProps<IOpportunity>> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [bdmOptions, setBdmOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchAccounts();
    fetchBDMUsers();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await CRMService.getAccounts({});
      const options = response.results?.map((account: any) => ({
        label: account.name,
        value: account.id,
      })) || [];
      setAccountOptions(options);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchBDMUsers = async () => {
    try {
      const response = await CRMService.getBDMUsers();
      const options = response.results?.map((user: any) => ({
        label: `${user.first_name} ${user.last_name}`,
        value: user.id,
      })) || [];
      setBdmOptions(options);
    } catch (error) {
      console.error("Error fetching BDM users:", error);
    }
  };

  const formFields = OpportunityFormFields(accountOptions, bdmOptions);

  const opportunityForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: OpportunityFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      opportunityForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await CRMService.updateOpportunity(values, initialValues?.id!);
        toast.success("Opportunity updated successfully");
      } else {
        await CRMService.createOpportunity(values);
        toast.success("Opportunity created successfully");
      }
      opportunityForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        opportunityForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    opportunityForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => opportunityForm.handleSubmit()} 
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
          </>
        ) : (
          formType === "Update" ? "Update Opportunity" : "Create Opportunity"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "New Opportunity" : "Edit Opportunity"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={opportunityForm.handleSubmit}>
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={opportunityForm}
            formFields={formFields}
            validationSchema={OpportunityFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

// Contract Form Component
export const ContractForm: FC<ICRMFormProps<IContract>> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [opportunityOptions, setOpportunityOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await CRMService.getOpportunities({ stage: 'won' });
      const options = response.results?.map((opportunity: any) => ({
        label: opportunity.name,
        value: opportunity.id,
      })) || [];
      setOpportunityOptions(options);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }
  };

  const formFields = ContractFormFields(opportunityOptions);

  const contractForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: ContractFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      contractForm.setValues(patchInitialValues(formFields)(initialValues || {}));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await CRMService.updateContract(values, initialValues?.id!);
        toast.success("Contract updated successfully");
      } else {
        await CRMService.createContract(values);
        toast.success("Contract created successfully");
      }
      contractForm.resetForm();
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        contractForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    contractForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleReset} disabled={loading}>
        Close
      </Button>
      <Button 
        onClick={() => contractForm.handleSubmit()} 
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
          </>
        ) : (
          formType === "Update" ? "Update Contract" : "Create Contract"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "New Contract" : "Edit Contract"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form ref={formRef} onSubmit={contractForm.handleSubmit}>
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={contractForm}
            formFields={formFields}
            validationSchema={ContractFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};