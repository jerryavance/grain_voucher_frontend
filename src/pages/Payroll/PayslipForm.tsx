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
import { PayslipFormFields } from "./PayslipFormFields";
import { PayrollService } from "./Payroll.service";
import { UserService } from "../Users/User.service";
import { PayslipFormValidations } from "./PayslipFormValidations";
import { IPayslipFormProps } from "./Payroll.interface";

const PayslipForm: FC<IPayslipFormProps> = ({
    handleClose,
    formType = "Save",
    initialValues,
    callBack,
  }) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [employees, setEmployees] = useState<any[]>([]);
  
    const formFields = PayslipFormFields();
  
    const payslipForm = useFormik({
      initialValues: getInitialValues(formFields),
      validationSchema: PayslipFormValidations(),
      validateOnChange: false,
      validateOnMount: false,
      validateOnBlur: false,
      enableReinitialize: true,
      onSubmit: (values: any) => handleSubmit(values),
    });
  
    useEffect(() => {
      fetchEmployees();
    }, []);
  
    useEffect(() => {
      if (formType === "Update" && initialValues) {
        const patchedValues = patchInitialValues(formFields)(initialValues || {});
        // For update, set the employee_id to the existing employee's id
        if (initialValues.employee?.id) {
          patchedValues.employee_id = initialValues.employee.id;
        }
        payslipForm.setValues(patchedValues);
      }
    }, [initialValues, formType, employees]);
  
    const fetchEmployees = async () => {
      try {
        const response = await PayrollService.getEmployees({});
        const employeeOptions = response.results.map((employee: any) => ({
          value: employee.id,
          label: `${employee.user.first_name} ${employee.user.last_name} - ${employee.user.role}`,
        }));
        setEmployees(employeeOptions);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to load employees");
      }
    };
  
    const handleSubmit = async (values: any) => {
      setLoading(true);
      try {
        if (formType === "Update") {
          await PayrollService.updatePayslip(values, initialValues.id);
          toast.success("Payslip updated successfully");
        } else {
          await PayrollService.createPayslip(values);
          toast.success("Payslip created successfully");
        }
        
        payslipForm.resetForm();
        callBack && callBack();
        handleClose();
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        
        if (error.response?.data) {
          payslipForm.setErrors(error.response.data);
        }
        toast.error(error.message || "An error occurred");
      }
    };
  
    const handleReset = () => {
      payslipForm.resetForm();
      handleClose();
    };
  
    const handleButtonClick = () => {
      payslipForm.handleSubmit();
    };
  
    const ActionBtnsPayslip: FC = () => {
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
              formType === "Update" ? "Update Payslip" : "Create Payslip"
            )}
          </Button>
        </>
      );
    };
  
    // Update form fields with employee options
    const updatedFormFields = formFields.map(field => 
      field.name === 'employee_id' 
        ? { ...field, options: employees }
        : field
    );
  
    return (
      <ModalDialog
        title={formType === "Save" ? "New Payslip" : "Edit Payslip"}
        onClose={handleReset}
        id={uniqueId()}
        ActionButtons={ActionBtnsPayslip}
      >
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(payslipForm.values);
          }}
          encType="multipart/form-data"
        >
          <Box sx={{ width: "100%" }}>
            <FormFactory
              others={{ sx: { marginBottom: "0rem" } }}
              formikInstance={payslipForm}
              formFields={updatedFormFields}
              validationSchema={PayslipFormValidations()}
            />
          </Box>
        </form>
      </ModalDialog>
    );
  };
  
  export default PayslipForm;