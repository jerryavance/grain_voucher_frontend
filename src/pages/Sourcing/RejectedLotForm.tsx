/**
 * SourcingForms.tsx — PARTIAL FIX (RejectedLotForm only)
 *
 * FIX: RejectedLotForm no longer requires manual original_investor_allocation.
 * The backend serializer now auto-detects it from the sale_lot's investor_allocation.
 * The form only asks for: sale_lot, quantity, reason, details, date, costs.
 *
 * This file should REPLACE the RejectedLotForm export in SourcingForms.tsx.
 * All other form exports remain unchanged.
 */

import { FC, useEffect, useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { getInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { RejectedLotFormFields } from "./SourcingFormFields";
import { SourcingService } from "./Sourcing.service";
import { formatWeight } from "./SourcingConstants";

interface DropdownOption {
  value: string;
  label: string;
}

// ============================================================
// FIXED: REJECTED LOT FORM
// No longer requires original_investor_allocation - backend auto-detects it
// ============================================================

interface IRejectedLotFormProps {
  open: boolean;
  saleLotId?: string;
  handleClose: () => void;
  callBack?: () => void;
}

export const RejectedLotForm: FC<IRejectedLotFormProps> = ({
  open, saleLotId, handleClose, callBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [saleLots, setSaleLots] = useState<DropdownOption[]>([]);
  const [lotsLoading, setLotsLoading] = useState(true);
  const [selectedLotInfo, setSelectedLotInfo] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    setLotsLoading(true);
    SourcingService.getSaleLots({ page_size: 100 })
      .then(r => {
        const lots = r.results || [];
        setSaleLots(lots.map((l: any) => ({
          value: l.id,
          label: `${l.lot_number} — ${l.grain_type_name} — ${formatWeight(l.available_quantity_kg)} avail`,
        })));
        // If pre-selected lot, find its info
        if (saleLotId) {
          const found = lots.find((l: any) => l.id === saleLotId);
          if (found) setSelectedLotInfo(found);
        }
      })
      .catch(() => toast.error("Failed to load sale lots"))
      .finally(() => setLotsLoading(false));
  }, [open, saleLotId]);

  const formFields = RejectedLotFormFields(saleLots);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      ...getInitialValues(formFields),
      ...(saleLotId ? { sale_lot: saleLotId } : {}),
    },
    validationSchema: Yup.object({
      sale_lot: Yup.string().required("Sale lot required"),
      rejected_quantity_kg: Yup.number().positive("Must be positive").required("Quantity required"),
      rejection_reason: Yup.string().required("Reason required"),
      rejection_details: Yup.string().required("Details required"),
      rejection_date: Yup.string().required("Date required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // ✅ FIX: Don't send original_investor_allocation — backend auto-detects it
        const payload: any = { ...values };
        // Remove empty/null allocation field — let backend handle it
        if (!payload.original_investor_allocation) {
          delete payload.original_investor_allocation;
        }
        
        await SourcingService.createRejectedLot(payload);
        toast.success("Rejection recorded successfully");
        form.resetForm();
        callBack?.();
        handleClose();
      } catch (e: any) {
        const errData = e?.response?.data;
        const msg = errData?.non_field_errors?.[0]
          || errData?.rejected_quantity_kg?.[0]
          || errData?.original_investor_allocation?.[0]
          || errData?.detail
          || "Failed to record rejection";
        toast.error(msg);
      } finally { setLoading(false); }
    },
  });

  // Update lot info when selection changes
  useEffect(() => {
    if (!form.values.sale_lot || lotsLoading) return;
    SourcingService.getSaleLotDetails(form.values.sale_lot as string)
      .then(setSelectedLotInfo)
      .catch(() => setSelectedLotInfo(null));
  }, [form.values.sale_lot, lotsLoading]);

  if (!open) return null;

  return (
    <ModalDialog
      title="Record Lot Rejection"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={() => (
        <>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => form.handleSubmit()}
            disabled={loading || lotsLoading}
          >
            {loading ? <ProgressIndicator color="inherit" size={20} /> : "Record Rejection"}
          </Button>
        </>
      )}
    >
      {lotsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <ProgressIndicator /><Span sx={{ ml: 2 }}>Loading lots...</Span>
        </Box>
      ) : (
        <Box>
          {selectedLotInfo && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>{selectedLotInfo.lot_number}</strong> — {selectedLotInfo.grain_type_name}
              {" | "}Available: <strong>{formatWeight(selectedLotInfo.available_quantity_kg)}</strong>
              {selectedLotInfo.investor_name && ` | Investor: ${selectedLotInfo.investor_name}`}
            </Alert>
          )}
          <FormFactory
            formikInstance={form}
            formFields={formFields}
            validationSchema={Yup.object({
              sale_lot: Yup.string().required("Sale lot required"),
              rejected_quantity_kg: Yup.number().positive("Must be positive").required("Quantity required"),
              rejection_reason: Yup.string().required("Reason required"),
              rejection_details: Yup.string().required("Details required"),
              rejection_date: Yup.string().required("Date required"),
            })}
          />
        </Box>
      )}
    </ModalDialog>
  );
};