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

interface ISupplierFormProps {
  handleClose: () => void;
  formType?: "Save" | "Update";
  initialValues?: any;
  callBack?: () => void;
  formData: {
    users: { value: string; label: string }[];
    hubs: { value: string; label: string }[];
    grainTypes: { value: string; label: string }[];
  };
  formDataLoading: boolean;
  searchHandlers: {
    handleUserSearch: (query: string) => void;
    handleHubSearch: (query: string) => void;
  };
}

const SupplierForm: FC<ISupplierFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
  formData,
  formDataLoading,
  searchHandlers,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formFields = SupplierProfileFormFields(
    formData.users,
    formData.hubs,
    formData.grainTypes,
    searchHandlers.handleUserSearch,
    searchHandlers.handleHubSearch
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
    if (formType === "Update" && initialValues && !formDataLoading) {
      const mappedValues = {
        ...initialValues,
        user_id: initialValues.user?.id,
        hub_id: initialValues.hub?.id,
        typical_grain_type_ids: initialValues.typical_grain_types?.map((gt: any) => gt.id) || [],
      };
      supplierForm.setValues(patchInitialValues(formFields)(mappedValues));
    }
  }, [initialValues, formType, formDataLoading]);

  const handleSubmit = async (values: any) => {
    // SelectInput2 submits a single string; backend expects an array
    const payload = {
      ...values,
      typical_grain_type_ids: values.typical_grain_type_ids
        ? [].concat(values.typical_grain_type_ids).filter(Boolean)
        : [],
    };
    setLoading(true);
    try {
      if (formType === "Update") {
        await SourcingService.updateSupplier(initialValues.id, payload);
        toast.success("Supplier updated successfully");
      } else {
        await SourcingService.createSupplier(payload);
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
        <Button onClick={handleReset} disabled={loading || formDataLoading}>
          Close
        </Button>
        <Button 
          onClick={handleButtonClick} 
          type="button"
          variant="contained"
          disabled={loading || formDataLoading}
        >
          {loading || formDataLoading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                {formDataLoading ? "Loading..." : "Saving..."}
              </Span>
            </>
          ) : (
            formType === "Update" ? "Update Supplier" : "Create Supplier"
          )}
        </Button>
      </>
    );
  };

  if (formDataLoading) {
    return (
      <ModalDialog
        title={formType === "Save" ? "New Supplier" : "Edit Supplier"}
        onClose={handleReset}
        id={uniqueId()}
        ActionButtons={ActionBtns}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <ProgressIndicator />
          <Span sx={{ ml: 2 }}>Loading form data...</Span>
        </Box>
      </ModalDialog>
    );
  }

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










// import { FC, useEffect, useRef, useState } from "react";
// import { Box, Button } from "@mui/material";
// import { useFormik } from "formik";
// import { toast } from "react-hot-toast";
// import ModalDialog from "../../components/UI/Modal/ModalDialog";
// import ProgressIndicator from "../../components/UI/ProgressIndicator";
// import { Span } from "../../components/Typography";
// import FormFactory from "../../components/UI/FormFactory";
// import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
// import uniqueId from "../../utils/generateId";
// import { SupplierProfileFormFields } from "./SourcingFormFields";
// import { SupplierProfileFormValidations } from "./SourcingFormValidations";
// import { SourcingService } from "./Sourcing.service";

// interface ISupplierFormProps {
//   handleClose: () => void;
//   formType?: "Save" | "Update";
//   initialValues?: any;
//   callBack?: () => void;
//   formData: {
//     users: { value: string; label: string }[];
//     hubs: { value: string; label: string }[];
//     grainTypes: { value: string; label: string }[];
//   };
//   formDataLoading: boolean;
//   searchHandlers: {
//     handleUserSearch: (query: string) => void;
//     handleHubSearch: (query: string) => void;
//   };
// }

