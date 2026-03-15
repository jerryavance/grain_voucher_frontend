/**
 * SourceOrderColumnShape.tsx — FIXED
 *
 * FIXES:
 *   - Hub column: reads from hub_detail.name instead of hub_name (which doesn't exist in serializer)
 *   - Grain Type column: reads from grain_type_detail.name instead of grain_type_name
 *   - Created By column: reads from created_by_detail instead of created_by_name
 *   - Supplier column: reads from supplier_detail for phone fallback
 */

import { FC } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import { ISourceOrderList } from "./Sourcing.interface";
import { formatCurrency, formatWeight, ORDER_STATUS_COLORS } from "./SourcingConstants";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const OrderDetailsLink: FC<{ id: string; orderNumber: string }> = ({
  id,
  orderNumber,
}) => {
  const navigate = useNavigate();
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => navigate(`/admin/sourcing/orders/${id}`)}
    >
      {orderNumber}
    </Typography>
  );
};

const SourceOrderColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Order Number",
    accessor: "order_number",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const { id, order_number } = row.original;
      return <OrderDetailsLink id={id} orderNumber={order_number} />;
    }
  },
  {
    Header: "Supplier",
    accessor: "supplier_name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      // ✅ FIX: use supplier_detail for nested data, fall back to flat fields
      const d = row.original;
      const name = d.supplier_name || d.supplier_detail?.business_name || "—";
      const phone = d.supplier_detail?.user?.phone_number || "";
      return (
        <Box>
          <Span sx={{ fontSize: 14, fontWeight: 600 }}>{name}</Span>
          {phone && (
            <Span sx={{ fontSize: 12, display: 'block', color: 'text.primary' }}>
              {phone}
            </Span>
          )}
        </Box>
      );
    }
  },
  {
    // ✅ FIX: Hub was showing UUID — now reads from hub_detail.name
    Header: "Hub",
    accessor: "hub",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const d = row.original;
      const hubName = d.hub_detail?.name || d.hub_name || "—";
      return <Span sx={{ fontSize: 14 }}>{hubName}</Span>;
    }
  },
  {
    // ✅ FIX: Grain Type was showing UUID — now reads from grain_type_detail.name
    Header: "Grain Type",
    accessor: "grain_type",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const d = row.original;
      const grainName = d.grain_type_detail?.name || d.grain_type_name || "—";
      return (
        <Chip
          label={grainName}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
  },
  {
    Header: "Quantity",
    accessor: "quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return <Span sx={{ fontSize: 14, fontWeight: 600 }}>
        {formatWeight(row.original.quantity_kg)}
      </Span>;
    }
  },
  {
    Header: "Price/kg",
    accessor: "offered_price_per_kg",
    minWidth: 100,
    Cell: ({ row }: any) => {
      return <Span sx={{ fontSize: 14 }}>
        {formatCurrency(row.original.offered_price_per_kg)}
      </Span>;
    }
  },
  {
    Header: "Total Cost",
    accessor: "total_cost",
    minWidth: 130,
    Cell: ({ row }: any) => {
      return <Span sx={{ fontSize: 14, fontWeight: 600, color: 'success.main' }}>
        {formatCurrency(row.original.total_cost)}
      </Span>;
    }
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { status, status_display } = row.original;
      return (
        <Chip
          label={status_display || status?.replace(/_/g, " ").toUpperCase()}
          color={ORDER_STATUS_COLORS[status] || "default"}
          size="small"
        />
      );
    }
  },
  {
    Header: "Expected Delivery",
    accessor: "expected_delivery_date",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const date = row.original.expected_delivery_date;
      return (
        <Span sx={{ fontSize: 13 }}>
          {date ? formatDateToDDMMYYYY(date) : "Not set"}
        </Span>
      );
    }
  },
  {
    // ✅ FIX: Created By was showing "undefined undefined" — now reads from created_by_detail
    Header: "Created By",
    accessor: "created_by",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const d = row.original;
      const detail = d.created_by_detail;
      const name = detail
        ? `${detail.first_name || ""} ${detail.last_name || ""}`.trim()
        : d.created_by_name || "—";
      return <Span sx={{ fontSize: 13 }}>{name || "—"}</Span>;
    }
  },
  {
    Header: "Created At",
    accessor: "created_at",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 13 }}>
          {formatDateToDDMMYYYY(row.original.created_at)}
        </Span>
      );
    }
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    }
  },
];

export default SourceOrderColumnShape;