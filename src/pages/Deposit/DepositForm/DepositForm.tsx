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
} from "./DepositFormFields";
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
import {
  GeneralFormValidations,
  SettingsFormValidations,
  OtherFormValidations,
} from "./Validations";
import { setFormErrors } from "../../../utils/form_validations";
import { AlertMessage } from "../../../components/UI/AlertMessage";
import { UserService } from "../../Users/User.service";
import { DepositService } from "../Deposit.service";
import { HubService } from "../../Hub/Hub.service";
import { GrainTypeService } from "../../GrainType/GrainType.service";
import { QualityGradeService } from "../../QualityGrade/QualityGrade.service";


interface Option {
  value: string;
  label: string;
}

const DepositForm: FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { formTitle, formType = "Save", DepositDetails } = state as {
    formType: string;
    formTitle: string;
    DepositDetails?: any;
  };

  useTitle(formTitle);

  const [loading, setLoading] = useState(false);
  const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);
  const [farmers, setFarmers] = useState<Option[]>([]);
  // const [hubs, setHubs] = useState<Option[]>([]);
  // const [agents, setAgents] = useState<Option[]>([]);
  const [grainTypes, setGrainTypes] = useState<Option[]>([]);
  const [qualityGrades, setQualityGrades] = useState<Option[]>([]);
  const [farmerQuery, setFarmerQuery] = useState("");
  const [hubQuery, setHubQuery] = useState("");
  const [agentQuery, setAgentQuery] = useState("");
  const [grainTypeQuery, setGrainTypeQuery] = useState("");
  const [qualityGradeQuery, setQualityGradeQuery] = useState("");

  // Search handlers
  const handleFarmerSearch = async (query: string) => {
    setFarmerQuery(query);
    try {
      const response = await UserService.getUsers({ name: query, user_type: "farmer" });
      setFarmers(
        response.results.map((farmer: any) => ({
          value: farmer.id,
          label: `${farmer.first_name} ${farmer.last_name}`.trim() || farmer.phone_number,
        }))
      );
    } catch (error) {
      console.error("Error fetching farmers:", error);
      toast.error("Failed to fetch farmers");
    }
  };

  // const handleHubSearch = async (query: string) => {
  //   setHubQuery(query);
  //   try {
  //     const response = await HubService.getHubs({ name: query });
  //     setHubs(
  //       response.results.map((hub: any) => ({
  //         value: hub.id,
  //         label: hub.name,
  //       }))
  //     );
  //   } catch (error) {
  //     console.error("Error fetching hubs:", error);
  //     toast.error("Failed to fetch hubs");
  //   }
  // };

  // const handleAgentSearch = async (query: string) => {
  //   setAgentQuery(query);
  //   try {
  //     const response = await UserService.getUsers({ name: query, role: "agent" });
  //     setAgents(
  //       response.results.map((agent: any) => ({
  //         value: agent.id,
  //         label: `${agent.first_name} ${agent.last_name}`.trim() || agent.phone_number,
  //       }))
  //     );
  //   } catch (error) {
  //     console.error("Error fetching agents:", error);
  //     toast.error("Failed to fetch agents");
  //   }
  // };

  const handleGrainTypeSearch = async (query: string) => {
    setGrainTypeQuery(query);
    try {
      const response = await GrainTypeService.getGrainTypes({ name: query });
      setGrainTypes(
        response.results.map((grain: any) => ({
          value: grain.id,
          label: grain.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching grain types:", error);
      toast.error("Failed to fetch grain types");
    }
  };

  const handleQualityGradeSearch = async (query: string) => {
    setQualityGradeQuery(query);
    try {
      const response = await QualityGradeService.getQualityGrades({ name: query });
      setQualityGrades(
        response.results.map((grade: any) => ({
          value: grade.id,
          label: grade.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching quality grades:", error);
      toast.error("Failed to fetch quality grades");
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          handleFarmerSearch(""),
          // handleHubSearch(""),
          // handleAgentSearch(""),
          handleGrainTypeSearch(""),
          handleQualityGradeSearch(""),
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load dropdown options");
      }
    };
    fetchInitialData();
  }, []);

  // Formik instances
  const generalInfoForm = useFormik({
    initialValues:
      formType === "Update"
        // ? patchInitialValues(GeneralFormFields(farmers, hubs, agents, handleFarmerSearch, handleHubSearch, handleAgentSearch))(DepositDetails)
        // : getInitialValues(GeneralFormFields(farmers, hubs, agents, handleFarmerSearch, handleHubSearch, handleAgentSearch)),
        ? patchInitialValues(GeneralFormFields(farmers, handleFarmerSearch))(DepositDetails)
        : getInitialValues(GeneralFormFields(farmers,handleFarmerSearch)),
    validationSchema: GeneralFormValidations,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: () => {},
  });

  const settingsInfoForm = useFormik({
    initialValues:
      formType === "Update"
        ? patchInitialValues(SettingsFormFields(grainTypes, qualityGrades, handleGrainTypeSearch, handleQualityGradeSearch))(DepositDetails)
        : getInitialValues(SettingsFormFields(grainTypes, qualityGrades, handleGrainTypeSearch, handleQualityGradeSearch)),
    validationSchema: SettingsFormValidations,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: () => {},
  });

  const otherInfoForm = useFormik({
    initialValues:
      formType === "Update"
        ? patchInitialValues(OtherFormFields())(DepositDetails)
        : getInitialValues(OtherFormFields()),
    validationSchema: OtherFormValidations,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: () => {},
  });

  // Form error states
  const [formsErrorStates, setFormsErrorStates] = useState({
    generalInfoForm: true,
    settingsInfoForm: true,
    otherInfoForm: true,
  });

  // Step configuration
  const steps: IStep[] = [
    {
      label: "General Information",
      formControl: generalInfoForm,
      formErrorState: formsErrorStates.generalInfoForm,
      component: (
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={generalInfoForm}
            // formFields={GeneralFormFields(farmers, hubs, agents, handleFarmerSearch, handleHubSearch, handleAgentSearch)}
            formFields={GeneralFormFields(farmers, handleFarmerSearch)}
            validationSchema={GeneralFormValidations}
            others={{ sx: { marginBottom: "0rem" } }}
          />
        </Box>
      ),
    },
    {
      label: "Deposit Settings",
      formControl: settingsInfoForm,
      formErrorState: formsErrorStates.settingsInfoForm,
      component: (
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={settingsInfoForm}
            formFields={SettingsFormFields(grainTypes, qualityGrades, handleGrainTypeSearch, handleQualityGradeSearch)}
            validationSchema={SettingsFormValidations}
            others={{ sx: { marginBottom: "0rem" } }}
          />
        </Box>
      ),
    },
    {
      label: "Other Information",
      formControl: otherInfoForm,
      formErrorState: formsErrorStates.otherInfoForm,
      component: (
        <Box sx={{ width: "100%" }}>
          <FormFactory
            formikInstance={otherInfoForm}
            formFields={OtherFormFields()}
            validationSchema={OtherFormValidations}
            others={{ sx: { marginBottom: "0rem" } }}
          />
        </Box>
      ),
    },
  ];

  // Handle form submission
  const handleSubmit = async () => {
    const form = deepMerge(
      generalInfoForm.values,
      settingsInfoForm.values,
      // otherInfoForm.values,
    );

    try {
      setLoading(true);
      if (formType === "Update") {
        await DepositService.updateDeposit(form, DepositDetails.id);
        toast.success("Deposit updated successfully");
      } else {
        await DepositService.createDeposit(form);
        toast.success("Deposit created successfully");
      }
      navigate("/admin/deposits");
    } catch (error: any) {
      toast.error(`Failed to ${formType.toLowerCase()} deposit`);
      const { non_field_errors, ...errors } = error.response?.data || {};
      setNonFieldErrors(non_field_errors || []);
      setFormsErrorStates({
        generalInfoForm: setFormErrors(
          errors,
          generalInfoForm,
          // getInitialValues(GeneralFormFields(farmers, hubs, agents, handleFarmerSearch, handleHubSearch, handleAgentSearch))
          getInitialValues(GeneralFormFields(farmers, handleFarmerSearch))
        ),
        settingsInfoForm: setFormErrors(
          errors,
          settingsInfoForm,
          getInitialValues(SettingsFormFields(grainTypes, qualityGrades, handleGrainTypeSearch, handleQualityGradeSearch))
        ),
        otherInfoForm: setFormErrors(
          errors,
          otherInfoForm,
          getInitialValues(OtherFormFields())
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit button component
  const SubmitBtn = () => (
    <Button
      onClick={handleSubmit}
      size="small"
      variant="contained"
      sx={{ marginLeft: "0.5rem" }}
      disabled={loading}
    >
      {loading ? (
        <>
          <ProgressIndicator color="inherit" size={20} />
          <Span sx={{ marginLeft: "0.5rem" }}>Loading...</Span>
        </>
      ) : (
        formType
      )}
    </Button>
  );

  return (
    <Box pt={2} pb={4}>
      <Card sx={{ padding: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {nonFieldErrors.length > 0 && (
            <AlertMessage
              isOpen={nonFieldErrors.length > 0}
              message={() => (
                <ul style={{ padding: 0, margin: 0 }}>
                  {nonFieldErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
              type="error"
              closeAlert={() => setNonFieldErrors([])}
            />
          )}
          <HorizontalStepper steps={steps} submitBtn={<SubmitBtn />} />
        </Box>
      </Card>
    </Box>
  );
};

export default DepositForm;