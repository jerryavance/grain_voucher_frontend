import React, { FC } from 'react';
import { Box, Typography, Avatar, Grid, Card } from '@mui/material';
import { Person, Phone } from '@mui/icons-material';

interface UserGreetingProps {
  user: {
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
}

const UserGreeting: FC<UserGreetingProps> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserInitials = () => {
    if (!user?.first_name || !user?.last_name) return 'U';
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  if (!user) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Welcome to Grain Trading Platform
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
            src={user.avatar}
          >
            {user.avatar ? undefined : getUserInitials()}
          </Avatar>
        </Grid>
        
        <Grid item xs>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {getGreeting()}, {user.first_name}!
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 1 }}>
            {user.first_name} {user.last_name}
          </Typography>
          
          {user.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
              <Phone sx={{ fontSize: 16, mr: 1 }} />
              <Typography variant="body2">
                {user.phone}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid item>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {new Date().toLocaleDateString('en-UG', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default UserGreeting;