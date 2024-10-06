// NavbarService.jsx
'use client'; // Ensure this is a Client Component

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import {
    AppBar,
    Box,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Link as MuiLink,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation'; // Correct import for Next.js 13+
import { useState } from 'react';

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '20px',
        border: '2px solid #EC008B', // Pink border
        padding: '10px',
    },
    '& .MuiMenuItem-root': {
        padding: '20px',
    },
}));

const NavbarService = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isTabletOrMobile = useMediaQuery('(max-width:1200px)');
    const isMobile = useMediaQuery('(max-width:600px)');
    const router = useRouter();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    const menuItems = [
        { text: 'About us', link: '/user/aboutus' },
        { text: 'Offers', link: '/user/offers' },
        { text: 'Service', link: '/user/services' },
        { text: 'Products', link: '/user/products' },
        { text: 'Book appointment', link: '/user/book-now' },
    ];

    return (
        <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 'none' }}>
            <Toolbar
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    padding: { xs: '20px', sm: '30px', md: '0 40px' },
                    height: { xs: '80px', sm: '80px' },
                    boxSizing: 'border-box',
                }}
            >
                {isTabletOrMobile ? (
                    <>
                        {/* Back Button */}
                        <Box
                            sx={{
                                position: 'absolute',
                                left: '20px',
                            }}
                        >
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="back"
                                onClick={handleBack}
                                sx={{
                                    padding: '8px',
                                }}
                            >
                                <ArrowBackIcon sx={{ color: '#383838' }} />
                            </IconButton>
                        </Box>

                        {/* Centered Logo */}
                        <Box
                            sx={{
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <NextLink href="/" passHref>
                                <MuiLink>
                                    <Box
                                        sx={{
                                            width: {
                                                xs: '102px', // Mobile
                                                sm: '196px', // Tablet
                                            },
                                            height: {
                                                xs: '27px', // Mobile
                                                sm: '52px', // Tablet
                                            },
                                        }}
                                    >
                                        <Image
                                            src="/assets/images/keena_logo.png"
                                            alt="Keena Rakkado Logo"
                                            width={isMobile ? 102 : 196}
                                            height={isMobile ? 27 : 52}
                                            style={{ width: '100%', height: 'auto' }}
                                        />
                                    </Box>
                                </MuiLink>
                            </NextLink>
                        </Box>

                        {/* Menu Button */}
                        <Box
                            sx={{
                                position: 'absolute',
                                right: '20px',
                                display: 'flex',
                            }}
                        >
                            <IconButton
                                edge="end"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenu}
                                sx={{
                                    padding: '8px',
                                }}
                            >
                                <MenuIcon
                                    sx={{
                                        color: '#383838',
                                        width: {
                                            xs: '25.45px', // Mobile
                                            sm: '30.55px', // Tablet
                                        },
                                        height: {
                                            xs: '20px', // Mobile
                                            sm: '24px', // Tablet
                                        },
                                    }}
                                />
                            </IconButton>
                        </Box>

                        {/* Mobile/Tablet Menu */}
                        <StyledMenu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {/* Menu Header */}
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    padding: '10px 0',
                                    color: '#383838',
                                }}
                            >
                                Menu
                            </Typography>
                            <Divider sx={{ border: '1px solid #EC008B' }} />

                            {menuItems.map((item, index) => (
                                <div key={item.text}>
                                    <MenuItem
                                        onClick={handleClose}
                                        sx={{
                                            ...(item.text === 'Service' && {
                                                backgroundColor: '#EC008B',
                                                color: '#fff',
                                            }),
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <NextLink href={item.link} passHref>
                                                <MuiLink
                                                    sx={{
                                                        fontSize: '14px',
                                                        fontWeight: 700,
                                                        color: item.text === 'Service' ? '#fff' : '#383838',
                                                        textDecoration: 'none',
                                                        '&:hover': {
                                                            color: '#0066cc',
                                                        },
                                                    }}
                                                >
                                                    {item.text}
                                                </MuiLink>
                                            </NextLink>
                                            {item.text === 'Service' && (
                                                <Image
                                                    src="/assets/images/glass.png"
                                                    alt="Glasses Icon"
                                                    width={40}
                                                    height={16}
                                                    style={{ marginLeft: '10px' }}
                                                />
                                            )}
                                        </Box>
                                    </MenuItem>
                                    {index < menuItems.length - 1 && (
                                        <Divider sx={{ border: '1px solid #EC008B' }} />
                                    )}
                                </div>
                            ))}
                        </StyledMenu>
                    </>
                ) : (
                    // Desktop View
                    <>
                        {/* Logo Section */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <NextLink href="/" passHref>
                                <MuiLink>
                                    <Box
                                        sx={{
                                            width: '277px',
                                            height: '78px',
                                        }}
                                    >
                                        <Image
                                            src="/assets/images/keena_logo.png"
                                            alt="Keena Rakkado Logo"
                                            width={277}
                                            height={78}
                                            style={{ width: '100%', height: 'auto' }}
                                        />
                                    </Box>
                                </MuiLink>
                            </NextLink>
                        </Box>

                        {/* Navigation Links */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '60px',
                            }}
                        >
                            {menuItems.map((item) => (
                                <NextLink key={item.text} href={item.link} passHref>
                                    <MuiLink
                                        sx={{
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            color: '#383838',
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            transition: 'color 0.3s ease',
                                            '&:hover': {
                                                color: '#0066cc',
                                            },
                                        }}
                                    >
                                        {item.text === 'Service' ? (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexDirection: 'column',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Image
                                                    src="/assets/images/glass.png"
                                                    alt="Glasses Icon"
                                                    width={40}
                                                    height={16}
                                                    style={{ marginBottom: '8px' }}
                                                />
                                                <Typography
                                                    sx={{
                                                        fontSize: '24px',
                                                        fontWeight: 700,
                                                        color: '#383838',
                                                    }}
                                                >
                                                    {item.text}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            item.text
                                        )}
                                    </MuiLink>
                                </NextLink>
                            ))}
                        </Box>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavbarService;