// const SupplierForm: FC<ISupplierFormProps> = ({
//   handleClose,
//   formType = "Save",
//   initialValues,
//   callBack,
//   formData,
//   formDataLoading,
//   searchHandlers,
// }) => {
//   const formRef = useRef<HTMLFormElement | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   const formFields = SupplierProfileFormFields(
//     formData.users,
//     formData.hubs,
//     formData.grainTypes,
//     searchHandlers.handleUserSearch,
//     searchHandlers.handleHubSearch
//   );

//   const supplierForm = useFormik({
//     initialValues: getInitialValues(formFields),
//     validationSchema: SupplierProfileFormValidations,
//     validateOnChange: false,
//     validateOnMount: false,
//     validateOnBlur: false,
//     enableReinitialize: true,
//     onSubmit: (values: any) => handleSubmit(values),
//   });

//   useEffect(() => {
//     if (formType === "Update" && initialValues && !formDataLoading) {
//       const mappedValues = {
//         ...initialValues,
//         user_id: initialValues.user?.id,
//         hub_id: initialValues.hub?.id,
//         typical_grain_type_ids: initialValues.typical_grain_types?.map((gt: any) => gt.id) || [],
//       };
//       supplierForm.setValues(patchInitialValues(formFields)(mappedValues));
//     }
//   }, [initialValues, formType, formDataLoading]);

//   const handleSubmit = async (values: any) => {
//     setLoading(true);
//     try {
//       if (formType === "Update") {
//         await SourcingService.updateSupplier(initialValues.id, values);
//         toast.success("Supplier updated successfully");
//       } else {
//         await SourcingService.createSupplier(values);
//         toast.success("Supplier created successfully");
//       }
      
//       supplierForm.resetForm();
//       callBack && callBack();
//       handleClose();
//       setLoading(false);
//     } catch (error: any) {
//       setLoading(false);
      
//       if (error.response?.data) {
//         supplierForm.setErrors(error.response.data);
//       }
//       toast.error(error.message || "An error occurred");
//     }
//   };

//   const handleReset = () => {
//     supplierForm.resetForm();
//     handleClose();
//   };

//   const handleButtonClick = () => {
//     supplierForm.handleSubmit();
//   };

//   const ActionBtns: FC = () => {
//     return (
//       <>
//         <Button onClick={handleReset} disabled={loading || formDataLoading}>
//           Close
//         </Button>
//         <Button 
//           onClick={handleButtonClick} 
//           type="button"
//           variant="contained"
//           disabled={loading || formDataLoading}
//         >
//           {loading || formDataLoading ? (
//             <>
//               <ProgressIndicator color="inherit" size={20} />{" "}
//               <Span style={{ marginLeft: "0.5rem" }} color="primary">
//                 {formDataLoading ? "Loading..." : "Saving..."}
//               </Span>
//             </>
//           ) : (
//             formType === "Update" ? "Update Supplier" : "Create Supplier"
//           )}
//         </Button>
//       </>
//     );
//   };

//   if (formDataLoading) {
//     return (
//       <ModalDialog
//         title={formType === "Save" ? "New Supplier" : "Edit Supplier"}
//         onClose={handleReset}
//         id={uniqueId()}
//         ActionButtons={ActionBtns}
//       >
//         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
//           <ProgressIndicator />
//           <Span sx={{ ml: 2 }}>Loading form data...</Span>
//         </Box>
//       </ModalDialog>
//     );
//   }

//   return (
//     <ModalDialog
//       title={formType === "Save" ? "New Supplier" : "Edit Supplier"}
//       onClose={handleReset}
//       id={uniqueId()}
//       ActionButtons={ActionBtns}
//     >
//       <form
//         ref={formRef}
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSubmit(supplierForm.values);
//         }}
//       >
//         <Box sx={{ width: "100%" }}>
//           <FormFactory
//             others={{ sx: { marginBottom: "0rem" } }}
//             formikInstance={supplierForm}
//             formFields={formFields}
//             validationSchema={SupplierProfileFormValidations}
//           />
//         </Box>
//       </form>
//     </ModalDialog>
//   );
// };

// export default SupplierForm;