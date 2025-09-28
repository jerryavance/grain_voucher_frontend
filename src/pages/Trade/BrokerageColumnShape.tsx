import { FC } from "react";
import { Typography } from "@mui/material";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";

const BrokerageColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Trade ID",
    accessor: "trade.id",
    minWidth: 200,
  },
  {
    Header: "Agent",
    accessor: "agent.first_name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { agent } = row.original;
      return <Span>{agent ? `${agent.first_name} ${agent.last_name}` : "Unknown"}</Span>;
    },
  },
  {
    Header: "Commission Type",
    accessor: "commission_type",
    minWidth: 150,
  },
  {
    Header: "Commission Value",
    accessor: "commission_value",
    minWidth: 150,
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 120,
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

export default BrokerageColumnShape;