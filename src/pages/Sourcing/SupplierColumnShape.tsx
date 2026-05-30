import { FC } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { Span } from "../../components/Typography";
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SupplierDetailsLink id={id} name={business_name} />
          {is_verified && <VerifiedIcon color="success" fontSize="small" />}
        </Box>
      );
    },
  },
  {
    Header: "Contact Person",
    accessor: "user_detail",
    minWidth: 150,
    Cell: ({ row }: any) => {
      const { user_detail } = row.original;
      const name = `${user_detail?.first_name || ""} ${user_detail?.last_name || ""}`.trim();
      return <Span sx={{ fontSize: 14 }}>{name || "—"}</Span>;
    },
  },
  {
    Header: "Phone",
    accessor: "user_detail.phone_number",
    minWidth: 130,
    Cell: ({ row }: any) => {
      const { user_detail } = row.original;
      return <Span sx={{ fontSize: 14 }}>{user_detail?.phone_number || "N/A"}</Span>;
    },
  },
  {
    Header: "Primary Hub",
    accessor: "hub_detail",
    minWidth: 150,
    Cell: ({ row }: any) => {
      // hub_detail is the enriched object returned by SupplierProfileSerializer.
      // The previous fallback to user_detail.hubs[0] / "Maracha Hub" was a leftover
      // stub that masked the real hub for every supplier.
      const hub = row.original.hub_detail;
      return <Span sx={{ fontSize: 14 }}>{hub?.name || "—"}</Span>;
    },
  },
  {
    Header: "Grain Types",
    accessor: "typical_grain_types_detail",
    minWidth: 200,
    Cell: ({ row }: any) => {
      // typical_grain_types_detail = [{id, name}, …] from the serializer.
      // The raw typical_grain_types field is just UUID strings, which is why
      // the column used to render "None specified" for every row.
      const types: Array<{ id: string; name: string }> =
        row.original.typical_grain_types_detail || [];
      if (types.length === 0) {
        return <Span sx={{ fontSize: 14, color: "text.disabled" }}>None specified</Span>;
      }
      return (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {types.slice(0, 3).map((grain) => (
            <Chip key={grain.id} label={grain.name} size="small" />
          ))}
          {types.length > 3 && (
            <Chip label={`+${types.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>
      );
    },
  },
  {
    Header: "Verified",
    accessor: "is_verified",
    minWidth: 100,
    Cell: ({ row }: any) => {
      const { is_verified, verified_at } = row.original;
      if (!is_verified) {
        return <Chip label="Unverified" color="warning" size="small" />;
      }
      return (
        <Chip
          label="Verified"
          color="success"
          size="small"
          // optional: can show date on hover or tooltip
          title={verified_at ? new Date(verified_at).toLocaleDateString() : ""}
        />
      );
    },
  },
  {
    Header: "Action",
    accessor: "action",
    minWidth: 100,
    maxWidth: 100,
    Cell: ({ row }: any) => {
      const data = row.original;
      return <DropdownActionBtn key={row.id} actions={actions} metaData={data} />;
    },
  },
];

export default SupplierColumnShape;