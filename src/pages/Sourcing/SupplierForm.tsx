import { FC, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { SupplierProfileFormFields } from "./SourcingFormFields";
import { SupplierProfileFormValidations } from "./SourcingFormValidations";
import { SourcingService } from "./Sourcing.service";
import { ISupplierFormProps } from "./Sourcing.interface";
import { TOption } from "../../@types/common";

const SupplierForm: FC<ISupplierFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Options state
  const [users, setUsers] = useState<TOption[]>([]);
  const [hubs, setHubs] = useState<TOption[]>([]);
  const [grainTypes, setGrainTypes] = useState<TOption[]>([]);

  // Fetch options on mount
  useEffect(() => {
    fetchUsers();
    fetchHubs();
    fetchGrainTypes();
  }, []);

  const fetchUsers = async (search = '') => {
    try {
      const response = await fetch(`/api/auth/users/?search=${search}&role=farmer`);
      const data = await response.json();
      const options = data.results.map((user: any) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name} (${user.phone_number})`,
      }));
      setUsers(options);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchHubs = async (search = '') => {
    try {
      const response = await fetch(`/api/hubs/hubs/?search=${search}`);
      const data = await response.json();
      const options = data.results.map((hub: any) => ({
        value: hub.id,
        label: hub.name,
      }));
      setHubs(options);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  const fetchGrainTypes = async () => {
    try {
      const response = await fetch('/api/vouchers/grain-types/');
      const data = await response.json();
      const options = data.results.map((grain: any) => ({
        value: grain.id,
        label: grain.name,
      }));
      setGrainTypes(options);
    } catch (error) {
      console.error("Error fetching grain types:", error);
    }
  };

  const formFields = SupplierProfileFormFields(
    users,
    hubs,
    grainTypes,
    (value: string) => fetchUsers(value),
    (value: string) => fetchHubs(value)
  );

  const supplierForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: SupplierProfileFormValidations,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      // Map the initial values to match form field names
      const mappedValues = {
        ...initialValues,
        user_id: initialValues.user?.id,
        hub_id: initialValues.hub?.id,
        typical_grain_type_ids: initialValues.typical_grain_types?.map((gt: any) => gt.id) || [],
      };
      supplierForm.setValues(patchInitialValues(formFields)(mappedValues));
    }
  }, [initialValues, formType]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (formType === "Update") {
        await SourcingService.updateSupplier(initialValues.id, values);
        toast.success("Supplier updated successfully");
      } else {
        await SourcingService.createSupplier(values);
        toast.success("Supplier created successfully");
      }
      
      supplierForm.resetForm();
      callBack && callBack();
      handleClose();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      
      if (error.response?.data) {
        supplierForm.setErrors(error.response.data);
      }
      toast.error(error.message || "An error occurred");
    }
  };

  const handleReset = () => {
    supplierForm.resetForm();
    handleClose();
  };

  const handleButtonClick = () => {
    supplierForm.handleSubmit();
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
            formType === "Update" ? "Update Supplier" : "Create Supplier"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Supplier" : "Edit Supplier"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(supplierForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={supplierForm}
            formFields={formFields}
            validationSchema={SupplierProfileFormValidations}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default SupplierForm;