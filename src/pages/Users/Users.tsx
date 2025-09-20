import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import useTitle from "../../hooks/useTitle";
import { useModalContext } from "../../contexts/ModalDialogContext";
import { UserService } from "./User.service";
import { IUsersResults } from "./Users.interface";
import { IUser } from "../Account/UserProfile/models/User.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import UserColumnShape from "./UserColumnShape";
import EditIcon from "@mui/icons-material/Edit";
import UserForm from "./UserForm";
import { INITIAL_PAGE_SIZE } from "../../api/constants";

const Users = () => {
  useTitle("Users");
  const { setShowModal } = useModalContext();

  const [editUser, setEditUser] = useState<IUser | null>(null);
  const [formType, setFormType] = useState<"Save" | "Update">("Save");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<IUsersResults>();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    

    fetchData(filters);
  }, [filters]);

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      const resp: IUsersResults = await UserService.getUsers(params);
      setUsers(resp);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching Teams:", error);
    }
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      const results: any = await UserService.getUsers(searchQuery);
      setUsers(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormType("Save");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleDeactivateUser = async (user: IUser) => {
    try {
      await UserService.deactivateUser(user?.id);
      toast.success("User deactivated successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleEditUser = (user: IUser) => {
    setFormType("Update");
    setEditUser(user);
    setTimeout(() => {
      setShowModal(true);
    });
  };  

  const tableActions: IDropdownAction[] = [
    {
      label: "Edit",
      icon: <EditIcon color="primary" />,
      onClick: (user: IUser) => handleEditUser(user),
    },
    {
      label: "Deactivate User",
      icon: <DeleteIcon color="error" />,
      onClick: (user: IUser) => handleDeactivateUser(user),
    },
  ];  

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput
          value={searchQuery}
          onChange={handleInputChange}
          type="text"
          placeholder="Search user..."
        />

        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          onClick={handleOpenModal}
        >
          Create
        </Button>
      </Box>

      <CustomTable
        columnShape={UserColumnShape(tableActions)}
        data={users?.results || []}
        dataCount={users?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({...filters, page})}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) => setFilters({ ...filters, page_size: size })}
        loading={loading}
      />

      <UserForm
        callBack={handleRefreshData}
        formType={formType}
        handleClose={handleCloseModal}
        initialValues={{...editUser, ...editUser?.profile}}
      />
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    alignItems: "center", // This aligns items vertically
    gap: 2, // This adds consistent spacing between elements
    marginBottom: 2,
  },
  createButton: {
    marginLeft: 'auto', // This pushes the button to the right
    height: 'fit-content', // Ensures button height matches the input
  },
  pageSize: {
    maxWidth: 60,
    marginLeft: 2,
  }
}

export default Users;
