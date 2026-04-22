import { Chip } from "@mui/material";
import { Span } from "../../components/Typography";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";

const CATEGORY_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "info"> = {
  grain: "success",
  pesticide: "warning",
  fertilizer: "info",
  seed: "primary",
  other: "default",
};

const GrainTypeColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "name",
    minWidth: 160,
    Cell: ({ row }: any) => (
      <Span sx={{ fontSize: 12, fontWeight: "bold" }}>{row.original.name}</Span>
    ),
  },
  {
    Header: "Category",
    accessor: "product_category_display",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Chip
        label={row.original.product_category_display || row.original.product_category || "Grain"}
        size="small"
        color={CATEGORY_COLORS[row.original.product_category] ?? "default"}
        variant="outlined"
      />
    ),
  },
  {
    Header: "Unit",
    accessor: "unit_of_measure_display",
    minWidth: 110,
    Cell: ({ row }: any) => (
      <Chip
        label={row.original.unit_of_measure_display || row.original.unit_of_measure || "kg"}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    Header: "Description",
    accessor: "description",
    minWidth: 280,
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 50,
    maxWidth: 50,
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];

export default GrainTypeColumnShape;
