import { FC } from "react";
import { Typography } from "@mui/material";
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

export const TradeDetailsLink: FC<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  // Assuming no details page for now, just display name
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
    >
      {name}
    </Typography>
  );
};

const TradeColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Buyer",
    accessor: "buyer.name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { buyer } = row.original;
      return <Span>{buyer?.name || "Unknown"}</Span>;
    },
  },
  {
    Header: "Grain Type",
    accessor: "grain_type.name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { grain_type } = row.original;
      return <Span>{grain_type?.name || "Unknown"}</Span>;
    },
  },
  {
    Header: "Quantity (MT)",
    accessor: "quantity_mt",
    minWidth: 120,
  },
  {
    Header: "Grade",
    accessor: "grade",
    minWidth: 100,
  },
  {
    Header: "Price per MT",
    accessor: "price_per_mt",
    minWidth: 120,
  },
  {
    Header: "Total Amount",
    accessor: "total_amount",
    minWidth: 120,
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 100,
  },
  {
    Header: "Hub",
    accessor: "hub.name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      return <Span>{hub?.name || "Unknown"}</Span>;
    },
  },
  {
    Header: "Created At",
    accessor: "created_at",
    minWidth: 150,
    Cell: ({ value }: any) => formatDateToDDMMYYYY(value),
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>;
    },
  },
];

export default TradeColumnShape;