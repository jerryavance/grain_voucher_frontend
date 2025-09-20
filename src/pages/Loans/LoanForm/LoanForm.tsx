import { FC, useEffect, useState } from "react";
import { Box, Button, Card } from "@mui/material";
import useTitle from "../../../hooks/useTitle";
import { useLocation, useNavigate } from "react-router-dom";
import HorizontalStepper, {
  IStep,
} from "../../../components/UI/HorizontalStepper";
import {
  SettingsFormFields,
  GeneralFormFields,
  OtherFormFields,
} from "./LoanFormFields";
import {
  deepMerge,
  getInitialValues,
  patchInitialValues,
} from "../../../utils/form_factory";
import { useFormik } from "formik";
import FormFactory from "../../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { Span } from "../../../components/Typography";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import { LOAN_PURPOSE, CURRENCY_CODES , LOAN_DURATION, PAYMENT_METHOD, DURATION_UNITS, REPAYMENT_FREQUENCIES, STATUS } from "../../../constants/loan-options";
import {
  SettingsFormValidations,
  GeneralFormValidations,
  OtherFormValidations,
} from "./Validations";
import { setFormErrors } from "../../../utils/form_validations";
import { AlertMessage } from "../../../components/UI/AlertMessage";
import { UserService } from "../../Users/User.service";
import { LoanService } from "../Loan.service";

const LoanForm: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    formTitle,
    formType = "Save",
    userType,
    loanDetails,
  } = location.state as {
    formType: string;
    formTitle: string;
    userType: string;
    loanDetails?: any;
  };

  useTitle(formTitle);

  const [loading, setLoading] = useState<boolean>(false);
  interface IUserResults {
    results: { id: string; name: string }[];
  }

  const [users, setUsers] = useState<IUserResults>();
  const [userQuery, setUserQuery] = useState("");
  const [formsErrorStates, setFormsErrorStates] = useState<any>({
    generalInfoForm: true,
    settingsInfoForm: true,
    otherInfoForm: true,
  });

  const handleUserSearch = async (query: string) => {
    setUserQuery(query);
    try {
      const response = await UserService.getUsers(query);
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  const [nonFieldErrors, setNonFieldErrors] = useState<any[]>([]);

  interface IUserOption {
    value: string;
    label: string;
  }

  const generalFormFields = GeneralFormFields(
    LOAN_PURPOSE,
    (users?.results?.map((user: { id: string; name: string }): IUserOption => ({
      value: user.id,
      label: user.name,
    })) || []) as IUserOption[],
    handleUserSearch
  );

  const generalInfoForm = useFormik({
    initialValues:
      formType === "Update"
        ? patchInitialValues(generalFormFields)(loanDetails)
        : getInitialValues(generalFormFields),
    validateOnMount: false,
    validateOnChange: true,
    validationSchema: GeneralFormValidations,
    onSubmit: (values) => {},
  });

  const settingsFormFields = SettingsFormFields(
    LOAN_DURATION,
    PAYMENT_METHOD,
    REPAYMENT_FREQUENCIES,
    STATUS,
  );
  const settingsInfoForm = useFormik({
    validateOnMount: true,
    validateOnChange: true,
    initialValues:
      formType === "Update"
        ? patchInitialValues(settingsFormFields)(loanDetails)
        : getInitialValues(settingsFormFields),
    validationSchema: SettingsFormValidations,
    onSubmit: (values) => {},
  });

  const otherFormFields = OtherFormFields(
    CURRENCY_CODES,
  );
  const otherInfoForm = useFormik({
    validateOnMount: true,
    validateOnChange: true,
    initialValues:
      formType === "Update"
        ? patchInitialValues(otherFormFields)(loanDetails)
        : getInitialValues(otherFormFields),
    validationSchema: OtherFormValidations,
    onSubmit: (values) => {},
  });

  const stepCollection = [
    {
      label: "General Information",
      formControl: generalInfoForm,
      formFields: generalFormFields,
      validations: GeneralFormValidations,
      formErrorState: formsErrorStates.generalInfoForm,
    },
    {
      label: "Loan Settings",
      formControl: settingsInfoForm,
      formFields: settingsFormFields,
      validations: SettingsFormValidations,
      formErrorState: formsErrorStates.settingsInfoForm,
    },
    {
      label: "Other Information",
      formControl: otherInfoForm,
      formFields: otherFormFields,
      validations: OtherFormValidations,
      formErrorState: formsErrorStates.otherInfoForm,
    },
  ];

  useEffect(() => {
    fetchUsers(userQuery);
  }, [userQuery]);

  const fetchUsers = async (query?: string) => {
    try {
      const results: any = await UserService.getUsers({
        name: query,
      });
      setUsers(results);
    } catch (error) {}
  };

  const handleSubmit = async () => {
    const form: any = stepCollection
      .map(({ formControl }: any) => formControl.values)
      .reduce((acc: any, curr: any) => {
        return deepMerge(acc, curr);
      }, {});

    if (userType === "admin") {
      form.user_details.type = "loan";
    }

    try {
      setLoading(true);

      if (formType === "Update") {
        await LoanService.updateLoan(form, loanDetails.id);
      } else {
        await LoanService.createLoan(form);
      }

      setLoading(false);
      toast.success("loan created successfully");
      handleReset();
      navigate("/admin/loan");
    } catch (error: any) {
      toast.error("Failed to create loan");

      const { non_field_errors, ...errors } = error.response.data;

      if (non_field_errors) {
        setNonFieldErrors(non_field_errors.length > 0 ? non_field_errors : []);
      }
      setFormsErrorStates({
        generalInfoForm: setFormErrors(
          errors,
          generalInfoForm,
          getInitialValues(generalFormFields)
        ),
        familyInfoForm: setFormErrors(
          errors,
          settingsInfoForm,
          getInitialValues(settingsFormFields)
        ),
        otherInfoForm: setFormErrors(
          errors,
          otherInfoForm,
          getInitialValues(otherFormFields)
        ),
      });

      setLoading(false);
    }
  };

  const handleReset = () => {
    generalInfoForm.resetForm();
    settingsInfoForm.resetForm();
    otherInfoForm.resetForm();
  };

  const steps = (forms: any[]): IStep[] => {
    return forms.map(
      ({
        label,
        formControl,
        formFields,
        validations,
        formErrorState,
      }: any) => {
        return {
          label,
          formControl,
          formErrorState: formErrorState,
          component: (
            <Box sx={{ width: "100%" }}>
              <FormFactory
                others={{ sx: { marginBottom: "0rem" } }}
                formikInstance={formControl}
                formFields={formFields}
                validationSchema={validations}
              />
            </Box>
          ),
        };
      }
    );
  };

  const SubmitBtn = () => {
    return (
      <Button
        onClick={handleSubmit}
        size="small"
        variant="contained"
        sx={{ marginLeft: "0.5rem" }}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />{" "}
            <Span style={{ marginLeft: "0.5rem" }} color="primary">
              Loading...
            </Span>
          </>
        ) : (
          formType
        )}
      </Button>
    );
  };

  return (
    <Box pt={2} pb={4}>
      <Card sx={{ padding: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {nonFieldErrors.length > 0 && (
            <Box>
              <AlertMessage
                isOpen={nonFieldErrors.length > 0}
                message={() => (
                  <ul style={{ padding: 0, margin: 0 }}>
                    {nonFieldErrors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
                type="error"
                closeAlert={() => setNonFieldErrors([])}
              />
            </Box>
          )}
          <HorizontalStepper
            steps={steps(stepCollection)}
            submitBtn={<SubmitBtn />}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default LoanForm;
