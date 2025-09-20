import { Header } from "antd/es/layout/layout";
import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const HubColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { name } = row.original;
      return (<Span sx={{ fontSize: 12, fontWeight: 'bold' }}>{name}</Span>)
    }
  },
  {
    Header: "Admin",
    accessor: "hub_admin",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { hub_admin } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {hub_admin?.first_name || "Unknown"} {hub_admin?.last_name || "Unknown"}
        </Span>
      );
    }
  },
  {
    Header: "Slug",
    accessor: "slug",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { slug } = row.original;
      return (<Span sx={{ fontSize: 12 }}>{slug}</Span>)
    }
  },
  {
    Header: "Location",
    accessor: "location",
    minWidth: 100,
  },
  { 
    Header: "Created At",
    accessor: "created_at",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { created_at } = row.original;
      return (<Span sx={{ fontSize: 12 }}>{new Date(created_at).toLocaleDateString()}</Span>)
    }
  },
  {
    Header: "Updated At",
    accessor: "updated_at",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { updated_at } = row.original;
      return (<Span sx={{ fontSize: 12 }}>{new Date(updated_at).toLocaleDateString()}</Span>)
    }
  },
  {
    Header: "Status",
    accessor: "is_active",
    minWidth: 80,
    Cell: ({ row }: any) => {
      const { is_active } = row.original;
      return (<Span sx={{ fontSize: 12 }}>{is_active ? 'Yes' : 'No'}</Span>)
    }
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 50,
    maxWidth: 50,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>
    }
  },
];

export default HubColumnShape;
