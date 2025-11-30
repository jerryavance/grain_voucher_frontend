// src/pages/Trade/TradeStatusStepper.tsx - CORRECTED VERSION
import React, { FC } from "react";
import { Stepper, Step, StepLabel, Box, Chip } from "@mui/material";

interface TradeStatusStepperProps {
  currentStatus: string;
}

// ✅ FIXED: Added pending_allocation step
const statusSteps = [
  "draft",
  "pending_approval",
  "approved",
  "pending_allocation",  // ✅ ADDED - this was missing!
  "ready_for_delivery",
  "in_transit",
  "delivered",
  "completed",
];

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  pending_allocation: "Pending Allocation",  // ✅ ADDED
  ready_for_delivery: "Ready for Delivery",
  in_transit: "In Transit",
  delivered: "Delivered",
  completed: "Completed",
};

// ✅ Optional statuses that might be skipped
const optionalStatuses = ["pending_allocation"];

const TradeStatusStepper: FC<TradeStatusStepperProps> = ({ currentStatus }) => {
  // Handle special statuses
  if (currentStatus === "cancelled" || currentStatus === "rejected") {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Chip
          label={currentStatus === "cancelled" ? "Trade Cancelled" : "Trade Rejected"}
          color="error"
          sx={{ fontSize: 16, py: 2, px: 3 }}
        />
      </Box>
    );
  }

  const activeStep = statusSteps.indexOf(currentStatus);

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {statusSteps.map((step) => (
          <Step key={step}>
            <StepLabel
              optional={
                optionalStatuses.includes(step) ? (
                  <Box component="span" sx={{ fontSize: 10, color: "text.secondary" }}>
                    (If required)
                  </Box>
                ) : undefined
              }
            >
              {statusLabels[step]}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default TradeStatusStepper;