import React, { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Link } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

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

        return ""; 
    };

    const handleSignUp = async () => {
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
            const response = await axios.post('http://127.0.0.1:8000/auth/users/', {
                first_name: name,
                username: email,
                password,
                password2: confirmPassword, 
                email: email,
            });
            console.log('Signup Response:', response);

            setSuccessMessage('User registered successfully. Redirecting to signin page.');
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (error) {
            if (error.response && error.response.data) {
                
                const data = error.response.data;
                let message = '';
                if (typeof data === 'string') {
                    message = data;
                } else if (typeof data === 'object') {
                    message = Object.entries(data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                } else {
                    message = 'Signup failed. Please try again.';
                }
                setErrorMessage(message);
            } else {
                setErrorMessage('Signup failed. Please try again.');
            }
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
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ marginTop: 2 }}>
                    <AttachMoneyIcon sx={{ color: 'blue', fontSize: 30, marginRight: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                        BudgetMaster
                    </Typography>
                </Box>
                <Typography variant="subtitle1">Take control of your finances</Typography>
            </Box>

            {/* Sign-up Form  */}
            <Card sx={{ padding: 4, width: '350px', borderRadius: 4, marginBottom:5 }} elevation={5}>
                {successMessage && (
                    <Typography variant="body2" color="success" gutterBottom textAlign="center">
                        {successMessage}
                    </Typography>
                )}
                {errorMessage && (
                    <Typography variant="body2" color="error" gutterBottom textAlign="center">
                        {errorMessage}
                    </Typography>
                )}
                <Typography variant="h6" gutterBottom textAlign="center">
                    Create an account
                </Typography>
                <Typography variant="body2" gutterBottom textAlign="center">
                    Enter your information to get started
                </Typography>
                <TextField label="Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    helperText={passwordError}
                />
                <TextField
                    label="Confirm Password"
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
                <Button variant="contained" fullWidth sx={{ marginTop: 2, borderRadius: 4 }} onClick={handleSignUp}>
                    Sign Up
                </Button>
                <Typography variant="body2" align="center" mt={2}>
                    Already have an account? <Link href="/signin">Sign in</Link>
                </Typography>
            </Card>
        </Box>
    );
}

export default SignUpPage;