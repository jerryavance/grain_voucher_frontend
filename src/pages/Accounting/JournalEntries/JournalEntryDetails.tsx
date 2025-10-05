
import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
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
    if (id) {
      fetchEntryDetails(id);
    }
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

  const handleBack = () => {
    navigate("/accounting/journal-entries");
  };

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

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Journal Entries
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Journal Entry #{entry.entry_number}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Entry Type</Typography>
            <Typography>{entry.entry_type_display}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Date</Typography>
            <Typography>{formatDateToDDMMYYYY(entry.date)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Debit Account</Typography>
            <Typography>{entry.debit_account}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Credit Account</Typography>
            <Typography>{entry.credit_account}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Amount</Typography>
            <Typography>${entry.amount.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Related Trade</Typography>
            <Typography>{entry.related_trade?.trade_number || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Related Invoice</Typography>
            <Typography>{entry.related_invoice?.invoice_number || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Related Payment</Typography>
            <Typography>{entry.related_payment?.payment_number || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Reversed</Typography>
            <Typography>{entry.is_reversed ? "Yes" : "No"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Reversed By</Typography>
            <Typography>{entry.reversed_by?.username || "N/A"}</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
          <Typography>{entry.description}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Notes</Typography>
          <Typography>{entry.notes || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Created By</Typography>
          <Typography>{entry.created_by?.username || "N/A"}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Created At</Typography>
          <Typography>{formatDateToDDMMYYYY(entry.created_at)}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default JournalEntryDetails;