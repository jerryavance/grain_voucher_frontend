import { Header } from "antd/es/layout/layout";
import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const InventoriesColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Grain Type",
    accessor: "grain_type.name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { grain_type } = row.original;
      return <Span sx={{ fontSize: 12, fontWeight: "bold" }}>{grain_type?.name || "Unknown"}</Span>;
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
    Header: "Admin",
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
    Header: "Total Quantity (kg)",
    accessor: "total_quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { total_quantity_kg } = row.original;
      return <Span sx={{ fontSize: 12 }}>{total_quantity_kg || "0.00"}</Span>;
    },
  },
  {
    Header: "Available Quantity (kg)",
    accessor: "available_quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { available_quantity_kg } = row.original;
      return <Span sx={{ fontSize: 12 }}>{available_quantity_kg || "0.00"}</Span>;
    },
  },
  {
    Header: "Reserved Quantity (kg)",
    accessor: "reserved_quantity_kg",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { reserved_quantity_kg } = row.original;
      return <Span sx={{ fontSize: 12 }}>{reserved_quantity_kg || "0.00"}</Span>;
    },
  },
  {
    Header: "Utilization (%)",
    accessor: "utilization_percentage",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { utilization_percentage } = row.original;
      return <Span sx={{ fontSize: 12 }}>{utilization_percentage || "0.00"}%</Span>;
    },
  },
  {
    Header: "Current Value Estimate",
    accessor: "current_value_estimate",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { current_value_estimate } = row.original;
      return <Span sx={{ fontSize: 12 }}>{current_value_estimate || "0.00"}</Span>;
    },
  },
  {
    Header: "Pending Deposits",
    accessor: "pending_deposits_count",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { pending_deposits_count } = row.original;
      return <Span sx={{ fontSize: 12 }}>{pending_deposits_count || 0}</Span>;
    },
  },
  {
    Header: "Active Vouchers",
    accessor: "active_vouchers_count",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { active_vouchers_count } = row.original;
      return <Span sx={{ fontSize: 12 }}>{active_vouchers_count || 0}</Span>;
    },
  },
  {
    Header: "Last Updated",
    accessor: "last_updated",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { last_updated } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {last_updated ? new Date(last_updated).toLocaleDateString() : "Unknown"}
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

export default InventoriesColumnShape;