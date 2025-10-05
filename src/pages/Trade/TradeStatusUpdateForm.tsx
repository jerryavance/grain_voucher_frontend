// TradeStatusUpdateForm.tsx
import React, { FC, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { toast } from "react-hot-toast";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { TradeService } from "./Trade.service";
import { TradeStatusUpdateValidations } from "./TradeFormValidations";
import { ITrade, ITradeStatusUpdate } from "./Trade.interface";
import { IFormField } from "../../utils/form_factory";
import { STATUS_OPTIONS } from "./TradeFormFields";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface ITradeStatusUpdateFormProps {
  trade: ITrade;
  onClose: () => void;
  onSuccess: () => void;
}

const getAvailableStatuses = (currentStatus: string) => {
  const statusTransitions: Record<string, string[]> = {
    draft: ['pending_approval', 'cancelled'],
    pending_approval: ['approved', 'rejected', 'draft'],
    approved: ['pending_allocation', 'cancelled'],
    pending_allocation: ['allocated', 'approved', 'cancelled'],
    allocated: ['in_transit', 'pending_allocation'],
    in_transit: ['delivered', 'allocated'],
    delivered: ['completed', 'in_transit'],
    completed: [],
    cancelled: [],
    rejected: ['draft'],
  };

  const allowedStatuses = statusTransitions[currentStatus] || [];
  return STATUS_OPTIONS.filter(option => 
    allowedStatuses.includes(String(option.value)) || String(option.value) === currentStatus
  );
};

const TradeStatusUpdateForm: FC<ITradeStatusUpdateFormProps> = ({
  trade,
  onClose,
  onSuccess,
}) => {
  const { setShowModal } = useModalContext();
  const [loading, setLoading] = React.useState(false);

  const availableStatuses = getAvailableStatuses(trade.status);

  const TradeStatusUpdateFormFields: IFormField[] = [
    {
      name: 'status',
      initailValue: trade.status,
      label: 'New Status',
      type: 'select',
      uiType: 'select',
      options: availableStatuses,
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
      required: true,
    },
    {
      name: 'notes',
      initailValue: '',
      label: 'Notes / Reason',
      type: 'text',
      uiType: 'textarea',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },
    {
      name: 'actual_delivery_date',
      initailValue: '',
      label: 'Actual Delivery Date',
      type: 'date',
      uiType: 'date',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'vehicle_number',
      initailValue: trade.vehicle_number || '',
      label: 'Vehicle Number',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    },
    {
      name: 'driver_name',
      initailValue: trade.driver_name || '',
      label: 'Driver Name',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    },
  ];

  const statusForm = useFormik({
    initialValues: getInitialValues(TradeStatusUpdateFormFields),
    validationSchema: TradeStatusUpdateValidations(),
    validateOnChange: false,
    onSubmit: async (values: ITradeStatusUpdate) => {
      setLoading(true);
      try {
        await TradeService.updateTradeStatus(trade.id, values);
        toast.success("Trade status updated successfully");
        
        statusForm.resetForm();
        onSuccess();
      } catch (error: any) {
        if (error.response?.data) {
          statusForm.setErrors(error.response.data);
        }
        toast.error(error.response?.data?.detail || "Failed to update status");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    setShowModal(true);
    
    return () => {
      setShowModal(false);
    };
  }, []);

  const handleClose = () => {
    statusForm.resetForm();
    onClose();
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={() => statusForm.handleSubmit()}
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Updating...</Span>
          </>
        ) : (
          "Update Status"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title={`Update Status for ${trade.trade_number}`}
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="sm"
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          formikInstance={statusForm}
          formFields={TradeStatusUpdateFormFields}
          validationSchema={TradeStatusUpdateValidations()}
        />
      </Box>
    </ModalDialog>
  );
};

export default TradeStatusUpdateForm;


// // TradeStatusUpdateForm.tsx
// import React, { FC } from "react";
// import { Box, Button } from "@mui/material";
// import { useFormik } from "formik";
// import ModalDialog from "../../components/UI/Modal/ModalDialog";
// import ProgressIndicator from "../../components/UI/ProgressIndicator";
// import { Span } from "../../components/Typography";
// import FormFactory from "../../components/UI/FormFactory";
// import { toast } from "react-hot-toast";
// import { getInitialValues } from "../../utils/form_factory";
// import uniqueId from "../../utils/generateId";
// import { TradeService } from "./Trade.service";
// import { TradeStatusUpdateValidations } from "./TradeFormValidations";
// import { ITrade, ITradeStatusUpdate } from "./Trade.interface";
// import { IFormField } from "../../utils/form_factory";
// import { STATUS_OPTIONS } from "./TradeFormFields";

// interface ITradeStatusUpdateFormProps {
//   trade: ITrade;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// const TradeStatusUpdateFormFields: IFormField[] = [
//   {
//     name: 'status',
//     initailValue: '',
//     label: 'New Status',
//     type: 'select',
//     uiType: 'select',
//     options: STATUS_OPTIONS,
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//     required: true,
//   },
//   {
//     name: 'notes',
//     initailValue: '',
//     label: 'Notes',
//     type: 'text',
//     uiType: 'textarea',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//   },
//   {
//     name: 'actual_delivery_date',
//     initailValue: '',
//     label: 'Actual Delivery Date',
//     type: 'date',
//     uiType: 'date',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'vehicle_number',
//     initailValue: '',
//     label: 'Vehicle Number',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 6 },
//   },
//   {
//     name: 'driver_name',
//     initailValue: '',
//     label: 'Driver Name',
//     type: 'text',
//     uiType: 'text',
//     uiBreakpoints: { xs: 12, sm: 12, md: 12 },
//   },
// ];

// const TradeStatusUpdateForm: FC<ITradeStatusUpdateFormProps> = ({
//   trade,
//   onClose,
//   onSuccess,
// }) => {
//   const [loading, setLoading] = React.useState(false);

//   const statusForm = useFormik({
//     initialValues: getInitialValues(TradeStatusUpdateFormFields),
//     validationSchema: TradeStatusUpdateValidations(),
//     validateOnChange: false,
//     onSubmit: async (values: ITradeStatusUpdate) => {
//       setLoading(true);
//       try {
//         await TradeService.updateTradeStatus(trade.id, values);
//         toast.success("Trade status updated successfully");
        
//         statusForm.resetForm();
//         onSuccess();
//       } catch (error: any) {
//         if (error.response?.data) {
//           statusForm.setErrors(error.response.data);
//         }
//         toast.error(error.response?.data?.detail || "Failed to update status");
//       } finally {
//         setLoading(false);
//       }
//     },
//   });

//   const ActionBtns: FC = () => (
//     <>
//       <Button onClick={onClose} disabled={loading}>
//         Cancel
//       </Button>
//       <Button
//         onClick={() => statusForm.handleSubmit()}
//         variant="contained"
//         disabled={loading}
//       >
//         {loading ? (
//           <>
//             <ProgressIndicator color="inherit" size={20} />
//             <Span style={{ marginLeft: "0.5rem" }}>Updating...</Span>
//           </>
//         ) : (
//           "Update Status"
//         )}
//       </Button>
//     </>
//   );

//   return (
//     <ModalDialog
//       title={`Update Status for ${trade.trade_number}`}
//       onClose={onClose}
//       id={uniqueId()}
//       ActionButtons={ActionBtns}
//     >
//       <Box sx={{ width: "100%" }}>
//         <FormFactory
//           formikInstance={statusForm}
//           formFields={TradeStatusUpdateFormFields}
//           validationSchema={TradeStatusUpdateValidations()}
//         />
//       </Box>
//     </ModalDialog>
//   );
// };

// export default TradeStatusUpdateForm;