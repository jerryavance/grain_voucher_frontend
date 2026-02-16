// SupplierPaymentPreferences.tsx - UPDATED VERSION

import { Box, Button, Card, CardContent, Typography, Grid, Chip, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import MobileMoneyIcon from "@mui/icons-material/PhoneAndroid";
import BankIcon from "@mui/icons-material/AccountBalance";
import CashIcon from "@mui/icons-material/Money";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { SourcingService } from "./Sourcing.service";
import { IPaymentPreference } from "./Sourcing.interface";
import { PaymentPreferenceForm } from "./PaymentPreferenceForm";
import ProgressIndicator from "../../components/UI/ProgressIndicator";

const SupplierPaymentPreferences = () => {
  useTitle("Payment Methods");
  const { setShowModal } = useModalContext();

  const [preferences, setPreferences] = useState<IPaymentPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [editPreference, setEditPreference] = useState<IPaymentPreference | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: Backend automatically filters by authenticated supplier
      // No need to pass supplier=me - it causes UUID error
      const response = await SourcingService.getMyPaymentPreferences();
      setPreferences(response.results || []);
    } catch (error: any) {
      toast.error("Failed to load payment methods");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setEditPreference(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditPreference(null);
  };

  const handleEditPreference = (preference: IPaymentPreference) => {
    setFormType("Update");
    setEditPreference(preference);
    setTimeout(() => {
      setShowModal(true);
    }, 100);
  };

  const handleDeletePreference = async (preference: IPaymentPreference) => {
    if (!window.confirm(`Are you sure you want to delete this payment method?`)) {
      return;
    }

    try {
      await SourcingService.deletePaymentPreference(preference.id);
      toast.success("Payment method deleted successfully");
      fetchPreferences();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to delete payment method");
    }
  };

  const handleSetDefault = async (preference: IPaymentPreference) => {
    if (preference.is_default) {
      toast("This is already your default payment method", { icon: "ℹ️" });
      return;
    }

    try {
      await SourcingService.updatePaymentPreference(preference.id, { is_default: true });
      toast.success("Default payment method updated");
      fetchPreferences();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to update default method");
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mobile_money":
        return <MobileMoneyIcon sx={{ fontSize: 40 }} />;
      case "bank_transfer":
        return <BankIcon sx={{ fontSize: 40 }} />;
      case "cash":
        return <CashIcon sx={{ fontSize: 40 }} />;
      default:
        return <MobileMoneyIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "mobile_money":
        return "primary.main";
      case "bank_transfer":
        return "success.main";
      case "cash":
        return "warning.main";
      default:
        return "primary.main";
    }
  };

  if (loading && preferences.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Payment Methods</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
          Add Payment Method
        </Button>
      </Box>

      {preferences.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No payment methods configured
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add a payment method to receive payments for your grain deliveries
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
                Add Your First Payment Method
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {preferences.map((preference) => (
            <Grid item xs={12} sm={6} md={4} key={preference.id}>
              <Card
                sx={{
                  position: "relative",
                  border: preference.is_default ? 2 : 1,
                  borderColor: preference.is_default ? "primary.main" : "divider",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  {/* Header with Icon and Status */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${getMethodColor(preference.method)}15`,
                        borderRadius: 2,
                        p: 1,
                        color: getMethodColor(preference.method),
                      }}
                    >
                      {getMethodIcon(preference.method)}
                    </Box>
                    <Box>
                      {preference.is_default && (
                        <Chip
                          label="Default"
                          size="small"
                          color="primary"
                          icon={<StarIcon />}
                          sx={{ mb: 0.5 }}
                        />
                      )}
                      {!preference.is_active && (
                        <Chip label="Inactive" size="small" color="error" />
                      )}
                    </Box>
                  </Box>

                  {/* Method Name */}
                  <Typography variant="h6" gutterBottom>
                    {preference.method_display}
                  </Typography>

                  {/* Account Details */}
                  {preference.details.account_number && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {preference.method === "mobile_money"
                          ? "Phone Number"
                          : "Account Number"}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {preference.details.account_number}
                      </Typography>
                    </Box>
                  )}

                  {preference.details.account_name && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Account Name
                      </Typography>
                      <Typography variant="body1">{preference.details.account_name}</Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pt: 2,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditPreference(preference)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePreference(preference)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {!preference.is_default && preference.is_active && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<StarBorderIcon />}
                        onClick={() => handleSetDefault(preference)}
                      >
                        Set Default
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <PaymentPreferenceForm
        callBack={fetchPreferences}
        formType={formType}
        handleClose={handleCloseModal}
        initialValues={editPreference}
      />
    </Box>
  );
};

export default SupplierPaymentPreferences;