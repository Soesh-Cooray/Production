import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Chip,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Snackbar,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentsIcon from '@mui/icons-material/Payments';
import { debtAPI, getCurrencySymbol } from '../api';

const emptyDebtForm = {
	title: '',
	person: '',
	type: 'i_owe',
	totalAmount: '',
	paidAmount: '0',
	dueDate: '',
	notes: '',
};

function getStatus(debt) {
	const remaining = Math.max(Number(debt.totalAmount) - Number(debt.paidAmount), 0);
	if (remaining <= 0) {
		return 'paid';
	}

	if (debt.dueDate) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const due = new Date(debt.dueDate);
		due.setHours(0, 0, 0, 0);
		if (due < today) {
			return 'overdue';
		}
	}

	return 'active';
}

function statusConfig(status) {
	if (status === 'paid') {
		return { label: 'Paid', color: 'success' };
	}
	if (status === 'overdue') {
		return { label: 'Overdue', color: 'error' };
	}
	return { label: 'Active', color: 'warning' };
}

function DebtPage() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [debts, setDebts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currencySymbol, setCurrencySymbol] = useState(getCurrencySymbol());
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingDebtId, setEditingDebtId] = useState(null);
	const [form, setForm] = useState(emptyDebtForm);
	const [formError, setFormError] = useState('');

	const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
	const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);
	const [paymentAmount, setPaymentAmount] = useState('');
	const [paymentError, setPaymentError] = useState('');

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success',
	});

	const mapApiDebtToUi = (item) => ({
		id: item.id,
		title: item.title,
		person: item.person,
		type: item.type,
		totalAmount: Number(item.total_amount),
		paidAmount: Number(item.paid_amount),
		dueDate: item.due_date,
		notes: item.notes || '',
		createdAt: item.created_at,
		updatedAt: item.updated_at,
	});

	const fetchDebts = useCallback(async () => {
		try {
			setLoading(true);
			const response = await debtAPI.getAll();
			setDebts((response.data || []).map(mapApiDebtToUi));
		} catch (error) {
			console.error('Failed to fetch debts:', error);
			setSnackbar({
				open: true,
				message: 'Failed to load debts.',
				severity: 'error',
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDebts();
	}, [fetchDebts]);

	useEffect(() => {
		const updateCurrency = () => setCurrencySymbol(getCurrencySymbol());
		window.addEventListener('currencyChange', updateCurrency);
		return () => window.removeEventListener('currencyChange', updateCurrency);
	}, []);

	const summary = useMemo(() => {
		return debts.reduce(
			(acc, debt) => {
				const remaining = Math.max(Number(debt.totalAmount) - Number(debt.paidAmount), 0);
				if (debt.type === 'i_owe') {
					acc.iOwe += remaining;
				} else {
					acc.owedToMe += remaining;
				}
				if (getStatus(debt) === 'overdue') {
					acc.overdueCount += 1;
				}
				return acc;
			},
			{ iOwe: 0, owedToMe: 0, overdueCount: 0 }
		);
	}, [debts]);

	const resetForm = () => {
		setForm(emptyDebtForm);
		setEditingDebtId(null);
		setFormError('');
	};

	const openCreateDialog = () => {
		resetForm();
		setDialogOpen(true);
	};

	const openEditDialog = (debt) => {
		setEditingDebtId(debt.id);
		setForm({
			title: debt.title,
			person: debt.person,
			type: debt.type,
			totalAmount: String(debt.totalAmount),
			paidAmount: String(debt.paidAmount),
			dueDate: debt.dueDate || '',
			notes: debt.notes || '',
		});
		setFormError('');
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
		resetForm();
	};

	const handleFormChange = (field) => (event) => {
		setForm((prev) => ({ ...prev, [field]: event.target.value }));
	};

	const validateDebtForm = () => {
		const total = Number(form.totalAmount);
		const paid = Number(form.paidAmount || 0);

		if (!form.title.trim()) {
			return 'Debt title is required.';
		}
		if (!form.person.trim()) {
			return 'Person or entity name is required.';
		}
		if (!Number.isFinite(total) || total <= 0) {
			return 'Total amount must be greater than 0.';
		}
		if (!Number.isFinite(paid) || paid < 0) {
			return 'Paid amount cannot be negative.';
		}
		if (paid > total) {
			return 'Paid amount cannot be greater than total amount.';
		}

		return '';
	};

	const handleSaveDebt = async () => {
		const validationError = validateDebtForm();
		if (validationError) {
			setFormError(validationError);
			return;
		}

		const payload = {
			title: form.title.trim(),
			person: form.person.trim(),
			type: form.type,
			total_amount: Number(form.totalAmount),
			paid_amount: Number(form.paidAmount || 0),
			due_date: form.dueDate || null,
			notes: form.notes.trim(),
		};

		try {
			if (editingDebtId) {
				const response = await debtAPI.update(editingDebtId, payload);
				const updatedDebt = mapApiDebtToUi(response.data);
				setDebts((prev) => prev.map((item) => (item.id === editingDebtId ? updatedDebt : item)));
				setSnackbar({ open: true, message: 'Debt updated successfully.', severity: 'success' });
			} else {
				const response = await debtAPI.create(payload);
				setDebts((prev) => [mapApiDebtToUi(response.data), ...prev]);
				setSnackbar({ open: true, message: 'Debt added successfully.', severity: 'success' });
			}

			closeDialog();
		} catch (error) {
			console.error('Failed to save debt:', error);
			const apiError = error?.response?.data;
			if (apiError && typeof apiError === 'object') {
				const firstKey = Object.keys(apiError)[0];
				const firstMessage = Array.isArray(apiError[firstKey]) ? apiError[firstKey][0] : apiError[firstKey];
				setFormError(String(firstMessage));
			} else {
				setFormError('Failed to save debt. Please try again.');
			}
		}
	};

	const handleDeleteDebt = async (id) => {
		const hasConfirmed = window.confirm('Delete this debt entry?');
		if (!hasConfirmed) {
			return;
		}

		try {
			await debtAPI.delete(id);
			setDebts((prev) => prev.filter((item) => item.id !== id));
			setSnackbar({ open: true, message: 'Debt deleted.', severity: 'info' });
		} catch (error) {
			console.error('Failed to delete debt:', error);
			setSnackbar({ open: true, message: 'Failed to delete debt.', severity: 'error' });
		}
	};

	const openPaymentDialog = (debt) => {
		setSelectedDebtForPayment(debt);
		setPaymentAmount('');
		setPaymentError('');
		setPaymentDialogOpen(true);
	};

	const closePaymentDialog = () => {
		setPaymentDialogOpen(false);
		setSelectedDebtForPayment(null);
		setPaymentAmount('');
		setPaymentError('');
	};

	const handleApplyPayment = async () => {
		if (!selectedDebtForPayment) {
			return;
		}

		const amount = Number(paymentAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			setPaymentError('Enter a valid amount greater than 0.');
			return;
		}

		const remaining = Math.max(
			Number(selectedDebtForPayment.totalAmount) - Number(selectedDebtForPayment.paidAmount),
			0
		);
		if (amount > remaining) {
			setPaymentError('Payment cannot be greater than the remaining amount.');
			return;
		}

		try {
			const payload = {
				title: selectedDebtForPayment.title,
				person: selectedDebtForPayment.person,
				type: selectedDebtForPayment.type,
				total_amount: Number(selectedDebtForPayment.totalAmount),
				paid_amount: Number(selectedDebtForPayment.paidAmount) + amount,
				due_date: selectedDebtForPayment.dueDate || null,
				notes: selectedDebtForPayment.notes || '',
			};

			const response = await debtAPI.update(selectedDebtForPayment.id, payload);
			const updatedDebt = mapApiDebtToUi(response.data);
			setDebts((prev) =>
				prev.map((item) =>
					item.id === selectedDebtForPayment.id ? updatedDebt : item
				)
			);

			closePaymentDialog();
			setSnackbar({ open: true, message: 'Payment updated.', severity: 'success' });
		} catch (error) {
			console.error('Failed to update payment:', error);
			setPaymentError('Failed to update payment. Please try again.');
		}
	};

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	return (
		<Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
			{loading && (
				<Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
					<Typography color="text.secondary">Loading debts...</Typography>
				</Paper>
			)}
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				mb={4}
				flexWrap="wrap"
				gap={2}
				sx={!isMobile ? {
					p: 3,
					borderRadius: 3,
					border: `1px solid ${theme.palette.divider}`,
					background: theme.palette.mode === 'dark'
						? 'linear-gradient(135deg, rgba(45,56,72,0.5), rgba(26,32,44,0.45))'
						: 'linear-gradient(135deg, #f5fffa, #edf4ff)',
				} : undefined}
			>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
						Debt Management
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Track money you owe and money owed to you.
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={openCreateDialog}
					sx={{
						borderRadius: 3,
						px: 3,
						py: 1.5,
						fontWeight: 'bold',
						boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)',
						textTransform: 'none',
					}}
				>
					Add Debt
				</Button>
			</Box>

			<Grid container spacing={2} sx={{ mb: 3 }}>
				<Grid item xs={12} md={4}>
					<Paper
						sx={{
							p: 2.5,
							borderRadius: 3,
							height: '100%',
							border: `1px solid ${theme.palette.divider}`,
							boxShadow: theme.palette.mode === 'dark'
								? '0 8px 20px rgba(0,0,0,0.3)'
								: '0 8px 20px rgba(34, 67, 115, 0.08)',
						}}
					>
						<Typography variant="body2" color="text.secondary">
							I Owe
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
							{currencySymbol}{summary.iOwe.toFixed(2)}
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} md={4}>
					<Paper
						sx={{
							p: 2.5,
							borderRadius: 3,
							height: '100%',
							border: `1px solid ${theme.palette.divider}`,
							boxShadow: theme.palette.mode === 'dark'
								? '0 8px 20px rgba(0,0,0,0.3)'
								: '0 8px 20px rgba(34, 67, 115, 0.08)',
						}}
					>
						<Typography variant="body2" color="text.secondary">
							Owed To Me
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
							{currencySymbol}{summary.owedToMe.toFixed(2)}
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} md={4}>
					<Paper
						sx={{
							p: 2.5,
							borderRadius: 3,
							height: '100%',
							border: `1px solid ${theme.palette.divider}`,
							boxShadow: theme.palette.mode === 'dark'
								? '0 8px 20px rgba(0,0,0,0.3)'
								: '0 8px 20px rgba(34, 67, 115, 0.08)',
						}}
					>
						<Typography variant="body2" color="text.secondary">
							Overdue Entries
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
							{summary.overdueCount}
						</Typography>
					</Paper>
				</Grid>
			</Grid>

			{debts.length === 0 ? (
				<Paper
					sx={{
						py: 5,
						px: 2,
						borderRadius: 4,
						textAlign: 'center',
						border: `1px solid ${theme.palette.divider}`,
						boxShadow: theme.palette.mode === 'dark'
							? '0 10px 28px rgba(0,0,0,0.35)'
							: '0 10px 25px rgba(34, 67, 115, 0.1)',
					}}
				>
					<Stack spacing={1} alignItems="center">
						<CreditCardIcon color="disabled" sx={{ fontSize: 44 }} />
						<Typography variant="h6">No debts added yet</Typography>
						<Typography color="text.secondary">
							Create your first debt entry to start tracking repayments.
						</Typography>
						<Button variant="outlined" onClick={openCreateDialog} startIcon={<AddIcon />}>
							Add First Debt
						</Button>
					</Stack>
				</Paper>
			) : isMobile ? (
				<Stack spacing={2}>
					{debts.map((debt) => {
						const remaining = Math.max(Number(debt.totalAmount) - Number(debt.paidAmount), 0);
						const status = getStatus(debt);
						const config = statusConfig(status);

						return (
							<Paper
								key={debt.id}
								sx={{
									p: 2,
									borderRadius: 4,
									border: `1px solid ${theme.palette.divider}`,
									boxShadow: theme.palette.mode === 'dark'
										? '0 10px 24px rgba(0,0,0,0.35)'
										: '0 10px 22px rgba(34, 67, 115, 0.1)',
								}}
							>
								<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
									<Typography sx={{ fontWeight: 700, pr: 1 }}>{debt.title}</Typography>
									<Typography sx={{ fontWeight: 700 }}>
										{currencySymbol}{remaining.toFixed(2)}
									</Typography>
								</Box>

								<Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={1}>
									<Chip
										label={debt.type === 'i_owe' ? 'I Owe' : 'Owed To Me'}
										size="small"
										color={debt.type === 'i_owe' ? 'default' : 'primary'}
										variant={debt.type === 'i_owe' ? 'outlined' : 'filled'}
									/>
									<Chip label={config.label} size="small" color={config.color} />
									<Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
										{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'No due date'}
									</Typography>
								</Box>

								<Typography variant="body2" color="text.secondary" mb={1}>
									{debt.person}
								</Typography>

								<Box display="flex" justifyContent="space-between" mb={1}>
									<Typography variant="body2" color="text.secondary">
										Total: {currencySymbol}{Number(debt.totalAmount).toFixed(2)}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Paid: {currencySymbol}{Number(debt.paidAmount).toFixed(2)}
									</Typography>
								</Box>

								<Box display="flex" justifyContent="flex-end" gap={1}>
									<IconButton
										color="success"
										onClick={() => openPaymentDialog(debt)}
										title="Update payment"
									>
										<PaymentsIcon fontSize="small" />
									</IconButton>
									<IconButton
										color="primary"
										onClick={() => openEditDialog(debt)}
										title="Edit debt"
									>
										<EditIcon fontSize="small" />
									</IconButton>
									<IconButton
										color="error"
										onClick={() => handleDeleteDebt(debt.id)}
										title="Delete debt"
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Box>
							</Paper>
						);
					})}
				</Stack>
			) : (
				<TableContainer
					component={Paper}
					sx={{
						borderRadius: 4,
						border: `1px solid ${theme.palette.divider}`,
						background: theme.palette.mode === 'dark'
							? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))'
							: 'linear-gradient(180deg, #ffffff, #f8fbff)',
						boxShadow: theme.palette.mode === 'dark'
							? '0 10px 30px rgba(0,0,0,0.35)'
							: '0 12px 30px rgba(34, 67, 115, 0.12)',
					}}
				>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Debt</TableCell>
								<TableCell>Type</TableCell>
								<TableCell align="right">Total</TableCell>
								<TableCell align="right">Paid</TableCell>
								<TableCell align="right">Remaining</TableCell>
								<TableCell>Due Date</TableCell>
								<TableCell>Status</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{debts.map((debt) => {
								const remaining = Math.max(Number(debt.totalAmount) - Number(debt.paidAmount), 0);
								const status = getStatus(debt);
								const config = statusConfig(status);

								return (
									<TableRow key={debt.id} hover>
										<TableCell>
											<Typography sx={{ fontWeight: 600 }}>{debt.title}</Typography>
											<Typography variant="body2" color="text.secondary">
												{debt.person}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip
												label={debt.type === 'i_owe' ? 'I Owe' : 'Owed To Me'}
												size="small"
												color={debt.type === 'i_owe' ? 'default' : 'primary'}
												variant={debt.type === 'i_owe' ? 'outlined' : 'filled'}
											/>
										</TableCell>
										<TableCell align="right">
											{currencySymbol}{Number(debt.totalAmount).toFixed(2)}
										</TableCell>
										<TableCell align="right">
											{currencySymbol}{Number(debt.paidAmount).toFixed(2)}
										</TableCell>
										<TableCell align="right" sx={{ fontWeight: 700 }}>
											{currencySymbol}{remaining.toFixed(2)}
										</TableCell>
										<TableCell>{debt.dueDate || 'N/A'}</TableCell>
										<TableCell>
											<Chip label={config.label} size="small" color={config.color} />
										</TableCell>
										<TableCell align="right">
											<IconButton
												color="success"
												onClick={() => openPaymentDialog(debt)}
												title="Update payment"
											>
												<PaymentsIcon />
											</IconButton>
											<IconButton
												color="primary"
												onClick={() => openEditDialog(debt)}
												title="Edit debt"
											>
												<EditIcon />
											</IconButton>
											<IconButton
												color="error"
												onClick={() => handleDeleteDebt(debt.id)}
												title="Delete debt"
											>
												<DeleteIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
				<DialogTitle>{editingDebtId ? 'Update Debt' : 'Add Debt'}</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						{!!formError && <Alert severity="error">{formError}</Alert>}
						<TextField
							label="Debt Title"
							value={form.title}
							onChange={handleFormChange('title')}
							fullWidth
							required
						/>
						<TextField
							label="Person / Entity"
							value={form.person}
							onChange={handleFormChange('person')}
							fullWidth
							required
						/>
						<TextField
							select
							label="Debt Type"
							value={form.type}
							onChange={handleFormChange('type')}
							fullWidth
						>
							<MenuItem value="i_owe">I Owe</MenuItem>
							<MenuItem value="owed_to_me">Owed To Me</MenuItem>
						</TextField>
						<TextField
							label="Total Amount"
							type="number"
							inputProps={{ min: 0, step: '0.01' }}
							value={form.totalAmount}
							onChange={handleFormChange('totalAmount')}
							fullWidth
							required
						/>
						<TextField
							label="Paid Amount"
							type="number"
							inputProps={{ min: 0, step: '0.01' }}
							value={form.paidAmount}
							onChange={handleFormChange('paidAmount')}
							fullWidth
						/>
						<TextField
							label="Due Date"
							type="date"
							value={form.dueDate}
							onChange={handleFormChange('dueDate')}
							InputLabelProps={{ shrink: true }}
							fullWidth
						/>
						<TextField
							label="Notes"
							value={form.notes}
							onChange={handleFormChange('notes')}
							fullWidth
							multiline
							minRows={3}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={closeDialog}>Cancel</Button>
					<Button variant="contained" onClick={handleSaveDebt}>
						{editingDebtId ? 'Save Changes' : 'Create Debt'}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={paymentDialogOpen} onClose={closePaymentDialog} maxWidth="xs" fullWidth>
				<DialogTitle>Update Payment</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						{!!paymentError && <Alert severity="error">{paymentError}</Alert>}
						<Typography variant="body2" color="text.secondary">
							{selectedDebtForPayment?.title}
						</Typography>
						<TextField
							label="Payment Amount"
							type="number"
							inputProps={{ min: 0, step: '0.01' }}
							value={paymentAmount}
							onChange={(event) => setPaymentAmount(event.target.value)}
							fullWidth
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={closePaymentDialog}>Cancel</Button>
					<Button variant="contained" onClick={handleApplyPayment}>
						Apply
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Container>
	);
}

export default DebtPage;
