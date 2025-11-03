import { FC } from "react";
import { Typography, Chip, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import { IInvoice } from "./Invoices.interface";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const InvoiceDetailsLink: FC<{ id: string; number: string }> = ({ id, number }) => {
  const navigate = useNavigate();
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => navigate(`/admin/accounting/invoices/details/${id}`)}
    >
      {number}
    </Typography>
  );
};

const InvoiceColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Invoice Number",
    accessor: "invoice_number",
    minWidth: 150,
    Cell: ({ row }: any) => <InvoiceDetailsLink id={row.original.id} number={row.original.invoice_number} />,
  },
  {
    Header: "Account",
    accessor: "account_name",
    minWidth: 150,
  },
  {
    Header: "Period",
    accessor: "period",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const invoice: IInvoice = row.original;
      if (invoice.period_start && invoice.period_end) {
        return (
          <Typography variant="body2" fontSize="0.875rem">
            {formatDateToDDMMYYYY(invoice.period_start)} - {formatDateToDDMMYYYY(invoice.period_end)}
          </Typography>
        );
      }
      return <Typography variant="body2">-</Typography>;
    },
  },
  {
    Header: "GRNs",
    accessor: "grn_count",
    minWidth: 50,
    Cell: ({ value }: any) => (
      <Chip label={value || 0} size="small" color="primary" variant="outlined" />
    ),
  },
  {
    Header: "Issue Date",
    accessor: "issue_date",
    minWidth: 120,
    Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
  },
  {
    Header: "Due Date",
    accessor: "due_date",
    minWidth: 120,
    Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
  },
  {
    Header: "Total Amount",
    accessor: "total_amount",
    minWidth: 130,
    Cell: ({ value }: any) => (
      <Typography variant="body2" fontWeight="medium">
        UGX {parseFloat(value).toFixed(2)}
      </Typography>
    ),
  },
  {
    Header: "Amount Due",
    accessor: "amount_due",
    minWidth: 130,
    Cell: ({ value }: any) => {
      const amount = parseFloat(value);
      return (
        <Typography
          variant="body2"
          fontWeight="medium"
          color={amount > 0 ? "error.main" : "success.main"}
        >
          UGX {amount.toFixed(2)}
        </Typography>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status_display",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const invoice: IInvoice = row.original;
      const colorMap: Record<string, any> = {
        draft: "default",
        issued: "info",
        sent: "primary",
        partially_paid: "warning",
        paid: "success",
        overdue: "error",
        cancelled: "default",
        written_off: "error",
      };
      return (
        <Chip
          label={invoice.status_display}
          size="small"
          color={colorMap[invoice.status] || "default"}
        />
      );
    },
  },
  {
    Header: "Payment Status",
    accessor: "payment_status_display",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const invoice: IInvoice = row.original;
      const colorMap: Record<string, any> = {
        unpaid: "warning",
        partial: "info",
        paid: "success",
        overdue: "error",
      };
      return (
        <Chip
          label={invoice.payment_status_display}
          size="small"
          color={colorMap[invoice.payment_status] || "default"}
        />
      );
    },
  },
  {
    Header: "Frequency",
    accessor: "invoicing_frequency",
    minWidth: 150,
    Cell: ({ value }: any) => (
      value ? <Chip label={value} size="small" variant="outlined" /> : <Typography>-</Typography>
    ),
  },
  {
    Header: "Days Overdue",
    accessor: "days_overdue",
    minWidth: 120,
    Cell: ({ value }: any) => {
      if (!value || value === 0) return <Typography>-</Typography>;
      return (
        <Chip
          label={`${value} days`}
          size="small"
          color="error"
        />
      );
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      // Filter actions based on conditions
      const filteredActions = actions.filter(action => {
        if (action.condition) {
          return action.condition(row.original);
        }
        return true;
      });
      return <DropdownActionBtn key={row.id} actions={filteredActions} metaData={row.original} />;
    },
  },
];

export default InvoiceColumnShape;













// import { FC } from "react";
// import { Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
// import DropdownActionBtn, { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
// import { Span } from "../../../components/Typography";
// import { IInvoice } from "./Invoices.interface";

// const styledTypography = {
//   cursor: "pointer",
//   "&:hover": {
//     textDecoration: "underline",
//     fontWeight: "bold",
//   },
// };

// export const InvoiceDetailsLink: FC<{ id: string; number: string }> = ({ id, number }) => {
//   const navigate = useNavigate();
//   return (
//     <Typography sx={styledTypography} color="primary" variant="h6" onClick={() => navigate(`/admin/accounting/invoices/details/${id}`)}>
//       {number}
//     </Typography>
//   );
// };

// const InvoiceColumnShape = (actions: IDropdownAction[]) => [
//   {
//     Header: "Invoice Number",
//     accessor: "invoice_number",
//     minWidth: 150,
//     Cell: ({ row }: any) => <InvoiceDetailsLink id={row.original.id} number={row.original.invoice_number} />,
//   },
//   {
//     Header: "Account",
//     accessor: "account.name",
//     minWidth: 150,
//   },
//   {
//     Header: "Issue Date",
//     accessor: "issue_date",
//     minWidth: 120,
//     Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
//   },
//   {
//     Header: "Due Date",
//     accessor: "due_date",
//     minWidth: 120,
//     Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
//   },
//   {
//     Header: "Total Amount",
//     accessor: "total_amount",
//     minWidth: 120,
//   },
//   {
//     Header: "Amount Due",
//     accessor: "amount_due",
//     minWidth: 120,
//   },
//   {
//     Header: "Status",
//     accessor: "status_display",
//     minWidth: 120,
//   },
//   {
//     Header: "Payment Status",
//     accessor: "payment_status_display",
//     minWidth: 150,
//   },
//   {
//     Header: "Action",
//     accessor: "action",
//     minWidth: 100,
//     maxWidth: 100,
//     Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
//   },
// ];

// export default InvoiceColumnShape;