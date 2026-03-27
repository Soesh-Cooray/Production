import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Card, Grid, LinearProgress, Box, IconButton, Dialog, DialogTitle, DialogContent, TextField, Select,
    MenuItem, Button, FormControl, InputLabel, Paper, CircularProgress, Snackbar, Alert, useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SavingsIcon from '@mui/icons-material/Savings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { categoryAPI, budgetAPI, transactionAPI, getCurrencySymbol } from '../api';

function BudgetsPage() {
    const theme = useTheme();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
    const [currencySymbol, setCurrencySymbol] = useState(getCurrencySymbol());
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [editingBudget, setEditingBudget] = useState(null);

    useEffect(() => {
        fetchBudgetsCategoriesTransactions();
        const updateCurrency = () => setCurrencySymbol(getCurrencySymbol());
        window.addEventListener('currencyChange', updateCurrency);
        return () => window.removeEventListener('currencyChange', updateCurrency);
    }, []);

    const fetchBudgetsCategoriesTransactions = async () => {
        try {
            setLoading(true);
            const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
                budgetAPI.getAll(),
                categoryAPI.getExpenseCategories(),
                transactionAPI.getExpenses()
            ]);
            setBudgets(budgetsRes.data);
            setCategories(categoriesRes.data);
            setTransactions(transactionsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching budgets, categories, or transactions:', err);
            setError('Failed to load budgets, categories, or transactions');
            setLoading(false);
        }
    };

    const handleAddBudgetOpen = () => {
        setIsAddBudgetDialogOpen(true);
    };

    const handleAddBudgetClose = () => {
        setIsAddBudgetDialogOpen(false);
        setEditingBudget(null);
    };

    const handleEditBudget = (id, budget) => {
        setEditingBudget(budget);
        setIsAddBudgetDialogOpen(true);
    };

    const handleAddNewBudget = async (newBudget) => {
        try {
            const payload = {
                category_id: newBudget.category,
                amount: newBudget.budgetAmount,
                period: newBudget.period,
                start_date: newBudget.startDate
            };
            console.log("Budget payload:", payload);
            if (editingBudget) {
                const res = await budgetAPI.update(editingBudget.id, payload);
                setBudgets(budgets.map(b => b.id === editingBudget.id ? res.data : b));
                setSnackbar({
                    open: true,
                    message: 'Budget updated successfully',
                    severity: 'success'
                });
            } else {
                const res = await budgetAPI.create(payload);
                setBudgets([...budgets, res.data]);
                setSnackbar({
                    open: true,
                    message: 'Budget added successfully',
                    severity: 'success'
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: editingBudget ? 'Failed to update budget' : 'Failed to add budget',
                severity: 'error'
            });
        }
    };

    const handleDeleteBudget = async (id) => {
        try {
            await budgetAPI.delete(id);
            setBudgets(budgets.filter(budget => budget.id !== id));
            setSnackbar({
                open: true,
                message: 'Budget deleted successfully',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to delete budget',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const addMonthsClamped = (date, months) => {
        const base = new Date(date);
        const day = base.getDate();
        base.setDate(1);
        base.setMonth(base.getMonth() + months);
        const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
        base.setDate(Math.min(day, lastDay));
        return base;
    };

    const addYearsClamped = (date, years) => {
        const base = new Date(date);
        const day = base.getDate();
        base.setDate(1);
        base.setFullYear(base.getFullYear() + years);
        const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
        base.setDate(Math.min(day, lastDay));
        return base;
    };

    const getNextPeriodDate = (date, period) => {
        if (period === 'weekly') {
            const next = new Date(date);
            next.setDate(next.getDate() + 7);
            return next;
        }
        if (period === 'yearly') {
            return addYearsClamped(date, 1);
        }
        return addMonthsClamped(date, 1);
    };

    const getActivePeriodRange = (budget) => {
        const start = new Date(budget.start_date);
        if (Number.isNaN(start.getTime())) {
            return null;
        }

        const now = new Date();
        let periodStart = new Date(start);
        let periodEnd = getNextPeriodDate(periodStart, budget.period);
        let guard = 0;

        while (periodEnd <= now && guard < 600) {
            periodStart = periodEnd;
            periodEnd = getNextPeriodDate(periodStart, budget.period);
            guard += 1;
        }

        return { periodStart, periodEnd };
    };

    // Helper to calculate spent for a budget
    const calculateSpent = (budget) => {
        const activeRange = getActivePeriodRange(budget);
        if (!activeRange) {
            return 0;
        }

        const { periodStart, periodEnd } = activeRange;
        return transactions
            .filter(txn => {
                const txnCatId = Number(typeof txn.category === 'object' ? txn.category.id : txn.category);
                const budgetCatId = Number(typeof budget.category === 'object' ? budget.category.id : budget.category);
                return (
                    txnCatId === budgetCatId &&
                    new Date(txn.date) >= periodStart &&
                    new Date(txn.date) < periodEnd
                );
            })
            .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
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
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    mb: 3,
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(53, 75, 99, 0.35), rgba(28, 40, 56, 0.4))'
                        : 'linear-gradient(135deg, #f4fff7, #e9f7ff)',
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Budgets
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Set and track your spending limits
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddBudgetOpen}
                    sx={{
                        borderRadius: 3,
                        px: 2.5,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 700,
                        boxShadow: '0 10px 24px rgba(25, 118, 210, 0.25)',
                    }}
                >
                    Add Budget
                </Button>
            </Box>
            </Paper>

            <Grid container spacing={3} alignItems="flex-start">
                {budgets.map((budget) => {
                    const spent = calculateSpent(budget);
                    const remaining = Number(budget.amount) - spent;
                    const percent = Number(budget.amount) ? Math.min((spent / Number(budget.amount)) * 100, 100) : 0;
                    const categoryName =
                        typeof budget.category === 'object'
                            ? budget.category?.name
                            : categories.find(cat => cat.id === budget.category)?.name || 'Category';
                    return (
                        <Grid item xs={12} sm={6} md={4} key={budget.id}>
                            <BudgetProgressCard
                                name={categoryName}
                                period={budget.period}
                                startDate={budget.start_date}
                                spent={spent}
                                amount={budget.amount}
                                remaining={remaining}
                                percent={percent}
                                onEdit={() => handleEditBudget(budget.id, budget)}
                                onDelete={() => handleDeleteBudget(budget.id)}
                                currencySymbol={currencySymbol}
                            />
                        </Grid>
                    );
                })}
                {budgets.length === 0 && (
                    <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 5,
                                width: '100%',
                                maxWidth: 980,
                                minHeight: 320,
                                borderRadius: 3,
                                borderColor: 'primary.main',
                                borderStyle: 'dashed',
                                borderWidth: 1,
                                mx: 'auto',
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                                    : 'linear-gradient(180deg, #ffffff, #f8fbff)',
                            }}
                        >
                            <SavingsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary" mb={1}>
                                No budgets set up yet
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mb={2}>
                                Create your first budget to start tracking your spending and
                                stay on top of your financial goals.
                            </Typography>
                            <Button variant="contained" color="primary" onClick={handleAddBudgetOpen}>
                                Create Your First Budget
                            </Button>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <AddBudgetDialog
                open={isAddBudgetDialogOpen}
                onClose={handleAddBudgetClose}
                onAddBudget={handleAddNewBudget}
                categories={categories}
                onAddCustomCategory={fetchBudgetsCategoriesTransactions}
                editingBudget={editingBudget}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

function AddBudgetDialog({ open, onClose, onAddBudget, categories, onAddCustomCategory, editingBudget }) {
    const [category, setCategory] = useState('');
    const [budgetAmount, setBudgetAmount] = useState(0);
    const [period, setPeriod] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-CA').split('/').reverse().join('-'));
    const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState('');
    const [newCategoryType, setNewCategoryType] = useState('expense');
    const theme = useTheme();

    useEffect(() => {
        if (editingBudget) {
            // Ensure category is always an ID, not an object
            setCategory(
                typeof editingBudget.category === 'object'
                    ? editingBudget.category?.id || ''
                    : editingBudget.category || ''
            );
            setBudgetAmount(Number(editingBudget.amount));
            setPeriod(editingBudget.period);
            setStartDate(editingBudget.start_date);
        } else {
            setCategory('');
            setBudgetAmount(0);
            setPeriod('monthly');
            setStartDate(new Date().toLocaleDateString('en-CA').split('/').reverse().join('-'));
        }
        setNewCategoryType('expense');
    }, [editingBudget, categories, open]);

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

    const handleBudgetAmountChange = (event) => {
        setBudgetAmount(parseFloat(event.target.value) || 0);
    };

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleAddCustomCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('Category name is required');
            return;
        }
        try {
            await categoryAPI.create({
                name: newCategoryName,
                transaction_type: newCategoryType
            });
            setNewCategoryName('');
            setIsAddingCustomCategory(false);
            setNewCategoryType('expense');
            onAddCustomCategory();
            setError('');
        } catch (err) {
            console.error('Error creating category:', err);
            setError('Failed to create category');
        }
    };

    const handleAddBudget = () => {
        if (!category) {
            setError('Please select a category');
            return;
        }
        if (budgetAmount < 0) {
            setError('Budget amount cannot be negative');
            return;
        }
        onAddBudget({
            category,
            budgetAmount,
            period,
            startDate,
            spent: 0,
            allocated: budgetAmount
        });
        onClose();
    };

    return (
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        border: `1px solid ${theme.palette.divider}`,
                    },
                }}
            >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {!isAddingCustomCategory ? (
                            <>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="category-label" shrink>Category</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        id="category"
                                        value={category}
                                        onChange={handleCategoryChange}
                                        error={!!error}
                                        label="Category"
                                    >
                                        <MenuItem value="">
                                            <em>Select category</em>
                                        </MenuItem>
                                        {categories.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Box mt={1}>
                                    <Button size="small" onClick={() => setIsAddingCustomCategory(true)}>
                                        + Add custom category
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Paper elevation={3}
                                sx={{
                                    p: 2, mt: 1, mb: 2, borderRadius: 2,
                                    background: theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                    boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.7)' : undefined,
                                    border: theme.palette.mode === 'dark' ? '1px solid #333' : '1px solid #e0e0e0',
                                }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: theme.palette.text.primary }}>
                                    Add Custom Category
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={7}>
                                        <TextField
                                            fullWidth
                                            label="New Category Name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            error={!!error}
                                            helperText={error}
                                            sx={{
                                                background: theme.palette.background.default,
                                                borderRadius: 1,
                                                input: { color: theme.palette.text.primary },
                                                label: { color: theme.palette.text.primary },
                                            }}
                                            InputLabelProps={{ style: { color: theme.palette.text.primary, opacity: 0.8 } }}
                                            InputProps={{ style: { color: theme.palette.text.primary } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <FormControl fullWidth>
                                            <InputLabel id="new-category-type-label" sx={{ color: theme.palette.text.primary }}>Type</InputLabel>
                                            <Select
                                                labelId="new-category-type-label"
                                                value={newCategoryType}
                                                label="Type"
                                                onChange={e => setNewCategoryType(e.target.value)}
                                                sx={{
                                                    background: theme.palette.background.default,
                                                    borderRadius: 1,
                                                    color: theme.palette.text.primary,
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            backgroundColor: theme.palette.background.paper,
                                                            color: theme.palette.text.primary,
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="expense">Expense</MenuItem>
                                                <MenuItem value="income">Income</MenuItem>
                                                <MenuItem value="savings">Savings</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Box mt={2} display="flex" gap={1}>
                                    <Button
                                        size="small"
                                        onClick={handleAddCustomCategory}
                                        variant="contained"
                                    >
                                        Add Category
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setIsAddingCustomCategory(false);
                                            setNewCategoryName('');
                                            setNewCategoryType('expense');
                                            setError('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Budget Amount"
                            type="number"
                            value={budgetAmount}
                            onChange={handleBudgetAmountChange}
                            inputProps={{ min: 0, step: 0.01 }}
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="period-label" shrink>Period</InputLabel>
                            <Select
                                labelId="period-label"
                                id="period"
                                value={period}
                                onChange={handlePeriodChange}
                                label="Period"
                            >
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="yearly">Once</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button onClick={onClose} sx={{ mr: 1 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleAddBudget}>
                        {editingBudget ? 'Update Budget' : 'Add Budget'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

const BudgetProgressCard = ({ name, period, startDate, spent, amount, remaining, percent, onEdit, onDelete, currencySymbol }) => {
    const theme = useTheme();

    return (
    <Card sx={{
        p: 3,
        borderRadius: 4,
        boxShadow: theme.palette.mode === 'dark' ? '0 14px 34px rgba(0,0,0,0.35)' : '0 12px 32px rgba(0,0,0,0.12)',
        mb: 2,
        minWidth: 320,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === 'dark'
            ? 'linear-gradient(160deg, rgba(32,42,56,0.95), rgba(25,33,44,0.92))'
            : 'linear-gradient(160deg, rgba(255,255,255,0.98), rgba(244,251,255,0.92))',
        transition: 'all 0.25s ease-in-out',
        '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: theme.palette.mode === 'dark' ? '0 20px 42px rgba(0,0,0,0.42)' : '0 18px 38px rgba(0,0,0,0.2)'
        }
    }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{name}</Typography>
            <Box>
                <IconButton aria-label="edit" onClick={onEdit}><EditIcon /></IconButton>
                <IconButton aria-label="delete" onClick={onDelete}><DeleteIcon /></IconButton>
            </Box>
        </Box>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 0.5 }}>
            {period.charAt(0).toUpperCase() + period.slice(1)} Budget
        </Typography>
        <Box display="flex" alignItems="center" color="text.secondary" sx={{ mb: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 18, mr: 1 }} />
            <Typography variant="body2">Started {new Date(startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ fontWeight: 500 }}>{currencySymbol}{spent.toFixed(2)}</Typography>
            <Typography sx={{ fontWeight: 500 }}>of {currencySymbol}{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#f5f5f5',
                mb: 1,
                '& .MuiLinearProgress-bar': {
                    backgroundColor:
                        percent > 100
                            ? '#b71c1c'
                            : percent > 80
                                ? '#f44336'
                                : percent > 60
                                    ? '#ff9800'
                                    : '#4caf50',
                },
            }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="textSecondary">
                Remaining: {currencySymbol}{Number(remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
            <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                    color:
                        percent > 100
                            ? '#b71c1c'
                            : percent > 80
                                ? '#f44336'
                                : percent > 60
                                    ? '#ff9800'
                                    : undefined
                }}
            >
                {percent.toFixed(0)}%
            </Typography>
        </Box>
    </Card>
    );
};

export default BudgetsPage;