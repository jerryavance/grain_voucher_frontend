
import React, { FC, useRef, useState, useEffect } from "react";
import { Box, Button, Alert } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeFormFields } from "./InvestorFormFields";
import { InvestorService } from "./Investor.service";
import { TradeValidation } from "./InvestorFormValidations";
import { ITradeFormProps } from "./Investor.interface";
import { TOption } from "../../@types/common";

const TradeForm: FC<ITradeFormProps> = ({
  handleClose,
  formType = "Save",
  initialValues,
  callBack,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [warning, setWarning] = useState<string>("");

  // State for dropdown options
  const [grns, setGrns] = useState<TOption[]>([]);
  const [hubs, setHubs] = useState<TOption[]>([]);
  const [grainTypes, setGrainTypes] = useState<TOption[]>([]);
  const [buyers, setBuyers] = useState<TOption[]>([]);
  const [suppliers, setSuppliers] = useState<TOption[]>([]);

  const formFields = TradeFormFields({
    grns,
    hubs,
    grainTypes,
    buyers,
    suppliers,
    isUpdate: formType === "Update",
  });

  const tradeForm = useFormik({
    initialValues: getInitialValues(formFields),
    validationSchema: TradeValidation,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (values: any) => handleSubmit(values),
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (formType === "Update" && initialValues) {
      tradeForm.setValues(
        patchInitialValues(formFields)(initialValues || {})
      );
    }
  }, [initialValues, formType, grns, hubs, grainTypes, buyers, suppliers]);

  const fetchDropdownData = async () => {
    try {
      const [grnsData, hubsData, grainTypesData, buyersData, suppliersData] = await Promise.all([
        InvestorService.getGRNs(),
        InvestorService.getHubs(),
        InvestorService.getGrainTypes(),
        InvestorService.getBuyers(),
        InvestorService.getSuppliers(),
      ]);

      setGrns(grnsData.map((g: any) => ({ label: g.number, value: g.id })));
      setHubs(hubsData.map((h: any) => ({ label: h.name, value: h.id })));
      setGrainTypes(grainTypesData.map((g: any) => ({ label: g.name, value: g.id })));
      setBuyers(buyersData.map((b: any) => ({ label: b.name, value: b.id })));
      setSuppliers(suppliersData.map((s: any) => ({ label: s.name, value: s.id })));
    } catch (error: any) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load form data");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setWarning("");
    try {
      if (formType === "Update" && initialValues) {
        await InvestorService.updateTrade(values, initialValues.id);
        toast.success("Trade updated successfully");
      } else {
        const response = await InvestorService.createTrade(values);
        if (response.warning) {
          setWarning(response.warning);
          toast("Trade created with pending allocation", {
            icon: "⚠️",
            style: {
              background: "#fff3cd",
              color: "#856404",
            },
          });
        } else {
          toast.success("Trade created successfully");
        }
      }
      tradeForm.resetForm();
      callBack && callBack();
      if (!warning || formType === "Update") {
        handleClose();
      }
    } catch (error: any) {
      if (error.response?.data) {
        tradeForm.setErrors(error.response.data);
      }
      const errorMessage = error.response?.data?.detail || error.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    tradeForm.resetForm();
    setWarning("");
    handleClose();
  };

  const handleButtonClick = () => {
    tradeForm.handleSubmit();
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
            formType === "Update" ? "Update Trade" : "Create Trade"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={formType === "Save" ? "New Trade" : "Edit Trade"}
      onClose={handleReset}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="lg"
    >
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(tradeForm.values);
        }}
      >
        <Box sx={{ width: "100%" }}>
          {warning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {warning}
            </Alert>
          )}
          <FormFactory
            others={{ sx: { marginBottom: "0rem" } }}
            formikInstance={tradeForm}
            formFields={formFields}
            validationSchema={TradeValidation}
          />
        </Box>
      </form>
    </ModalDialog>
  );
};

export default TradeForm;


// import React, { FC, useRef, useState, useEffect } from "react";
// import { Box, Button } from "@mui/material";
// import { useFormik } from "formik";
// import ModalDialog from "../../components/UI/Modal/ModalDialog";
// import ProgressIndicator from "../../components/UI/ProgressIndicator";
// import { Span } from "../../components/Typography";
// import FormFactory from "../../components/UI/FormFactory";
// import { toast } from "react-hot-toast";
// import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
// import uniqueId from "../../utils/generateId";
// import { TradeFormFields } from "./InvestorFormFields";
// import { InvestorService } from "./Investor.service";
// import { TradeValidation } from "./InvestorFormValidations";
// import { ITradeFormProps } from "./Investor.interface";

// const TradeForm: FC<ITradeFormProps> = ({
//   handleClose,
//   formType = "Save",
//   initialValues,
//   callBack,
// }) => {
//   const formRef = useRef<HTMLFormElement | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   const formFields = TradeFormFields();

//   const tradeForm = useFormik({
//     initialValues: getInitialValues(formFields),
//     validationSchema: TradeValidation,
//     validateOnChange: false,
//     validateOnMount: false,
//     validateOnBlur: false,
//     enableReinitialize: true,
//     onSubmit: (values: any) => handleSubmit(values),
//   });

//   useEffect(() => {
//     if (formType === "Update" && initialValues) {
//       tradeForm.setValues(
//         patchInitialValues(formFields)(initialValues || {})
//       );
//     }
//   }, [initialValues, formType]);

//   const handleSubmit = async (values: any) => {
//     setLoading(true);
//     try {
//       if (formType === "Update" && initialValues) {
//         await InvestorService.updateTrade(values, initialValues.id);
//         toast.success("Trade updated successfully");
//       } else {
//         await InvestorService.createTrade(values);
//         toast.success("Trade created successfully");
//       }
//       tradeForm.resetForm();
//       callBack && callBack();
//       handleClose();
//     } catch (error: any) {
//       if (error.response?.data) {
//         tradeForm.setErrors(error.response.data);
//       }
//       toast.error(error.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     tradeForm.resetForm();
//     handleClose();
//   };

//   const handleButtonClick = () => {
//     tradeForm.handleSubmit();
//   };

//   const ActionBtns: FC = () => {
//     return (
//       <>
//         <Button onClick={handleReset} disabled={loading}>
//           Close
//         </Button>
//         <Button 
//           onClick={handleButtonClick} 
//           type="button"
//           variant="contained"
//           disabled={loading}
//         >
//           {loading ? (
//             <>
//               <ProgressIndicator color="inherit" size={20} />{" "}
//               <Span style={{ marginLeft: "0.5rem" }} color="primary">
//                 Loading...
//               </Span>
//             </>
//           ) : (
//             formType === "Update" ? "Update Trade" : "Create Trade"
//           )}
//         </Button>
//       </>
//     );
//   };

//   return (
//     <ModalDialog
//       title={formType === "Save" ? "New Trade" : "Edit Trade"}
//       onClose={handleReset}
//       id={uniqueId()}
//       ActionButtons={ActionBtns}
//       maxWidth="md"
//     >
//       <form
//         ref={formRef}
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSubmit(tradeForm.values);
//         }}
//       >
//         <Box sx={{ width: "100%" }}>
//           <FormFactory
//             others={{ sx: { marginBottom: "0rem" } }}
//             formikInstance={tradeForm}
//             formFields={formFields}
//             validationSchema={TradeValidation}
//           />
//         </Box>
//       </form>
//     </ModalDialog>
//   );
// };

// export default TradeForm;