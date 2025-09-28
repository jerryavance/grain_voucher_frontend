import { Header } from "antd/es/layout/layout";
import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const LedgerEntriesColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "User",
    accessor: "user",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { user } = row.original;
      return (
        <Span sx={{ fontSize: 12, fontWeight: "bold" }}>
          {user?.first_name || "Unknown"} {user?.last_name || "Unknown"}
        </Span>
      );
    },
  },
  {
    Header: "Phone Number",
    accessor: "user.phone_number",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { user } = row.original;
      return <Span sx={{ fontSize: 12 }}>{user?.phone_number || "Unknown"}</Span>;
    },
  },
  {
    Header: "Role",
    accessor: "user.role",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { user } = row.original;
      return <Span sx={{ fontSize: 12 }}>{user?.role || "Unknown"}</Span>;
    },
  },
  {
    Header: "Hub Name",
    accessor: "hub.name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      return <Span sx={{ fontSize: 12 }}>{hub?.name || "Unknown"}</Span>;
    },
  },
  {
    Header: "Hub Admin",
    accessor: "hub.hub_admin",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      const admin = hub?.hub_admin;
      return (
        <Span sx={{ fontSize: 12 }}>
          {admin?.first_name || "Unknown"} {admin?.last_name || "Unknown"}
        </Span>
      );
    },
  },
  {
    Header: "Location",
    accessor: "hub.location",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      return <Span sx={{ fontSize: 12 }}>{hub?.location || "Unknown"}</Span>;
    },
  },
  {
    Header: "Event Type",
    accessor: "event_type",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { event_type } = row.original;
      return <Span sx={{ fontSize: 12 }}>{event_type || "Unknown"}</Span>;
    },
  },
  {
    Header: "Description",
    accessor: "description",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { description } = row.original;
      return <Span sx={{ fontSize: 12 }}>{description || "N/A"}</Span>;
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { amount } = row.original;
      return <Span sx={{ fontSize: 12 }}>{amount || "0.00"}</Span>;
    },
  },
  {
    Header: "Timestamp",
    accessor: "timestamp",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { timestamp } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {timestamp ? new Date(timestamp).toLocaleDateString() : "Unknown"}
        </Span>
      );
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 50,
    maxWidth: 50,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];

export default LedgerEntriesColumnShape;