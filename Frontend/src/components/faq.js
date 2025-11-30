import React from 'react';
import {
    Box, Typography, Accordion, AccordionSummary, AccordionDetails, Container, useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const FAQ = () => {
    const theme = useTheme();

    // FAQ data structure - you can manually add questions and answers here
    const faqData = [
        {
            question: 'How do I create a new budget?',
            answer: 'Go to the budgets page and click on the "Create New Budget" button.'
        },
        {
            question: 'How do I add a new transaction?',
            answer: 'Go to the transactions page and click on the "Add New Transaction" button. You can also either delete or edit a transaction by clicking on the corresponding button.'
        },
        {
            question: 'How can I add a new category?',
            answer: 'Go to the Budgets page click on "Crate New Budget" button. Then you fill the dialog box with the new category information. Then the new category will be added to the list.'
        },
        {
            question: 'How can I add email reminders?',
            answer: 'Go to the Settings page and click on the "Email Reminders" button. Then you fill the dialog box with the necessary information. Then you will receive email reminders .'
        },
        {
            question: 'How can I delete my account?',
            answer: 'Go to the Settings page and click on the "Delete Account" button. Then your account will be deleted.'
        }
    ];

    return (
        <Box sx={{ p: 3, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
            <Container maxWidth="md">
                <Box display="flex" alignItems="center" mb={3}>
                    <HelpOutlineIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                        Frequently Asked Questions
                    </Typography>
                </Box>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Find answers to common questions about BudgetMaster
                </Typography>

                <Box sx={{ mt: 4 }}>
                    {faqData.map((faq, index) => (
                        <Accordion
                            key={index}
                            sx={{
                                mb: 2,
                                borderRadius: 2,
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 2px 10px rgba(0, 0, 0, 0.2)'
                                    : '0 2px 10px rgba(0,0,0,0.05)',
                                backgroundColor: theme.palette.background.paper,
                                '&:before': {
                                    display: 'none',
                                },
                                '&.Mui-expanded': {
                                    margin: '16px 0',
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
                                sx={{
                                    px: 3,
                                    py: 2,
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(0, 0, 0, 0.02)',
                                    },
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: theme.palette.text.primary,
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {faq.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                <Box
                    sx={{
                        mt: 6,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.05)'}`,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.primary }}>
                        Still have questions?
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        If you can't find the answer you're looking for, please contact our support team.
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            mt: 2,
                            color: theme.palette.primary.main,
                            fontWeight: 500
                        }}
                    >
                        budgetmaster2025@gmail.com
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default FAQ;

