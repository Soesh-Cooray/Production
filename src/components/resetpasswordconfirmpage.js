import React, { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Link } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function ResetPasswordConfirmPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const validatePassword = (password) => {
        const minLength = 8;
        const maxLength = 16;
        const hasCapital = /[A-Z]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (password.length < minLength || password.length > maxLength) {
            return "Password must be between 8 and 16 characters.";
        } else if (!hasCapital) {
            return "Password must contain at least one capital letter.";
        } else if (!hasSpecial) {
            return "Password must contain at least one special character.";
        } else if (!hasNumber) {
            return "Password must contain at least one numerical character.";
        }

        return ""; // Password is valid
    };

    const handleResetConfirm = async () => {
        const passwordErrorMessage = validatePassword(password);
        setPasswordError(passwordErrorMessage);
        setConfirmPasswordError("");

        if (passwordErrorMessage) {
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            return;
        }

        try {
            
            const params = new URLSearchParams(location.search);
            const uid = params.get('uid');
            const token = params.get('token');

            if (!uid || !token) {
                setMessage("Error: Invalid reset link. Please request a new password reset.");
                return;
            }

            await axios.post('http://127.0.0.1:8000/auth/users/reset_password_confirm/', {
                uid,
                token,
                new_password: password,
                re_new_password: confirmPassword,
            });

            setMessage("Password reset successfully!");
            setTimeout(() => {
                navigate('/signin');
            }, 2000);
        } catch (error) {
            if (error.response && error.response.data) {
               
                const errorMessage = Object.values(error.response.data)[0];
                setMessage(`Error: ${errorMessage}`);
            } else {
                setMessage("Error: Could not reset password. Please try again.");
            }
            console.error("Password reset confirmation error:", error);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f0f7ff',
            }}
        >
            {/* Logo and Title */}
            <Box textAlign="center" mb={4}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <AttachMoneyIcon sx={{ color: 'blue', fontSize: 30, marginRight: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                        BudgetMaster
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 30 }}>Set New Password</Typography>
            </Box>

            {/* Reset Password Form */}
            <Card sx={{ padding: 4, width: '350px', borderRadius: 4 }} elevation={5}>
                {message && (
                    <Typography variant="body2" color={message.startsWith("Error") ? "error" : "success"} gutterBottom textAlign="center">
                        {message}
                    </Typography>
                )}
                <Typography variant="h6" gutterBottom textAlign="center">
                    Reset Password
                </Typography>
                <Typography variant="body2" gutterBottom textAlign="center">
                    Enter your new password
                </Typography>
                <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    helperText={passwordError}
                />
                <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!confirmPasswordError}
                    helperText={confirmPasswordError}
                />
                <Typography variant="body2" color="textSecondary" textAlign="left" mt={1}>
                    Password Complexity:
                </Typography>
                <Typography variant="body2" color="black" textAlign="left" mt={1} sx={{ fontWeight: 'bold' }}>
                    <ul>  
                        <li>Must be 8-16 characters long </li>
                        <li>Must contain at least one capital letter </li>
                        <li>Must contain one special character</li>
                        <li>Must contain one number</li>
                    </ul>
                </Typography>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{ marginTop: 2, borderRadius: 4 }}
                    onClick={handleResetConfirm}
                >
                    Reset Password
                </Button>
                <Typography variant="body2" align="center" mt={2}>
                    Remember your password? <Link href="/signin">Sign in</Link>
                </Typography>
            </Card>
        </Box>
    );
}

export default ResetPasswordConfirmPage;