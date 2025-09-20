import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const PriceFeedColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Hub",
    accessor: "hub",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      return hub ? <Span sx={{ fontSize: 12, fontWeight: 'bold' }}>{hub.name} : {hub.location}</Span> : <Span sx={{ fontSize: 12, fontStyle: 'italic' }}>Global</Span>;
    }
  },
  {
    Header: "Grain Type",
    accessor: "grain_type",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { grain_type } = row.original;
      return <Span sx={{ fontSize: 12 }}>{grain_type.name}</Span>;
    }
  },
  {
    Header: "Price (Per Kg)",
    accessor: "price_per_kg",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { price_per_kg } = row.original;
      return <Span sx={{ fontSize: 12 }}>{price_per_kg}</Span>;
    }
  },
  {
    Header: "Effective Date",
    accessor: "effective_date",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { effective_date } = row.original;
      return <Span sx={{ fontSize: 12 }}>{new Date(effective_date).toLocaleDateString()}</Span>;
    }
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 50,
    maxWidth: 50,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    }
  },
];

export default PriceFeedColumnShape;
