import { FC } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import { Span } from "../../../components/Typography";
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
    <Typography sx={styledTypography} color="primary" variant="h6" onClick={() => navigate(`/admin/accounting/invoices/details/${id}`)}>
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
    accessor: "account.name",
    minWidth: 150,
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
    minWidth: 120,
  },
  {
    Header: "Amount Due",
    accessor: "amount_due",
    minWidth: 120,
  },
  {
    Header: "Status",
    accessor: "status_display",
    minWidth: 120,
  },
  {
    Header: "Payment Status",
    accessor: "payment_status_display",
    minWidth: 150,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];

export default InvoiceColumnShape;