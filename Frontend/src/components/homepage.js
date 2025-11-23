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
              <Button component={Link} to="/signin" sx={{ marginRight: 1, '&:hover': { backgroundColor: '#4caf50', color: 'white' } }}>Login</Button>
              <Button variant="contained" sx={{ backgroundColor: 'blue', color: 'white' }} component={Link} to="/signup">
                Sign Up
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AppBar>


      <Box sx={{ padding: { xs: 2, md: 4 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ marginBottom: 5, marginTop: { xs: 5, md: 10 }, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
              Take Control Of Your Finances
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              Track expenses, set budgets, and achieve your
            </Typography>
            <Typography variant="h4" paragraph sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              Financial goals with BudgetMaster.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, marginTop: 2 }}>
              <Button variant="contained" component={Link} to="/signup" fullWidth sx={{ maxWidth: { sm: 'fit-content' } }}>
                Get Started →
              </Button>
              <Button
                component={Link} to="/signin"
                fullWidth
                sx={{
                  maxWidth: { sm: 'fit-content' },
                  '&:hover': { backgroundColor: '#4caf50', color: 'white' }
                }}
              >
                Login
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} display="flex" justifyContent="center">
            <Card sx={{ padding: 2, borderRadius: 4, width: '100%', maxWidth: 500, height: 'auto', minHeight: '200px', marginTop: { xs: 5, md: 15 } }} elevation={10}>
              <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
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
        <Typography variant="h4" sx={{ marginTop: 5, marginBottom: 7, fontWeight: 'bold', fontSize: { xs: '2rem', md: '2.125rem' } }}>
          Why Choose BudgetMaster
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ padding: 3, textAlign: 'left', borderRadius: 4, height: '100%', minHeight: 200 }} elevation={10}>
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
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ padding: 3, textAlign: 'left', borderRadius: 4, height: '100%', minHeight: 200 }} elevation={10}>
              <CalendarToday />
              <Typography variant="h5" sx={{ marginTop: 3 }} gutterBottom>
                Budget Planning
              </Typography>
              <Typography variant="body1">
                Set monthly budgets to see how much more you can spend.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ padding: 3, textAlign: 'left', borderRadius: 4, height: '100%', minHeight: 200 }} elevation={10}>
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