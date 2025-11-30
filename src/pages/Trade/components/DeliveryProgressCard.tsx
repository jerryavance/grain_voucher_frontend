// src/pages/Trade/components/DeliveryProgressCard.tsx
import React, { FC } from "react";
import {
  Card,
  CardContent,
  LinearProgress,
  Typography,
  Button,
  Grid,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import { formatNumber } from "../tradeWorkflowHelper";

interface DeliverySummary {
  total_ordered_kg: number;
  total_delivered_kg: number;
  remaining_kg: number;
  completion_percentage: number;
  is_fully_delivered: boolean;
  delivery_count: number;
  can_create_more_deliveries: boolean;
}

interface DeliveryProgressCardProps {
  deliverySummary?: DeliverySummary;
  onCreateDelivery: () => void;
}

const DeliveryProgressCard: FC<DeliveryProgressCardProps> = ({
  deliverySummary,
  onCreateDelivery,
}) => {
  if (!deliverySummary) return null;

  const {
    total_ordered_kg,
    total_delivered_kg,
    remaining_kg,
    completion_percentage,
    is_fully_delivered,
    delivery_count,
    can_create_more_deliveries,
  } = deliverySummary;

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        border: 1,
        borderColor: is_fully_delivered ? "success.main" : "primary.main",
        bgcolor: is_fully_delivered ? "success.50" : "primary.50",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ShippingIcon color={is_fully_delivered ? "success" : "primary"} />
            <Typography variant="h6" fontWeight={700}>
              Delivery Progress
            </Typography>
          </Box>
          {is_fully_delivered && (
            <Chip
              icon={<CheckIcon />}
              label="Fully Delivered"
              color="success"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              {formatNumber(total_delivered_kg, 0)} / {formatNumber(total_ordered_kg, 0)} kg
              delivered
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {completion_percentage.toFixed(1)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completion_percentage}
            sx={{
              height: 12,
              borderRadius: 2,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 2,
                background: is_fully_delivered
                  ? "linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)"
                  : "linear-gradient(90deg, #2196F3 0%, #42A5F5 100%)",
              },
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Total Ordered
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatNumber(total_ordered_kg, 0)} kg
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Delivered
            </Typography>
            <Typography variant="h6" fontWeight={600} color="success.main">
              {formatNumber(total_delivered_kg, 0)} kg
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Remaining
            </Typography>
            <Typography variant="h6" fontWeight={600} color="error.main">
              {formatNumber(remaining_kg, 0)} kg
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Delivery Batches
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {delivery_count}
            </Typography>
          </Grid>
        </Grid>

        {can_create_more_deliveries && !is_fully_delivered && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateDelivery}
            sx={{ mt: 3 }}
            size="large"
          >
            Create New Delivery Batch
          </Button>
        )}

        {is_fully_delivered && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "success.100",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="success.dark" fontWeight={600}>
              ✓ All deliveries completed successfully!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryProgressCard;