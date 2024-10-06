// app/policy/[id]/page.jsx
"use client"; // Ensure this is a client component

import { Box, Typography } from '@mui/material';
import { useParams } from 'next/navigation'; // Use next/navigation for dynamic params
import { useEffect, useState } from 'react';
import Footer from '../../../components/Footer'; // Adjusted the import path
import NavbarHome from '../../../components/NavbarHome'; // Reuse the Navbar from About Us

export default function PolicyDetail() {
    const { id } = useParams(); // Get the policy ID from the URL
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            if (id) {
                try {
                    const res = await fetch(`/api/policies/${id}`);
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await res.json();
                    setPolicy(data);
                    sessionStorage.setItem('policyData', JSON.stringify(data));
                } catch (error) {
                    console.error('Error fetching policy:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        const storedPolicy = sessionStorage.getItem('policyData');
        if (storedPolicy) {
            setPolicy(JSON.parse(storedPolicy));
            setLoading(false);
        } else {
            fetchPolicy();
        }
    }, [id]);

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

    if (!policy) {
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
                    <Typography variant="h6">Policy not found.</Typography>
                </Box>
                <Footer />
            </>
        );
    }

    return (
        <>
            {/* Navbar of FAQ */}
            <NavbarHome />

            {/* Content section styled responsively */}
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
                        {policy.name}
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
                        dangerouslySetInnerHTML={{ __html: policy.description }}
                    />
                </Box>
            </Box>

            {/* Include the Footer component */}
            <Footer />
        </>
    );
}
