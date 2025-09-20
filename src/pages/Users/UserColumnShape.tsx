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

export const UserDetailsLink: FC<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  const navigate = useNavigate();
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => navigate(`/users/details/${id}`)}
    >
      {name}
    </Typography>
  );
};

const UserColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "First name",
    accessor: "first_name",
    minWidth: 100,
  },
  {
    Header: "Last name",
    accessor: "last_name",
    minWidth: 100,
  },
  {
    Header: "Phone",
    accessor: "phone_number",
    minWidth: 200,
  },
  {
    Header: "Email",
    accessor: "email",
    minWidth: 100,
  },
  {
    Header: "Role",
    accessor: "role",
    minWidth: 100,
  },
  {
    Header: "Location",
    accessor: "profile.location",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { profile } = row.original;
      return (
        <Span sx={{ fontSize: 12 }}>
          {profile?.location || "Unknown"} {profile?.gender || "Unknown"}
        </Span>
      );
    }
  },
  // {
  //   Header: "Status",
  //   accessor: "status",
  //   minWidth: 100,
  //   Cell: ({ row }: any) => {
  //     const {is_active} = row.original;
  //     return is_active ? "Active" : "Inactive";
  //   },
  // },
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

export default UserColumnShape;
