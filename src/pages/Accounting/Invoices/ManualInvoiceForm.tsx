import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Typography,
  Divider,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import ModalDialog from "../../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import { Span } from "../../../components/Typography";
import { InvoiceService } from "./Invoices.service";
import { CRMService } from "../../CRM/CRM.service";
import { IManualInvoiceFormProps, IUninvoicedGRN } from "./Invoices.interface";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import uniqueId from "../../../utils/generateId";

const ManualInvoiceForm: FC<IManualInvoiceFormProps> = ({ handleClose, callBack }) => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [uninvoicedGRNs, setUninvoicedGRNs] = useState<IUninvoicedGRN[]>([]);
  const [selectedGRNs, setSelectedGRNs] = useState<IUninvoicedGRN[]>([]);
  const [formData, setFormData] = useState({
    payment_terms: "",
    notes: "",
    beneficiary_bank: "",
    beneficiary_name: "",
    beneficiary_account: "",
    beneficiary_branch: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchUninvoicedGRNs(selectedAccount.id);
    } else {
      setUninvoicedGRNs([]);
      setSelectedGRNs([]);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const resp = await CRMService.getAccounts({});
      setAccounts(resp.results || []);
    } catch (error) {
      toast.error("Failed to fetch accounts");
    }
  };

  const fetchUninvoicedGRNs = async (accountId: string) => {
    try {
      setLoading(true);
      const resp = await InvoiceService.getUninvoicedGRNs(accountId);
      setUninvoicedGRNs(resp.grns || []);
    } catch (error) {
      toast.error("Failed to fetch uninvoiced GRNs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGRN = (grn: IUninvoicedGRN) => {
    if (!selectedGRNs.find((g) => g.id === grn.id)) {
      setSelectedGRNs([...selectedGRNs, grn]);
    }
  };

  const handleRemoveGRN = (grnId: string) => {
    setSelectedGRNs(selectedGRNs.filter((g) => g.id !== grnId));
  };

  const calculateTotal = () => {
    return selectedGRNs.reduce((sum, grn) => {
      return sum + grn.net_weight_kg * grn.trade.selling_price;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedAccount) {
      toast.error("Please select an account");
      return;
    }

    if (selectedGRNs.length === 0) {
      toast.error("Please select at least one GRN");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        account_id: selectedAccount.id,
        grn_ids: selectedGRNs.map((g) => g.id),
        ...formData,
      };

      await InvoiceService.createManualInvoice(payload);
      toast.success("Invoice created successfully");
      callBack && callBack();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const ActionBtns: FC = () => (
    <>
      <Button onClick={handleClose} disabled={loading}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} variant="contained" disabled={loading}>
        {loading ? (
          <>
            <ProgressIndicator color="inherit" size={20} />
            <Span style={{ marginLeft: "0.5rem" }}>Creating...</Span>
          </>
        ) : (
          "Create Invoice"
        )}
      </Button>
    </>
  );

  return (
    <ModalDialog
      title="Create Manual Invoice"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="lg"
    >
      <Box sx={{ minWidth: 800 }}>
        {/* Account Selection */}
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={accounts}
            getOptionLabel={(option) => option.name || ""}
            value={selectedAccount}
            onChange={(_, newValue) => setSelectedAccount(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Account *" placeholder="Search accounts..." />
            )}
          />
        </Box>

        {selectedAccount && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Available GRNs */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Available GRNs ({uninvoicedGRNs.length})
              </Typography>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <ProgressIndicator size={30} />
                </Box>
              ) : uninvoicedGRNs.length === 0 ? (
                <Typography color="text.secondary">No uninvoiced GRNs available for this account</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>GRN Number</TableCell>
                        <TableCell>Trade</TableCell>
                        <TableCell>Grain Type</TableCell>
                        <TableCell>Delivery Date</TableCell>
                        <TableCell align="right">Weight (kg)</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {uninvoicedGRNs.map((grn) => (
                        <TableRow key={grn.id}>
                          <TableCell>{grn.grn_number}</TableCell>
                          <TableCell>{grn.trade.trade_number}</TableCell>
                          <TableCell>{grn.trade.grain_type?.name || "-"}</TableCell>
                          <TableCell>{formatDateToDDMMYYYY(grn.delivery_date)}</TableCell>
                          <TableCell align="right">{grn.net_weight_kg.toFixed(2)}</TableCell>
                          <TableCell align="right">{grn.trade.selling_price.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            {(grn.net_weight_kg * grn.trade.selling_price).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAddGRN(grn)}
                              disabled={selectedGRNs.some((g) => g.id === grn.id)}
                            >
                              {selectedGRNs.some((g) => g.id === grn.id) ? "Added" : "Add"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            {/* Selected GRNs */}
            {selectedGRNs.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Selected GRNs ({selectedGRNs.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          <TableCell>GRN Number</TableCell>
                          <TableCell>Trade</TableCell>
                          <TableCell align="right">Weight (kg)</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="center">Remove</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedGRNs.map((grn) => (
                          <TableRow key={grn.id}>
                            <TableCell>{grn.grn_number}</TableCell>
                            <TableCell>{grn.trade.trade_number}</TableCell>
                            <TableCell align="right">{grn.net_weight_kg.toFixed(2)}</TableCell>
                            <TableCell align="right">{grn.trade.selling_price.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              {(grn.net_weight_kg * grn.trade.selling_price).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton size="small" color="error" onClick={() => handleRemoveGRN(grn.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>
                            Subtotal:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            UGX {calculateTotal().toFixed(2)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Invoice Details */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Invoice Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Payment Terms"
                        value={formData.payment_terms}
                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Beneficiary Bank"
                        value={formData.beneficiary_bank}
                        onChange={(e) => setFormData({ ...formData, beneficiary_bank: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Beneficiary Name"
                        value={formData.beneficiary_name}
                        onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Beneficiary Account"
                        value={formData.beneficiary_account}
                        onChange={(e) => setFormData({ ...formData, beneficiary_account: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Beneficiary Branch"
                        value={formData.beneficiary_branch}
                        onChange={(e) => setFormData({ ...formData, beneficiary_branch: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </ModalDialog>
  );
};

export default ManualInvoiceForm;