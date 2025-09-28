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

export const EmployeeDetailsLink: FC<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  const navigate = useNavigate();
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => navigate(`/payroll/employees/details/${id}`)}
    >
      {name}
    </Typography>
  );
};

const EmployeeColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Employee Name",
    accessor: "user.first_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { user } = row.original;
      const fullName = `${user.first_name} ${user.last_name}`;
      return (
        <EmployeeDetailsLink 
          id={row.original.id} 
          name={fullName}
        />
      );
    }
  },
  {
    Header: "Email",
    accessor: "user.email",
    minWidth: 200,
  },
  {
    Header: "Phone",
    accessor: "user.phone_number",
    minWidth: 150,
  },
  {
    Header: "Role",
    accessor: "user.role",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { user } = row.original;
      return (
        <Span sx={{ fontSize: 12, textTransform: 'capitalize' }}>
          {user?.role || "Unknown"}
        </Span>
      );
    }
  },
  {
    Header: "Salary",
    accessor: "salary",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { salary } = row.original;
      return (
        <Span sx={{ fontSize: 12, fontWeight: 'bold' }}>
          UGX {parseFloat(salary).toLocaleString()}
        </Span>
      );
    }
  },
  {
    Header: "Contract Start",
    accessor: "contract_start",
    minWidth: 120,
    Cell: ({ row }: any) => {
      const { contract_start } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {formatDateToDDMMYYYY(contract_start)}
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

export default EmployeeColumnShape;