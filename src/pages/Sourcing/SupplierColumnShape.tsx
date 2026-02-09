import { FC } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
import { ISupplierProfile } from "./Sourcing.interface";
import VerifiedIcon from "@mui/icons-material/Verified";

const styledTypography = {
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
    fontWeight: "bold",
  },
};

export const SupplierDetailsLink: FC<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  const navigate = useNavigate();
  return (
    <Typography
      sx={styledTypography}
      color="primary"
      variant="h6"
      onClick={() => navigate(`/admin/sourcing/suppliers/${id}`)}
    >
      {name}
    </Typography>
  );
};

const SupplierColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Business Name",
    accessor: "business_name",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { id, business_name, is_verified } = row.original;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupplierDetailsLink id={id} name={business_name} />
          {is_verified && <VerifiedIcon color="success" fontSize="small" />}
        </Box>
      );
    }
  },
  {
    Header: "Contact Person",
    accessor: "user",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { user } = row.original;
      return (
        <Span sx={{ fontSize: 14 }}>
          {user?.first_name} {user?.last_name}
        </Span>
      );
    }
  },
  {
    Header: "Phone",
    accessor: "user.phone_number",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const { user } = row.original;
      return <Span sx={{ fontSize: 14 }}>{user?.phone_number || "N/A"}</Span>;
    }
  },
  {
    Header: "Primary Hub",
    accessor: "hub.name",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { hub } = row.original;
      return <Span sx={{ fontSize: 14 }}>{hub?.name || "Not Set"}</Span>;
    }
  },
  {
    Header: "Grain Types",
    accessor: "typical_grain_types",
    minWidth: 200,
    Cell: ({ row }: any) => {
      const { typical_grain_types } = row.original;
      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {typical_grain_types?.slice(0, 3).map((grain: any) => (
            <Chip key={grain.id} label={grain.name} size="small" />
          ))}
          {typical_grain_types?.length > 3 && (
            <Chip label={`+${typical_grain_types.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>
      );
    }
  },
  {
    Header: "Total Orders",
    accessor: "total_orders",
    minWidth: 100,
    Cell: ({ row }: any) => {
      return <Span sx={{ fontSize: 14 }}>{row.original.total_orders || 0}</Span>;
    }
  },
  {
    Header: "Total Supplied (kg)",
    accessor: "total_supplied_kg",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const amount = row.original.total_supplied_kg || 0;
      return <Span sx={{ fontSize: 14 }}>{amount.toLocaleString()}</Span>;
    }
  },
  {
    Header: "Status",
    accessor: "is_verified",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { is_verified } = row.original;
      return (
        <Chip
          label={is_verified ? "Verified" : "Unverified"}
          color={is_verified ? "success" : "warning"}
          size="small"
        />
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
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    }
  },
];

export default SupplierColumnShape;