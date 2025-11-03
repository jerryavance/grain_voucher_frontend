// TradeColumnShape.tsx
import { FC } from "react";
import { Typography, Chip, Box } from "@mui/material";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const TradeDetailsLink: FC<{ 
  tradeNumber: string;
  onClick: () => void;
}> = ({ tradeNumber, onClick }) => {
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={onClick}
    >
      {tradeNumber}
    </Typography>
  );
};

const getStatusColor = (status: string) => {
  const statusColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    draft: "default",
    pending_approval: "warning",
    approved: "info",
    pending_allocation: "warning",
    allocated: "primary",
    in_transit: "info",
    delivered: "success",
    completed: "success",
    cancelled: "error",
    rejected: "error",
  };
  return statusColors[status] || "default";
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TradeColumnShape = (actions: IDropdownAction[], onTradeClick: (trade: any) => void) => [
  {
    Header: "Trade Number",
    accessor: "trade_number",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { trade_number } = row.original;
      return (
        <TradeDetailsLink 
          tradeNumber={trade_number}
          onClick={() => onTradeClick(row.original)}
        />
      );
    },
  },
  {
    Header: "Buyer",
    accessor: "buyer_name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const buyer_name = row.original.buyer_name || row.original.buyer?.name;
      return <Span sx={{ fontSize: 13 }}>{buyer_name || "N/A"}</Span>;
    },
  },
  {
    Header: "Grain Type",
    accessor: "grain_type_name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const grain_type_name = row.original.grain_type_name || row.original.grain_type?.name;
      return <Span sx={{ fontSize: 13 }}>{grain_type_name || "N/A"}</Span>;
    },
  },
  {
    Header: "Quality",
    accessor: "quality_grade_name",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const quality_grade_name = row.original.quality_grade_name || row.original.quality_grade?.name;
      return <Span sx={{ fontSize: 13 }}>{quality_grade_name || "N/A"}</Span>;
    },
  },
  {
    Header: "Quantity",
    accessor: "quantity_mt",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { quantity_mt, quantity_kg } = row.original;
      return (
        <Box>
          <Span sx={{ fontSize: 13, fontWeight: 600 }}>
            {Number(quantity_kg || 0).toFixed(2)} Kg
          </Span>
          <Span sx={{ fontSize: 11, display: "block", color: "text.primary" }}>
            ({Number(quantity_mt || 0).toFixed(0)} MT)
          </Span>
        </Box>
      );
    },
  },
  {
    Header: "Buying Price",
    accessor: "buying_price",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { buying_price } = row.original;
      return (
        <Span sx={{ fontSize: 13 }}>
          {formatCurrency(buying_price || 0)}
        </Span>
      );
    },
  },
  {
    Header: "Selling Price",
    accessor: "selling_price",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { selling_price } = row.original;
      return (
        <Span sx={{ fontSize: 13 }}>
          {formatCurrency(selling_price || 0)}
        </Span>
      );
    },
  },
  {
    Header: "Revenue",
    accessor: "payable_by_buyer",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { payable_by_buyer } = row.original;
      return (
        <Span sx={{ fontSize: 13, fontWeight: 600 }}>
          {formatCurrency(payable_by_buyer || 0)}
        </Span>
      );
    },
  },
  {
    Header: "Margin",
    accessor: "margin",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { margin, roi_percentage } = row.original;
      const isPositive = margin >= 0;
      return (
        <Box>
          <Span 
            sx={{ 
              fontSize: 13, 
              fontWeight: 600,
              color: isPositive ? "success.main" : "error.main" 
            }}
          >
            {formatCurrency(margin || 0)}
          </Span>
          <Span sx={{ fontSize: 11, display: "block", color: "text.primary" }}>
            ROI: {Number(roi_percentage || 0).toFixed(2)}%
          </Span>
        </Box>
      );
    },
  },
  {
    Header: "Hub",
    accessor: "hub_name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const hub_name = row.original.hub_name || row.original.hub?.name;
      return <Span sx={{ fontSize: 13 }}>{hub_name || "N/A"}</Span>;
    },
  },
  {
    Header: "Status",
    accessor: "status_display",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const { status, status_display, allocation_complete } = row.original;
      return (
        <Box>
          <Chip
            label={status_display || status}
            color={getStatusColor(status)}
            size="small"
            sx={{ fontSize: 11 }}
          />
          {status === 'allocated' && allocation_complete && (
            <Chip
              label="Allocated"
              color="success"
              size="small"
              sx={{ fontSize: 10, ml: 0.5 }}
            />
          )}
        </Box>
      );
    },
  },
  {
    Header: "Initiated By",
    accessor: "initiated_by_name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { initiated_by_name, initiated_by } = row.original;
      const name = initiated_by_name || 
        (initiated_by ? `${initiated_by.first_name} ${initiated_by.last_name}` : "N/A");
      return <Span sx={{ fontSize: 12 }}>{name}</Span>;
    },
  },
  {
    Header: "Created Date",
    accessor: "created_at",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { created_at } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {created_at ? formatDateToDDMMYYYY(created_at) : "N/A"}
        </Span>
      );
    },
  },
  {
    Header: "Delivery Date",
    accessor: "delivery_date",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { delivery_date } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {delivery_date ? formatDateToDDMMYYYY(delivery_date) : "N/A"}
        </Span>
      );
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];

