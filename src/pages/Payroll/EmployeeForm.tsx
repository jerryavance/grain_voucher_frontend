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
import { EmployeeFormFields } from "./EmployeeFormFields";
import { PayrollService } from "./Payroll.service";
import { UserService } from "../Users/User.service";
import { EmployeeFormValidations } from "./EmployeeFormValidations";
import { IEmployeeFormProps } from "./Payroll.interface";

const EmployeeForm: FC<IEmployeeFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<any[]>([]);

  const formFields = EmployeeFormFields();

  const employeeForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: EmployeeFormValidations(),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      const patchedValues = patchInitialValues(formFields)(initialValues || {});
      // For update, set the user_id to the existing user's id
      if (initialValues.user?.id) {
        patchedValues.user_id = initialValues.user.id;
      }
      employeeForm.setValues(patchedValues);
    }
  }, [initialValues, formType, users]);

  const fetchUsers = async () => {
    try {
      const response = await UserService.getUsers({});
      const userOptions = response.results.map((user: any) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name} (${user.email})`,
      }));
      setUsers(userOptions);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await PayrollService.updateEmployee(values, initialValues.id);
        toast.success("Employee updated successfully");
      } else {
        await PayrollService.createEmployee(values);
        toast.success("Employee created successfully");
      }
      
      employeeForm.resetForm();
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      
      if (error.response?.data) {
        employeeForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    employeeForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    employeeForm.handleSubmit();
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
            formType === "Update" ? "Update Employee" : "Create Employee"
          )}
        </Button>
      </>
    );
  };

  // Update form fields with user options
  const updatedFormFields = formFields.map(field => 
    field.name === 'user_id' 
      ? { ...field, options: users }
      : field
  );

  return (
    <ModalDialog
      title={formType === "Save" ? "New Employee" : "Edit Employee"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(employeeForm.values);
        }}
        encType="multipart/form-data"
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={employeeForm}
            formFields={updatedFormFields}
            validationSchema={EmployeeFormValidations()}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default EmployeeForm;