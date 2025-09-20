import { FC } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const styledTypography = {
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
    fontWeight: 'bold'
  }
}

export const InvestmentDetailsLink: FC<{ id: string, name: string }> = ({ id, name }) => {
  const navigate = useNavigate();
  return (
    <Typography sx={styledTypography} color='primary' variant='h6' onClick={() => navigate(`/admin/investment/details/${id}`)}>
      {name}
    </Typography>
  );
}

const InvestmentColumnShape = (ViewAction: FC<{ id: string }>) => [
  {
    Header: "Identifier",
    accessor: "id",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { investment_name, id } = row.original;
      return <InvestmentDetailsLink id={id} name={investment_name} />;
    }
  },
  {
    Header: "Type",
    accessor: "investment_type",
    minWidth: 100,
  },
  {
    Header: "Risk Level",
    accessor: "risk_level",
    minWidth: 100,
  },
  {
    Header: "Investment Bank",
    accessor: "investment_bank_details.name",
    minWidth: 100,
  },
  {
    Header: "Total Investment",
    accessor: "total_investment_amount",
    minWidth: 100,
  },
  {
    Header: "Available Units",
    accessor: "available_units",
    minWidth: 100,
  },
  {
    Header: "Unit Price",
    accessor: "unit_price",
    minWidth: 100,
  },
  {
    Header: "Interest Rate",
    accessor: "interest_rate",
    minWidth: 100,
  },
  {
    Header: "Start Date",
    accessor: "start_date",
    minWidth: 100,
    Cell: ({ row }: any) => formatDateToDDMMYYYY(row.original.start_date)
  },
  {
    Header: "End Date",
    accessor: "end_date",
    minWidth: 100,
    Cell: ({ row }: any) => formatDateToDDMMYYYY(row.original.end_date)
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => <ViewAction id={row.original.id} />
  },
];

export default InvestmentColumnShape;
