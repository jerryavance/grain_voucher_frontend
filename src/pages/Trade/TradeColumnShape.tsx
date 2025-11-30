import { FC } from "react";
import { Typography, Chip, Box, LinearProgress, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import { ITradeListItem } from "./Trade.interface";
import {
  formatCurrency,
  formatNumber,
  getTradeStatusColor,
  getPaymentStatusColor,
} from "./tradeWorkflowHelper";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const TradeDetailsLink: FC<{ id: string; tradeNumber: string }> = ({
  id,
  tradeNumber,
}) => {
  const navigate = useNavigate();
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => navigate(`/admin/trade/${id}`)}
    >
      {tradeNumber}
    </Typography>
  );
};

const TradeColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Trade #",
    accessor: "trade_number",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { id, trade_number } = row.original;
      return <TradeDetailsLink id={id} tradeNumber={trade_number} />;
    },
  },
  {
    Header: "Buyer",
    accessor: "buyer_name",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const { buyer_name } = row.original;
      return <Span sx={{ fontSize: 14, fontWeight: 500 }}>{buyer_name}</Span>;
    },
  },
  {
    Header: "Supplier",
    accessor: "supplier_name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { supplier_name } = row.original;
      return <Span sx={{ fontSize: 13 }}>{supplier_name}</Span>;
    },
  },
  {
    Header: "Grain Type",
    accessor: "grain_type_name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { grain_type_name, quality_grade_name } = row.original;
      return (
        <Box>
          <Span sx={{ fontSize: 13, fontWeight: 500 }}>{grain_type_name}</Span>
          <br />
          <Span sx={{ fontSize: 11, color: "text.secondary" }}>
            {quality_grade_name}
          </Span>
        </Box>
      );
    },
  },
  {
    Header: "Quantity",
    accessor: "quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { quantity_kg, net_tonnage } = row.original;
      return (
        <Box>
          <Span sx={{ fontSize: 13, fontWeight: 500 }}>
            {formatNumber(quantity_kg, 0)} kg
          </Span>
          <br />
          <Span sx={{ fontSize: 11, color: "text.secondary" }}>
            {formatNumber(net_tonnage, 2)} MT
          </Span>
        </Box>
      );
    },
  },
  {
    Header: "Price (Buy/Sell)",
    accessor: "buying_price",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { buying_price, selling_price } = row.original;
      return (
        <Box>
          <Span sx={{ fontSize: 12, color: "error.main" }}>
            Buy: {formatCurrency(buying_price)}/kg
          </Span>
          <br />
          <Span sx={{ fontSize: 12, color: "success.main" }}>
            Sell: {formatCurrency(selling_price)}/kg
          </Span>
        </Box>
      );
    },
  },
  // ✅ NEW: Delivery Progress Column
  {
    Header: "Delivery Progress",
    accessor: "delivery_completion_percentage",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const { delivery_completion_percentage, grn_count, status } = row.original;

      // Only show for trades in delivery phase
      if (!["ready_for_delivery", "in_transit", "delivered", "completed"].includes(status)) {
        return <Span sx={{ fontSize: 12, color: "text.secondary" }}>-</Span>;
      }

      const percentage = delivery_completion_percentage || 0;
      const batches = grn_count || 0;

      return (
        <Box sx={{ width: "100%" }}>
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <LocalShippingIcon sx={{ fontSize: 14, color: "primary.main" }} />
            <Span sx={{ fontSize: 11, fontWeight: 600, color: "primary.main" }}>
              {percentage.toFixed(0)}%
            </Span>
            {batches > 0 && (
              <Span sx={{ fontSize: 10, color: "text.secondary" }}>
                ({batches} {batches === 1 ? "batch" : "batches"})
              </Span>
            )}
          </Box>
          <Tooltip title={`${percentage.toFixed(1)}% delivered`}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 6,
                borderRadius: 1,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 1,
                  backgroundColor:
                    percentage >= 100 ? "success.main" : "primary.main",
                },
              }}
            />
          </Tooltip>
        </Box>
      );
    },
  },
  {
    Header: "Revenue",
    accessor: "payable_by_buyer",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const { payable_by_buyer } = row.original;
      return (
        <Span sx={{ fontSize: 13, fontWeight: 600, color: "success.main" }}>
          {formatCurrency(payable_by_buyer)}
        </Span>
      );
    },
  },
  {
    Header: "Margin / ROI",
    accessor: "margin",
    minWidth: 140,
    Cell: ({ row }: any) => {
      const { margin, roi_percentage } = row.original;
      return (
        <Box>
          <Span sx={{ fontSize: 13, fontWeight: 500, color: "primary.main" }}>
            {formatCurrency(margin)}
          </Span>
          <br />
          <Chip
            label={`ROI: ${formatNumber(roi_percentage, 1)}%`}
            size="small"
            color={
              roi_percentage > 10
                ? "success"
                : roi_percentage > 5
                ? "warning"
                : "default"
            }
            sx={{ height: 20, fontSize: 10 }}
          />
        </Box>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 140,
    Cell: ({ row }: any) => {
      const { status_display, status } = row.original;
      return (
        <Chip
          label={status_display}
          size="small"
          color={getTradeStatusColor(status)}
          sx={{ fontWeight: 500 }}
        />
      );
    },
  },
  // ✅ ENHANCED: Payment Status with Invoice Count
  {
    Header: "Payment",
    accessor: "payment_status_display",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { payment_status_display, amount_due, grn_count } = row.original;

      return (
        <Box>
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <Chip
              label={payment_status_display || "Pending"}
              size="small"
              color={getPaymentStatusColor(payment_status_display?.toLowerCase())}
              sx={{ fontWeight: 500 }}
            />
          </Box>
          {grn_count > 0 && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <ReceiptIcon sx={{ fontSize: 12, color: "text.secondary" }} />
              <Span sx={{ fontSize: 10, color: "text.secondary" }}>
                {grn_count} {grn_count === 1 ? "invoice" : "invoices"}
              </Span>
            </Box>
          )}
          {amount_due > 0 && (
            <Span
              sx={{
                fontSize: 10,
                color: "error.main",
                display: "block",
                mt: 0.5,
              }}
            >
              Due: {formatCurrency(amount_due)}
            </Span>
          )}
        </Box>
      );
    },
  },
  {
    Header: "Hub",
    accessor: "hub_name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { hub_name } = row.original;
      return <Span sx={{ fontSize: 12 }}>{hub_name}</Span>;
    },
  },
  {
    Header: "Created By",
    accessor: "initiated_by_name",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const { initiated_by_name } = row.original;
      return <Span sx={{ fontSize: 12 }}>{initiated_by_name}</Span>;
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return (
        <DropdownActionBtn key={row.id} actions={actions} metaData={data} />
      );
    },
  },
];

export default TradeColumnShape;