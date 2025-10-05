// GRNForm.tsx
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
import { GRNValidations } from "./TradeFormValidations";
import { ITrade } from "./Trade.interface";
import { IFormField } from "../../utils/form_factory";
import { useModalContext } from "../../contexts/ModalDialogContext";

interface IGRNFormProps {
  trade: ITrade;
  onClose: () => void;
  onSuccess: () => void;
}

const GRNFormFields: IFormField[] = [
  {
    name: 'point_of_loading',
    initailValue: '',
    label: 'Point of Loading',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'loading_date',
    initailValue: '',
    label: 'Loading Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'delivery_date',
    initailValue: '',
    label: 'Delivery Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'delivered_to_name',
    initailValue: '',
    label: 'Delivered To (Name)',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'delivered_to_address',
    initailValue: '',
    label: 'Delivery Address',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
    required: true,
  },
  {
    name: 'delivered_to_contact',
    initailValue: '',
    label: 'Delivery Contact',
    type: 'tel',
    uiType: 'phone',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'vehicle_number',
    initailValue: '',
    label: 'Vehicle Number',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'driver_name',
    initailValue: '',
    label: 'Driver Name',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'driver_id_number',
    initailValue: '',
    label: 'Driver ID Number',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'driver_phone',
    initailValue: '',
    label: 'Driver Phone',
    type: 'tel',
    uiType: 'phone',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'quantity_bags',
    initailValue: '',
    label: 'Number of Bags',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
  },
  {
    name: 'gross_weight_kg',
    initailValue: '',
    label: 'Gross Weight (kg)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    required: true,
  },
  {
    name: 'tare_weight_kg',
    initailValue: '',
    label: 'Tare Weight (kg)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
  },
  {
    name: 'net_weight_kg',
    initailValue: '',
    label: 'Net Weight (kg)',
    type: 'number',
    uiType: 'number',
    uiBreakpoints: { xs: 12, sm: 12, md: 4 },
    required: true,
  },
  {
    name: 'warehouse_manager_name',
    initailValue: '',
    label: 'Warehouse Manager Name',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'warehouse_manager_date',
    initailValue: '',
    label: 'Manager Sign Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'received_by_name',
    initailValue: '',
    label: 'Received By (Name)',
    type: 'text',
    uiType: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'received_by_date',
    initailValue: '',
    label: 'Received Date',
    type: 'date',
    uiType: 'date',
    uiBreakpoints: { xs: 12, sm: 12, md: 6 },
    required: true,
  },
  {
    name: 'remarks',
    initailValue: '',
    label: 'Remarks',
    type: 'text',
    uiType: 'textarea',
    uiBreakpoints: { xs: 12, sm: 12, md: 12 },
  },
];

const GRNForm: FC<IGRNFormProps> = ({ trade, onClose, onSuccess }) => {
  const { showModal } = useModalContext();
  const [loading, setLoading] = React.useState(false);

  const grnForm = useFormik({
    initialValues: getInitialValues(GRNFormFields),
    validationSchema: GRNValidations(),
    validateOnChange: false,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          trade: trade.id,
        };
        
        await TradeService.createGRN(payload);
        toast.success("GRN created successfully");
        
        grnForm.resetForm();
        onSuccess();
      } catch (error: any) {
        if (error.response?.data) {
          grnForm.setErrors(error.response.data);
        }
        toast.error(error.message || "Failed to create GRN");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // Pre-fill form with trade data
    if (trade) {
      grnForm.setValues({
        ...grnForm.values,
        point_of_loading: trade.hub?.name || '',
        delivered_to_name: trade.buyer?.name || '',
        delivered_to_address: trade.delivery_location || '',
        vehicle_number: trade.vehicle_number || '',
        driver_name: trade.driver_name || '',
        driver_phone: trade.driver_phone || '',
        driver_id_number: trade.driver_id || '',
        quantity_bags: trade.quantity_bags || '',
        gross_weight_kg: trade.gross_weight_kg || '',
        tare_weight_kg: trade.tare_weight_kg || '',
        net_weight_kg: trade.net_weight_kg || trade.quantity_kg || '',
      });
    }
  }, [trade]);

  const ActionBtns: FC = () => (
    <>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={() => grnForm.handleSubmit()}
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Creating...</Span>
          </>
        ) : (
          "Create GRN"
        )}
      </Button>
    </>
  );

  if (!showModal) return null;

  return (
    <ModalDialog
      title="Create Goods Received Note"
      onClose={onClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <Box sx={{ width: "100%" }}>
        <FormFactory
          formikInstance={grnForm}
          formFields={GRNFormFields}
          validationSchema={GRNValidations()}
        />
      </Box>
    </ModalDialog>
  );
};

export default GRNForm;