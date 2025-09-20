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
} from "./InvestmentFormFields";
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
import {  INVESTMENT_TYPES, INTEREST_TYPES, DURATION_UNITS, REPAYMENT_FREQUENCIES, RISK_LEVELS, COLLATERAL_TYPES, ELIGIBLE_INVESTOR_TYPES, VISIBILITY_OPTIONS, BORROWER_TYPES } from "../../../constants/investment-options";
import {
  SettingsFormValidations,
  GeneralFormValidations,
  OtherFormValidations,
} from "./Validations";
import { setFormErrors } from "../../../utils/form_validations";
import { AlertMessage } from "../../../components/UI/AlertMessage";
import { IHubResults } from "../../Hub/Hub.interface";
import { HubService } from "../../Hub/Hub.service";
import { InvestmentService } from "../InvestmentsList/Investment.service";
import { CURRENCY_CODES } from "../../../constants/currency-codes";

const InvestmentForm: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    formTitle,
    formType = "Save",
    userType,
    investmentDetails,
  } = location.state as {
    formType: string;
    formTitle: string;
    userType: string;
    investmentDetails?: any;
  };

  useTitle(formTitle);

  const [loading, setLoading] = useState<boolean>(false);
  const [hubs, setHubs] = useState<IHubResults>();
  const [hubQuery, setHubQuery] = useState("");
  const [formsErrorStates, setFormsErrorStates] = useState<any>({
    generalInfoForm: true,
    settingsInfoForm: true,
    otherInfoForm: true,
  });

  const handleHubSearch = async (query: string) => {
    setHubQuery(query);
    try {
      const response = await HubService.getHubs(query);
      setHubs(response);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };


  const [nonFieldErrors, setNonFieldErrors] = useState<any[]>([]);

  const generalFormFields = GeneralFormFields(
    INVESTMENT_TYPES,
    INTEREST_TYPES,
    DURATION_UNITS,
    REPAYMENT_FREQUENCIES,
    hubs?.results?.map((hub) => ({
      value: hub.id,
      label: hub.name,
    })) || [],
    handleHubSearch

  );

  const generalInfoForm = useFormik({
    initialValues:
      formType === "Update"
        ? patchInitialValues(generalFormFields)(investmentDetails)
        : getInitialValues(generalFormFields),
    validateOnMount: false,
    validateOnChange: true,
    validationSchema: GeneralFormValidations,
    onSubmit: (values) => {},
  });

  const settingsFormFields = SettingsFormFields(
    RISK_LEVELS,
    COLLATERAL_TYPES,
    CURRENCY_CODES,
    ELIGIBLE_INVESTOR_TYPES,
    VISIBILITY_OPTIONS
  );
  const settingsInfoForm = useFormik({
    validateOnMount: true,
    validateOnChange: true,
    initialValues:
      formType === "Update"
        ? patchInitialValues(settingsFormFields)(investmentDetails)
        : getInitialValues(settingsFormFields),
    validationSchema: SettingsFormValidations,
    onSubmit: (values) => {},
  });

  const otherFormFields = OtherFormFields(
    BORROWER_TYPES,
  );
  const otherInfoForm = useFormik({
    validateOnMount: true,
    validateOnChange: true,
    initialValues:
      formType === "Update"
        ? patchInitialValues(otherFormFields)(investmentDetails)
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
      label: "Investment Settings",
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
    fetchHubs(hubQuery);
  }, [hubQuery]);

  const fetchHubs = async (query?: string) => {
    try {
      const results: any = await HubService.getHubs({
        name: query,
      });
      setHubs(results);
    } catch (error) {}
  };

  const handleSubmit = async () => {
    const form: any = stepCollection
      .map(({ formControl }: any) => formControl.values)
      .reduce((acc: any, curr: any) => {
        return deepMerge(acc, curr);
      }, {});

    if (userType === "hub") {
      form.user_details.type = "investment";
    }

    try {
      setLoading(true);

      if (formType === "Update") {
        await InvestmentService.updateInvestment(form, investmentDetails.id);
      } else {
        await InvestmentService.createInvestment(form);
      }

      setLoading(false);
      toast.success("investment created successfully");
      handleReset();
      navigate("/admin/investment");
    } catch (error: any) {
      toast.error("Failed to create investment");

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

export default InvestmentForm;
