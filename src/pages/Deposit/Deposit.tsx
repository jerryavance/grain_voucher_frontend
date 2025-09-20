import { debounce } from "lodash";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useState, useEffect } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IDeposit } from "./Deposit.interface";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import useTitle from "../../hooks/useTitle";
import DepositColumnShape from "./ColumnShape";
import { useNavigate } from "react-router-dom";
import { INITIAL_PAGE_SIZE, TYPE_ADMIN } from "../../api/constants";
import { DepositService } from "./Deposit.service";
import { ViewActionButton } from "../../components/elements/Elements";

const Deposit: FC = () => {
  useTitle("Deposit");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [DepositList, setDepositList] = useState<IDeposit[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page_size, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [filters, setFilters] = useState<{ type: string }>({
    type: "Deposit",
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const debouncedFetchData = debounce(async (query: string) => {
      try {
        setLoading(true);
        const { results, count }: any = await DepositService.getDeposits({
          ...filters,
          page_size,
          page: pageIndex,
          search: query,
          role: TYPE_ADMIN,
        });
        updateData(results, count);
        console.log("API RESULTS", results, count);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }, 500);
    debouncedFetchData(searchQuery);

    return () => {
      debouncedFetchData.cancel();
    };
  }, [searchQuery, page_size, pageIndex, filters]);

  const handlePageSizeChanges = (event: SelectChangeEvent) => {
    const pageSize = Number(event.target.value);
    setPageSize(pageSize);
  };

  const updateData = (data: IDeposit[], count: number) => {
    setDepositList(data);
    setCount(count);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleNavigation = (data: any) => {
    navigate("/admin/deposit/create", {
      state: { ...data, formTitle: "Create Deposit" },
    });
  };

  const handleViewDatails = (id: string) => {
    navigate(`/admin/deposit/details/${id}`);
  };

  const ViewAction: FC<{ id: string }> = ({ id }) => {
    return <ViewActionButton onClick={() => handleViewDatails(id)} />;
  };

  return (
    <Box pt={2} pb={4}>
      <Box sx={styles.tablePreHeader}>
        <SearchInput
          value={searchQuery}
          onChange={handleInputChange}
          type="text"
          placeholder="Search user..."
        />
        <SelectInput
          value={page_size}
          onChange={handlePageSizeChanges}
          styles={{ marginLeft: "1rem" }}
        />
        <Button
          sx={{ marginLeft: "auto" }}
          variant="contained"
          onClick={() => handleNavigation({ formType: "Save" })}
        >
          Deposit
        </Button>
      </Box>

      <CustomTable
        columnShape={DepositColumnShape(ViewAction)}
        data={DepositList}
        dataCount={count}
        pageInitialState={{ pageSize: page_size, pageIndex: 0 }}
        setPageIndex={setPageIndex}
        pageIndex={pageIndex}
        setPageSize={setPageSize}
        loading={loading}
      />
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    alignItems: "center", 
    gap: 2, 
    marginBottom: 2,
  },
  createButton: {
    marginLeft: 'auto',
    height: 'fit-content',
  },
  pageSize: {
    maxWidth: 60,
    marginLeft: 2,
  }
}

export default Deposit;
