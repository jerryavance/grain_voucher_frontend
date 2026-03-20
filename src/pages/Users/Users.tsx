import {
  Box, Button, Chip, FormControl, InputLabel,
  MenuItem, Select, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { UserService } from "./User.service";
import { IUser, IUsersResults } from "./Users.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import UserColumnShape from "./UserColumnShape";
import UserForm from "./UserForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

// ─── Role filter options (aligned with actual API roles) ─────────────────────

const ROLE_OPTIONS = [
  { value: "",            label: "All Roles"   },
  { value: "super_admin", label: "Super Admin" },
  { value: "hub_admin",   label: "Hub Admin"   },
  { value: "bdm",         label: "BDM"         },
  { value: "finance",     label: "Finance"     },
  { value: "investor",    label: "Investor"    },
  { value: "farmer",      label: "Farmer"      },
  { value: "agent",       label: "Agent"       },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Users = () => {
  useTitle("Users");
  const { showModal, setShowModal } = useModalContext();

  const [editUser, setEditUser]     = useState<IUser | null>(null);
  const [formType, setFormType]     = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [users, setUsers]           = useState<IUsersResults>();
  const [filters, setFilters]       = useState<any>({ page: 1, page_size: INITIAL_PAGE_SIZE });
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { ...filters };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter)  params.role   = roleFilter;
      const resp: IUsersResults = await UserService.getUsers(params);
      setUsers(resp);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setFilters((f: any) => ({ ...f, page: 1 }));
  };

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const openCreate = () => {
    setFormType("Save");
    setEditUser(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  // ── Row actions ─────────────────────────────────────────────────────────────
  const handleEditUser = (user: IUser) => {
    setFormType("Update");
    setEditUser(user);
    setTimeout(() => setShowModal(true));
  };

  const handleDeactivateUser = async (user: IUser) => {
    if (!window.confirm(`Deactivate ${user.first_name} ${user.last_name}?`)) return;
    try {
      await UserService.deactivateUser(user.id);
      toast.success("User deactivated");
      fetchData();
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  const tableActions: IDropdownAction[] = [
    { label: "Edit",       icon: <EditIcon color="primary" />, onClick: handleEditUser       },
    { label: "Deactivate", icon: <DeleteIcon color="error"  />, onClick: handleDeactivateUser },
  ];

  // ── Role counts for summary chips ───────────────────────────────────────────
  const roleCounts = (users?.results ?? []).reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Box pt={2} pb={4}>

      {/* ── Page header ── */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <PeopleIcon sx={{ fontSize: 36, mr: 1.5, color: "primary.main" }} />
        <Typography variant="h4">Users</Typography>
        <Chip
          label={`${users?.count ?? 0} total`}
          size="small"
          sx={{ ml: 1.5, fontWeight: 600 }}
        />
      </Box>

      {/* ── Role summary chips ── */}
      {users && users.results.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {Object.entries(roleCounts).map(([role, count]) => (
            <Chip
              key={role}
              label={`${role.replace("_", " ")}: ${count}`}
              size="small"
              variant="outlined"
              clickable
              onClick={() => {
                setRoleFilter(role === roleFilter ? "" : role);
                handleFilter();
              }}
              sx={{
                fontWeight: 600,
                fontSize: "0.72rem",
                textTransform: "capitalize",
                borderColor: roleFilter === role ? "#1565c0" : undefined,
                bgcolor:     roleFilter === role ? "#e3f2fd"  : undefined,
                color:       roleFilter === role ? "#1565c0"  : undefined,
              }}
            />
          ))}
        </Box>
      )}

      {/* ── Filters row ── */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
        <SearchInput
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Search by name or phone…"
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={e => { setRoleFilter(e.target.value); handleFilter(); }}
          >
            {ROLE_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleFilter}>
          Search
        </Button>
        <Button
          variant="contained"
          onClick={openCreate}
          sx={{ ml: "auto" }}
        >
          Create User
        </Button>
      </Box>

      {/* ── Table ── */}
      <CustomTable
        columnShape={UserColumnShape(tableActions)}
        data={users?.results || []}
        dataCount={users?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters((f: any) => ({ ...f, page: page + 1 }))}
        pageIndex={filters.page - 1}
        setPageSize={(size: number) => setFilters((f: any) => ({ ...f, page_size: size, page: 1 }))}
        loading={loading}
      />

      {/* ── Form modal ── */}
      {showModal && (
        <UserForm
          callBack={fetchData}
          formType={formType}
          handleClose={handleCloseModal}
          initialValues={{ ...editUser, ...editUser?.profile }}
        />
      )}
    </Box>
  );
};

export default Users;