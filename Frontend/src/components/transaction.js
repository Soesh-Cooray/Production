import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Select, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell, IconButton, FormControl, InputLabel,
  MenuItem, styled, CircularProgress, Snackbar, Alert, useTheme, Card,
  TableContainer, Chip, Stack, InputAdornment, Tooltip, Container, Grid
} from '@mui/material';

import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Sort as SortIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon
} from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, categoryAPI, getCurrencySymbol } from '../api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.4)' 
    : '0 4px 20px rgba(0,0,0,0.05)',
  backgroundColor: theme.palette.background.paper,
  backgroundImage: 'none',
  overflow: 'visible'
}));

const StyledTableHeadRow = styled(TableRow)(({ theme }) => ({
  '& th': {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  },
  '& td': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingTop: 16,
    paddingBottom: 16,
  },
  '&:last-child td': {
    borderBottom: 0,
  }
}));

const HoverMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: 8,
  margin: '2px 8px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)',
  },
  '&.Mui-selected': {
     backgroundColor: theme.palette.primary.main + '20',
  }
}));

function TransactionsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [savings, setSavings] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [savingsCategories, setSavingsCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });


  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState(getCurrencySymbol());
  const [sortAmountOrder, setSortAmountOrder] = useState(null);


  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/signin');
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesRes, incomesRes, savingsRes, categoriesRes] = await Promise.all([
        transactionAPI.getExpenses(),
        transactionAPI.getIncomes(),
        transactionAPI.getSavings(),
        categoryAPI.getAll()
      ]);

      setExpenses(expensesRes.data);
      setIncomes(incomesRes.data);
      setSavings(savingsRes.data);
      setAllCategories(categoriesRes.data);


      setExpenseCategories(categoriesRes.data.filter(cat => cat.transaction_type === 'expense'));
      setIncomeCategories(categoriesRes.data.filter(cat => cat.transaction_type === 'income'));
      setSavingsCategories(categoriesRes.data.filter(cat => cat.transaction_type === 'savings'));

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);


      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update available categories when type changes
  useEffect(() => {
    if (type === 'expense') {
      setCategory('');
    } else if (type === 'income') {
      setCategory('');
    } else if (type === 'savings') {
      setCategory('');
    }
  }, [type]);

  useEffect(() => {
    const updateCurrency = () => setCurrencySymbol(getCurrencySymbol());
    window.addEventListener('currencyChange', updateCurrency);
    return () => window.removeEventListener('currencyChange', updateCurrency);
  }, []);



  const handleOpenAddDialog = () => {

    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setType('expense');
    setEditingTransaction(null);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddTransaction = async () => {
    if (!description || !amount || !date || !category) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
      return;
    }
    if (parseFloat(amount) < 0) {
      setSnackbar({
        open: true,
        message: 'Amount cannot be negative',
        severity: 'error'
      });
      return;
    }
    if (new Date(date) > new Date()) {
      setSnackbar({
        open: true,
        message: 'Date cannot be in the future',
        severity: 'error'
      });
      return;
    }
    try {
      const transactionData = {
        description,
        amount: parseFloat(amount),
        date,
        category,
        transaction_type: type
      };
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, transactionData);
        setSnackbar({
          open: true,
          message: 'Transaction updated successfully',
          severity: 'success'
        });
      } else {
        await transactionAPI.create(transactionData);
        setSnackbar({
          open: true,
          message: 'Transaction added successfully',
          severity: 'success'
        });
      }
      handleCloseAddDialog();
      fetchData();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save transaction',
        severity: 'error'
      });
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setDate(transaction.date);
    setCategory(transaction.category);
    setType(transaction.transaction_type);
    setOpenAddDialog(true);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      await transactionAPI.delete(transactionToDelete.id);
      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully',
        severity: 'success'
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete transaction',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Filter transactions based on search term, type filter, and category filter
  const filteredTransactions = () => {
    let transactions = [...expenses, ...incomes, ...savings];


    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      transactions = transactions.filter(t =>
        t.description.toLowerCase().includes(search)
      );
    }


    if (filterType !== 'all') {
      transactions = transactions.filter(t => t.transaction_type === filterType);
    }


    if (filterCategory !== 'all') {
      transactions = transactions.filter(t => t.category === parseInt(filterCategory));
    }


    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortAmountOrder) {
      transactions.sort((a, b) => sortAmountOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount);
    }
    return transactions;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
        <Button onClick={fetchData} variant="outlined" color="primary">Retry</Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}>
            Transactions
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your financial activity
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            fontWeight: 'bold',
            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)',
            textTransform: 'none'
          }}
        >
          New Transaction
        </Button>
      </Box>

      {/* Filters Card */}
      <StyledCard sx={{ mb: 4, px: 2, py: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search transactions..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
          />

          <Stack direction="row" spacing={2} width={{ xs: '100%', md: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="income"><Stack direction="row" alignItems="center" gap={1}><TrendingUpIcon fontSize="small" color="success"/> Income</Stack></MenuItem>
                <MenuItem value="expense"><Stack direction="row" alignItems="center" gap={1}><TrendingDownIcon fontSize="small" color="error"/> Expense</Stack></MenuItem>
                <MenuItem value="savings"><Stack direction="row" alignItems="center" gap={1}><SavingsIcon fontSize="small" color="info"/> Savings</Stack></MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {allCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </StyledCard>

      {/* Transactions Table */}
      {filteredTransactions().length > 0 ? (
        <StyledCard>
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <StyledTableHeadRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell 
                    onClick={() => setSortAmountOrder(sortAmountOrder === 'asc' ? 'desc' : 'asc')}
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <Box display="flex" alignItems="center">
                      Amount
                      {sortAmountOrder && (
                        <SortIcon fontSize="small" sx={{ ml: 1, transform: sortAmountOrder === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </StyledTableHeadRow>
              </TableHead>
              <TableBody>
                {filteredTransactions().map((transaction) => (
                  <StyledTableRow key={transaction.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="textPrimary">
                        {transaction.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.category_name || 'Uncategorized'} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          transaction.transaction_type === 'income' ? <TrendingUpIcon /> :
                          transaction.transaction_type === 'expense' ? <TrendingDownIcon /> :
                          <SavingsIcon />
                        }
                        label={transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                        size="small"
                        color={
                          transaction.transaction_type === 'income' ? 'success' :
                          transaction.transaction_type === 'expense' ? 'error' : 'info'
                        }
                        variant="soft" // If not supported, defaults to filled/outlined logic usually or use transparent
                        sx={{ 
                          borderRadius: 2,
                          backgroundColor: 
                            transaction.transaction_type === 'income' ? 'rgba(46, 125, 50, 0.1)' :
                            transaction.transaction_type === 'expense' ? 'rgba(211, 47, 47, 0.1)' :
                            'rgba(2, 136, 209, 0.1)',
                          color: 
                            transaction.transaction_type === 'income' ? 'rgb(27, 94, 32)' :
                            transaction.transaction_type === 'expense' ? 'rgb(198, 40, 40)' :
                            'rgb(1, 87, 155)',
                          border: 'none'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontWeight="bold"
                        color={
                          transaction.transaction_type === 'income' ? 'success.main' :
                          transaction.transaction_type === 'expense' ? 'error.main' : 'info.main'
                        }
                      >
                        {transaction.transaction_type === 'income' ? '+' : transaction.transaction_type === 'expense' ? '-' : ''}
                        {currencySymbol}{parseFloat(transaction.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEditTransaction(transaction)}
                          size="small"
                          sx={{ color: theme.palette.text.secondary, mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteClick(transaction)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledCard>
      ) : (
        <StyledCard sx={{ minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <Box 
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '50%',
              p: 4,
              mb: 3
            }}
          >
            <MonetizationOnIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          </Box>
          <Typography variant="h6" gutterBottom color="textPrimary">
            No transactions found
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 300, mb: 3 }}>
            {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
              ? "Try adjusting your filters to see more results."
              : "Start by adding your first transaction to track your income and expenses."}
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenAddDialog}
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Add Transaction
          </Button>
        </StyledCard>
      )}

      {/* Dialog and other modals */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        PaperProps={{
          style: {
            borderRadius: 20,
            padding: '10px',
            backgroundImage: 'none'
          },
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                 <TextField
                  fullWidth
                  margin="normal"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Amount"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                 <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    label="Type"
                    sx={{ borderRadius: 3 }}
                  >
                    <HoverMenuItem value="income">Income</HoverMenuItem>
                    <HoverMenuItem value="expense">Expense</HoverMenuItem>
                    <HoverMenuItem value="savings">Savings</HoverMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                    sx={{ borderRadius: 3 }}
                  >
                    {(type === 'expense' ? expenseCategories : type === 'income' ? incomeCategories : savingsCategories).map((cat) => (
                      <HoverMenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </HoverMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseAddDialog}
            sx={{
              borderRadius: 3,
              color: 'text.secondary',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTransaction}
            sx={{
              borderRadius: 3,
              px: 4,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {editingTransaction ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          style: {
            borderRadius: 20,
            padding: '16px',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography color="textSecondary">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ borderRadius: 3, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            sx={{ borderRadius: 3 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TransactionsPage;