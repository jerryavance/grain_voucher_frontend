import { Box, Chip, Tooltip, Typography } from "@mui/material";
import DropdownActionBtn, { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import { IUser } from "./Users.interface";

// ─── Role config ─────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: "Super Admin", color: "#fff",    bg: "#7b1fa2" },
  hub_admin:   { label: "Hub Admin",   color: "#fff",    bg: "#1565c0" },
  bdm:         { label: "BDM",         color: "#fff",    bg: "#0277bd" },
  finance:     { label: "Finance",     color: "#fff",    bg: "#2e7d32" },
  investor:    { label: "Investor",    color: "#fff",    bg: "#e65100" },
  farmer:      { label: "Farmer",      color: "#fff",    bg: "#558b2f" },
  agent:       { label: "Agent",       color: "#1a1a1a", bg: "#fdd835" },
};

const RoleChip = ({ role, is_superuser }: { role: string; is_superuser: boolean }) => {
  const cfg = ROLE_CONFIG[role] ?? { label: role, color: "#fff", bg: "#546e7a" };
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      <Chip
        label={cfg.label}
        size="small"
        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.68rem" }}
      />
      {is_superuser && (
        <Chip
          label="Superuser"
          size="small"
          sx={{ bgcolor: "#b71c1c", color: "#fff", fontWeight: 700, fontSize: "0.68rem" }}
        />
      )}
    </Box>
  );
};

// ─── Column definitions ───────────────────────────────────────────────────────

const UserColumnShape = (actions: IDropdownAction[]) => [
  {
    Header: "Name",
    accessor: "first_name",
    minWidth: 160,
    Cell: ({ row }: any) => {
      const user: IUser = row.original;
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
      return (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.primary">
            {user.phone_number}
          </Typography>
        </Box>
      );
    },
  },
  {
    Header: "Role",
    accessor: "role",
    minWidth: 140,
    Cell: ({ row }: any) => (
      <RoleChip role={row.original.role} is_superuser={row.original.is_superuser} />
    ),
  },
  {
    Header: "Hubs",
    accessor: "hubs",
    minWidth: 180,
    Cell: ({ row }: any) => {
      const hubs: IUser["hubs"] = row.original.hubs ?? [];
      if (hubs.length === 0) {
        return <Typography variant="caption" color="text.primary">No hub</Typography>;
      }
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {hubs.map(h => (
            <Tooltip key={h.id} title={`Status: ${h.status}`} arrow>
              <Chip
                label={h.name}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.68rem", borderColor: "#1565c0", color: "#1565c0" }}
              />
            </Tooltip>
          ))}
        </Box>
      );
    },
  },
  {
    Header: "Location",
    accessor: "profile.location",
    minWidth: 120,
    Cell: ({ row }: any) => (
      <Typography variant="body2" color="text.primary">
        {row.original.profile?.location || "—"}
      </Typography>
    ),
  },
  {
    Header: "Actions",
    accessor: "action",
    minWidth: 80,
    maxWidth: 80,
    Cell: ({ row }: any) => (
      <DropdownActionBtn key={row.id} actions={actions} metaData={row.original} />
    ),
  },
];

export default UserColumnShape;