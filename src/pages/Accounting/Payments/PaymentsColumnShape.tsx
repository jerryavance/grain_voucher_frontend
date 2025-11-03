import { FC } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import { Span } from "../../../components/Typography";
import { IPayment } from "./Payments.interface";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const PaymentDetailsLink: FC<{ id: string; number: string }> = ({ id, number }) => {
  const navigate = useNavigate();
  return (
    <Typography sx={styledTypography} color="primary" variant="h6" onClick={() => navigate(`/admin/accounting/payments/details/${id}`)}>
      {number}
    </Typography>
  );
};


const PaymentColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Payment Number",
    accessor: "payment_number",
    minWidth: 150,
    Cell: ({ row }: any) => <PaymentDetailsLink id={row.original.id} number={row.original.payment_number} />,
  },
  {
    Header: "Invoice",
    accessor: "invoice_details.invoice_number",
    minWidth: 150,
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 120,
  },
  {
    Header: "Payment Date",
    accessor: "payment_date",
    minWidth: 120,
    Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
  },
  {
    Header: "Method",
    accessor: "payment_method_display",
    minWidth: 120,
  },
  {
    Header: "Status",
    accessor: "status_display",
    minWidth: 120,
  },
  {
    Header: "Reconciled",
    accessor: "reconciled",
    minWidth: 100,
    Cell: ({ value }: any) => <Span>{value ? "Yes" : "No"}</Span>,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />,
  },
];

export default PaymentColumnShape;