export default TradeColumnShape;


// // TradeColumnShape.tsx
// import { FC } from "react";
// import { Typography, Chip, Box } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
// import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
// import { Span } from "../../components/Typography";

// const styledTypography = {
//   cursor: "pointer",
//   "&:hover": {
//     textDecoration: "underline",
//     fontWeight: "bold",
//   },
// };

// export const TradeDetailsLink: FC<{ id: string; tradeNumber: string }> = ({
//   id,
//   tradeNumber,
// }) => {
//   const navigate = useNavigate();
//   return (
//     <Typography
//       sx={styledTypography}
//       color="primary"
//       variant="h6"
//       onClick={() => navigate(`/trades/details/${id}`)}
//     >
//       {tradeNumber}
//     </Typography>
//   );
// };

// const getStatusColor = (status: string) => {
//   const statusColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
//     draft: "default",
//     pending_approval: "warning",
//     approved: "info",
//     pending_allocation: "warning",
//     allocated: "primary",
//     in_transit: "info",
//     delivered: "success",
//     completed: "success",
//     cancelled: "error",
//     rejected: "error",
//   };
//   return statusColors[status] || "default";
// };

// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat('en-UG', {
//     style: 'currency',
//     currency: 'UGX',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// };

// const TradeColumnShape = (actions: IDropdownAction[]) => [
//   {
//     Header: "Trade Number",
//     accessor: "trade_number",
//     minWidth: 150,
//     Cell: ({ row }: any) => {
//       const { id, trade_number } = row.original;
//       return <TradeDetailsLink id={id} tradeNumber={trade_number} />;
//     },
//   },
//   {
//     Header: "Buyer",
//     accessor: "buyer_name",
//     minWidth: 150,
//     Cell: ({ row }: any) => {
//       const buyer_name = row.original.buyer_name || row.original.buyer?.name;
//       return <Span sx={{ fontSize: 13 }}>{buyer_name || "N/A"}</Span>;
//     },
//   },
//   {
//     Header: "Grain Type",
//     accessor: "grain_type_name",
//     minWidth: 120,
//     Cell: ({ row }: any) => {
//       const grain_type_name = row.original.grain_type_name || row.original.grain_type?.name;
//       return <Span sx={{ fontSize: 13 }}>{grain_type_name || "N/A"}</Span>;
//     },
//   },
//   {
//     Header: "Quality",
//     accessor: "quality_grade_name",
//     minWidth: 100,
//     Cell: ({ row }: any) => {
//       const quality_grade_name = row.original.quality_grade_name || row.original.quality_grade?.name;
//       return <Span sx={{ fontSize: 13 }}>{quality_grade_name || "N/A"}</Span>;
//     },
//   },
//   {
//     Header: "Quantity",
//     accessor: "quantity_mt",
//     minWidth: 100,
//     Cell: ({ row }: any) => {
//       const { quantity_mt, quantity_kg } = row.original;
//       return (
//         <Box>
//           <Span sx={{ fontSize: 13, fontWeight: 600 }}>
//             {Number(quantity_mt || 0).toFixed(2)} MT
//           </Span>
//           <Span sx={{ fontSize: 11, display: "block", color: "text.secondary" }}>
//             ({Number(quantity_kg || 0).toFixed(0)} kg)
//           </Span>
//         </Box>
//       );
//     },
//   },
//   {
//     Header: "Price/kg",
//     accessor: "buyer_price_per_kg",
//     minWidth: 100,
//     Cell: ({ row }: any) => {
//       const { buyer_price_per_kg } = row.original;
//       return (
//         <Span sx={{ fontSize: 13 }}>
//           {formatCurrency(buyer_price_per_kg || 0)}
//         </Span>
//       );
//     },
//   },
//   {
//     Header: "Revenue",
//     accessor: "total_revenue",
//     minWidth: 120,
//     Cell: ({ row }: any) => {
//       const { total_revenue } = row.original;
//       return (
//         <Span sx={{ fontSize: 13, fontWeight: 600 }}>
//           {formatCurrency(total_revenue || 0)}
//         </Span>
//       );
//     },
//   },
//   {
//     Header: "Profit",
//     accessor: "gross_profit",
//     minWidth: 120,
//     Cell: ({ row }: any) => {
//       const { gross_profit, roi_percentage } = row.original;
//       const isPositive = gross_profit >= 0;
//       return (
//         <Box>
//           <Span 
//             sx={{ 
//               fontSize: 13, 
//               fontWeight: 600,
//               color: isPositive ? "success.main" : "error.main" 
//             }}
//           >
//             {formatCurrency(gross_profit || 0)}
//           </Span>
//           <Span sx={{ fontSize: 11, display: "block", color: "text.secondary" }}>
//             ROI: {Number(roi_percentage || 0).toFixed(2)}%
//           </Span>
//         </Box>
//       );
//     },
//   },
//   {
//     Header: "Hub",
//     accessor: "hub_name",
//     minWidth: 120,
//     Cell: ({ row }: any) => {
//       const hub_name = row.original.hub_name || row.original.hub?.name;
//       return <Span sx={{ fontSize: 13 }}>{hub_name || "N/A"}</Span>;
//     },
//   },
//   {
//     Header: "Status",
//     accessor: "status_display",
//     minWidth: 130,
//     Cell: ({ row }: any) => {
//       const { status, status_display, allocation_complete } = row.original;
//       return (
//         <Box>
//           <Chip
//             label={status_display || status}
//             color={getStatusColor(status)}
//             size="small"
//             sx={{ fontSize: 11 }}
//           />
//           {status === 'allocated' && allocation_complete && (
//             <Chip
//               label="Allocated"
//               color="success"
//               size="small"
//               sx={{ fontSize: 10, ml: 0.5 }}
//             />
//           )}
//         </Box>
//       );
//     },
//   },
//   {
//     Header: "Initiated By",
//     accessor: "initiated_by_name",
//     minWidth: 120,
//     Cell: ({ row }: any) => {
//       const { initiated_by_name, initiated_by } = row.original;
//       const name = initiated_by_name || 
//         (initiated_by ? `${initiated_by.first_name} ${initiated_by.last_name}` : "N/A");
//       return <Span sx={{ fontSize: 12 }}>{name}</Span>;
//     },
//   },
//   {
//     Header: "Created Date",
//     accessor: "created_at",
//     minWidth: 100,
//     Cell: ({ row }: any) => {
//       const { created_at } = row.original;
//       return (
//         <Span sx={{ fontSize: 12 }}>
//           {created_at ? formatDateToDDMMYYYY(created_at) : "N/A"}
//         </Span>
//       );
//     },
//   },
//   {
//     Header: "Delivery Date",
//     accessor: "expected_delivery_date",
//     minWidth: 100,
//     Cell: ({ row }: any) => {
//       const { expected_delivery_date } = row.original;
//       return (
//         <Span sx={{ fontSize: 12 }}>
//           {expected_delivery_date ? formatDateToDDMMYYYY(expected_delivery_date) : "N/A"}
//         </Span>
//       );
//     },
//   },
//   {
//     Header: "Action",
//     accessor: "action",
//     minWidth: 100,
//     maxWidth: 100,
//     Cell: ({ row }: any) => {
//       const data = row.original;
//       return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
//     },
//   },
// ];

// export default TradeColumnShape;