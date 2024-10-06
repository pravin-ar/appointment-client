// app/aboutus/page.jsx
"use client"; // Ensures this is a Client Component

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer'; // Import the Footer component
import NavbarAboutUs from '../../components/NavbarAboutUs'; // Adjusted the import path

export default function AboutUsPage() {
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedInfo = sessionStorage.getItem('aboutUsInfo');

        if (storedInfo) {
            setInfo(storedInfo);
            setLoading(false);
        } else {
            fetchAboutUsContent();
        }
    }, []);

    const fetchAboutUsContent = async () => {
        try {
            const response = await fetch('/api/aboutus');
            const data = await response.json();
            if (data && data.info) {
                setInfo(data.info);
                sessionStorage.setItem('aboutUsInfo', data.info); // Store in sessionStorage
            }
        } catch (error) {
            console.error('Error fetching About Us content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <NavbarAboutUs />
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
            {/* Navbar of About Us */}
            <NavbarAboutUs />

            {/* Content of the About Us page */}
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
                        About Us
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
