// app/faq/page.jsx
"use client"; // Ensures this is a Client Component

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarHome from '../../components/NavbarHome'; // Adjusted the import path

export default function FAQPage() {
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedInfo = sessionStorage.getItem('faqInfo');

        if (storedInfo) {
            setInfo(storedInfo);
            setLoading(false);
        } else {
            fetchFAQContent();
        }
    }, []);

    const fetchFAQContent = async () => {
        try {
            const response = await fetch('/api/faq');
            const data = await response.json();
            if (data && data.info) {
                setInfo(data.info);
                sessionStorage.setItem('faqInfo', data.info); // Store in sessionStorage
            }
        } catch (error) {
            console.error('Error fetching FAQ content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <NavbarHome />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '80vh',
                        backgroundColor: '#FFFFFF',
                        padding: '20px',
                    }}
                >
                    <Typography variant="h6">Loading...</Typography>
                </Box>
                <Footer />
            </>
        );
    }

    return (
        <>
            {/* Navbar of FAQ */}
            <NavbarHome />

            {/* Content of the FAQ page */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: { xs: '40px 20px', sm: '40px 40px', md: '40px 20px' },
                    backgroundColor: '#FFFFFF',
                }}
            >
                <Box
                    sx={{
                        backgroundColor: '#fff',
                        border: '1px solid #EC008B',
                        borderRadius: '24px',
                        padding: { xs: '30px 20px', sm: '40px 30px', md: '60px 40px' },
                        maxWidth: { xs: '100%', sm: '80%', md: '1337px' },
                        minHeight: { xs: 'auto', sm: '500px', md: '681px' },
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '16px', sm: '20px', md: '36px' },
                            fontWeight: 800,
                            color: '#383838',
                            lineHeight: { xs: '20px', sm: '24px', md: '44px' },
                            marginBottom: { xs: '20px', sm: '30px', md: '40px' },
                        }}
                    >
                        FAQ
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: '12px', sm: '14px', md: '24px' },
                            fontWeight: 500,
                            color: '#6B6B6B',
                            lineHeight: { xs: '14.4px', sm: '16.8px', md: '28.8px' },
                            padding: { xs: '10px', sm: '20px', md: '10px' },
                            marginBottom: { xs: '20px', sm: '30px', md: '20px' },
                            textAlign: 'center',
                        }}
                        dangerouslySetInnerHTML={{ __html: info }}
                    />
                </Box>
            </Box>

            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
