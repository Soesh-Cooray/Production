import React from 'react';
import { AppBar, Box, Button, Card, Grid, LinearProgress, Typography } from '@mui/material';
import InsertChart from '@mui/icons-material/InsertChart';
import CalendarToday from '@mui/icons-material/CalendarToday';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import SavingsIcon from '@mui/icons-material/Savings';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <Box sx={{ backgroundColor: '#f0f7ff', overflow: 'auto', minHeight: '100vh', width: '100%' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', padding: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ color: 'blue', fontWeight: 'bold' }}>
                $
              </Typography>
              <Typography variant="h6" sx={{ marginLeft: 1 }}>
                BudgetMaster
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box>
              <Button component={Link} to="/signin" sx={{ marginRight: 1 ,'&:hover': {backgroundColor: '#4caf50',color: 'white'}}}>Login</Button>
              <Button variant="contained" sx={{ backgroundColor: 'blue', color: 'white' }} component={Link} to="/signup">
                Sign Up
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AppBar>

  
      <Box sx={{ padding: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ marginBottom: 5, marginTop: 10 }}>
              Take Control Of Your Finances
            </Typography>
            <Typography variant="h4">
              Track expenses, set budgets, and achieve your 
            </Typography>
            <Typography variant="h4" paragraph>
              Financial goals with BudgetMaster.
            </Typography>
            
            <Button variant="contained" sx={{ marginRight: 1, marginTop: 2 }} component={Link} to="/signup">
              Get Started →
            </Button>
            <Button 
              component={Link} to="/signin" 
              sx={{ 
                marginTop: 2,'&:hover': {backgroundColor: '#4caf50',color: 'white'}
            }}
            >
            Login
            </Button>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ padding: 2, borderRadius: 4, width: '80%', height: '200px', marginLeft: 20, marginTop: 15 }} elevation={10}>
              <Typography variant="h4" gutterBottom>
                Your Budget Overview
              </Typography>
              <LinearProgress variant="determinate" value={50} sx={{ marginBottom: 1, borderRadius: 4, backgroundColor: 'lightgray', '& .MuiLinearProgress-bar': { backgroundColor: 'blue', borderRadius: 4 }, height: 16 }} />
              <LinearProgress variant="determinate" value={25} sx={{ marginBottom: 1, borderRadius: 4, backgroundColor: 'lightgray', '& .MuiLinearProgress-bar': { backgroundColor: 'red', borderRadius: 4 }, height: 16 }} />
              <LinearProgress variant="determinate" value={75} sx={{ marginBottom: 1, borderRadius: 4, backgroundColor: 'lightgray', '& .MuiLinearProgress-bar': { backgroundColor: 'green', borderRadius: 4 }, height: 16 }} />
              <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                <Box display="flex" alignItems="center">
                  <SavingsIcon />
                  <Typography variant="body2" sx={{ marginLeft: 1 }}>Savings Goal</Typography>
                </Box>
                <Typography variant="body2">$12,000</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>


      <Box textAlign="center" padding={4} sx={{ overflow: 'visible' }}>
        <Typography variant="h4" sx={{ marginTop: 5, marginBottom: 7, fontWeight: 'bold' }}>
          Why Choose BudgetMaster
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={3}>
            <Card sx={{ padding: 3, textAlign: 'left', borderRadius: 4, width: '320px', height: '200px' }} elevation={10}>
              <InsertChart />
              <Typography variant="h5" sx={{ marginTop: 3 }} gutterBottom>
                Expense Tracking
              </Typography>
              <Typography variant="body1">
                Easily track and categorize your expenses 
                to see where your money goes.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ padding: 3, textAlign: 'left', borderRadius: 4, width: '320px', height: '200px' }} elevation={10}>
              <CalendarToday />
              <Typography variant="h5" sx={{ marginTop: 3 }} gutterBottom>
                Budget Planning
              </Typography>
              <Typography variant="body1">
                Set monthly budgets to see how much more you can spend.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ padding: 3, textAlign: 'left', borderRadius: 4, width: '320px', height: '200px' }} elevation={10}>
              <MonetizationOn />
              <Typography variant="h5" sx={{ marginTop: 3 }} gutterBottom>
                Financial Reports
              </Typography>
              <Typography variant="body1">
                Get insightful reports and visualize your financial progress over time.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#ECFFFC', padding: 2, textAlign: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h6" sx={{ color: 'blue', fontWeight: 'bold' }}>
            $
          </Typography>
          <Typography variant="h6" sx={{ marginLeft: 1 }}>
            BudgetMaster
          </Typography>
        </Box>
        <Typography variant="body2">
          © 2025 BudgetMaster. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default HomePage;