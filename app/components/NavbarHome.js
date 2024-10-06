// NavbarHome.jsx
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
import { useState } from 'react';

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '20px',
        border: '2px solid #EC008B',
        padding: '10px',
    },
    '& .MuiMenuItem-root': {
        padding: '20px',
    },
}));

const NavbarHome = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isTabletOrMobile = useMediaQuery('(max-width:1200px)');
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
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
                    padding: { xs: '20px', sm: '30px', md: '40px 20px' },
                    height: { xs: '80px', sm: '80px' },
                    position: 'relative',
                }}
            >
                {/* Logo Section */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: { xs: '20px', sm: '40px', md: '40px' },
                    }}
                >
                    <Box
                        sx={{
                            width: {
                                xs: '102px', // Mobile
                                sm: '196px', // Tablet
                                md: '365px', // Desktop
                            },
                            height: {
                                xs: '27px', // Mobile
                                sm: '52px', // Tablet
                                md: '96px', // Desktop
                            },
                        }}
                    >
                        <Image
                            src="/assets/images/keena_logo.png"
                            alt="Keena Rakkado Logo"
                            width={365}
                            height={96}
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </Box>
                </Box>

                {/* Menu Button for Tablet and Mobile */}
                {isTabletOrMobile && (
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenu}
                        sx={{
                            position: 'absolute',
                            right: { xs: '20px', sm: '20px' },
                            width: {
                                xs: '25.45px', // Mobile width
                                sm: '30.55px', // Tablet width
                            },
                            height: {
                                xs: '20px', // Mobile height
                                sm: '24px', // Tablet height
                            },
                        }}
                    >
                        <MenuIcon
                            sx={{
                                color: '#383838',
                                width: {
                                    xs: '25.45px', // Mobile width
                                    sm: '30.55px', // Tablet width
                                },
                                height: {
                                    xs: '20px', // Mobile height
                                    sm: '24px', // Tablet height
                                },
                            }}
                        />
                    </IconButton>
                )}

                {/* Navigation Links for Desktop */}
                {!isTabletOrMobile && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '60px',
                            marginRight: { md: '40px' },
                        }}
                    >
                        <MuiLink
                            component={NextLink}
                            href="/"
                            sx={{
                                paddingRight: 0,
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#383838',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: '#0066cc',
                                },
                            }}
                        >
                            <Image
                                src="/assets/images/glass.png"
                                alt="Glasses Icon"
                                width={60}
                                height={24}
                            />
                        </MuiLink>
                        {menuItems.map((item) => (
                            <MuiLink
                                key={item.text}
                                component={NextLink}
                                href={item.link}
                                sx={{
                                    paddingRight: 0,
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: '#383838',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        color: '#0066cc',
                                    },
                                }}
                            >
                                {item.text}
                            </MuiLink>
                        ))}
                    </Box>
                )}

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
                    {/* Menu Header with Glass Icon */}
                    <MenuItem
                        sx={{
                            backgroundColor: '#EC008B', // Pink background
                            color: '#fff', // White text
                            justifyContent: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '14px', sm: '16px' },
                                    marginRight: '10px',
                                }}
                            >
                                Menu
                            </Typography>
                            <Image
                                src="/assets/images/glass.png"
                                alt="Glasses Icon"
                                width={40}
                                height={16}
                            />
                        </Box>
                    </MenuItem>
                    <Divider sx={{ border: '1px solid #EC008B' }} />

                    {menuItems.map((item, index) => (
                        <div key={item.text}>
                            <MenuItem onClick={handleClose}>
                                <MuiLink
                                    component={NextLink}
                                    href={item.link}
                                    sx={{
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        color: '#383838',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            color: '#0066cc',
                                        },
                                    }}
                                >
                                    {item.text}
                                </MuiLink>
                            </MenuItem>
                            {index < menuItems.length - 1 && (
                                <Divider sx={{ border: '1px solid #EC008B' }} />
                            )}
                        </div>
                    ))}
                </StyledMenu>
            </Toolbar>
        </AppBar>
    );
};

export default NavbarHome;
