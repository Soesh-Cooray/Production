import React, { useEffect, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Card,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	LinearProgress,
	MenuItem,
	Paper,
	Select,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SavingsIcon from '@mui/icons-material/Savings';
import CloseIcon from '@mui/icons-material/Close';
import { categoryAPI, getCurrencySymbol, savingsGoalAPI } from '../api';

const getGoalPercent = (goal) => {
	const target = Number(goal.target_amount || 0);
	const current = Number(goal.current_amount || 0);
	if (!target) {
		return 0;
	}
	return Math.min((current / target) * 100, 100);
};

function SavingsGoalsPage() {
	const [goals, setGoals] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingGoal, setEditingGoal] = useState(null);
	const [currencySymbol, setCurrencySymbol] = useState(getCurrencySymbol());
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success',
	});

	const [title, setTitle] = useState('');
	const [category, setCategory] = useState('');
	const [targetAmount, setTargetAmount] = useState(0);
	const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
	const [targetDate, setTargetDate] = useState('');
	const [notes, setNotes] = useState('');

	const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [formError, setFormError] = useState('');

	const fetchData = async () => {
		try {
			setLoading(true);
			const [goalsRes, categoriesRes] = await Promise.all([
				savingsGoalAPI.getAll(),
				categoryAPI.getSavingsCategories(),
			]);
			setGoals(goalsRes.data);
			setCategories(categoriesRes.data);
			setLoading(false);
		} catch (err) {
			console.error('Error loading savings goals:', err);
			setError('Failed to load savings goals');
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		const updateCurrency = () => setCurrencySymbol(getCurrencySymbol());
		window.addEventListener('currencyChange', updateCurrency);
		return () => window.removeEventListener('currencyChange', updateCurrency);
	}, []);

	const handleOpenAddDialog = () => {
		setEditingGoal(null);
		setTitle('');
		setCategory('');
		setTargetAmount(0);
		setStartDate(new Date().toISOString().split('T')[0]);
		setTargetDate('');
		setNotes('');
		setFormError('');
		setIsAddingCustomCategory(false);
		setNewCategoryName('');
		setOpenDialog(true);
	};

	const handleOpenEditDialog = (goal) => {
		setEditingGoal(goal);
		setTitle(goal.title || '');
		setCategory(typeof goal.category === 'object' ? goal.category.id : goal.category || '');
		setTargetAmount(Number(goal.target_amount || 0));
		setStartDate(goal.start_date || new Date().toISOString().split('T')[0]);
		setTargetDate(goal.target_date || '');
		setNotes(goal.notes || '');
		setFormError('');
		setIsAddingCustomCategory(false);
		setNewCategoryName('');
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingGoal(null);
	};

	const handleCreateCustomCategory = async () => {
		if (!newCategoryName.trim()) {
			setFormError('Category name is required');
			return;
		}

		try {
			const response = await categoryAPI.create({
				name: newCategoryName.trim(),
				transaction_type: 'savings',
			});
			const createdCategory = response.data;
			setCategories((prev) => [...prev, createdCategory]);
			setCategory(createdCategory.id);
			setNewCategoryName('');
			setIsAddingCustomCategory(false);
			setFormError('');
			setSnackbar({
				open: true,
				message: 'Savings category added',
				severity: 'success',
			});
		} catch (err) {
			console.error('Error creating savings category:', err);
			setFormError('Failed to create savings category');
		}
	};

	const handleSaveGoal = async () => {
		if (!title.trim() || !category || Number(targetAmount) <= 0 || !startDate) {
			setFormError('Title, category, target amount and start date are required');
			return;
		}

		const payload = {
			title: title.trim(),
			category_id: category,
			target_amount: Number(targetAmount),
			start_date: startDate,
			target_date: targetDate || null,
			notes,
		};

		try {
			if (editingGoal) {
				await savingsGoalAPI.update(editingGoal.id, payload);
				setSnackbar({ open: true, message: 'Savings goal updated', severity: 'success' });
			} else {
				await savingsGoalAPI.create(payload);
				setSnackbar({ open: true, message: 'Savings goal added', severity: 'success' });
			}
			handleCloseDialog();
			fetchData();
		} catch (err) {
			console.error('Error saving savings goal:', err);
			setFormError('Failed to save savings goal');
		}
	};

	const handleDeleteGoal = async (goalId) => {
		try {
			await savingsGoalAPI.delete(goalId);
			setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
			setSnackbar({ open: true, message: 'Savings goal deleted', severity: 'success' });
		} catch (err) {
			console.error('Error deleting savings goal:', err);
			setSnackbar({ open: true, message: 'Failed to delete savings goal', severity: 'error' });
		}
	};

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount || 0), 0);
	const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.current_amount || 0), 0);

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
					background: 'linear-gradient(135deg, #e6fff4, #eef6ff)',
					border: '1px solid rgba(90, 120, 150, 0.2)',
				}}
			>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={0}>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 'bold' }}>Savings Goals</Typography>
					<Typography variant="subtitle1" color="textSecondary">Create goals and track savings progress by category</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleOpenAddDialog}
					sx={{
						borderRadius: 3,
						px: 2.5,
						py: 1,
						textTransform: 'none',
						fontWeight: 700,
						boxShadow: '0 10px 24px rgba(25, 118, 210, 0.25)',
					}}
				>
					Add Savings Goal
				</Button>
			</Box>
			</Paper>

			<Grid container spacing={2} sx={{ mb: 3 }}>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2, borderRadius: 2 }}>
						<Typography variant="subtitle2" color="textSecondary">Total Goal Target</Typography>
						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							{currencySymbol}{totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2, borderRadius: 2 }}>
						<Typography variant="subtitle2" color="textSecondary">Total Saved Across Goals</Typography>
						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							{currencySymbol}{totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
						</Typography>
					</Paper>
				</Grid>
			</Grid>

			<Grid container spacing={3} alignItems="flex-start">
				{goals.map((goal) => {
					const current = Number(goal.current_amount || 0);
					const target = Number(goal.target_amount || 0);
					const remaining = Number(goal.remaining_amount || 0);
					const percent = getGoalPercent(goal);

					return (
						<Grid item xs={12} sm={6} md={4} key={goal.id}>
							<Card
								sx={{
									p: 3,
									borderRadius: 4,
									minWidth: 320,
									border: '1px solid rgba(120, 144, 156, 0.2)',
									boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
									background: 'linear-gradient(160deg, rgba(255,255,255,0.96), rgba(244,251,255,0.9))',
									transition: 'all 0.25s ease',
									'&:hover': {
										transform: 'translateY(-5px)',
										boxShadow: '0 16px 36px rgba(0, 0, 0, 0.16)',
									},
								}}
							>
								<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
									<Box>
										<Typography variant="h6" sx={{ fontWeight: 'bold' }}>{goal.title}</Typography>
										<Typography variant="body2" color="textSecondary">
											{goal.category?.name || 'Savings Category'}
										</Typography>
									</Box>
									<Box>
										<IconButton aria-label="edit" onClick={() => handleOpenEditDialog(goal)}><EditIcon /></IconButton>
										<IconButton aria-label="delete" onClick={() => handleDeleteGoal(goal.id)}><DeleteIcon /></IconButton>
									</Box>
								</Box>

								<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
									<Typography sx={{ fontWeight: 500 }}>{currencySymbol}{current.toFixed(2)}</Typography>
									<Typography sx={{ fontWeight: 500 }}>of {currencySymbol}{target.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
								</Box>

								<LinearProgress
									variant="determinate"
									value={percent}
									sx={{
										height: 8,
										borderRadius: 4,
										backgroundColor: '#f5f5f5',
										mb: 1,
									}}
								/>

								<Box display="flex" justifyContent="space-between" alignItems="center">
									<Typography variant="body2" color="textSecondary">
										Remaining: {currencySymbol}{remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
									</Typography>
									<Typography variant="body2" color="textSecondary">{percent.toFixed(0)}%</Typography>
								</Box>

								<Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
									Start: {new Date(goal.start_date).toLocaleDateString()}
									{goal.target_date ? ` | Target: ${new Date(goal.target_date).toLocaleDateString()}` : ''}
								</Typography>
							</Card>
						</Grid>
					);
				})}

				{goals.length === 0 && (
					<Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
						<Paper
							elevation={0}
							sx={{
								p: 5,
								borderRadius: 3,
								borderColor: 'primary.main',
								borderStyle: 'dashed',
								borderWidth: 1,
								background: 'linear-gradient(180deg, #ffffff, #f8fbff)',
							}}
						>
							<SavingsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
							<Typography variant="h6" color="textSecondary" mb={1}>
								No savings goals yet
							</Typography>
							<Typography variant="body2" color="textSecondary" mb={2}>
								Add a goal and savings transactions under the same savings category to track progress automatically.
							</Typography>
							<Button variant="contained" onClick={handleOpenAddDialog}>Create Savings Goal</Button>
						</Paper>
					</Grid>
				)}
			</Grid>

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: 4,
						border: '1px solid rgba(120, 144, 156, 0.2)',
					},
				}}
			>
				<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					{editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}
					<IconButton aria-label="close" onClick={handleCloseDialog}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Goal Title"
								margin="normal"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</Grid>

						<Grid item xs={12}>
							{!isAddingCustomCategory ? (
								<>
									<FormControl fullWidth margin="normal">
										<InputLabel id="savings-category-label" shrink>Category</InputLabel>
										<Select
											labelId="savings-category-label"
											value={category}
											onChange={(e) => setCategory(e.target.value)}
											error={!!formError && !category}
											label="Category"
										>
											<MenuItem value="">
												<em>Select savings category</em>
											</MenuItem>
											{categories.map((cat) => (
												<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
											))}
										</Select>
									</FormControl>
									<Box mt={1}>
										<Button size="small" onClick={() => setIsAddingCustomCategory(true)}>
											+ Add custom savings category
										</Button>
									</Box>
								</>
							) : (
								<Paper elevation={2} sx={{ p: 2, mt: 1, mb: 2, borderRadius: 2 }}>
									<Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
										Add Custom Savings Category
									</Typography>
									<TextField
										fullWidth
										label="New Category Name"
										value={newCategoryName}
										onChange={(e) => setNewCategoryName(e.target.value)}
										error={!!formError}
										helperText={formError}
										sx={{ mb: 2 }}
									/>
									<Box display="flex" gap={1}>
										<Button size="small" onClick={handleCreateCustomCategory} variant="contained">
											Add Category
										</Button>
										<Button
											size="small"
											onClick={() => {
												setIsAddingCustomCategory(false);
												setNewCategoryName('');
												setFormError('');
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
								label="Target Amount"
								type="number"
								value={targetAmount}
								onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
								inputProps={{ min: 0, step: 0.01 }}
								InputLabelProps={{ shrink: true }}
								margin="normal"
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Start Date"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								InputLabelProps={{ shrink: true }}
								margin="normal"
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Target Date (Optional)"
								type="date"
								value={targetDate}
								onChange={(e) => setTargetDate(e.target.value)}
								InputLabelProps={{ shrink: true }}
								margin="normal"
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Notes (Optional)"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								multiline
								rows={3}
								margin="normal"
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button variant="contained" onClick={handleSaveGoal}>
						{editingGoal ? 'Update Goal' : 'Add Goal'}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={5000}
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

export default SavingsGoalsPage;
