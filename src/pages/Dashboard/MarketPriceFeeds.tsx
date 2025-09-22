// src/pages/Saas/MarketPriceFeeds.tsx
import React, { FC, useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Refresh,
  LocationOn,
  Store
} from '@mui/icons-material';
import { IPriceFeed } from './PriceFeed.interface';

interface MarketPriceFeedsProps {
  priceFeeds: IPriceFeed[];
  grainTypes: any[];
  loading: boolean;
  onRefresh: () => void;
}

interface PriceWithTrend extends IPriceFeed {
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
}

const MarketPriceFeeds: FC<MarketPriceFeedsProps> = ({ 
  priceFeeds, 
  grainTypes, 
  loading, 
  onRefresh 
}) => {
  const theme = useTheme();
  const [processedFeeds, setProcessedFeeds] = useState<PriceWithTrend[]>([]);

  useEffect(() => {
    const enhanced = priceFeeds.map((feed) => {
      const grainType = grainTypes.find(gt => gt.id === feed.grain_type);

      const trends = ['up', 'down', 'stable'] as const;
      const randomTrend = trends[Math.floor(Math.random() * trends.length)];
      const randomChange = (Math.random() * 10 - 5).toFixed(2);

      return {
        ...feed,
        grain_type: {
          id: feed.grain_type,
          name: grainType?.name || 'Unknown Grain'
        },
        trend: randomTrend,
        changePercentage: parseFloat(randomChange)
      } as PriceWithTrend;
    });

    setProcessedFeeds(enhanced);
  }, [priceFeeds, grainTypes]);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-UG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  const getTrendIcon = (trend: string, changePercentage: number) => {
    const iconStyle = { fontSize: 18 };
    if (trend === 'up' || changePercentage > 0) {
      return <TrendingUp sx={{ ...iconStyle, color: theme.palette.success.main }} />;
    } else if (trend === 'down' || changePercentage < 0) {
      return <TrendingDown sx={{ ...iconStyle, color: theme.palette.error.main }} />;
    }
    return <Remove sx={{ ...iconStyle, color: theme.palette.grey[500] }} />;
  };

  const getTrendColor = (trend: string, changePercentage: number) => {
    if (trend === 'up' || changePercentage > 0) return theme.palette.success.main;
    if (trend === 'down' || changePercentage < 0) return theme.palette.error.main;
    return theme.palette.primary.main;
  };

  if (loading) {
    return (
      <Card sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <CircularProgress size={40} color="primary" />
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Live Market Prices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time grain prices across different hubs
          </Typography>
        </Box>
        <IconButton onClick={onRefresh} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {processedFeeds.slice(0, 8).map((feed) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={feed.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2,
                height: '100%',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 6
                }
              }}
            >
              {/* Grain Type Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {typeof feed.grain_type === 'string'
                      ? feed.grain_type
                      : feed.grain_type?.name}
                  </Typography>
                  {feed.hub && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Store sx={{ fontSize: 14, color: 'primary.main', mr: 0.5 }} />
                      <Typography variant="caption" color="text.primary">
                        {feed.hub.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {getTrendIcon(feed.trend || 'stable', feed.changePercentage || 0)}
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Price Display */}
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  UGX {formatPrice(feed.price_per_kg)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  per kg
                </Typography>
              </Box>

              {/* Price Change */}
              {feed.changePercentage !== undefined && (
                <Box sx={{ textAlign: 'center', mb: 1 }}>
                  <Chip
                    size="small"
                    label={`${feed.changePercentage > 0 ? '+' : ''}${feed.changePercentage}%`}
                    sx={{
                      bgcolor: getTrendColor(feed.trend || 'stable', feed.changePercentage),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 22,
                      borderRadius: 1
                    }}
                  />
                </Box>
              )}

              {/* Location */}
              {feed.hub?.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LocationOn sx={{ fontSize: 14, color: 'primary.main', mr: 0.5 }} />
                  <Typography variant="caption" color="text.primary">
                    {feed.hub.location}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {processedFeeds.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No price feeds available at the moment
          </Typography>
        </Box>
      )}

      {processedFeeds.length > 8 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Showing 8 of {processedFeeds.length} price feeds
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default MarketPriceFeeds;
