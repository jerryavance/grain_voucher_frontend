import { FC } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import { getLoanStatusColor } from "../../utils/helpers";

const styledTypography = {
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
    fontWeight: 'bold'
  }
}

export const LoanDetailsLink: FC<{ id: string, name: string }> = ({ id, name }) => {
  const navigate = useNavigate();
  return (
    <Typography sx={styledTypography} color='primary' variant='h6' onClick={() => navigate(`/admin/loan/details/${id}`)}>
      {name}
    </Typography>
  );
}

const LoanColumnShape = (ViewAction: FC<{ id: string }>) => [
  {
    Header: "Loan ID",
    accessor: "id",
    minWidth: 50,
    Cell: ({ row }: any) => {
      const { loan_id, id } = row.original;
      return <LoanDetailsLink id={id} name={loan_id} />;
    }
  },
  {
    Header: "Purpose",
    accessor: "purpose",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { purpose } = row.original;
      return purpose ? <Typography variant="body1">{purpose}</Typography> : "N/A";
    }
  },
  {
    Header: "Amount",
    accessor: "amount",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { amount, currency } = row.original;
      return <Typography variant="body1">{`${amount} ${currency || 'USD'}`}</Typography>;
    }
  },
  {
    Header: "Total Units",
    accessor: "total_units",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { total_units } = row.original;
      return <Typography variant="body1">{total_units || "N/A"}</Typography>;
    }
  },
  {
    Header: "Units Available",
    accessor: "units_available",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { units_available } = row.original;
      return <Typography variant="body1">{units_available || "N/A"}</Typography>;
    }
  },
  {
    Header: "Created At",
    accessor: "created_at",
    minWidth: 150,
    Cell: ({ row }: any) => formatDateToDDMMYYYY(row.original.created_at)
  },
  {
    Header: "Duration",
    accessor: "loan_duration",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { loan_duration, duration_unit } = row.original;
      return <Typography variant="body1">{`${loan_duration} ${duration_unit || 'days'}`}</Typography>;
    }
  },
  {
    Header: "Repayment Frequency",
    accessor: "repayment_frequency",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { repayment_frequency } = row.original;
      return <Typography variant="body1">{repayment_frequency || "N/A"}</Typography>;
    }
  },
  {
    Header: "Status",
    accessor: "status",
    minWidth: 70,
    Cell: ({ row }: any) => {
      const { status } = row.original;
      const { text, bg } = getLoanStatusColor(status);
  
      return (
        <Typography
          variant="body2"
          sx={{
            display: "inline-block",
            px: 1,
            py: 0.5,
            borderRadius: "6px",
            fontWeight: 500,
            fontSize: "0.75rem",
            backgroundColor: bg,
            color: text,
            textTransform: "capitalize"
          }}
        >
          {status || "N/A"}
        </Typography>
      );
    }
  },  
  {
    Header: "Action",
    accessor: "action",
    minWidth: 50,
    maxWidth: 100,
    Cell: ({ row }: any) => <ViewAction id={row.original.id} />
  },
];

export default LoanColumnShape;
