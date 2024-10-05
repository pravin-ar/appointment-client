// app/components/NavbarService.js

'use client'; // Ensure this is a Client Component

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import {
    AppBar,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correct import for Next.js 13+
import { useState } from 'react';
import styles from './NavbarOthers.module.css'; // Using the existing CSS module

const StyledMenu = styled(Menu)({
    '& .MuiPaper-root': {
        borderRadius: '20px',
        border: '2px solid #EC008B', // Pink border
        padding: '10px',
    },
    '& .MuiMenuItem-root': {
        padding: '20px',
    },
});

const NavbarService = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isTabletOrMobile = useMediaQuery('(max-width:1200px)');
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
        <AppBar position="static" className={styles.appBar}>
            <Toolbar className={styles.toolbar}>
                {isTabletOrMobile ? (
                    <>
                        {/* Back Button */}
                        <div className={styles.navbarLeft}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="back"
                                onClick={handleBack}
                                className={styles.backButton}
                            >
                                <ArrowBackIcon style={{ color: '#383838' }} />
                            </IconButton>
                        </div>

                        {/* Centered Logo */}
                        <div className={styles.navbarCenter}>
                            <Link href="/">
                                <Image
                                    src="/assets/images/keena_logo.png"
                                    alt="Keena Rakkado Logo"
                                    width={196}
                                    height={52}
                                    className={styles.logo}
                                />
                            </Link>
                        </div>

                        {/* Menu Button */}
                        <div className={styles.navbarRight}>
                            <IconButton
                                edge="end"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenu}
                                className={styles.menuButton}
                            >
                                <MenuIcon style={{ color: '#383838' }} />
                            </IconButton>
                        </div>

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
                            {/* Optional Menu Header */}
                            <Typography
                                variant="h6"
                                component="div"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                Menu
                            </Typography>
                            <Divider style={{ border: '1px solid #EC008B' }} />

                            {menuItems.map((item, index) => (
                                <div key={item.text}>
                                    <MenuItem
                                        onClick={handleClose}
                                        className={item.text === 'Service' ? styles.activeMenuItem : ''}
                                    >
                                        <div className={styles.menuItemContent}>
                                            <Link href={item.link} className={styles.menuText}>
                                                {item.text}
                                            </Link>
                                            {item.text === 'Service' && (
                                                <Image
                                                    src="/assets/images/glass.png"
                                                    alt="Glasses Icon"
                                                    width={40} /* Icon for tablet and mobile */
                                                    height={16}
                                                    className={styles.menuIcon}
                                                />
                                            )}
                                        </div>
                                    </MenuItem>
                                    {index < menuItems.length - 1 && (
                                        <Divider style={{ border: '1px solid #EC008B' }} />
                                    )}
                                </div>
                            ))}
                        </StyledMenu>
                    </>
                ) : (
                    // Desktop View
                    <>
                        {/* Logo Section */}
                        <div className={styles.navbarLeft}>
                            <Link href="/">
                                <Image
                                    src="/assets/images/keena_logo.png"
                                    alt="Keena Rakkado Logo"
                                    width={277}
                                    height={78}
                                    className={styles.logo}
                                />
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className={styles.navbarCenter}>
                            {menuItems.map((item) => (
                                <Link key={item.text} href={item.link} className={styles.navLink}>
                                    {item.text === 'Service' ? (
                                        <div className={styles.menuItemContent}>
                                            {/* Glass Icon Above Text */}
                                            <Image
                                                src="/assets/images/glass.png"
                                                alt="Glasses Icon"
                                                width={40} /* Icon above text */
                                                height={16}
                                                className={styles.activeMenuItemIcon}
                                            />
                                            <Link href={item.link} className={styles.navLink}>
                                                {item.text}
                                            </Link>
                                        </div>
                                    ) : (
                                        item.text
                                    )}
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );

};

export default NavbarService;
