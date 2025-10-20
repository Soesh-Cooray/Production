import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell, IconButton, FormControl, InputLabel,
  MenuItem, styled, CircularProgress, Snackbar, Alert, useTheme
} from '@mui/material';

import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, categoryAPI, getCurrencySymbol } from '../api';  

const HoverMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: 5,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(22, 163, 74, 0.2)' : '#16a34a',
    color: theme.palette.mode === 'dark' ? '#fff' : '#f9fafb',
  },
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

  
  useEffect(() => {
    fetchData();
  }, []);
  
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

  const fetchData = async () => {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/signin');
  };

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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchData} sx={{ ml: 2 }}>Retry</Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ padding: 2, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Transactions
          </Typography>
          <Typography variant="body1" color="textSecondary">Manage your income and expenses</Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <TextField
            label="Search transactions..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              mr: 1, 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              },
              width: 200,
            }}
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            size="small"
            sx={{ 
              mr: 1, 
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                },
              },
            }}  
          >
            <HoverMenuItem value="all">All Types</HoverMenuItem>
            <HoverMenuItem value="income">Income</HoverMenuItem>
            <HoverMenuItem value="expense">Expense</HoverMenuItem>
            <HoverMenuItem value="savings">Savings</HoverMenuItem>
          </Select>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            size="small"
            sx={{ 
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                },
              },
            }}
          > 
            <HoverMenuItem value="all">All Categories</HoverMenuItem>
            {allCategories.map((cat) => (
              <HoverMenuItem key={cat.id} value={cat.id}>{cat.name}</HoverMenuItem>
            ))}
          </Select>
        </Box>
        <Button 
          variant="contained" 
          sx={{ 
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }} 
          onClick={handleOpenAddDialog}
        >
          + Add Transaction
        </Button>
      </Box>

      {/* Transactions Table or Clean State */}
      {filteredTransactions().length > 0 ? ( 
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(126, 125, 124, 0.29)' : '#e0f7fa' }}>
              <TableCell sx={{ color: theme.palette.text.primary }}>Description</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Date</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Category</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Type</TableCell>
              <TableCell sx={{ color: theme.palette.text.primary, cursor: 'pointer', userSelect: 'none' }} onClick={() => setSortAmountOrder(sortAmountOrder === 'asc' ? 'desc' : 'asc')}>
                Amount
                <span style={{ marginLeft: 4, fontSize: 16 }}>
                  {sortAmountOrder === 'asc' ? '▲' : sortAmountOrder === 'desc' ? '▼' : ''}
                </span>
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.primary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions().map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell sx={{ color: theme.palette.text.primary }}>{transaction.description}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{transaction.date}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{transaction.category_name || 'Unknown'}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {transaction.transaction_type === 'income' ? 'Income' : transaction.transaction_type === 'expense' ? 'Expense' : 'Savings'}
                </TableCell>
                <TableCell
                  sx={{
                    color: transaction.transaction_type === 'income'
                      ? theme.palette.mode === 'dark' ? '#81c784' : 'green'
                      : transaction.transaction_type === 'expense'
                        ? theme.palette.mode === 'dark' ? '#e57373' : 'red'
                        : theme.palette.mode === 'dark' ? '#7986cb' : '#3949ab',
                    fontWeight: 'bold',
                  }}
                >
                  {transaction.transaction_type === 'income' ? '+' : transaction.transaction_type === 'expense' ? '-' : ''}{currencySymbol}{parseFloat(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleEditTransaction(transaction)}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteClick(transaction)}
                    sx={{ color: theme.palette.mode === 'dark' ? '#e57373' : '#f44336' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
          <MonetizationOnIcon sx={{ fontSize: 200, color: theme.palette.mode === 'dark' ? '#90caf9' : '#0EA9FF' }} />
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
            No transactions yet
          </Typography>
          <Typography variant="body2" gutterBottom color="textSecondary">
            Start by adding your first transaction to track your income and expenses
          </Typography>

          <Button 
            variant="contained" 
            onClick={handleOpenAddDialog} 
            sx={{ 
              mt: 2, 
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            + Add Transaction
          </Button>
        </Box>
      )}

   
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        PaperProps={{
          style: {
            borderRadius: 10,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </DialogTitle>
        <DialogContent>
          <TextField 
            label="What was this transaction for" 
            fullWidth 
            margin="normal" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
          <TextField 
            fullWidth 
            margin="normal" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            InputLabelProps={{ shrink: true }}
            label="Date"
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              sx={{
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <HoverMenuItem value="income">Income</HoverMenuItem>
              <HoverMenuItem value="expense">Expense</HoverMenuItem>
              <HoverMenuItem value="savings">Savings</HoverMenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Category</InputLabel>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                backgroundColor: theme.palette.background.paper,
              }}
            >
              {type === 'expense' && expenseCategories.map((cat) => (
                <HoverMenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </HoverMenuItem>
              ))}
              {type === 'income' && incomeCategories.map((cat) => (
                <HoverMenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </HoverMenuItem>
              ))}
              {type === 'savings' && savingsCategories.map((cat) => (
                <HoverMenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </HoverMenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Amount" 
            fullWidth 
            margin="normal" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseAddDialog}
            sx={{ 
              borderRadius: 4,
              color: theme.palette.text.primary,
              '&:hover': { 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 12, 12, 0.2)' : '#FF0C0C',
                color: theme.palette.mode === 'dark' ? '#e57373' : '#f9fafb',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddTransaction}
            sx={{ 
              borderRadius: 4,
              backgroundColor: theme.palette.primary.main,
              '&:hover': { 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(22, 163, 74, 0.2)' : '#16a34a',
                color: theme.palette.mode === 'dark' ? '#81c784' : '#f9fafb',
              },
            }}
          >
            {editingTransaction ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

   
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          style: {
            borderRadius: 10,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.primary }}>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ 
              borderRadius: 4,
              color: theme.palette.text.primary,
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteConfirm}
            sx={{ 
              borderRadius: 4,
              backgroundColor: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TransactionsPage;