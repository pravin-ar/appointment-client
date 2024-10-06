// Footer.jsx
'use client'; // Ensure this is a client component

import { Box, List, ListItem, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Footer = () => {
    const [services, setServices] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [footerInfo, setFooterInfo] = useState({
        description: '',
        email: '',
        website: '',
        address: '',
        number: '',
    });

    useEffect(() => {
        // Fetch services
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/service-card-text');
                const data = await response.json();

                const formattedServices = data.map((service) => ({
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    image_url: service.image_url,
                    info: service.info,
                    keywords: service.meta_data?.keywords || 'services, more details',
                }));
                setServices(formattedServices);
                sessionStorage.setItem('servicesData', JSON.stringify(formattedServices));
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        const storedServices = sessionStorage.getItem('servicesData');
        if (storedServices) {
            setServices(JSON.parse(storedServices));
        } else {
            fetchServices();
        }

        // Fetch policies
        const fetchPolicies = async () => {
            try {
                const res = await fetch('/api/policies');
                const data = await res.json();
                setPolicies(data);
                sessionStorage.setItem('policies', JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching policies:', error);
            }
        };

        const storedPolicies = sessionStorage.getItem('policies');
        if (storedPolicies) {
            setPolicies(JSON.parse(storedPolicies));
        } else {
            fetchPolicies();
        }

        // Fetch footer info
        const fetchFooterInfo = async () => {
            try {
                const res = await fetch('/api/footer-info');
                const data = await res.json();
                setFooterInfo({
                    description: data.description || '',
                    email: data.email || '',
                    website: data.website || '',
                    address: data.address || '',
                    number: data.number || '',
                });
                sessionStorage.setItem('footerInfo', JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching footer info:', error);
            }
        };

        const storedFooterInfo = sessionStorage.getItem('footerInfo');
        if (storedFooterInfo) {
            const data = JSON.parse(storedFooterInfo);
            setFooterInfo({
                description: data.description || '',
                email: data.email || '',
                website: data.website || '',
                address: data.address || '',
                number: data.number || '',
            });
        } else {
            fetchFooterInfo();
        }
    }, []);

    const { description, email, website, address, number } = footerInfo;

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#FFFFFF',
                padding: { xs: '40px 20px', sm: '50px 20px', md: '60px 20px' },
                textAlign: 'left',
            }}
        >
            <Box
                sx={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    gap: '20px',
                    padding: '0 20px',
                    textAlign: { xs: 'center', sm: 'left' },
                }}
            >
                {/* Left Section with Logo and Contact Information */}
                <Box
                    sx={{
                        flex: '1 1 23%',
                        maxWidth: { xs: '100%', sm: '23%' },
                        minWidth: '200px',
                        boxSizing: 'border-box',
                        padding: 0,
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            width: {
                                xs: '113.96px', // Mobile width
                                sm: '117.57px', // Tablet width
                                md: '203px',    // Desktop width
                            },
                            height: {
                                xs: '32px',    // Mobile height
                                sm: '33.01px', // Tablet height
                                md: '57px',    // Desktop height
                            },
                            marginBottom: '12px',
                            margin: { xs: '0 auto', sm: '0' },
                        }}
                    >
                        <Image
                            src="/assets/images/keena_logo.png" // Replace with your logo path
                            alt="Keena Rakkado Logo"
                            layout="fill" // Ensures the image fills the container
                            objectFit="contain"
                        />
                    </Box>
                    {description && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: { xs: '14px', sm: '10px', md: '16px' },
                                fontWeight: 500,
                                lineHeight: 1.5,
                                margin: '12px 0',
                                color: '#959595',
                            }}
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    )}
                    <Typography
                        sx={{
                            lineHeight: 1.8,
                            margin: '12px 0',
                            fontSize: { xs: '14px', sm: '10px', md: '16px' },
                            fontWeight: 600,
                            color: '#959595',
                        }}
                    >
                        {address && (
                            <>
                                <strong>Address:</strong> {address}
                                <br />
                            </>
                        )}
                        {number && (
                            <>
                                <strong>Mob No:</strong> {number}
                                <br />
                            </>
                        )}
                        {email && (
                            <>
                                <strong>Email:</strong> {email}
                                <br />
                            </>
                        )}
                        {website && (
                            <>
                                <strong>Website:</strong>{' '}
                                <Link href={website} target="_blank" rel="noopener noreferrer">
                                    {website}
                                </Link>
                            </>
                        )}
                    </Typography>
                </Box>

                {/* Navigation Section */}
                <Box
                    sx={{
                        flex: '1 1 23%',
                        maxWidth: { xs: '100%', sm: '23%' },
                        minWidth: '200px',
                        boxSizing: 'border-box',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: { xs: '16px', sm: '12px', md: '24px' },
                            fontWeight: 700,
                            color: '#545454',
                            marginBottom: '18px',
                        }}
                    >
                        Navigation
                    </Typography>
                    <List sx={{ padding: 0, margin: 0 }}>
                        <ListItem sx={{ padding: 0, margin: '12px 0' }}>
                            <Link href="/user/aboutus" passHref>
                                <Typography
                                    component="a"
                                    sx={{
                                        fontSize: { xs: '14px', sm: '10px', md: '18px' },
                                        fontWeight: 600,
                                        lineHeight: 1.6,
                                        color: '#959595',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            color: '#0066cc',
                                        },
                                    }}
                                >
                                    About Us
                                </Typography>
                            </Link>
                        </ListItem>
                        <ListItem sx={{ padding: 0, margin: '12px 0' }}>
                            <Link href="/user/faq" passHref>
                                <Typography
                                    component="a"
                                    sx={{
                                        fontSize: { xs: '14px', sm: '10px', md: '18px' },
                                        fontWeight: 600,
                                        lineHeight: 1.6,
                                        color: '#959595',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            color: '#0066cc',
                                        },
                                    }}
                                >
                                    FAQ
                                </Typography>
                            </Link>
                        </ListItem>
                        <ListItem sx={{ padding: 0, margin: '12px 0' }}>
                            <Link href="/user/contact-us" passHref>
                                <Typography
                                    component="a"
                                    sx={{
                                        fontSize: { xs: '14px', sm: '10px', md: '18px' },
                                        fontWeight: 600,
                                        lineHeight: 1.6,
                                        color: '#959595',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            color: '#0066cc',
                                        },
                                    }}
                                >
                                    Contact Us
                                </Typography>
                            </Link>
                        </ListItem>
                        <ListItem sx={{ padding: 0, margin: '12px 0' }}>
                            <Link href="/user/policy" passHref>
                                <Typography
                                    component="a"
                                    sx={{
                                        fontSize: { xs: '14px', sm: '10px', md: '18px' },
                                        fontWeight: 600,
                                        lineHeight: 1.6,
                                        color: '#959595',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            color: '#0066cc',
                                        },
                                    }}
                                >
                                    Our Policy
                                </Typography>
                            </Link>
                        </ListItem>
                    </List>
                </Box>

                {/* Our Services Section */}
                <Box
                    sx={{
                        flex: '1 1 23%',
                        maxWidth: { xs: '100%', sm: '23%' },
                        minWidth: '200px',
                        boxSizing: 'border-box',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: { xs: '16px', sm: '12px', md: '24px' },
                            fontWeight: 700,
                            color: '#545454',
                            marginBottom: '18px',
                        }}
                    >
                        Our Services
                    </Typography>
                    {services.length > 0 ? (
                        <List sx={{ padding: 0, margin: 0 }}>
                            {services.map((service) => (
                                <ListItem key={service.id} sx={{ padding: 0, margin: '12px 0' }}>
                                    <Link href={`/user/services/${service.id}`} passHref>
                                        <Typography
                                            component="a"
                                            sx={{
                                                fontSize: { xs: '14px', sm: '10px', md: '18px' },
                                                fontWeight: 600,
                                                lineHeight: 1.6,
                                                color: '#959595',
                                                textDecoration: 'none',
                                                '&:hover': {
                                                    color: '#0066cc',
                                                },
                                            }}
                                        >
                                            {service.name}
                                        </Typography>
                                    </Link>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '16px',
                                color: '#999999',
                                marginTop: '12px',
                            }}
                        >
                            No services available.
                        </Typography>
                    )}
                </Box>

                {/* Policies Section */}
                <Box
                    sx={{
                        flex: '1 1 23%',
                        maxWidth: { xs: '100%', sm: '23%' },
                        minWidth: '200px',
                        boxSizing: 'border-box',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: { xs: '16px', sm: '12px', md: '24px' },
                            fontWeight: 700,
                            color: '#545454',
                            marginBottom: '18px',
                        }}
                    >
                        Policies
                    </Typography>
                    <List sx={{ padding: 0, margin: 0 }}>
                        {policies.map((policy) => (
                            <ListItem key={policy.id} sx={{ padding: 0, margin: '12px 0' }}>
                                <Link href={`/user/policies/${policy.id}`} passHref>
                                    <Typography
                                        component="a"
                                        sx={{
                                            fontSize: { xs: '14px', sm: '10px', md: '18px' },
                                            fontWeight: 600,
                                            lineHeight: 1.6,
                                            color: '#959595',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                color: '#0066cc',
                                            },
                                        }}
                                    >
                                        {policy.name}
                                    </Typography>
                                </Link>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;
