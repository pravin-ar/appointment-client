import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Divider, IconButton, Menu, MenuItem, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Navbar.module.css';

const StyledMenu = styled(Menu)({
    '& .MuiPaper-root': {
        borderRadius: '20px',
        border: '2px solid #EC008B', // Border to match the pink color
        padding: '10px',
    },
    '& .MuiMenuItem-root': {
        padding: '20px',
    },
});

const NavbarHome = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isTabletOrMobile = useMediaQuery('(max-width:1200px)');

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
        <AppBar position="static" style={{ backgroundColor: '#fff', boxShadow: 'none' }}>
            <Toolbar className={styles.toolbar}>
                {/* Logo Section */}
                <div className={styles.navbarLeft}>
                    <Image
                        src="/assets/images/keena_logo.png"
                        alt="Keena Rakkado Logo"
                        width={277}
                        height={78}
                        className={styles.logo}
                    />
                </div>

                {/* Links for Desktop */}
                {!isTabletOrMobile ? (
                    <div className={styles.navbarCenter}>
                        <Link href="/" className={styles.navLink}>
                            <Image
                                src="/assets/images/glass.png"
                                alt="Glasses Icon"
                                width={60}
                                height={24}
                            />
                        </Link>
                        {menuItems.map((item) => (
                            <Link key={item.text} href={item.link} className={styles.navLink}>
                                {item.text}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenu}
                        className={styles.menuButton}
                    >
                        <MenuIcon style={{ color: '#383838' }} />
                    </IconButton>
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
                    <Typography
                        variant="h6"
                        component="div"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        Menu
                        <Image
                            src="/assets/images/glass.png"
                            alt="Glasses Icon"
                            width={30}
                            height={30}
                        />
                    </Typography>
                    <Divider style={{ border: '1px solid #EC008B' }} />

                    {menuItems.map((item, index) => (
                        <div key={item.text}>
                            <MenuItem onClick={handleClose}>
                                <Link href={item.link} className={styles.navLink}>
                                    {item.text}
                                </Link>
                            </MenuItem>
                            {index < menuItems.length - 1 && (
                                <Divider style={{ border: '1px solid #EC008B' }} />
                            )}
                        </div>
                    ))}
                </StyledMenu>
            </Toolbar>
        </AppBar>
    );
};

export default NavbarHome;
