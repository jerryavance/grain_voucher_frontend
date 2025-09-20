import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const QualityGradeColumnShape = (actions: IDropdownAction[]) => [
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
    Header: "Min Moisture",
    accessor: "min_moisture",
    minWidth: 100,
  },
  {
    Header: "Max Moisture",
    accessor: "max_moisture",
    minWidth: 100,
  },
  {
    Header: "Description",
    accessor: "description",
    minWidth: 100,
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


export default QualityGradeColumnShape;
