import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useTitle from "../../../hooks/useTitle";
import { JournalEntryService } from "./JournalEntries.service";
import { IJournalEntry } from "./JournalEntries.interface";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

const JournalEntryDetails = () => {
  useTitle("Journal Entry Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<IJournalEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) fetchEntryDetails(id);
  }, [id]);

  const fetchEntryDetails = async (entryId: string) => {
    try {
      setLoading(true);
      const data = await JournalEntryService.getJournalEntryDetails(entryId);
      setEntry(data);
    } catch (error: any) {
      toast.error("Failed to fetch journal entry details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/admin/accounting/journal-entries");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  if (!entry) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Journal Entry not found
        </Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Journal Entries
        </Button>
      </Box>
    );
  }

  const { related_trade: trade } = entry;

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 3 }}>
        Back to Journal Entries
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Journal Entry #{entry.entry_number}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {entry.entry_type_display} — {formatDateToDDMMYYYY(entry.entry_date)}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* SUMMARY SECTION */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Summary
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Debit Account</Typography>
            <Typography>{entry.debit_account}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Credit Account</Typography>
            <Typography>{entry.credit_account}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Amount</Typography>
            <Typography>UGX {entry.amount.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Reversal Status</Typography>
            <Chip
              label={entry.is_reversed ? "Reversed" : "Active"}
              color={entry.is_reversed ? "error" : "success"}
              size="small"
            />
          </Grid>
        </Grid>

        {/* LINKED TRANSACTIONS */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Linked Transactions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Related Invoice</Typography>
            <Typography>
              {entry.related_invoice || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Related Payment</Typography>
            <Typography>
              {entry.related_payment || "N/A"}
            </Typography>
          </Grid>
          {trade && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography fontWeight="bold" sx={{ mb: 1 }}>
                  Related Trade
                </Typography>
                <Typography>Trade #: {trade.trade_number}</Typography>
                <Typography>Buyer: {trade.buyer_name}</Typography>
                <Typography>Supplier: {trade.supplier_name}</Typography>
                <Typography>
                  Grain: {trade.grain_type_name} ({trade.quality_grade_name})
                </Typography>
                <Typography>
                  Quantity: {trade.quantity_kg.toLocaleString()} kg
                </Typography>
                <Typography>
                  Value: UGX {trade.payable_by_buyer.toLocaleString()}
                </Typography>
                <Typography>Status: {trade.status_display}</Typography>
              </Grid>
            </>
          )}
        </Grid>

        {/* DESCRIPTION AND NOTES */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Description & Notes
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Description:</strong> {entry.description || "N/A"}
        </Typography>
        <Typography>
          <strong>Notes:</strong> {entry.notes || "N/A"}
        </Typography>

        {/* METADATA */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Metadata
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Created By</Typography>
            <Typography>
              {entry.created_by
                ? `${entry.created_by.first_name} ${entry.created_by.last_name}`
                : "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography fontWeight="bold">Created At</Typography>
            <Typography>{formatDateToDDMMYYYY(entry.created_at)}</Typography>
          </Grid>
          {entry.is_reversed && (
            <Grid item xs={12} sm={6}>
              <Typography fontWeight="bold">Reversed By</Typography>
              <Typography>
                {entry.reversed_by?.first_name
                  ? `${entry.reversed_by.first_name} ${entry.reversed_by.last_name}`
                  : "N/A"}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default JournalEntryDetails;
