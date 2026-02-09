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
      const { supplier_name, supplier_phone } = row.original;
      return (
        <Box>
          <Span sx={{ fontSize: 14, fontWeight: 600 }}>{supplier_name}</Span>
          <Span sx={{ fontSize: 12, display: 'block', color: 'text.secondary' }}>
            {supplier_phone}
          </Span>
        </Box>
      );
    }
  },
  {
    Header: "Hub",
    accessor: "hub_name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return <Span sx={{ fontSize: 14 }}>{row.original.hub_name}</Span>;
    }
  },
  {
    Header: "Grain Type",
    accessor: "grain_type_name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Chip 
          label={row.original.grain_type_name} 
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
          label={status_display}
          color={ORDER_STATUS_COLORS[status]}
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
    Header: "Created By",
    accessor: "created_by_name",
    minWidth: 130,
    Cell: ({ row }: any) => {
      return <Span sx={{ fontSize: 13 }}>{row.original.created_by_name}</Span>;
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