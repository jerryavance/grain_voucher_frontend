import { FC } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import { Span } from "../../../components/Typography";
import { IJournalEntry } from "./JournalEntries.interface";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const JournalEntryDetailsLink: FC<{ id: string; number: string }> = ({ id, number }) => {
  const navigate = useNavigate();
  return (
    <Typography sx={styledTypography} color="primary" variant="h6" onClick={() => navigate(`/admin/accounting/journal-entries/details/${id}`)}>
      {number}
    </Typography>
  );
};

const JournalEntryColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Entry Number",
    accessor: "entry_number",
    minWidth: 150,
    Cell: ({ row }: any) => <JournalEntryDetailsLink id={row.original.id} number={row.original.entry_number} />,
  },
  {
    Header: "Type",
    accessor: "entry_type_display",
    minWidth: 120,
  },
  {
    Header: "Date",
    accessor: "entry_date",
    minWidth: 120,
    Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
  },
  {
    Header: "Debit Account",
    accessor: "debit_account",
    minWidth: 150,
  },
  {
    Header: "Credit Account",
    accessor: "credit_account",
    minWidth: 150,
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 120,
  },
  {
    Header: "Description",
    accessor: "description",
    minWidth: 200,
  },
  {
    Header: "Reversed",
    accessor: "is_reversed",
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

export default JournalEntryColumnShape;