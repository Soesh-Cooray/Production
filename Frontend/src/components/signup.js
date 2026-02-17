import React, { useState } from 'react';
import {
    Box, Card, TextField, Button, Typography, Link,
    Checkbox, FormControlLabel, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import axios from 'axios';
import { API_BASE } from '../api';
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
    const [isLoading, setIsLoading] = useState(false);

    // Privacy Policy State
    const [agreedToPolicy, setAgreedToPolicy] = useState(false);
    const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

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
        if (isLoading) {
            return;
        }

        setIsLoading(true);
        const passwordErrorMessage = validatePassword(password);
        setPasswordError(passwordErrorMessage);
        setConfirmPasswordError("");
        setErrorMessage("");

        if (passwordErrorMessage) {
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        if (!agreedToPolicy) {
            setErrorMessage("You must agree to the Privacy Policy to create an account.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}/auth/users/`, {
                first_name: name,
                username: email,
                password,
                re_password: confirmPassword,
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
            } finally {
                setIsLoading(false);
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
                padding: 2
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
            <Card sx={{ padding: 4, width: '350px', borderRadius: 4, marginBottom: 5 }} elevation={5}>
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

                {/* Privacy Policy Checkbox */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={agreedToPolicy}
                                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                I agree to the{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => setPrivacyPolicyOpen(true)}
                                    sx={{ verticalAlign: 'baseline' }}
                                >
                                    Privacy Policy
                                </Link>
                            </Typography>
                        }
                    />
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    sx={{ marginTop: 2, borderRadius: 4 }}
                    onClick={handleSignUp}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : (
                        'Sign Up'
                    )}
                </Button>
                <Typography variant="body2" align="center" mt={2}>
                    Already have an account? <Link href="/signin">Sign in</Link>
                </Typography>
            </Card>

            {/* Privacy Policy Modal */}
            <Dialog
                open={privacyPolicyOpen}
                onClose={() => setPrivacyPolicyOpen(false)}
                scroll="paper"
                aria-labelledby="privacy-policy-title"
                aria-describedby="privacy-policy-description"
            >
                <DialogTitle id="privacy-policy-title">Privacy Policy</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText id="privacy-policy-description" tabIndex={-1}>
                        <Typography variant="h6" gutterBottom>1. Introduction</Typography>
                        <Typography paragraph>
                            Welcome to BudgetMaster. We are committed to protecting your personal information and your right to privacy.
                            This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it.
                        </Typography>

                        <Typography variant="h6" gutterBottom>2. Information We Collect</Typography>
                        <Typography paragraph>
                            We collect personal information that you voluntarily provide to us when you register on the application,
                            such as your name, email address, and password. We also store the financial data you input, including
                            budgets, transaction details, and categories.
                        </Typography>

                        <Typography variant="h6" gutterBottom>3. How We Use Your Information</Typography>
                        <Typography paragraph>
                            We use your personal information to create and manage your account. Your financial data is used solely
                            to provide you with budgeting and expense tracking features. We do not sell your personal or financial
                            data to third parties.
                        </Typography>

                        <Typography variant="h6" gutterBottom>4. Data Security</Typography>
                        <Typography paragraph>
                            We implement appropriate technical and organizational security measures designed to protect the security
                            of any personal information we process. However, please also remember that we cannot guarantee that
                            the internet itself is 100% secure.
                        </Typography>

                        <Typography variant="h6" gutterBottom>5. Your Rights</Typography>
                        <Typography paragraph>
                            You have the right to review, change, or terminate your account at any time. If you wish to delete your
                            account and all associated data, please contact our support team.
                        </Typography>

                        <Typography variant="h6" gutterBottom>6. Contact Us</Typography>
                        <Typography paragraph>
                            If you have questions or comments about this policy, you may email us at budgetmaster@gmail.com.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPrivacyPolicyOpen(false)} color="primary">
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            setAgreedToPolicy(true);
                            setPrivacyPolicyOpen(false);
                        }}
                        color="primary"
                        variant="contained"
                    >
                        I Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SignUpPage;