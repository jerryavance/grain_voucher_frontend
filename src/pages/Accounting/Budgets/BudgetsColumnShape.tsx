import { FC } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../../components/UI/DropdownActionBtn";
import { Span } from "../../../components/Typography";
import { IBudget } from "./Budgets.interface";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const BudgetDetailsLink: FC<{ id: string; period: string }> = ({ id, period }) => {
  const navigate = useNavigate();
  return (
    <Typography sx={styledTypography} color="primary" variant="h6" onClick={() => navigate(`/admin/accounting/budgets/details/${id}`)}>
      {formatDateToDDMMYYYY(period)}
    </Typography>
  );
};

const BudgetColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Period",
    accessor: "period",
    minWidth: 120,
    Cell: ({ row }: any) => <BudgetDetailsLink id={row.original.id} period={row.original.period} />,
  },
  {
    Header: "Hub",
    accessor: "hub.name",
    minWidth: 150,
  },
  {
    Header: "Grain Type",
    accessor: "grain_type.name",
    minWidth: 150,
  },
  {
    Header: "Budgeted Amount",
    accessor: "budgeted_amount",
    minWidth: 120,
  },
  {
    Header: "Actual Amount",
    accessor: "actual_amount",
    minWidth: 120,
  },
  {
    Header: "Variance",
    accessor: "variance",
    minWidth: 120,
  },
  {
    Header: "Variance %",
    accessor: "variance_percentage",
    minWidth: 100,
  },
  {
    Header: "Over Budget",
    accessor: "is_over_budget",
    minWidth: 120,
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

export default BudgetColumnShape;