import { debounce } from 'lodash';
import { Box, Grid, useTheme, Button, Typography, Card, Avatar } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import useTitle from "../../hooks/useTitle";
import useAuth from "../../hooks/useAuth";
import { PriceFeedService } from "../PriceFeed/PriceFeed.service";
import { GrainTypeService } from "../GrainType/GrainType.service";
import { VoucherService } from "../Voucher/Voucher.service";
import VoucherStatsCards from "./VoucherStatsCards";
import MarketPriceFeeds from "./MarketPriceFeeds";
import UserGreeting from "./UserGreeting";
import QuickActions from "./QuickActions";
import { H4 } from "../../components/Typography";
import { IPriceFeedResults, IPriceFeed } from "../PriceFeed/PriceFeed.interface";
import { IGrainTypeResults } from "../GrainType/GrainType.interface";
import { ApiFilters } from "../Voucher/Voucher.interface";

const SaaS: FC = () => {
  useTitle("Dashboard");
  
  const theme = useTheme();
  const navigate = useNavigate();
  const { user }: any = useAuth();

  // State management
  const [dashboardData, setDashboardData] = useState<any>({});
  const [voucherStats, setVoucherStats] = useState<any>({});
  const [priceFeeds, setPriceFeeds] = useState<IPriceFeed[]>([]);
  const [grainTypes, setGrainTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedsLoading, setFeedsLoading] = useState<boolean>(true);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchVoucherStats(),
        fetchPriceFeeds(),
        fetchGrainTypes()
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherStats = async () => {
    try {
      const filters: ApiFilters = { page_size: 1000 };
      const response = await VoucherService.getMyVouchers(filters);
      
      if (response && response.results) {
        const vouchers = response.results;
        const stats = {
          totalVouchers: vouchers.length,
          totalValue: vouchers.reduce((sum: number, voucher: any) => sum + parseFloat(voucher.current_value), 0),
          totalQuantity: vouchers.reduce((sum: number, voucher: any) => sum + parseFloat(voucher.deposit.quantity_kg), 0),
          activeVouchers: vouchers.filter((v: any) => v.status === 'issued').length,
        };
        setVoucherStats(stats);
      }
    } catch (error) {
      console.error("Error fetching voucher stats:", error);
      setVoucherStats({
        totalVouchers: 0,
        totalValue: 0,
        totalQuantity: 0,
        activeVouchers: 0,
      });
    }
  };

  const fetchPriceFeeds = async () => {
    setFeedsLoading(true);
    try {
      const filters = { 
        page_size: 20,
        ordering: '-effective_date'
      };
      const response: IPriceFeedResults = await PriceFeedService.getPriceFeeds(filters);
      
      if (response && response.results) {
        setPriceFeeds(response.results);
      }
    } catch (error) {
      console.error("Error fetching price feeds:", error);
      setPriceFeeds([]);
    } finally {
      setFeedsLoading(false);
    }
  };

  const fetchGrainTypes = async () => {
    try {
      const filters = { page_size: 100 };
      const response: IGrainTypeResults = await GrainTypeService.getGrainTypes(filters);
      
      if (response && response.results) {
        setGrainTypes(response.results);
      }
    } catch (error) {
      console.error("Error fetching grain types:", error);
      setGrainTypes([]);
    }
  };

  const handleDeposit = () => {
    navigate('/transactions/deposit');
  };

  const handleWithdraw = () => {
    navigate('/transactions/withdraw');
  };

  const handleViewVouchers = () => {
    navigate('/vouchers');
  };

  const handleCreateDeposit = () => {
    navigate('/deposits/create');
  };

  return (
    <Box pt={2} pb={4} sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* User Greeting Section */}
      <UserGreeting user={user} />

      {/* Quick Actions */}
      {/* <QuickActions 
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        onViewVouchers={handleViewVouchers}
        onCreateDeposit={handleCreateDeposit}
      /> */}

      {/* Voucher Stats Cards */}
      <VoucherStatsCards 
        stats={voucherStats}
        loading={loading}
      />

      {/* Market Price Feeds */}
      <MarketPriceFeeds 
        priceFeeds={priceFeeds}
        grainTypes={grainTypes}
        loading={feedsLoading}
        onRefresh={fetchPriceFeeds}
      />

      {/* Analytics and Portfolio Section */}
      <Grid container spacing={4} pt={4}>
        <Grid item lg={8} md={7} xs={12}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Market Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track market trends and price movements for better trading decisions.
            </Typography>
            {/* You can integrate your existing analytics component here */}
            <Box sx={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: 2
            }}>
              <Typography color="text.secondary">
                Analytics Chart Coming Soon
              </Typography>
            </Box>
          </Card>
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default SaaS;