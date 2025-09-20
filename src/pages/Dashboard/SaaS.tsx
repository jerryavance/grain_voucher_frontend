import { debounce } from 'lodash';
import { Box, Grid, useTheme, Button } from "@mui/material";
import { FC , useEffect, useState} from "react";
import Analytics from "./Analytics/Analytics";
import Portfolio from "./Analytics/Portfolio";
import SaaSCard from "./Card";
import Footer from "./Footer";
import Performance from "./Performance/Performance";
import PerformanceLine from "./Performance/PerformanceLine";
import useTitle from "../../hooks/useTitle";
import BucketIcon from "../../icons/BucketIcon";
import EarningIcon from "../../icons/EarningIcon";
import PeopleIcon from "../../icons/PeopleIcon";
import WindowsLogoIcon from "../../icons/WindowsLogoIcon";
import { useNavigate } from 'react-router-dom';
import { use } from "i18next";
import useAuth from "../../hooks/useAuth";
import { DashboardService } from "./services/Dashboard.service";
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { FilterFormValidations } from './models/Validations';
import { useFormik } from 'formik';
import { getInitialValues } from '../../utils/form_factory';
import { FilterFormFields } from './models/FilterForm';
import TableFilter from '../../components/UI/TableFilter';
import { H6, H4 } from "../../components/Typography";

const SaaS: FC = () => {
  // change navbar title
  useTitle("Dashboard");

  const theme = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const { user }: any = useAuth();
  const [cardHeight, setCardHeight] = useState<string | number>(0);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<any>({
    // Set default date range for the last one month
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const handleFilterSubmit = () => {
    const values = filterForm.values;
    setFilters((prevFilters: any) => ({ ...prevFilters, ...values }));
  };

  const filterFormFields = FilterFormFields();
  const filterForm = useFormik({
    initialValues: getInitialValues(filterFormFields),
    validateOnMount: true,
    validateOnChange: true,
    validationSchema: FilterFormValidations,
    onSubmit: handleFilterSubmit,
  });

  const fetchData = async ( filters:any ) => {
    setLoading(true);
    try {
      const response = await DashboardService.getDashboardSummary();
      setDashboardData(response);
      setLoading(false);
    } catch (error) {
      // Handle errors here
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(filters);
  }, [filters]); // Make sure to include filters if they affect data fetching
  
  const formatNumberWithCommas = (number: number) => {
    return number.toLocaleString();
  };


  const cardList = [
    {
      price: formatNumberWithCommas(dashboardData?.wallet_balance || 0),
      Icon: EarningIcon,
      title: "Net Invested (UGX)",
      color: theme.palette.primary.main,
    },
    {
      price: formatNumberWithCommas(dashboardData?.wallet_balance || 0),
      title: "Wallet Balance (UGX)",
      Icon: EarningIcon,
      color: theme.palette.primary.purple,
    },
  ];

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
    setCardHeight(open ? 0 : 'auto');
  };

  const handleFilterClear = () => {
    // Reset the filter form
    filterForm.resetForm();
    // Reset the date range to the default last one month
    const defaultFilters = {
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    };
    setFilters(defaultFilters);
    // Fetch data with the default filters
    fetchData(defaultFilters);
  }

  const handleDeposit = (data: any) => {
    navigate('/transactions/deposit')
  }

  const handleWithdraw = (data: any) => {
    navigate('/transactions/withdraw')
  }
  
  return (
    <Box pt={2} pb={4}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <H4>Welcome {user?.first_name} {user?.last_name} !</H4>
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end"> {/* Use justifyContent to move the filter button to the right */}
        <Button variant="contained" size="small" sx={{ margin: "0 0.5rem 2rem 0" }} onClick={() => handleDeposit({ formType: 'Save'})}>
          Deposit
        </Button>

        <Button variant="contained" size="small" sx={{ margin: "0 0.5rem 2rem 0" }} onClick={() => handleWithdraw({ formType: 'Save'})}>
          Withdraw
        </Button>

        <Button onClick={handleToggle} sx={{ paddingX: '1px', margin: "0 0 2rem 0" }} variant="contained" color="primary">
          {!open ? <FilterListIcon /> : <FilterListOffIcon />}
        </Button>
      </Grid>
      
      <TableFilter
        loading={loading}
        height={cardHeight}
        formInstance={filterForm}
        validations={FilterFormValidations}
        formFields={filterFormFields}
        onSubmit={handleFilterSubmit}
        onClear={handleFilterClear}
      />


      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {cardList.map((card, index) => (
          <Grid item lg={3} xs={6} key={index}>
            <SaaSCard card={card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} pt={4}>
        <Grid item lg={8} md={7} xs={12}>
          <PerformanceLine />
        </Grid>
        <Grid item lg={4} md={5} xs={12}>
          <Portfolio />
        </Grid>

        <Grid item lg={8} md={7} xs={12}>
          <Performance />
        </Grid>
        
        <Grid item lg={4} md={5} xs={12}>
          <Analytics />
        </Grid>

        <Grid item xs={12}>
          <Footer imageLink="/static/illustration/sass-dashboard.svg" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SaaS;