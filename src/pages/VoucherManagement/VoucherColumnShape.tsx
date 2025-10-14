import { FC } from "react";
import { Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import { IVoucher } from "./Voucher.interface";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "issued":
      return "success";
    case "pending_verification":
      return "warning";
    case "transferred":
      return "info";
    case "redeemed":
      return "default";
    case "expired":
      return "error";
    default:
      return "default";
  }
};

const getVerificationColor = (status: string) => {
  switch (status) {
    case "verified":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

export const VoucherColumnShape = (
    voucherActions: IDropdownAction[],
    onViewDetails: (voucher: IVoucher) => void
  ) => [
    {
      Header: "GRN Number",
      accessor: "grn_number",
      Cell: ({ value, row }: { value: string; row: { original: IVoucher } }) => (
        <span
          style={{ cursor: "pointer", color: "#1976d2" }}
          onClick={() => onViewDetails(row.original)}
        >
          {value}
        </span>
      ),
    },
    {
      Header: "Current Value",
      accessor: "current_value",
      Cell: ({ value }: { value: number }) => (
        <span>{`UGX ${value?.toLocaleString() || 0}`}</span>
      ),
    },
    {
        Header: "Holder Name",
        accessor: "holder", // keep the holder object
        Cell: ({ row }: any) => {
          const holder = row.original.holder;
          return (
            <span>
              {holder?.first_name} {holder?.last_name}
            </span>
          );
        },
    },
      
    {
      Header: "Holder Phone",
      accessor: "holder.phone_number",
    },
    {
      Header: "Holder ID Number",
      accessor: "holder.id",
    },
    {
      Header: "Verification Status",
      accessor: "verification_status",
      Cell: ({ value }: { value: string }) => {
        const statusColors: { [key: string]: string } = {
          pending: "warning",
          verified: "success",
          rejected: "error",
        };
        return (
          <Chip
            label={value}
            color={statusColors[value.toLowerCase()] as any}
            size="small"
          />
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }: { row: { original: IVoucher } }) => (
        <DropdownActionBtn actions={voucherActions} metaData={row.original} />
      ),
    },
  ];

  
export const RedemptionColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Redemption ID",
    accessor: "id",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12, fontWeight: 600 }}>
          {row.original.id.substring(0, 8)}...
        </Span>
      );
    },
  },
  {
    Header: "Requester",
    accessor: "requester",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { requester } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {requester?.first_name} {requester?.last_name}
        </Span>
      );
    },
  },
  {
    Header: "GRN Number",
    accessor: "voucher_details.grn_number",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12 }}>
          {row.original.voucher_details?.grn_number || "N/A"}
        </Span>
      );
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12, fontWeight: 600 }}>
          UGX {parseFloat(row.original.amount || "0").toLocaleString()}
        </Span>
      );
    },
  },
  {
    Header: "Fee",
    accessor: "fee",
    minWidth: 100,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12, color: "error.main" }}>
          UGX {parseFloat(row.original.fee || "0").toLocaleString()}
        </Span>
      );
    },
  },
  {
    Header: "Net Payout",
    accessor: "net_payout",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12, fontWeight: 600, color: "success.main" }}>
          UGX {parseFloat(row.original.net_payout || "0").toLocaleString()}
        </Span>
      );
    },
  },
  {
    Header: "Payment Method",
    accessor: "payment_method",
    minWidth: 130,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12 }}>
          {row.original.payment_method?.replace("_", " ").toUpperCase() || "N/A"}
        </Span>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const status = row.original.status;
      const colorMap: Record<string, any> = {
        pending: "warning",
        approved: "info",
        rejected: "error",
        paid: "success",
      };
      return (
        <Chip
          label={status.toUpperCase()}
          color={colorMap[status] || "default"}
          size="small"
        />
      );
    },
  },
  {
    Header: "Request Date",
    accessor: "request_date",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12 }}>
          {formatDateToDDMMYYYY(row.original.request_date)}
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

export const DepositColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "GRN Number",
    accessor: "grn_number",
    minWidth: 150,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12, fontWeight: 600 }}>
          {row.original.grn_number || "N/A"}
        </Span>
      );
    },
  },
  {
    Header: "Farmer",
    accessor: "farmer",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { farmer } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {farmer?.first_name} {farmer?.last_name}
        </Span>
      );
    },
  },
  {
    Header: "Grain Type",
    accessor: "grain_type_details.name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12 }}>
          {row.original.grain_type_details?.name || "N/A"}
        </Span>
      );
    },
  },
  {
    Header: "Quantity (kg)",
    accessor: "quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12 }}>
          {parseFloat(row.original.quantity_kg || "0").toFixed(2)}
        </Span>
      );
    },
  },
  {
    Header: "Value",
    accessor: "value",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12, fontWeight: 600, color: "primary.main" }}>
          UGX {parseFloat(row.original.value || "0").toLocaleString()}
        </Span>
      );
    },
  },
  {
    Header: "Hub",
    accessor: "hub.name",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12 }}>
          {row.original.hub?.name || "N/A"}
        </Span>
      );
    },
  },
  {
    Header: "Validated",
    accessor: "validated",
    minWidth: 100,
    Cell: ({ row }: any) => {
      return (
        <Chip
          label={row.original.validated ? "YES" : "NO"}
          color={row.original.validated ? "success" : "warning"}
          size="small"
        />
      );
    },
  },
  {
    Header: "Deposit Date",
    accessor: "deposit_date",
    minWidth: 120,
    Cell: ({ row }: any) => {
      return (
        <Span sx={{ fontSize: 12 }}>
          {formatDateToDDMMYYYY(row.original.deposit_date)}
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