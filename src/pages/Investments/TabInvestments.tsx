import { debounce } from "lodash";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { FC, useState, useEffect } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import { IInvestment } from "./InvestmentsList/Investment.interface";
import SelectInput from "../../components/UI/FormComponents/SelectInput";
import useTitle from "../../hooks/useTitle";
import InvestmentColumnShape from "./ColumnShape";
import { useNavigate } from "react-router-dom";
import { INITIAL_PAGE_SIZE, TYPE_ADMIN } from "../../api/constants";
import { InvestmentService } from "./InvestmentsList/Investment.service";
import { ViewActionButton } from "../../components/elements/Elements";

const Investment: FC = () => {
  useTitle("Investment");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [InvestmentList, setInvestmentList] = useState<IInvestment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page_size, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [filters, setFilters] = useState<{ type: string }>({
    type: "Investment",
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const debouncedFetchData = debounce(async (query: string) => {
      try {
        setLoading(true);
        const { results, count }: any = await InvestmentService.getInvestments({
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

  const updateData = (data: IInvestment[], count: number) => {
    setInvestmentList(data);
    setCount(count);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleNavigation = (data: any) => {
    navigate("/admin/investment/create", {
      state: { ...data, formTitle: "Create Investment" },
    });
  };

  const handleViewDatails = (id: string) => {
    navigate(`/admin/investment/details/${id}`);
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
          Create Investment
        </Button>
      </Box>

      <CustomTable
        columnShape={InvestmentColumnShape(ViewAction)}
        data={InvestmentList}
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
    marginBottom: 2,
  },
  pageSize: {
    maxWidth: 60,
    marginLeft: 2,
  },
};

export default Investment;
