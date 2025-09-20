import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const GrainTypeColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { name } = row.original;
      return (<Span sx={{ fontSize: 12, fontWeight: 'bold' }}>{name}</Span>)
    }
  },
  {
    Header: "Description",
    accessor: "description",
    minWidth: 400,
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


export default GrainTypeColumnShape;
