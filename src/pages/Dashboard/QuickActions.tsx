import React, { FC } from 'react';
import { Grid, Card, Button, Typography, Box } from '@mui/material';
import {
  AccountBalance,
  GetApp,
  Receipt,
  Add,
  TrendingUp
} from '@mui/icons-material';

interface QuickActionsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  onViewVouchers: () => void;
  onCreateDeposit: () => void;
}

const QuickActions: FC<QuickActionsProps> = ({
  onDeposit,
  onWithdraw,
  onViewVouchers,
  onCreateDeposit
}) => {
  const actions = [
    {
      title: 'Deposit Money',
      description: 'Add funds to your wallet',
      icon: AccountBalance,
      color: 'success.main',
      onClick: onDeposit
    },
    {
      title: 'Withdraw Funds',
      description: 'Withdraw money from wallet',
      icon: GetApp,
      color: 'warning.main',
      onClick: onWithdraw
    },
    {
      title: 'My Vouchers',
      description: 'View your grain vouchers',
      icon: Receipt,
      color: 'primary.main',
      onClick: onViewVouchers
    },
    {
      title: 'Create Deposit',
      description: 'Deposit grain at hub',
      icon: Add,
      color: 'secondary.main',
      onClick: onCreateDeposit
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={2}>
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Grid item xs={6} sm={3} key={index}>
              <Card 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={action.onClick}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  minHeight: { xs: 80, sm: 100 }
                }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: action.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}
                  >
                    <IconComponent sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.5,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }
                    }}
                  >
                    {action.title}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      lineHeight: 1.2,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {action.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default QuickActions;