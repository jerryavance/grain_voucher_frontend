import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import useTitle from "../../hooks/useTitle";
import Invoices from "./Invoices/Invoices";
import Payments from "./Payments/Payments";
import JournalEntries from "./JournalEntries/JournalEntries";
import Budgets from "./Budgets/Budgets";

const Accounting = () => {
  useTitle("Accounting");
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box pt={2} pb={4}>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="Accounting Tabs" centered>
        <Tab label="Invoices" />
        <Tab label="Payments" />
        <Tab label="Journal Entries" />
        <Tab label="Budgets" />
      </Tabs>
      {tabValue === 0 && <Invoices />}
      {tabValue === 1 && <Payments />}
      {tabValue === 2 && <JournalEntries />}
      {tabValue === 3 && <Budgets />}
    </Box>
  );
};

export default Accounting;