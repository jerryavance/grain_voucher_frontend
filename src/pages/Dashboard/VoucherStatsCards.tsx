import React, { FC } from 'react';
import { Grid, Card, Typography, CircularProgress, Box } from '@mui/material';
import { Grain, AccountBalance, TrendingUp, Assignment } from '@mui/icons-material';

interface VoucherStatsCardsProps {
  stats: {
    totalVouchers: number;
    totalValue: number;
    totalQuantity: number;
    activeVouchers: number;
  };
  loading: boolean;
}

const VoucherStatsCards: FC<VoucherStatsCardsProps> = ({ stats, loading }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-UG').format(num);
  };

  const statsConfig = [
    {
      title: 'Total Vouchers',
      value: stats.totalVouchers,
      icon: Assignment,
      color: '#1976d2',
      bgcolor: 'primary.main'
    },
    {
      title: 'Total Grain',
      value: `${formatNumber(stats.totalQuantity)}kg`,
      icon: Grain,
      color: 'primary.main',
      bgcolor: 'success.main'
    },
    {
      title: 'Total Value',
      value: `UGX ${formatNumber(stats.totalValue)}`,
      icon: AccountBalance,
      color: '#ed6c02',
      bgcolor: 'primary.main'
    },
    {
      title: 'Active Vouchers',
      value: stats.activeVouchers,
      icon: TrendingUp,
      color: '#9c27b0',
      bgcolor: 'secondary.main'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          My Grain Portfolio
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} sm={6} md={3} key={item}>
              <Card sx={{ 
                p: 2, 
                textAlign: 'center', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 80
              }}>
                <CircularProgress size={30} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        My Grain Portfolio
      </Typography>
      <Grid container spacing={2}>
        {statsConfig.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  bgcolor: stat.bgcolor, 
                  color: 'white',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <IconComponent sx={{ fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  {stat.title}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default VoucherStatsCards;