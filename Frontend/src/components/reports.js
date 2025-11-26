import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Container, Paper, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, } from 'chart.js';
import { transactionAPI, getCurrencySymbol } from '../api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const AmountTypography = styled(Typography)(({ theme, color }) => ({
  fontWeight: 'bold',
  color: color === 'income'
    ? '#00C853'
    : color === 'expense'
      ? '#FF3D00'
      : color === 'savings'
        ? '#191CFF'
        : color === 'balance'
          ? theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
          : '#1E88E5',
  fontSize: '2rem',
  marginTop: theme.spacing(1),
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ marginTop: '20px' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('6');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savings, setSavings] = useState([]);
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    netBalance: 0,
    incomeVsExpenses: {
      labels: [],
      income: [],
      expenses: []
    },
    expenseBreakdown: {
      labels: [],
      values: [],
      percentages: [],
      colors: ['#ff6767', '#ff7878', '#ff8989', '#ffaaaa', '#ffcfcf', '#ffe3e3', '#ffeeee']
    },
    categorySpendingOverTime: {
      labels: [],
      datasets: []
    },
    incomeBreakdown: {
      labels: [],
      values: [],
      percentages: [],
      colors: ['#47894b', '#5ea758', '#8bbd78', '#98c377', '#7be382']
    },
    savingsBreakdown: {
      labels: [],
      values: [],
      percentages: [],
      colors: ['#1c96c5', '#20a7db', '#62c1e5', '#a0d9ef', '#cfecf7', '#d2ebff']
    }
  });
  const [currencySymbol, setCurrencySymbol] = useState(getCurrencySymbol());

  useEffect(() => {
    fetchData();
    const updateCurrency = () => setCurrencySymbol(getCurrencySymbol());
    window.addEventListener('currencyChange', updateCurrency);
    return () => window.removeEventListener('currencyChange', updateCurrency);
  }, [timeRange]);

  // Helper to filter transactions by selected time range
  const filterByTimeRange = (items) => {
    const range = parseInt(timeRange);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - (range - 1), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    return items.filter(item => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, incomesRes, savingsRes] = await Promise.all([
        transactionAPI.getExpenses(),
        transactionAPI.getIncomes(),
        transactionAPI.getSavings()
      ]);
      const expenses = expensesRes.data;
      const incomes = incomesRes.data;
      const savingsTxns = savingsRes.data;
      setSavings(savingsTxns);

      // Filter by time range for totals
      const filteredIncomes = filterByTimeRange(incomes);
      const filteredExpenses = filterByTimeRange(expenses);
      const filteredSavings = filterByTimeRange(savingsTxns);


      const totalIncome = filteredIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
      const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const totalSavings = filteredSavings.reduce((sum, saving) => sum + parseFloat(saving.amount), 0);
      const netBalance = totalIncome - totalExpenses - totalSavings;


      const months = getMonthsForTimeRange();
      const incomeVsExpenses = processIncomeVsExpensesData(incomes, expenses, months);



      const expenseBreakdown = processExpenseBreakdownData(filteredExpenses);
      const incomeBreakdown = processIncomeBreakdownData(filteredIncomes);
      const savingsBreakdown = processSavingsBreakdownData(filteredSavings);
      const categorySpending = processAllCategorySpendingOverTime(expenses, incomes, savingsTxns, months);

      setFinancialData({
        totalIncome,
        totalExpenses,
        totalSavings,
        netBalance,
        incomeVsExpenses,
        expenseBreakdown,
        categorySpendingOverTime: categorySpending,
        incomeBreakdown,
        savingsBreakdown
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError('Failed to load reports data');
      setLoading(false);
    }
  };

  const getMonthsForTimeRange = () => {
    const months = [];
    const today = new Date();
    const range = parseInt(timeRange);

    for (let i = range - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    return months;
  };

  const processIncomeVsExpensesData = (incomes, expenses, months) => {
    const incomeData = new Array(months.length).fill(0);
    const expenseData = new Array(months.length).fill(0);


    incomes.forEach(income => {
      const date = new Date(income.date);
      const monthIndex = months.indexOf(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
      if (monthIndex !== -1) {
        incomeData[monthIndex] += parseFloat(income.amount);
      }
    });


    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthIndex = months.indexOf(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
      if (monthIndex !== -1) {
        expenseData[monthIndex] += parseFloat(expense.amount);
      }
    });

    return {
      labels: months,
      income: incomeData,
      expenses: expenseData
    };
  };

  const processExpenseBreakdownData = (expenses) => {
    const categoryTotals = {};
    let totalExpenses = 0;

    // Calculate totals per category
    expenses.forEach(expense => {
      const category = expense.category_name || 'Uncategorized';
      const amount = parseFloat(expense.amount);
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      totalExpenses += amount;
    });


    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    const percentages = values.map(value => ((value / totalExpenses) * 100).toFixed(1));

    return {
      labels,
      values,
      percentages,
      colors: financialData.expenseBreakdown.colors.slice(0, labels.length)
    };
  };

  const processAllCategorySpendingOverTime = (expenses, incomes, savings, months) => {
    // Helper to get unique categories for each type
    const getCategories = (arr, key = 'category_name') =>
      [...new Set(arr.map(item => item[key] || 'Uncategorized'))];

    const expenseCategories = getCategories(expenses);
    const incomeCategories = getCategories(incomes);
    const savingsCategories = getCategories(savings);

    // Colors
    const expenseColors = financialData.expenseBreakdown.colors;
    const incomeColors = financialData.incomeBreakdown.colors;
    const savingsColors = financialData.savingsBreakdown.colors;

    // Build datasets for each type
    const datasets = [
      ...expenseCategories.map((category, idx) => ({
        label: `Expense: ${category}`,
        data: months.map((month) =>
          expenses
            .filter(e => (e.category_name || 'Uncategorized') === category &&
              new Date(e.date).toLocaleString('default', { month: 'short', year: 'numeric' }) === month)
            .reduce((sum, e) => sum + parseFloat(e.amount), 0)
        ),
        backgroundColor: expenseColors[idx % expenseColors.length],
        stack: 'Expenses',
      })),
      ...incomeCategories.map((category, idx) => ({
        label: `Income: ${category}`,
        data: months.map((month) =>
          incomes
            .filter(i => (i.category_name || 'Uncategorized') === category &&
              new Date(i.date).toLocaleString('default', { month: 'short', year: 'numeric' }) === month)
            .reduce((sum, i) => sum + parseFloat(i.amount), 0)
        ),
        backgroundColor: incomeColors[idx % incomeColors.length],
        stack: 'Income',
      })),
      ...savingsCategories.map((category, idx) => ({
        label: `Savings: ${category}`,
        data: months.map((month) =>
          savings
            .filter(s => (s.category_name || 'Uncategorized') === category &&
              new Date(s.date).toLocaleString('default', { month: 'short', year: 'numeric' }) === month)
            .reduce((sum, s) => sum + parseFloat(s.amount), 0)
        ),
        backgroundColor: savingsColors[idx % savingsColors.length],
        stack: 'Savings',
      })),
    ];

    return {
      labels: months,
      datasets,
    };
  };

  const processIncomeBreakdownData = (incomes) => {
    const sourceTotals = {};
    let totalIncome = 0;

    // Calculate totals per source
    incomes.forEach(income => {

      const source = income.category_name || 'Uncategorized';
      const amount = parseFloat(income.amount);
      sourceTotals[source] = (sourceTotals[source] || 0) + amount;
      totalIncome += amount;
    });


    const labels = Object.keys(sourceTotals);
    const values = Object.values(sourceTotals);
    const percentages = values.map(value => ((value / totalIncome) * 100).toFixed(1));

    return {
      labels,
      values,
      percentages,
      colors: financialData.incomeBreakdown.colors.slice(0, labels.length)
    };
  };

  const processSavingsBreakdownData = (savings) => {
    const categoryTotals = {};
    let totalSavings = 0;

    // Calculate totals per category
    savings.forEach(saving => {
      const category = saving.category_name || 'Uncategorized';
      const amount = parseFloat(saving.amount);
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      totalSavings += amount;
    });

    // Convert to arrays for chart
    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    const percentages = values.map(value => ((value / totalSavings) * 100).toFixed(1));

    return {
      labels,
      values,
      percentages,
      colors: financialData.savingsBreakdown.colors.slice(0, labels.length)
    };
  };

  // Chart configurations
  const incomeExpenseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
          borderDash: [5, 5],
        },
        ticks: {
          callback: (value) => `${value}`,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${currencySymbol}${context.parsed.y.toLocaleString()}`,
        },
      },
    },
  };


  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${currencySymbol}${value.toLocaleString()})`;
          },
        },
      },
    },
    cutout: '70%',
  };



  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${currencySymbol}${value.toLocaleString()})`;
          },
        },
      },
    },
  };


  const categorySpendingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
          borderDash: [5, 5],
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            return `${context.dataset.label}: ${currencySymbol}${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Financial Reports
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Visualize your financial trends and patterns
        </Typography>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-label">Last</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="1">This month</MenuItem>
            <MenuItem value="3">Last 3 months</MenuItem>
            <MenuItem value="6">Last 6 months</MenuItem>
            <MenuItem value="12">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <Card sx={{ height: '100%', minHeight: 150, width: '100%', padding: 2, }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Total Income
                </Typography>
                <AmountTypography color="income">
                  {currencySymbol}{financialData.totalIncome.toLocaleString()}
                </AmountTypography>
              </Box>
            </Card>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <Card sx={{ height: '100%', minHeight: 150, width: '100%', padding: 2, }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Total Expenses
                </Typography>
                <AmountTypography color="expense">
                  {currencySymbol}{financialData.totalExpenses.toLocaleString()}
                </AmountTypography>
              </Box>
            </Card>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <Card sx={{ height: '100%', minHeight: 150, width: '100%', padding: 2, }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Total Savings
                </Typography>
                <AmountTypography color="savings">
                  {currencySymbol}{financialData.totalSavings?.toLocaleString()}
                </AmountTypography>
              </Box>
            </Card>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <Card sx={{ height: '100%', minHeight: 150, width: '100%', padding: 2, }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Net Balance
                </Typography>
                <AmountTypography color="balance">
                  {currencySymbol}{financialData.netBalance.toLocaleString()}
                </AmountTypography>
              </Box>
            </Card>
          </StyledCard>
        </Grid>
      </Grid>

      <Paper sx={{
        mb: 4,
        borderRadius: 4
      }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider', borderRadius: 4 }}
        >
          <Tab label="Overview" />
          <Tab label="Expenses" />
          <Tab label="Income" />
          <Tab label="Savings" />
          <Tab label="Trends" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <StyledCard>
                <Card sx={{ height: 500, width: '100%', }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Income vs Expenses
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your financial balance over time
                    </Typography>
                    <Box height={350}>
                      <Bar
                        data={{
                          labels: financialData.incomeVsExpenses.labels,
                          datasets: [
                            {
                              label: 'Income',
                              data: financialData.incomeVsExpenses.income,
                              backgroundColor: '#00C853',
                              barThickness: 20,
                            },
                            {
                              label: 'Expenses',
                              data: financialData.incomeVsExpenses.expenses,
                              backgroundColor: '#FF3D00',
                              barThickness: 20,
                            },
                          ],
                        }}
                        options={incomeExpenseChartOptions}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </StyledCard>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Category Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Breakdown of your spending by category
              </Typography>
              <Box height={400} display="flex" justifyContent="center">
                <Box width="70%" height="100%">
                  <Pie
                    data={{
                      labels: financialData.expenseBreakdown.labels,
                      datasets: [{
                        data: financialData.expenseBreakdown.values,
                        backgroundColor: financialData.expenseBreakdown.colors,
                        borderWidth: 0,
                      }],
                    }}
                    options={pieOptions}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Income Sources Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Distribution of your income by source
              </Typography>
              <Box height={400} display="flex" justifyContent="center">
                <Box width="70%" height="100%">
                  <Pie
                    data={{
                      labels: financialData.incomeBreakdown?.labels || [],
                      datasets: [{
                        data: financialData.incomeBreakdown?.values || [],
                        backgroundColor: financialData.incomeBreakdown?.colors || [],
                        borderWidth: 0,
                      }],
                    }}
                    options={pieOptions}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Savings Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Distribution of your savings by category
              </Typography>
              <Box height={400} display="flex" justifyContent="center">
                <Box width="70%" height="100%">
                  <Pie
                    data={{
                      labels: financialData.savingsBreakdown.labels,
                      datasets: [{
                        data: financialData.savingsBreakdown.values,
                        backgroundColor: financialData.savingsBreakdown.colors,
                        borderWidth: 0,
                      }],
                    }}
                    options={{
                      ...pieOptions,
                      plugins: {
                        ...pieOptions.plugins,
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${percentage}% (${currencySymbol}${value.toLocaleString()})`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Income Vs Expenses Vs Savings Over Time
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Track how your spending, income & savings change over time
              </Typography>
              <Box height={400}>
                {console.log('Trends Bar Data:', financialData.categorySpendingOverTime)}
                <Bar
                  data={financialData.categorySpendingOverTime}
                  options={categorySpendingOptions}
                />
              </Box>
            </CardContent>
          </StyledCard>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Reports;