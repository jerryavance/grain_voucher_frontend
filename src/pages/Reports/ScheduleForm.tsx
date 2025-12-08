// src/pages/Reports/components/ScheduleForm.tsx
import React, { FC, useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { ReportsService } from "./Reports.service";
import { IScheduleFormProps } from "./Reports.interface";
import { ScheduleFormFields } from "./ScheduleFormFields";

const ScheduleForm: FC<IScheduleFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const formFields = ScheduleFormFields();

  const scheduleForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required("Schedule name is required")
        .min(3, "Name must be at least 3 characters"),
      report_type: Yup.string().required("Report type is required"),
      format: Yup.string().required("Format is required"),
      frequency: Yup.string().required("Frequency is required"),
      time_of_day: Yup.string().required("Time is required"),
      day_of_week: Yup.number().when('frequency', {
        is: 'weekly',
        then: (schema) => schema.required('Day of week is required for weekly schedules'),
      }),
      day_of_month: Yup.number().when('frequency', {
        is: 'monthly',
        then: (schema) => schema
          .required('Day of month is required for monthly schedules')
          .min(1, 'Day must be between 1 and 31')
          .max(31, 'Day must be between 1 and 31'),
      }),
      recipient_ids: Yup.array().min(1, "At least one recipient is required"),
    }),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      const patchedValues = patchInitialValues(formFields)(initialValues || {});
      // Extract recipient IDs
      if (initialValues.recipients) {
        patchedValues.recipient_ids = initialValues.recipients.map((r: any) => r.id);
      }
      scheduleForm.setValues(patchedValues);
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await ReportsService.updateReportSchedule(initialValues.id, values);
        toast.success("Schedule updated successfully");
      } else {
        await ReportsService.createReportSchedule(values);
        toast.success("Schedule created successfully");
      }
      
      scheduleForm.resetForm();
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        scheduleForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    scheduleForm.resetForm();
    handleClose();
  };

  const ActionBtns: FC = () => {
    return (
      <>
        <Button onClick={handleReset} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={() => scheduleForm.handleSubmit()} 
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Saving...
              </Span>
            </>
          ) : (
            formType === "Update" ? "Update Schedule" : "Create Schedule"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Report Schedule" : "Edit Report Schedule"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <form onSubmit={scheduleForm.handleSubmit}>
        <Box sx={{ width: "100%", py: 2 }}>
          <FormFactory
            formikInstance={scheduleForm}
            formFields={formFields}
            validationSchema={Yup.object()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default ScheduleForm;