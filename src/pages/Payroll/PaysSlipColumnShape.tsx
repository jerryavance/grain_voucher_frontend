import { FC } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

const PayslipDetailsLink: FC<{ id: string; period: string }> = ({
    id,
    period,
  }) => {
    const navigate = useNavigate();
    return (
      <Typography
        sx={styledTypography}
        color="primary"
        variant="h6"
        onClick={() => navigate(`/payroll/payslips/details/${id}`)}
      >
        {period}
      </Typography>
    );
  };
  
  const PayslipColumnShape = (actions: IDropdownAction[]) => [
    {
      Header: "Employee",
      accessor: "employee.user.first_name",
      minWidth: 200,
      Cell: ({ row }: any) => {
        const { employee } = row.original;
        const fullName = `${employee.user.first_name} ${employee.user.last_name}`;
        return (
          <Span sx={{ fontSize: 12, fontWeight: 'medium' }}>
            {fullName}
          </Span>
        );
      }
    },
    {
      Header: "Period",
      accessor: "period",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const { period } = row.original;
        return (
          <PayslipDetailsLink 
            id={row.original.id} 
            period={formatDateToDDMMYYYY(period)}
          />
        );
      }
    },
    {
      Header: "Gross Earnings",
      accessor: "gross_earnings",
      minWidth: 130,
      Cell: ({ row }: any) => {
        const { gross_earnings } = row.original;
        return (
          <Span sx={{ fontSize: 12, color: 'success.main', fontWeight: 'bold' }}>
            UGX {parseFloat(gross_earnings).toLocaleString()}
          </Span>
        );
      }
    },
    {
      Header: "Deductions",
      accessor: "deductions",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const { deductions } = row.original;
        return (
          <Span sx={{ fontSize: 12, color: 'error.main', fontWeight: 'bold' }}>
            UGX {parseFloat(deductions).toLocaleString()}
          </Span>
        );
      }
    },
    {
      Header: "Net Pay",
      accessor: "net_pay",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const { net_pay } = row.original;
        return (
          <Span sx={{ fontSize: 12, color: 'primary.main', fontWeight: 'bold' }}>
            UGX {parseFloat(net_pay).toLocaleString()}
          </Span>
        );
      }
    },
    {
      Header: "Employee Role",
      accessor: "employee.user.role",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const { employee } = row.original;
        return (
          <Span sx={{ fontSize: 12, textTransform: 'capitalize' }}>
            {employee.user.role}
          </Span>
        );
      }
    },
    {
      Header: "Created At",
      accessor: "created_at",
      minWidth: 120,
      Cell: ({ row }: any) => {
        const { created_at } = row.original;
        return (
          <Span sx={{ fontSize: 12 }}>
            {formatDateToDDMMYYYY(created_at)}
          </Span>
        );
      }
    },
    {
      Header: "Action",
      accessor: "action",
      minWidth: 100,
      maxWidth: 100,
      Cell: ({ row }: any) => {
        const data = row.original;
        return <DropdownActionBtn key={row.id} actions={actions} metaData={data}/>
      }
    },
  ];
  
  export default PayslipColumnShape;