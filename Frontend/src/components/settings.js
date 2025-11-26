import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent,
    Divider, Alert, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Grid, useTheme
} from '@mui/material';
import { apiClient, API_BASE } from '../api';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const SettingsPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // User Details State
    const [userDetails, setUserDetails] = useState({
        first_name: '',
        email: '',
        id: ''
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        reminder_frequency: 'none',
        reminder_time: '09:00'
    });

    // Password Change State
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        re_new_password: ''
    });

    // Delete Account Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        fetchUserDetails();
        fetchNotificationSettings();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await apiClient.get('/auth/users/me/', {
                baseURL: API_BASE
            });
            setUserDetails({
                first_name: response.data.first_name || '',
                email: response.data.email || '',
                id: response.data.id
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            setMessage({ type: 'error', text: `Failed to load user details: ${error.message} ${error.response?.data ? JSON.stringify(error.response.data) : ''}` });
        }
    };

    const fetchNotificationSettings = async () => {
        try {
            const response = await apiClient.get('/auth/settings/notifications/', {
                baseURL: API_BASE
            });
            setNotificationSettings({
                reminder_frequency: response.data.reminder_frequency || 'none',
                reminder_time: response.data.reminder_time ? response.data.reminder_time.substring(0, 5) : '09:00'
            });
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            // Don't show error to user, just log it. Feature might be optional or new.
        }
    };

    const handleUpdateDetails = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Note: Djoser /auth/users/me/ endpoint typically allows patching details
            // However, changing email might require re-verification depending on backend settings.
            // We will try to update first_name and email.
            await apiClient.patch('/auth/users/me/',
                {
                    first_name: userDetails.first_name,
                    email: userDetails.email
                },
                { baseURL: API_BASE }
            );
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. ' + (error.response?.data ? JSON.stringify(error.response.data) : '') });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateNotifications = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await apiClient.patch('/auth/settings/notifications/',
                notificationSettings,
                { baseURL: API_BASE }
            );
            setMessage({ type: 'success', text: 'Notification settings updated successfully.' });
        } catch (error) {
            console.error('Error updating notifications:', error);
            setMessage({ type: 'error', text: 'Failed to update notification settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new_password !== passwords.re_new_password) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await apiClient.post('/auth/users/set_password/',
                {
                    current_password: passwords.current_password,
                    new_password: passwords.new_password,
                    re_new_password: passwords.re_new_password
                },
                { baseURL: API_BASE }
            );
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setPasswords({ current_password: '', new_password: '', re_new_password: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            const errorMsg = error.response?.data
                ? Object.values(error.response.data).flat().join(' ')
                : 'Failed to update password.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await apiClient.delete('/auth/users/me/', {
                baseURL: API_BASE,
                data: { current_password: deletePassword } // Some configurations require password to delete
            });

            // Clear local storage and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currency');
            navigate('/signup');
        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage({ type: 'error', text: 'Failed to delete account. Please ensure your password is correct.' });
            setLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
            <Box display="flex" alignItems="center" mb={3}>
                <SettingsIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h4" fontWeight="bold">
                    Settings
                </Typography>
            </Box>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            {/* Profile Settings */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                        <Box component="span" mr={1} display="flex"><SaveIcon color="action" /></Box>
                        Profile Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={userDetails.first_name}
                                onChange={(e) => setUserDetails({ ...userDetails, first_name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                value={userDetails.email}
                                onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleUpdateDetails}
                                disabled={loading}
                            >
                                Update Profile
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                        <Box component="span" mr={1} display="flex"><NotificationsActiveIcon color="action" /></Box>
                        Email Reminders
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Frequency"
                                fullWidth
                                value={notificationSettings.reminder_frequency}
                                onChange={(e) => setNotificationSettings({ ...notificationSettings, reminder_frequency: e.target.value })}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="none">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly (Mondays)</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Time (UTC)"
                                type="time"
                                fullWidth
                                value={notificationSettings.reminder_time}
                                onChange={(e) => setNotificationSettings({ ...notificationSettings, reminder_time: e.target.value })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleUpdateNotifications}
                                disabled={loading}
                            >
                                Save Preferences
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Password Settings */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                        <Box component="span" mr={1} display="flex"><LockIcon color="action" /></Box>
                        Change Password
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Current Password"
                                type="password"
                                fullWidth
                                value={passwords.current_password}
                                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="New Password"
                                type="password"
                                fullWidth
                                value={passwords.new_password}
                                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Confirm New Password"
                                type="password"
                                fullWidth
                                value={passwords.re_new_password}
                                onChange={(e) => setPasswords({ ...passwords, re_new_password: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<LockIcon />}
                                onClick={handlePasswordChange}
                                disabled={loading}
                            >
                                Change Password
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Contact Support */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                        <Box component="span" mr={1} display="flex"><EmailIcon color="primary" /></Box>
                        Contact Support
                    </Typography>
                    <Typography variant="body1">
                        Have questions or feedback? Reach out to us at:
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                        budgetmaster2025@gmail.com
                    </Typography>
                </CardContent>
            </Card>

            {/* Delete Account */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
                <CardContent>
                    <Typography variant="h6" color="error" gutterBottom display="flex" alignItems="center">
                        <Box component="span" mr={1} display="flex"><DeleteIcon /></Box>
                        Danger Zone
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Deleting your account is irreversible. All your data, including transactions and budgets, will be permanently removed.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Delete Account
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Account?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete your account? This action cannot be undone.
                        Please enter your password to confirm.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="standard"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={!deletePassword}>
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;
